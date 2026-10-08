# Simulify — Frontend, UX e Fluxos

**Data de referência:** 08/10/2026  
**Status:** especificação-base para reconstrução do frontend

> Este documento é o contrato de experiência do Simulify. Antes de implementar telas, componentes ou animações, valide o fluxo aqui. A regra é simples: **é mais barato corrigir o fluxo no papel do que refazer o frontend depois**.

---

## 1. Objetivo de experiência

O Simulify deve passar a sensação de produto de empresa grande sem ficar pesado ou burocrático.

O usuário precisa entender, em poucos segundos:

```text
O que é?
  ↓
Criar ou importar um simulado
  ↓
Responder
  ↓
Ver desempenho
  ↓
Saber o que fazer depois
```

Princípios:

1. **Uma ação principal por contexto.**
2. **Nunca perder trabalho do usuário.**
3. **Uma ação assíncrona = uma solicitação lógica.**
4. **Feedback imediato em qualquer ação.**
5. **Erro explica o que aconteceu e o que fazer.**
6. **A interface deve impedir estados inválidos, não apenas explicá-los.**
7. **Guest mode funciona de verdade e não é uma versão capada por acidente.**
8. **IA é opcional para quem está apenas praticando com JSON.**
9. **Mobile-first e acessibilidade desde o primeiro componente.**
10. **Visual sofisticado, mas comportamento previsível.**

---

## 2. Decisão principal: dois caminhos de entrada

A landing page não deve obrigar o visitante a criar conta para experimentar o conceito.

```text
                         LANDING
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       COMEÇAR GRÁTIS     ENTRAR      TESTAR SEM CONTA
             │              │              │
             ▼              ▼              ▼
          REGISTER         LOGIN        GUEST MODE
             │              │              │
             └──────────┬───┴──────────────┘
                        ▼
                 ÁREA DE ESTUDO
```

### Regra de CTA

Na landing:

- CTA principal: **Começar grátis**
- CTA secundário de forte visibilidade: **Experimentar sem conta**
- Login permanece disponível no header.

Não esconder o Guest Mode no rodapé ou em um link textual quase invisível.

---

# 3. Fluxograma — versão inicial

Esta foi a primeira hipótese de fluxo, antes da revisão:

```text
LANDING
  │
  ├── Entrar ───────► LOGIN ───────► DASHBOARD
  │
  ├── Criar conta ──► REGISTER ────► DASHBOARD
  │
  └── Sem conta ────► JSON IMPORT ─► QUIZ ─► RESULTADO
                                      │
                                      └──► Entrar/Criar conta
```

### Nota histórica da hipótese inicial: 7,5/10

Ela funciona, mas ainda não é nível produto maduro.

### Problemas encontrados

| Problema | Impacto | Correção |
|---|---|---|
| Guest termina no resultado sem uma biblioteca local clara | Alto | Guest deve possuir uma pequena central de simulados locais |
| Conversão Guest → conta aparece somente no final | Médio | Oferecer conta nos momentos de alto valor sem bloquear o fluxo |
| Não existe fluxo de recuperação | Alto | Refresh, fechamento do navegador e retorno devem preservar estado |
| Não existe tratamento explícito de JSON inválido | Alto | Validação + erros por campo + exemplo válido |
| Quiz não mostra estados de rede/recuperação | Alto | Autosave, reconexão e recuperação |
| Não existe "duplicar" / reutilizar simulado | Médio | Adicionar na biblioteca autenticada |
| Login/register tratados como destinos isolados | Médio | Fluxo compartilhado de autenticação e retorno à intenção original |
| Não há estado de erro da IA | Alto | `pending → processing → ready/failed` |
| Não há proteção contra clique duplo | Crítico | Máquina de estados de interação + idempotência |
| Não há definição de navegação e back button | Médio | Rotas e transições especificadas antes da implementação |
| Não há regra de dados locais | Alto | Definir exatamente o que fica local e o que vai ao backend |

---

# 4. Fluxograma — versão revisada

Este é o modelo recomendado para implementação.

