# DESIGN.md — Simulify: Sistema de Design, Estratégia e Arquitetura de Produto

> **Visão Geral:** Este documento estabelece o posicionamento estratégico, a identidade visual, os padrões de engenharia de interface e a experiência de usuário (UX) do **Simulify** — a plataforma de simulados e preparação de alta performance para ENEM e Concursos Públicos.

---

## 1. Posicionamento de Marca & Estratégia de Negócio

### 1.1 O Propósito do Simulify
O Simulify **não é apenas um sistema de questionários**. É um **ambiente de diagnóstico e evolução do estudante**. 
* **O Problema do Usuário:** Concurseiros e vestibulandos resolvem milhares de questões de forma desordenada, não sabem quais matérias puxam sua nota para baixo, sofrem com interfaces burocráticas ou poluidíssimas, e perdem a sensação de prova real.
* **A Promessa do Simulify:** "Pratique melhor. Passe preparado." Proporcionamos treino no padrão exato da banca examinadora (cronômetro, caderno de prova impresso, eliminação de alternativas) combinado com diagnóstico inteligente de pontos fracos.

### 1.2 Identidade Visual: O Encontro entre Inovação e Foco
* **Logotipo (Inspirado no design-1.png):** O monograma com as duas fitas geométricas arredondadas que formam o "S" em gradiente azul cobalto e violeta. Representa velocidade, fluidez, evolução contínua e modernidade tecnológica.
* **Linguagem de Interface (Inspirada no design-2.png):** 
  - Estética **"Academic Tech"**: Um híbrido entre a precisão e densidade de informação do **Linear**, a clareza tipográfica e ritmo espacial do **Notion**, e o loop adaptativo de retenção do **Quizlet**.
  - Evitamos o aspecto de "CRUD genérico cheio de cards brancos idênticos". Usamos superfícies elevadas, hierarquia de texto clara e cores focadas exclusivamente em **ação** e **progresso**.

---

## 2. Sistema de Design Tokens

### 2.1 Paleta de Cores

| Nome do Token | Hexadecimal | Uso Principal |
| :--- | :--- | :--- |
| **Primary (Cobalto)** | `#4F46E5` / `#6366F1` | Ações principais, botão de avanço, foco de seleção ativo |
| **Secondary (Violeta)** | `#8B5CF6` | Elementos de IA, destaques especiais, gradientes de marca |
| **Dark Canvas (Landing Hero)** | `#0B0F19` | Fundo imersivo da Landing Page, contraste premium |
| **Light Canvas (App Background)** | `#F8FAFC` | Fundo da aplicação (descanso visual para sessões longas) |
| **Surface (Card / Painel)** | `#FFFFFF` | Superfícies principais de leitura |
| **Surface Muted** | `#F1F5F9` | Fundos de badges, barras secundárias, containers de código/JSON |
| **Border Normal** | `#E2E8F0` | Linhas divisórias sutis (sem caixas pesadas) |
| **Text Primary** | `#0F172A` | Títulos, enunciados de questões e dados chave |
| **Text Secondary** | `#475569` | Metadados, subtítulos, explicações e timestamps |
| **Text Muted** | `#94A3B8` | Placeholders e atalhos de teclado |
| **Success (Acerto)** | `#10B981` | Questão correta, evolução positiva de desempenho |
| **Danger (Erro)** | `#EF4444` | Questão incorreta, alerta de tempo |
| **Warning (Revisar)** | `#F59E0B` | Questão marcada para revisão |

### 2.2 Tipografia
* **Família Principal:** `Plus Jakarta Sans`, sans-serif (para títulos de impacto, números de métricas, botões e branding).
* **Família de Conteúdo/Leitura:** `Inter` (para enunciados densos de questões, textos de suporte e explicações pedagógicas).
* **Escala Tipográfica:**
  - Hero Display: `44px` / `52px` (Bold - 700)
  - H1 Dashboard: `28px` / `36px` (SemiBold - 600)
  - H2 Seções: `20px` / `28px` (SemiBold - 600)
  - H3 Questão/Tópico: `16px` / `24px` (Medium - 500)
  - Body Text: `14px` / `22px` (Regular - 400)
  - Small / Metadados: `12px` / `16px` (Medium - 500)
  - Micro / Atalhos: `11px` / `14px` (SemiBold - 600)

### 2.3 Raios de Arredondamento (Border Radius)
* `sm` (6px): Badges, tags de matérias, inputs compactos.
* `md` (10px): Botões de ação, itens de alternativas, cards secundários.
* `lg` (16px): Cards de métricas, modais, painel de prova.
* `full` (9999px): Avatares, pílulas de status, botões redondos de cronômetro.

---

## 3. Padrões de Interface "Enterprise-Grade" (Tolerância Zero a Erros de Amador)

Para garantir que o produto passe a sensação de um software de primeira linha (Apple, Linear, Stripe), implementamos as seguintes regras fundamentais:

1. **Prevenção de Duplo Clique e Debounce:**
   - Todo botão de ação assíncrona ou de submissão (ex: "Iniciar Prova", "Finalizar Simulado", "Importar JSON") possui trava automática de reentrância.
   - Ao ser clicado, ganha instantaneamente `pointer-events: none` e estado visual de `disabled` ou spinner sutil, impedindo requisições repetidas ou submissões duplas.
2. **Auto-Salvamento Resiliente de Estado da Prova:**
   - Cada alternativa selecionada, questão marcada para revisão e tempo decorrido é persistido localmente. O MVP usa IndexedDB com fallback de compatibilidade em `localStorage`.
   - Se o usuário fechar a aba acidentalmente, atualizar ou faltar energia, ao reabrir o Simulify um aviso amigável restaura exatamente onde ele parou: *"Simulado em andamento recuperado com sucesso"*.
