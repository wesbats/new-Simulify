# Simulify — Arquitetura de IA

**Data de referência:** 08/10/2026  
**Provider inicial recomendado:** DeepSeek API (`deepseek-flash`)  
**Princípio:** o Simulify nunca deve depender diretamente de um fornecedor de IA.

## 1. Problema que estamos evitando

Não usar o plano gratuito de um serviço de coding agent como dependência da infraestrutura de produção.

O OpenCode pode continuar sendo excelente para **desenvolvimento**, mas os próprios termos atuais dizem que serviços podem ser gratuitos ou pagos e que usuários serão avisados antes de um serviço gratuito passar a cobrar. Portanto, o Free deve ser tratado como uma conveniência, não como um contrato de disponibilidade para a aplicação. Fonte: https://dev.opencode.ai/legal/terms-of-service

Arquiteturalmente:

```text
OpenCode Free
     ↓
desenvolvimento

DeepSeek/Gemini/etc. API
     ↓
produção do Simulify
```

## 2. Abstração obrigatória

O domínio deve depender desta ideia:

```ts
export interface AIProvider {
  generateSimulation(
    input: GenerateSimulationInput,
  ): Promise<GeneratedSimulation>;
}
```

Nenhum `SimulationService` deve importar diretamente:

```ts
import OpenAI from ...
import DeepSeek from ...
import GoogleGenAI from ...
```

Esses SDKs pertencem à camada de infraestrutura/provider.

## 3. Estrutura sugerida

```text
src/ai/
├── ai.provider.ts
├── ai.service.ts
├── schemas/
│   ├── simulation-output.schema.ts
│   └── common.schema.ts
└── providers/
    ├── deepseek.provider.ts
    ├── gemini.provider.ts
    ├── openrouter.provider.ts
    ├── local.provider.ts
    └── mock.provider.ts
```

## 4. Provider inicial: DeepSeek API

A documentação oficial atual da DeepSeek lista o modelo `deepseek-flash` como **DeepSeek-V4.1-Flash**. A API é compatível com formatos OpenAI/Anthropic, oferece JSON Output, tool calls, contexto de até 1M tokens e visão. Fonte: https://api-docs.deepseek.com/quick_start/pricing/

Preço publicado atualmente por 1M tokens:

| Item | Off-peak | Peak |
|---|---:|---:|
| Input — cache hit | US$ 0,003 | US$ 0,006 |
| Input — cache miss | US$ 0,15 | US$ 0,30 |
| Output | US$ 0,60 | US$ 1,20 |

Os preços oficiais podem ser alterados pelo fornecedor; a própria página recomenda acompanhar a tabela atual. Fonte: https://api-docs.deepseek.com/quick_start/pricing/

### Decisão

Para a primeira versão produtiva do Simulify:

```text
AI_PROVIDER=deepseek
AI_MODEL=deepseek-flash
```

Isso é uma decisão de implementação inicial, não um acoplamento arquitetural.

## 5. Outros providers

### Gemini

Pode ser usado como provider alternativo ou fallback. A página oficial de preços do Gemini separa Free Tier e Paid Tier e, atualmente, indica diferenças de uso de dados entre os níveis. Por isso, para dados reais de usuários, revisar o tier e os termos vigentes antes de escolher um modelo de produção. Fonte: https://ai.google.dev/gemini-api/docs/pricing

### OpenRouter

Pode ser implementado como um provider adicional quando for útil ter acesso a múltiplos modelos através de uma interface única. Não deve ser obrigatório para o primeiro deploy.

### Local LLM

Excelente para desenvolvimento, testes de prompt, mocks e geração de dados fictícios.

```text
LM Studio / Ollama / llama.cpp
            ↓
     LocalAIProvider
```

Não usar a máquina pessoal como backend produtivo do Simulify.

## 6. Fallback

Fallback é útil, mas deve acontecer apenas para falhas transitórias.

```text
DeepSeek
   │
   ├── sucesso → pronto
   │
   └── 429/5xx/timeout
             ↓
          Gemini
             │
             ├── sucesso → pronto
             └── falha → failed
```

Não fazer fallback para qualquer erro. Exemplos que não justificam gastar em outro provider:

```text
prompt inválido
quota do usuário esgotada
entrada proibida
erro determinístico de validação
```

## 7. Jobs de IA

A geração será executada via Cloudflare Workflows.