```text
┌───────────────────────┐
│       LANDING         │
│ Produto / prova / CTA │
└───────────┬───────────┘
            │
      ┌─────┼───────────────┐
      │     │               │
      ▼     ▼               ▼
   LOGIN  REGISTER     EXPERIMENTAR
      │     │           SEM CONTA
      │     │               │
      └──┬──┘               ▼
         │          ┌─────────────────┐
         │          │ GUEST WORKSPACE │
         │          │ Colar JSON      │
         │          │ Validar         │
         │          │ Biblioteca local│
         │          └───────┬─────────┘
         │                  │
         ▼                  ▼
┌───────────────────┐  ┌───────────────┐
│ APP / DASHBOARD   │  │ SIMULADO LOCAL│
│ Criar IA          │  │ JSON           │
│ Importar JSON     │  └───────┬───────┘
│ Meus simulados    │          │
└─────────┬─────────┘          │
          │                    │
          ▼                    ▼
┌─────────────────────┐  ┌──────────────┐
│ CRIAR SIMULADO      │  │ QUIZ         │
│                     │  │ Autosave local│
│ IA / Import / Copiar│  │ progresso     │
└──────────┬──────────┘  └──────┬───────┘
           │                    │
           ▼                    │
     ┌─────────────┐            │
     │ WORKFLOW IA │            │
     │ pending     │            │
     │ processing  │            │
     │ ready/failed│            │
     └──────┬──────┘            │
            │                   │
            └──────────┬────────┘
                       ▼
               ┌───────────────┐
               │   RESULTADO   │
               │ Nota + análise│
               │ Revisar erros │
               │ Próximo passo │
               └───────┬───────┘
                       │
             ┌─────────┼────────────┐
             ▼         ▼            ▼
          REVISAR   REFAZER     BIBLIOTECA
             │         │            │
             └─────────┴────────────┘
```

### Nota histórica da hipótese revisada: 9,5/10. Esta nota não representa o comportamento implementado.

A estrutura agora cobre descoberta, conversão, prática, recuperação, retenção e o modo sem login sem misturar responsabilidades.

O único 0,5 restante não deve ser "adivinhado" em design: deve ser validado com uso real e testes de usabilidade.

---

# 5. Rotas públicas

```text
/
/login
/register
/forgot-password
```

### Landing `/`

Ordem recomendada:

```text
Hero
  ↓
Como funciona: Criar → Praticar → Evoluir
  ↓
Experiência do simulado
  ↓
Recursos
  ↓
Exemplos / prova visual
  ↓
FAQ
  ↓
CTA final
```

Não transformar a landing em um catálogo de recursos. O loop de valor deve aparecer antes da lista extensa de funcionalidades.

---

# 6. Guest Mode

## 6.1 Objetivo

Permitir que alguém use o Simulify **sem criar conta e sem consumir IA**.

O visitante trabalha exclusivamente com um simulado JSON válido que ele mesmo fornece.

```text
Guest
  ↓
Colar JSON
  ↓
Validar localmente
  ↓
Salvar JSON local
  ↓
Responder
  ↓
Resultado
  ↓
Continuar localmente
```

## 6.2 O que Guest NÃO faz

- não chama API de geração de IA;
- não exige cadastro;
- não envia o JSON para o backend apenas para validar;
- não promete sincronização entre dispositivos;
- não mistura dados do visitante com a conta autenticada.

## 6.3 Persistência

O modelo canônico do simulado continua sendo JSON.

Para armazenamento no navegador, usar **IndexedDB** como mecanismo de persistência do modo Guest. O registro contém o JSON, metadados mínimos e estado da tentativa.

Exemplo conceitual:

```text
IndexedDB
└── guestSimulations
    ├── id
    ├── title
    ├── schemaVersion
    ├── simulationJson
    ├── attemptState
    ├── updatedAt
    └── completedAt
```

Também oferecer:

```text
Exportar JSON
Importar JSON
Excluir localmente
```

### Aviso de privacidade

Mostrar uma mensagem simples:

> **Sem conta:** este simulado fica salvo apenas neste dispositivo e não é sincronizado com sua conta.

Não usar linguagem que sugira backup em nuvem.

---

# 7. Autenticação e intenção original

Não perder o contexto quando o visitante precisar entrar.

