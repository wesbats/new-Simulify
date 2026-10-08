# Simulify — Deploy e Operação

**Data de referência:** 08/10/2026

## 1. Ambientes

Separar desde o início:

```text
local
  ↓
staging
  ↓
production
```

Banco:

```text
Neon development branch
Neon staging branch
Neon production/main
```

Nunca compartilhar secrets de produção com staging.

## 2. Domínios

```text
https://simulify.com
https://api.simulify.com
```

O domínio principal aponta para o frontend; o subdomínio `api` aponta para o Worker.

Evitar usar `workers.dev` como URL principal de produção.

## 3. Frontend

```text
GitHub
   ↓
Cloudflare Pages
   ↓
React/Vite build
   ↓
dist/
   ↓
CDN
```

Variáveis públicas permitidas:

```env
VITE_API_URL=https://api.simulify.com
VITE_TURNSTILE_SITE_KEY=...
```

Não colocar secrets privados em `VITE_*`.

## 4. Backend

```text
GitHub
   ↓
Wrangler / Worker Builds / CI
   ↓
Cloudflare Worker
```

Variáveis públicas/configuráveis podem ficar em configuração do Worker.

Secrets:

```text
DATABASE_URL / conexão conforme configuração do Hyperdrive/Prisma
BETTER_AUTH_SECRET
GOOGLE_CLIENT_SECRET
DEEPSEEK_API_KEY
GEMINI_API_KEY
OPENROUTER_API_KEY
TURNSTILE_SECRET_KEY
```

Os nomes exatos podem variar conforme as bibliotecas, mas o princípio não muda: **secret nunca entra no bundle do frontend e nunca vai para o Git.**

## 5. Banco

Fluxo de produção:

```text
Worker
   ↓
Prisma
   ↓
Hyperdrive
   ↓
Neon
```

As migrations devem ser versionadas:

```text
prisma/migrations/
```

Aplicar migrations com procedimento explícito e reversível.

## 6. R2

Não criar R2 antes de existir requisito de upload.

Quando surgir:

```text
React
  ↓
Worker autoriza
  ↓
upload direto
  ↓
R2
  ↓
metadata/key no Postgres
```

Arquivos do próprio site continuam no frontend:

```text
public/images/hero.webp
public/icons/logo.svg
```

R2 é para conteúdo mutável, grande ou enviado por usuários.

## 7. CI/CD

Estratégia simples:

```text
main
 ↓
production

feature/*
 ↓
preview/staging
```

Frontend:

```text
push
 ↓
Pages build
 ↓
preview ou production
```

Backend:

```text
push
 ↓
tests
 ↓
typecheck
 ↓
build
 ↓
deploy Worker
```

Não fazer deploy de produção se testes ou validações estruturais falharem.

## 8. Checklist de pipeline

### Frontend

```text
[ ] npm ci
[ ] lint
[ ] typecheck
[ ] test
[ ] build
[ ] deploy
```

### Backend

```text
[ ] npm ci
[ ] lint
[ ] typecheck
[ ] unit tests
[ ] build
[ ] migration check
[ ] deploy Worker
```

## 9. Segurança de produção

```text
[ ] HTTPS
[ ] DNS proxied conforme necessário
[ ] WAF
[ ] CORS restrito
[ ] Turnstile
[ ] rate limits
[ ] quotas de IA
[ ] secrets configurados
[ ] cookies seguros
[ ] logs sem secrets
[ ] autorização por recurso
```

## 10. Observabilidade

Monitorar:

### API

- latência
- 4xx
- 5xx
- 429
- volume de requests

### Banco

- compute
- storage
- conexões/queries
- erros

### Workflows

- jobs iniciados
- jobs concluídos
- retries
- falhas
- duração

### IA

- requests
- tokens
- latência
- custo
- fallbacks

### R2

Quando utilizado:

- storage
- Class A
- Class B
- uploads/downloads

## 11. Controle de custos

A prioridade de controle é:

```text
IA
↓
R2/requests conforme uso
↓
infra restante
```

Proteções obrigatórias para IA:

```text
rate limit
+
quota por usuário
+
limite de payload
+
idempotency
+
monitoramento
```

Não depender apenas de um alerta de faturamento.

## 12. Rollback

### Código

Git permite reverter o commit/deploy.

### Banco

Migrations devem considerar:

```text
compatibilidade backward
→ deploy código
→ migration segura
→ limpeza posterior
```

Evitar migrations destrutivas sem plano de recuperação.

## 13. Backup

Um backup só é útil se puder ser restaurado.

Manter:

- estratégia de backup lógico
- retenção definida
- procedimento de restore
- teste periódico de restauração

## 14. Health check

Endpoint:

```http
GET /health
```

Resposta mínima:

```json
{
  "status": "ok"
}
```

Não expor:

- DATABASE_URL
- nomes de hosts internos
- secrets
- stack traces

## 15. Deploy inicial — ordem

```text
1. GitHub
2. Cloudflare DNS
3. Cloudflare Pages
4. Neon
5. Prisma/migrations
6. Hyperdrive
7. Worker + Hono
8. Better Auth
9. Turnstile
10. Workflows
11. AIProvider + DeepSeek
12. quotas/rate limit
13. observabilidade
14. domínio final
15. testes de produção
```

## 16. VPS de laboratório

Uma VPS pode ser usada separadamente para aprender:

```text
Ubuntu
Docker Compose
Caddy
PostgreSQL
Redis
SSH
firewall
backup
monitoramento
```

Mas isso não precisa virar a infraestrutura produtiva do Simulify.

## 17. Critério de pronto para produção

```text
[ ] domínio funciona
[ ] frontend funciona
[ ] login funciona
[ ] OAuth funciona
[ ] autorização funciona
[ ] DB persistindo
[ ] migration reproduzível
[ ] simulado é criado
[ ] workflow continua após fechar browser
[ ] IA gera resposta válida
[ ] JSON passa no schema
[ ] falha vira status=failed
[ ] quota bloqueia abuso
[ ] rate limit funciona
[ ] health check funciona
[ ] logs úteis
[ ] restore test realizado
```

## Fontes oficiais

- Workers: https://developers.cloudflare.com/workers/
- Pages: https://developers.cloudflare.com/pages/
- Hyperdrive: https://developers.cloudflare.com/hyperdrive/
- Workflows: https://developers.cloudflare.com/workflows/
- R2: https://developers.cloudflare.com/r2/
- Turnstile: https://developers.cloudflare.com/turnstile/
- WAF: https://developers.cloudflare.com/waf/
- Neon: https://neon.com/docs
- Prisma: https://www.prisma.io/docs/guides/deployment/cloudflare-workers