3. **Ergonomia e Atalhos de Teclado (Power User):**
   - Teclas `1`, `2`, `3`, `4`, `5` ou `A`, `B`, `C`, `D`, `E` selecionam diretamente a alternativa da questão ativa.
   - Setas `←` e `→` avançam e voltam entre as questões.
   - Tecla `R` marca a questão para "Revisar depois".
   - Tecla `E` ou clique no ícone de tesoura/risco ativa a eliminação visual da alternativa.
   - `Ctrl + K` abre a paleta de comandos rápida (Linear-style).
4. **Eliminação Inteligente de Alternativas:**
   - Em provas de concurso, eliminar alternativas absurdas é a principal técnica de resolução.
   - O botão de riscar alternativa não polui visualmente: é sutil e só ganha destaque no hover/foco. A alternativa riscada fica com opacidade reduzida (50%) e texto tachado (`line-through`), mas permanece legível caso o usuário mude de ideia.
5. **Zero Layout Shifts (CLS) e Estados de Vazio Elegantes:**
   - Nenhum elemento salta na tela ao carregar.
   - Telas vazias (ex: sem simulados ainda) possuem orientações calorosas e um botão de ação rápido ("Criar primeiro simulado com IA" ou "Colar JSON de exemplo").
6. **Acessibilidade e Feedback de Alta Precisão:**
   - Contraste sempre aprovado por WCAG AA.
   - Foco visual nítido para navegação completa sem mouse (`focus-visible: ring-2`).

---

## 4. O Modo de Impressão Realista (Padrão Caderno de Provas Concurso/ENEM)

Um diferencial crítico solicitado pelos concurseiros é treinar com caneta preta e papel, simulando as 4h30 de tensão física da prova.

### 4.1 Especificação do Caderno Impresso
* **Formato A4 em 2 Colunas:** Padrão clássico de bancas como Cespe/Cebraspe, FGV, FCC e Vunesp.
* **Cabeçalho Oficial de Concurso:**
  - Nome do Simulado, Data, Campo para Nome do Candidato e Número de Inscrição.
  - Caixa de Instruções Gerais:
    > *"1. Confira se este caderno contém a quantidade indicada de questões. 2. Cada questão apresenta 4 ou 5 opções, com apenas uma resposta correta. 3. Preencha o cartão-resposta anexo ao final da prova com caneta esferográfica preta."*
* **Diagramação e Quebra de Página:**
  - Uso estrito de `@media print` com `page-break-inside: avoid` em cada bloco de questão para **nunca cortar uma questão ou gráfico no meio de duas páginas**.
  - Economia de tinta: remoção de fundos escuros, sombras ou elementos decorativos supérfluos, utilizando traços nítidos e tipografia em preto puro (`#000000`).
* **Cartão-Resposta / Gabarito Rascunho:**
  - Uma seção destacável ao final com grade de bolinhas numeradas de 1 a N com letras (A, B, C, D, E) para o candidato treinar o preenchimento de gabarito contra o relógio.
* **Folha de Resolução / Gabarito Comentado Separado:**
  - Opção no menu de impressão: `Imprimir Prova do Candidato` (sem respostas) OU `Imprimir Gabarito Comentado com Justificativas`.

---

## 5. Arquitetura Local-First (Modo Convidado Sem Login)

O Simulify remove completamente o atrito inicial para experimentar:
1. **Zero Bloqueios para Começar:**
   - Na Landing Page, há botões claros: **"Começar Grátis"** ou **"Treinar Agora (Sem Cadastro)"**.
   - O usuário pode imediatamente colar um JSON com questões ou usar simulados modelo pré-carregados (ex: "ENEM - Ciências Humanas 2024", "Concurso Caixa - Português").
2. **Armazenamento no Navegador:**
   - Todo o histórico de provas realizadas, tempo gasto, acertos e gabaritos fica salvo no IndexedDB local. Preferências simples continuam em `localStorage`.
3. **Importador de JSON Tolerante a Falhas:**
   - Validador com parser amigável: se faltar uma vírgula ou uma chave, o sistema aponta a linha com erro em vez de dar tela branca.
   - Fornece um botão instantâneo: **"Copiar Modelo JSON"** e **"Carregar Simulado de Exemplo"**.
4. **Soft-Conversion (Transição Suave para Conta):**
   - Na tela de resultados ou no topo do dashboard, um card discreto informa:
     > *"Você está no modo offline. Seus dados estão salvos neste navegador. Deseja criar uma conta gratuita para não perder seu histórico e estudar no celular?"*

---

## 6. O Ciclo de Aprendizado (Loop Diagnóstico)

```
┌────────────────────────────────────────────────────────┐
│ 1. ESCOLHA / IMPORTAÇÃO                                 │
│ Matéria + Banca + Quantidade + TempoLimite             │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. RESOLUÇÃO REALISTA                                  │
│ Modo Focado / Cronômetro / Eliminar Alternativas / Print│
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. CORREÇÃO & DIAGNÓSTICO IMEDIATO                     │
│ Taxa de Acerto + Tempo Médio por Questão               │
│ Gráfico de Desempenho por Assunto Específico           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. PRÓXIMA MELHOR AÇÃO (LEARNING LOOP)                 │
│ "Você errou 3 questões de Crase. Deseja gerar uma      │
│  revisão rápida dessas 3 falhas agora?"                │
└────────────────────────────────────────────────────────┘
```