Exemplo:

```text
Landing
  ↓
Criar conta
  ↓
Register
  ↓
Dashboard
```

Mas também:

```text
Visitante abre recurso protegido
  ↓
Login
  ↓
Autenticação concluída
  ↓
retorna para a intenção original
```

O login não deve simplesmente jogar o usuário para `/app` em todos os casos.

### Estados obrigatórios

```text
idle
submitting
success
invalid credentials
rate limited
network error
session expired
```

---

# 8. Dashboard autenticado

O dashboard não deve ser um painel cheio de cards sem prioridade.

Hierarquia:

```text
Header
  ↓
Olá + contexto curto
  ↓
[AÇÃO PRINCIPAL] Criar simulado com IA
  ↓
Continuar de onde parou
  ↓
Meus simulados recentes
  ↓
Desempenho / evolução
```

### Ações secundárias

```text
Importar JSON
Ver biblioteca
Configurações
```

O usuário deve conseguir começar um simulado em poucos cliques sem precisar aprender a navegação primeiro.

---

# 9. Criação de simulado

## 9.1 IA

A criação normal não expõe JSON para o usuário comum.

```text
NOVO SIMULADO

Tema / conteúdo
Quantidade de questões
Dificuldade
Tipo de questão
Objetivo / instruções adicionais

[ Gerar simulado ]
```

JSON manual deve existir como:

```text
Opções avançadas → Importar / editar JSON
```

## 9.2 Fluxo de geração

```text
Formulário
   ↓
validar localmente
   ↓
POST /simulations
   ↓
202 Accepted
   ↓
página de processamento
   ↓
Workflow IA
   ↓
polling controlado / atualização de estado
   ↓
ready
   ↓
prévia
   ↓
começar simulado
```

O navegador nunca deve ficar aguardando uma requisição HTTP de vários minutos.

## 9.3 Estados visíveis

```text
Preparando...
Gerando questões...
Validando conteúdo...
Finalizando...
Concluído
Falhou — tentar novamente
```

Não mostrar um spinner infinito sem explicação.

---

# 10. Quiz

O quiz é uma área crítica. Não pode perder respostas.

Layout desktop:

```text
┌──────────────────────────────────────────────┐
│ Simulado      4/20        progresso     sair │
├──────────────────────────────────────────────┤
│                                              │
│ Pergunta                                     │
│                                              │
│ Enunciado                                    │
│                                              │
│ ○ Alternativa A                              │
│ ○ Alternativa B                              │
│ ○ Alternativa C                              │
│ ○ Alternativa D                              │
│                                              │
├──────────────────────────────────────────────┤
│ ← Anterior                 Próxima →         │
└──────────────────────────────────────────────┘
```

Mobile deve priorizar a pergunta, não barras laterais.

### Comportamento

- resposta selecionada fica persistida imediatamente no estado local;
- autenticado: sincronizar com backend de forma segura;
- guest: persistir em IndexedDB;
- refresh não pode apagar respostas;
- botão `Próxima` não pode criar respostas duplicadas;
- ao finalizar, pedir confirmação apenas se houver questão não respondida;
- teclado pode navegar quando fizer sentido;
- foco visível sempre preservado.

---

# 11. Resultado

O resultado não deve parar em "Você acertou 14/20".

Hierarquia:

```text
RESULTADO
  ↓
Pontuação principal
  ↓
Resumo rápido
  ↓
Acertos / erros / não respondidas
  ↓
Questões para revisar
  ↓
Insights de aprendizagem
  ↓
Próxima melhor ação
```

Ações:

```text
[ Revisar erros ]
[ Refazer simulado ]
[ Voltar à biblioteca ]
```

Guest:

```text
[ Salvar no dispositivo ]
[ Exportar JSON ]
[ Criar conta para sincronizar ]
```

A criação de conta deve ser uma oportunidade contextual, não um bloqueio retroativo.

---

# 12. Biblioteca

Autenticado:

```text
Meus simulados
├── Recentes
├── Favoritos
├── Concluídos
└── Rascunhos / falhos
```

Ações por simulado:

```text
Continuar
Ver resultado
Duplicar
Renomear
Excluir
```