```text
POST /simulations
      ↓
criar Simulation(pending)
      ↓
iniciar Workflow
      ↓
202 Accepted

Workflow
      ↓
processing
      ↓
montar prompt
      ↓
AIProvider
      ↓
validar schema
      ↓
salvar questões
      ↓
ready
```

Se o navegador fechar, o workflow continua. Ao voltar, o frontend consulta o estado persistido.

## 8. Resposta estruturada

Não confiar em texto livre da IA.

Esperar um objeto estruturado, por exemplo:

```json
{
  "title": "Funções do 2º grau",
  "questions": [
    {
      "statement": "...",
      "options": ["A", "B", "C", "D"],
      "correctOption": 2,
      "explanation": "...",
      "difficulty": "medium"
    }
  ]
}
```

Fluxo:

```text
AI response
   ↓
JSON parse
   ↓
Zod schema
   ↓
regras de negócio
   ↓
persistência
```

Se falhar:

```text
retry limitado
      ↓
se continuar falhando
      ↓
Simulation.status = failed
```

## 9. Quota e custo

Nunca permitir geração ilimitada apenas porque o botão está disponível.

```text
request
  ↓
auth
  ↓
quota
  ↓
idempotency
  ↓
create workflow
```

Registrar pelo menos:

```text
userId
simulationId
provider
model
inputTokens
outputTokens
cachedInputTokens (se disponível)
estimatedCost
status
createdAt
```

Isso permite calcular custo real por usuário e por simulado.

## 10. Fórmula de custo

Conceitualmente:

```text
custo =
  input_tokens × preço_input
+ output_tokens × preço_output
+ cache_storage/outros custos aplicáveis
```

Não assumir que o custo informado pelo frontend é confiável; o backend deve registrar os dados retornados pelo provider quando disponíveis.

## 11. Exemplo de configuração

```env
AI_PROVIDER=deepseek
AI_MODEL=deepseek-flash
AI_TIMEOUT_MS=120000
AI_MAX_RETRIES=2
AI_MAX_OUTPUT_TOKENS=...
```

Secrets:

```text
DEEPSEEK_API_KEY
GEMINI_API_KEY
OPENROUTER_API_KEY
```

Nunca expor essas chaves ao React/Vite.

## 12. Mock provider

Manter um provider fake desde o início:

```ts
class MockAIProvider implements AIProvider {
  async generateSimulation() {
    return fakeSimulation;
  }
}
```

Isso permite:

- testar UI sem gastar dinheiro
- executar testes determinísticos
- testar estados `pending/processing/ready/failed`
- validar o pipeline sem rede

## 13. Testes

Testar pelo menos:

```text
[ ] provider retorna JSON válido
[ ] provider retorna JSON inválido
[ ] timeout
[ ] 429
[ ] 5xx
[ ] retry
[ ] fallback
[ ] quota excedida
[ ] idempotência
[ ] workflow marcado como failed
[ ] resultado não duplica questões
```

## 14. Observabilidade

Métricas importantes:

```text
AI request count
AI success rate
AI failure rate
AI latency
input tokens
output tokens
cost estimate
cost by user
cost by simulation
provider fallback count
```

Nunca logar:

- API keys
- cookies
- tokens de sessão
- informações sensíveis desnecessárias

## 15. Política de escolha de modelo

O produto deve selecionar modelo através de configuração, não código espalhado.

```text
AIService
   ↓
config/model policy
   ↓
AIProvider
```

Assim é possível fazer:

```text
produção → DeepSeek Flash
fallback → Gemini
staging  → DeepSeek
local    → Mock/LLM local
```

sem modificar o domínio.

## 16. Decisão final

```text
OpenCode Free
    = ferramenta de desenvolvimento

DeepSeek API
    = provider de produção inicial

AIProvider
    = contrato arquitetural

Workflows
    = execução durável

Zod
    = validação do resultado

Quota + rate limit + idempotency
    = proteção financeira

Mock provider
    = desenvolvimento/testes sem custo
```

## Fontes oficiais

- DeepSeek V4.1 Flash: https://api-docs.deepseek.com/news/news260910/
- DeepSeek Models & Pricing: https://api-docs.deepseek.com/quick_start/pricing/
- DeepSeek Quick Start: https://api-docs.deepseek.com/quick_start/
- OpenCode Terms: https://dev.opencode.ai/legal/terms-of-service
- Gemini API Pricing: https://ai.google.dev/gemini-api/docs/pricing
