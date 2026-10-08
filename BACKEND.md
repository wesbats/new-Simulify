# Simulify — Backend

**Runtime:** Cloudflare Workers  
**Framework:** Hono + TypeScript  
**Banco:** Neon PostgreSQL  
**ORM:** Prisma

## 1. Responsabilidades

O backend será responsável por:

- autenticação e sessões
- autorização
- regras de negócio
- validação
- persistência
- quotas
- integração com IA
- criação e acompanhamento de jobs
- acesso a arquivos via R2, quando existir upload
- observabilidade e tratamento de erros

O Worker não deve assumir a função de processo persistente.

## 2. Estrutura sugerida

```text
apps/api/
├── src/
│   ├── app.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── simulations.ts
│   │   ├── questions.ts
│   │   └── results.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── cors.ts
│   │   ├── rate-limit.ts
│   │   └── error-handler.ts
│   ├── services/
│   │   ├── simulation.service.ts
│   │   ├── result.service.ts
│   │   └── ai.service.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── simulation.repository.ts
│   │   └── result.repository.ts
│   ├── ai/
│   │   ├── ai.provider.ts
│   │   ├── providers/
│   │   └── schemas/
│   ├── db/
│   │   └── client.ts
│   ├── auth/
│   │   └── config.ts
│   └── workflows/
│       └── generate-simulation.ts
├── wrangler.jsonc
└── package.json
```

## 3. Fluxo HTTP padrão

```text
request
  ↓
CORS / security headers
  ↓
authentication
  ↓
authorization
  ↓
validation (Zod)
  ↓
service
  ↓
repository / provider
  ↓
response
```

Rotas nunca devem carregar toda a regra de negócio.

## 4. API inicial

```http
GET  /health

POST /auth/register
POST /auth/login
POST /auth/logout
GET  /me

GET  /simulations
POST /simulations
GET  /simulations/:id
POST /simulations/:id/answers
GET  /simulations/:id/result

GET  /usage
```

A nomenclatura pode evoluir, mas o princípio permanece: controllers/routes coordenam; services executam regras; repositories persistem.

## 5. Geração de simulado

Nunca segurar uma requisição HTTP aberta durante uma geração que possa levar dezenas de segundos ou minutos.

```text
POST /simulations
      ↓
validar input
      ↓
autorização + quota
      ↓
criar Simulation(status=pending)
      ↓
iniciar Workflow
      ↓
HTTP 202 { simulationId }
```

Depois:

```http
GET /simulations/:id
```

Status:

```text
pending
processing
ready
failed
```

## 6. Repositórios

```ts
interface SimulationRepository {
  create(input: CreateSimulationInput): Promise<Simulation>;
  findById(id: string): Promise<Simulation | null>;
  updateStatus(id: string, status: SimulationStatus): Promise<void>;
}
```

Implementação:

```text
SimulationRepository
        ↑
PrismaSimulationRepository
```

Isso permite trocar a implementação de infraestrutura sem contaminar o domínio.

## 7. Prisma + Workers

Usar a integração adequada de Prisma para o runtime Workers e PostgreSQL.

O acesso ao banco deve ser desenhado considerando o modelo stateless do Worker. Não replicar cegamente um `Pool` de Node tradicional como se o processo fosse permanente.

Fluxo:

```text
Worker
  ↓
Prisma adapter/driver
  ↓
Hyperdrive
  ↓
Neon PostgreSQL
```

## 8. Autenticação

Better Auth fica atrás do Worker.

### Cookies

Preferir sessão via cookie seguro:

- `HttpOnly`
- `Secure`
- `SameSite` apropriado
- expiração e rotação conforme estratégia de sessão

Não guardar tokens de autenticação sensíveis em `localStorage` por padrão.

### Google OAuth

```text
React
  ↓
Google
  ↓
callback Worker
  ↓
Better Auth
  ↓
sessão
```

Secrets OAuth nunca vão para o bundle do Vite.

## 9. Autorização

Autenticação não basta.

Toda operação com recurso deve verificar propriedade/permissão:

```text
GET /simulations/abc
        ↓
usuário autenticado?
        ↓
simulation pertence a esse usuário?
        ↓
sim → retorna
não → 404/403 conforme estratégia
```

Objetivo: impedir IDOR/BOLA.

## 10. Validação

Usar Zod (ou camada equivalente) nos limites da aplicação.

Validar:

- body
- query params
- route params
- quantidade de questões
- limites de texto
- enums
- IDs
- paginação

O resultado validado pode então entrar no domínio.

## 11. CORS

Produção:

```text
https://simulify.com
```

Desenvolvimento:

```text
http://localhost:5173
```

Evitar `*` para endpoints autenticados.

## 12. Rate limiting

Endpoints críticos:

```text
/login
/register
/forgot-password
/simulations
```

Há duas camadas:

```text
edge/IP rate limit
+
application/user quota
```

Elas resolvem problemas diferentes.

## 13. Erros

Formato sugerido:

```json
{
  "error": {
    "code": "SIMULATION_GENERATION_FAILED",
    "message": "Não foi possível gerar o simulado.",
    "requestId": "..."
  }
}
```

Nunca retornar stack trace em produção.

Status principais:

```text
400 invalid request
401 unauthenticated
403 forbidden
404 not found
409 conflict
422 validation/business error
429 rate limit/quota
500 internal error
503 dependency unavailable
```

## 14. Idempotência

Geração de IA é cara. Um duplo clique não deve gerar dois simulados involuntariamente.

Aceitar uma chave idempotente no endpoint de criação:

```http
Idempotency-Key: <uuid>
```

Registrar a chave associada à operação e reaproveitar o resultado quando a mesma operação for reenviada dentro da janela definida.

## 15. Segurança

Checklist mínimo:

```text
[ ] HTTPS
[ ] secure cookies
[ ] CORS restrito
[ ] Zod validation
[ ] rate limiting
[ ] Turnstile
[ ] authorization por recurso
[ ] payload limits
[ ] secrets em bindings/secret manager
[ ] nenhum segredo no Git
[ ] logs sem tokens/chaves
[ ] queries parametrizadas/ORM
[ ] WAF
```

## 16. Arquivos e R2

Quando upload fizer parte do produto:

```text
POST /files/presign
       ↓
Worker valida usuário
       ↓
gera autorização/chave
       ↓
frontend faz upload
       ↓
R2
       ↓
Postgres guarda metadata/key
```

Para arquivos grandes, preferir upload direto/resumível para R2 em vez de trafegar o binário inteiro pelo Worker.

## 17. Banco de dados

Entidades iniciais prováveis:

```text
users
auth/accounts/sessions
simulations
simulation_questions
questions
answers
results
user_ai_usage
idempotency_keys
file_metadata
```

Os nomes finais devem acompanhar o modelo de domínio real, não ser copiados cegamente desta lista.

## 18. Regra de ouro

O backend deve conhecer **interfaces** e **casos de uso**, enquanto Cloudflare, Prisma, Neon, Better Auth e providers de IA ficam nas bordas.

Isso mantém o projeto portátil e testável.