Ações destrutivas devem ter confirmação ou undo conforme o caso.

Guest:

```text
Meus simulados neste dispositivo
```

Sem fingir que existe sincronização.

---

# 13. Sistema de botões — padrão empresa grande

Este é um requisito de qualidade, não um detalhe visual.

Todo componente de ação assíncrona deve obedecer à máquina de estados:

```text
IDLE
  ↓ clique
PENDING
  ↓
SUCCESS / ERROR
  ↓
IDLE
```

Nunca:

```text
IDLE → clique → request
IDLE → clique → request
IDLE → clique → request
```

## Regra obrigatória contra double click

Ao iniciar a operação:

1. bloquear a ação **no mesmo evento**;
2. atualizar visualmente o botão;
3. impedir nova execução no handler;
4. gerar idempotency key quando a operação criar/mutacionar recurso;
5. liberar ou substituir o estado conforme resultado.

O `disabled` visual sozinho não é proteção suficiente.

## Estados visuais

Todo botão assíncrono deve ter:

```text
idle
hover
focus-visible
pressed
pending
success
error
disabled
```

### Pending

Exemplo:

```text
[ Gerar simulado ]
         ↓
[ ◌ Gerando...  ]
```

A largura do botão deve permanecer estável para evitar layout shift.

Não trocar o botão inteiro por outro elemento durante a requisição.

---

# 14. Erros bobos que são proibidos

## Críticos — P0

| Erro | Regra |
|---|---|
| Double click cria dois recursos | Idempotência + bloqueio imediato |
| Duplo submit de formulário | Um único caminho de submit |
| Gerar IA duas vezes | `idempotencyKey` + estado do workflow |
| Respostas do quiz são perdidas no refresh | Persistência local imediata |
| Polling continua depois de sair da tela | Limpar timers/subscriptions |
| Duas requisições de salvar chegam fora de ordem | Versionamento/timestamp/ordenação |
| Usuário consegue acessar recurso de outra conta | Autorização por recurso no backend |
| Secret aparece no frontend | Nenhuma credencial privada em `VITE_*` |
| Ação destrutiva acontece sem proteção | Confirm/undo conforme risco |
| Erro 500 revela stack trace | Mensagem pública segura |

## Alta prioridade — P1

| Erro | Regra |
|---|---|
| Botão parece disabled, mas ainda executa | Guard no handler |
| Spinner infinito | timeout/erro/estado final sempre definido |
| Toasts empilhados infinitamente | deduplicação e limite |
| Enter envia formulário errado | `type="button"` e submit explícito |
| Modal abre duas vezes | estado único por modal |
| Usuário perde texto ao navegar | draft/autosave/guard |
| Back do navegador reenvia POST | POST nunca depende de reload/back |
| Retry cria recurso duplicado | idempotência |
| 401 causa loop infinito | uma estratégia clara de refresh/logout |
| 429 sem explicação | mensagem + cooldown quando adequado |
| Rede cai durante quiz | estado local + retry controlado |
| JSON inválido só mostra "erro" | apontar linha/campo/problema |
| Upload repetido cria arquivos órfãos | upload idempotente/cleanup |
| Página usa dados antigos após mutation | invalidação/revalidação controlada |

## Qualidade — P2

| Erro | Regra |
|---|---|
| Layout pula ao carregar | skeleton com dimensões próximas do conteúdo |
| Botões mudam de tamanho durante loading | largura/estrutura estáveis |
| Foco do teclado desaparece | gerenciamento explícito de foco |
| Clique pequeno no mobile | área de toque confortável |
| Ícone sem nome não é acessível | aria-label/label visível |
| Cor é a única indicação de erro | texto/ícone/estado adicional |
| Animação bloqueia interação | animação decorativa nunca deve prender usuário |
| Busca dispara request a cada tecla | debounce |
| Busca usa debounce para submit | submit continua imediato, mas protegido |
| Imagens estouram layout | width/height ou aspect-ratio definidos |

---

# 15. Formulários

Padrão:

```text
label
campo
helper text (se necessário)
erro contextual
```

Regras:

