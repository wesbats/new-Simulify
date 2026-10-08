# Simulify — Documentação Técnica

**Data de referência:** 08/10/2026  
**Status:** MVP local em reconstrução; a arquitetura cloud abaixo é alvo futuro.

## Como esta documentação está organizada

A recomendação é **não manter um único documento gigante**. O projeto terá um documento geral curto, que define as decisões arquiteturais, e documentos especializados para implementação.

```text
ARCHITECTURE.md   ← fonte de verdade das decisões
BACKEND.md        ← Worker, Hono, banco, auth e domínio
AI.md             ← IA, providers, custos, quotas e jobs
DEPLOYMENT.md     ← ambientes, DNS, CI/CD, secrets e produção
```

### Regra de manutenção

- `ARCHITECTURE.md` registra **o que foi escolhido e por quê**.
- `BACKEND.md` explica **como implementar** o backend.
- `AI.md` explica **como a IA é integrada sem lock-in**.
- `DEPLOYMENT.md` explica **como publicar e operar**.

Quando uma decisão mudar, atualize primeiro `ARCHITECTURE.md` e depois o documento especializado afetado.

## Stack alvo

```text
Frontend
  React + Vite + TypeScript
        ↓
Cloudflare Pages

API
  Cloudflare Workers + Hono + TypeScript
        ↓
  Hyperdrive
        ↓
  Neon PostgreSQL

Auth
  Better Auth

Jobs longos
  Cloudflare Workflows

IA
  AIProvider (abstração)
       ├── DeepSeek API      ← provider principal inicial
       ├── Gemini API        ← alternativa/fallback futuro
       ├── OpenRouter        ← opcional
       └── Local/mock        ← desenvolvimento/testes

Arquivos
  Cloudflare R2              ← somente quando upload fizer parte do produto

Proteção
  Turnstile + rate limiting + quotas + WAF
```

## Princípio arquitetural mais importante

O Simulify não deve ficar acoplado nem a um servidor tradicional nem a um fornecedor específico de IA.

```text
Infraestrutura gerenciada = produção
Fornecedor de IA           = componente substituível
```

A API deverá depender de uma interface `AIProvider`, e não diretamente de DeepSeek, Gemini ou outro fornecedor.

## Documentos

- [Arquitetura](ARCHITECTURE.md)
- [Backend](BACKEND.md)
- [IA](AI.md)
- [Deploy](DEPLOYMENT.md)
