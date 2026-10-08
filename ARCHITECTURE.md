# Simulify — Arquitetura

**Data de referência:** 08/10/2026

## 1. Objetivo

Reconstruir o Simulify como uma aplicação moderna, stateless na camada de API, com PostgreSQL real, jobs duráveis de IA, segurança desde o início e baixo custo operacional.

A arquitetura deve permitir que o projeto comece pequeno sem obrigar uma migração estrutural quando ganhar usuários.

## 2. Arquitetura de alto nível

```text
                                 INTERNET
                                     │
                          ┌──────────┴──────────┐
                          │ Cloudflare DNS/WAF  │
                          └──────────┬──────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │                                     │
                  ▼                                     ▼
          simulify.com                           api.simulify.com
                  │                                     │
                  ▼                                     ▼
       ┌────────────────────┐                ┌──────────────────────┐
       │ Cloudflare Pages   │                │ Cloudflare Worker    │
       │ React + Vite       │                │ Hono + TypeScript    │
       └──────────┬─────────┘                └──────────┬───────────┘
                  │                                     │
                  │                            ┌────────┼─────────┐
                  │                            │        │         │
                  │                            ▼        ▼         ▼
                  │                        Better   Workflows  Turnstile
                  │                         Auth       │
                  │                                     ▼
                  │                                 AIProvider
                  │                                     │
                  │                         ┌───────────┼───────────┐
                  │                         ▼           ▼           ▼
                  │                     DeepSeek     Gemini     Outros
                  │
                  └──────────────── HTTPS/JSON ────────────────┐
                                                                  │
                                                           ┌──────▼──────┐
                                                           │ Hyperdrive  │
                                                           └──────┬──────┘
                                                                  │
                                                           ┌──────▼──────┐
                                                           │    Neon     │
                                                           │ PostgreSQL  │
                                                           └─────────────┘

                           R2 (futuro, quando necessário)
                  usuário ───────── upload/download ────────► objetos
                                         │
                                         └──── metadata/key ──► Postgres
```

## 3. Decisões

| Componente | Escolha | Motivo |
|---|---|---|
| Código | GitHub | versionamento e CI/CD |
| DNS/edge | Cloudflare | rede, HTTPS, WAF e integração dos serviços |
| Frontend | Cloudflare Pages | React/Vite estático com CDN e deploy por Git |
| API | Cloudflare Workers | backend stateless e sem servidor para administrar |
| Routing | Hono | simples, tipado e adequado ao Workers |
| Banco | Neon PostgreSQL | PostgreSQL gerenciado e região em São Paulo disponível |
| Conexão DB | Hyperdrive | camada específica para acesso a banco externo a partir do Workers |
| ORM | Prisma | schema, migrations, relações e tipagem |
| Auth | Better Auth | sessões e OAuth sem implementar autenticação manualmente |
| Jobs de IA | Workflows | execução durável com estado, retry e espera |
| IA | `AIProvider` | evitar lock-in de fornecedor |
| IA inicial | DeepSeek API | custo baixo e API compatível com OpenAI/Anthropic |
| Arquivos | R2, quando necessário | objetos grandes e uploads de usuários |
| CAPTCHA | Turnstile | mitigação de bots |
| Filas | Queues, só quando necessário | não antecipar complexidade |
| Banco Cloudflare | D1 | não usar no início; PostgreSQL é a prioridade |
| VPS | laboratório separado | aprendizado de infra sem contaminar a produção |

## 4. O que fica onde

### Frontend

Assets próprios do produto:

```text
hero.webp
illustration.webp
dashboard.webp
logo.svg
favicon.svg
icons.svg
```

Ficam no frontend/Pages porque fazem parte do código e não são conteúdo gerado pelos usuários.

### PostgreSQL

Dados estruturados:

```text
users
sessions
simulations
questions
answers
results
plans
usage
file_metadata
```

### R2

Conteúdo binário enviado ou produzido em grande volume:

```text
avatars
PDFs
materiais
imagens de questões
vídeos
anexos
```

O PostgreSQL guarda a chave do objeto, tamanho, MIME type e metadados necessários.

## 5. Separação por domínio

A aplicação deve separar domínio e infraestrutura:

```text
SimulationService
      ↓
interfaces/repositories
      ↓
Prisma repository
      ↓
PostgreSQL
```

E para IA:

```text
SimulationService
      ↓
AIService
      ↓
AIProvider
      ↓
DeepSeek / Gemini / outro
```

Nenhuma regra de negócio deve importar SDK de fornecedor diretamente.

## 6. Estrutura de monorepo

```text
simulify/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── shared/
│   ├── validation/
│   └── domain/
├── prisma/
│   └── schema.prisma
├── ARCHITECTURE.md
├── BACKEND.md
├── AI.md
└── DEPLOYMENT.md
└── package.json
```

## 7. O que não fazer inicialmente

Não adicionar por arquitetura:

- Redis
- Kubernetes
- microservices
- Kafka
- RabbitMQ
- Docker na produção
- Nginx/Traefik na produção
- Durable Objects
- Queues
- R2 sem necessidade real
- VPS para hospedar o Simulify

Essas tecnologias podem ser adicionadas quando houver um problema concreto para resolver.

## 8. Princípios

1. **Frontend público, secrets somente no Worker.**
2. **API stateless.**
3. **PostgreSQL como fonte de verdade.**
4. **R2 para objetos; Postgres para dados estruturados.**
5. **Jobs longos fora da requisição HTTP.**
6. **IA atrás de uma interface substituível.**
7. **Quota e custo antes de escalar.**
8. **Domínio independente de Cloudflare e do fornecedor de IA.**
9. **Staging separado de produção.**
10. **Toda migração deve ter rollback/restauração planejados.**

## 9. Documentos relacionados

- [Backend](BACKEND.md)
- [IA](AI.md)
- [Deploy](DEPLOYMENT.md)

## Fontes oficiais

- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Cloudflare Hyperdrive: https://developers.cloudflare.com/hyperdrive/
- Cloudflare Workflows: https://developers.cloudflare.com/workflows/
- Cloudflare R2: https://developers.cloudflare.com/r2/
- Neon: https://neon.com/docs
- Prisma: https://www.prisma.io/docs
- Better Auth: https://better-auth.com/docs
- PostgreSQL: https://www.postgresql.org/docs/