- validação local para feedback rápido;
- validação backend sempre obrigatória;
- não limpar todos os campos quando um campo falha;
- preservar input ao ocorrer erro de rede;
- impedir submit enquanto estiver pending;
- erro deve apontar o campo ou causa;
- foco inicial deve ser lógico;
- `Enter` deve ter comportamento previsível.

---

# 16. Loading, erros e vazio

Toda tela relevante deve definir os quatro estados antes de ser implementada:

```text
LOADING
SUCCESS
EMPTY
ERROR
```

Para dados assíncronos complexos:

```text
IDLE
LOADING
PARTIAL/PROCESSING
SUCCESS
ERROR
RETRYING
```

Nunca deixar uma área simplesmente vazia porque a API ainda não respondeu.

---

# 17. Navegação e perda de dados

### Back do navegador

Não deve:

- repetir mutation;
- apagar formulário;
- criar recurso duplicado;
- quebrar o estado do quiz.

### Sair do quiz

Se existirem respostas ainda não sincronizadas:

```text
Você tem respostas não sincronizadas.

[ Continuar ] [ Sair e salvar localmente ]
```

Para guest, salvar localmente antes de permitir a saída.

---

# 18. Offline e rede instável

O frontend deve assumir que a rede pode falhar.

### Guest

É o caso mais simples: o estado principal é local.

### Autenticado

O mínimo aceitável:

```text
resposta local
   ↓
sync
   ↓
servidor
```

Se a sincronização falhar:

```text
salvo neste dispositivo
aguardando sincronização
```

Não dizer "salvo" quando só está no servidor; não dizer "salvo na nuvem" quando está apenas local.

---

# 19. Arquitetura de componentes

Estrutura sugerida:

```text
apps/web/
├── src/
│   ├── app/
│   ├── routes/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── simulations/
│   │   ├── quiz/
│   │   ├── results/
│   │   └── guest/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── feedback/
│   ├── lib/
│   │   ├── api/
│   │   ├── storage/
│   │   ├── validation/
│   │   └── telemetry/
│   └── styles/
```

Componentes de UI devem ser pequenos e previsíveis. Regra de negócio não deve ficar espalhada em botões visuais.

---

# 20. Contrato para ações assíncronas

Toda mutation do frontend deve responder a perguntas objetivas:

```text
Qual estado dispara a ação?
Como o double click é bloqueado?
Como a operação é cancelada?
Como o usuário vê progresso?
O que acontece com erro de rede?
O que acontece com 401?
O que acontece com 429?
O que acontece se a página for atualizada?
A operação é idempotente?
Onde o estado é persistido?
```

Se uma ação não tiver resposta para essas perguntas, ela ainda não está pronta para implementação.

---

# 21. Idempotência por tipo de ação

| Ação | Idempotência | Persistência |
|---|---|---|
| Login | recomendada | sessão |
| Register | obrigatória contra duplicidade | banco |
| Gerar simulado IA | **obrigatória** | banco/workflow |
| Salvar resposta | obrigatória | local + servidor |
| Finalizar tentativa | obrigatória | banco |
| Importar JSON | determinística | local ou banco |
| Excluir simulado | obrigatória | banco/local |
| Exportar JSON | pode ser repetido | download |
| Busca | não necessário | nenhum |

---

# 22. Acessibilidade mínima de produto

```text
[ ] navegação por teclado
[ ] focus-visible
[ ] labels reais em formulários
[ ] aria-label em ícones interativos
[ ] contraste adequado
[ ] mensagens de erro anunciadas de forma acessível
[ ] loading informado semanticamente
[ ] modal com foco controlado
[ ] escape fecha modal quando apropriado
[ ] áreas clicáveis confortáveis no mobile
[ ] reduced motion respeitado
```

---

# 23. Performance

Prioridades:

1. Não carregar recursos da landing que não são necessários para o primeiro paint.
2. Imagens do produto otimizadas, preferencialmente WebP/AVIF quando apropriado.
3. SVG para logos/ícones vetoriais.
4. Lazy-load para conteúdo abaixo da dobra quando fizer sentido.
5. Evitar dependências grandes sem necessidade.
6. Não renderizar a biblioteca inteira se paginação/virtualização for necessária.
7. Animações devem usar propriedades eficientes e não bloquear interação.

Assets fixos do produto continuam no frontend. Uploads grandes e conteúdo criado por usuários entram em R2 quando a funcionalidade existir.

---

# 24. Estados globais que precisam existir desde o começo

```text
AuthState
  ├── anonymous
  ├── authenticating
  ├── authenticated
  └── expired

NetworkState
  ├── online
  └── offline

AsyncActionState
  ├── idle
  ├── pending
  ├── success
  └── error

SimulationGenerationState
  ├── draft
  ├── pending
  ├── processing
  ├── ready
  └── failed

QuizAttemptState
  ├── not_started
  ├── in_progress
  ├── syncing
  ├── completed
  └── recovery_required
```

Esses estados devem existir no modelo da aplicação antes de o design tentar escondê-los.

---

# 25. Critério de aceite do frontend

O frontend não é considerado pronto somente porque "a tela funciona".

### Fluxo de entrada

```text
[ ] landing → login
[ ] landing → register
[ ] landing → guest
[ ] login → dashboard
[ ] register → dashboard
[ ] intenção original é preservada
```

### Guest

```text
[ ] JSON válido entra
[ ] JSON inválido é explicado
[ ] simulado fica persistido localmente
[ ] refresh não perde dados
[ ] quiz funciona sem API
[ ] resultado funciona sem API
[ ] exportação funciona
[ ] exclusão funciona
[ ] nenhuma chamada de IA ocorre
```

### Autenticado

```text
[ ] criar com IA
[ ] não duplica geração com double click
[ ] workflow aparece com estado real
[ ] falha pode ser recuperada
[ ] biblioteca atualiza após mutation
[ ] quiz não perde respostas
[ ] resultado é persistido
```

### Robustez

```text
[ ] 401
[ ] 403
[ ] 404
[ ] 409
[ ] 422
[ ] 429
[ ] 500
[ ] timeout
[ ] offline
[ ] refresh durante operação
[ ] back button
[ ] duplo clique
[ ] tecla Enter repetida
```

---

# 26. Ordem de implementação recomendada

Não começar pelo dashboard completo.

```text
1. Design system + tokens
2. Button / Input / Modal / Toast / Dialog
3. Shell de navegação
4. Landing
5. Auth
6. Guest JSON flow
7. Quiz
8. Resultado
9. Dashboard
10. Biblioteca
11. Criação com IA
12. estados de processamento/falha
13. autosave/sincronização
14. acessibilidade
15. performance
16. testes E2E dos fluxos críticos
```

A razão é importante: **componentes de interação errados contaminam todas as telas**. Primeiro consertamos a fundação, depois multiplicamos os padrões.

---

# 27. Definição do produto frontend

O Simulify deve parecer um produto único, não quatro páginas independentes.

A experiência completa é:

```text
                    SIMULIFY
                       │
               ┌───────┴───────┐
               │               │
          COM CONTA        SEM CONTA
               │               │
               ▼               ▼
          CRIAR / USAR     IMPORTAR JSON
          SIMULADOS             │
               │                │
               └───────┬────────┘
                       ▼
                     QUIZ
                       │
                       ▼
                   RESULTADO
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
           REVISAR   REFAZER  EVOLUIR
              │        │        │
              └────────┴────────┘
                       │
                       ▼
                  PRÓXIMO ESTUDO
```

**A métrica mental do frontend é:** o usuário sabe sempre **onde está, o que está acontecendo, se sua ação foi registrada e qual é o próximo passo**.

---

# 28. Decisão final

A arquitetura de experiência aprovada para implementação é:

```text
LANDING
 ├── Authenticated journey
 │     ├── Dashboard
 │     ├── Criar com IA
 │     ├── Biblioteca
 │     ├── Quiz
 │     └── Resultados
 │
 └── Guest journey
       ├── Colar/importar JSON
       ├── Biblioteca local
       ├── Quiz local
       └── Resultados locais
```

A implementação deve tratar **confiabilidade de interação** como requisito funcional. Double click, perda de dados, requests duplicados, estados de loading indefinidos, race conditions e inconsistência após navegação são bugs de produto e não apenas "detalhes de frontend".
