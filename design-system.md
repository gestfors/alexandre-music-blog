# Design System · Pattern Library — Robson Svicero

> Biblioteca viva com os padrões visuais e de interação deste site.

Referência central para tipografia, componentes, superfícies, layout e motion usando exatamente as classes, estruturas e comportamentos da implementação original.

Este documento organiza exemplos canônicos para manter consistência entre estratégia visual, experiência de uso e implementação front-end.

---

## Navegação

- [Hero](#hero)
- [Tipografia](#tipografia)
- [Cores & Superfícies](#cores--surfaces)
- [Componentes UI](#componentes-ui)
- [Layout & Spacing](#layout--spacing)
- [Motion & Interaction](#motion--interaction)
- [Ícones](#ícones)

---

## Hero

**Eyebrow:** Design System · Pattern Library

**Heading (h1):** Biblioteca viva com os padrões visuais e de interação deste site.

**Lead:** Referência central para tipografia, componentes, superfícies, layout e motion usando exatamente as classes, estruturas e comportamentos da implementação original.

**CTAs:**
- Botão primário → `Explorar estilos` (`btn btn-primary`)
- Botão secundário → `Ver componentes` (`btn btn-secondary`)

**Nota:** Este documento organiza exemplos canônicos para manter consistência entre estratégia visual, experiência de uso e implementação front-end.

**Mídia:** Vídeo em loop com overlay (`hero-video` + `hero-overlay`), poster `assets/images/hero-poster.jpg`, fontes `assets/videos/hero-loop.webm` e `assets/videos/hero-loop.mp4`.

---

## Tipografia

> Escala tipográfica em uso real.

### Heading 1

- **Tamanho:** 56px / 59px → 80px / 84px
- **Exemplo:** *Criação de sites que transformam visitantes em clientes.*

### Heading 2

- **Tamanho:** 34px / 37px → 56px / 60px
- **Exemplo:** *Design e desenvolvimento em uma única entrega.*

### Heading 3

- **Tamanho:** 28px / 32px
- **Exemplo:** *Landing Pages*

### Bold L

- **Tamanho:** 17px / 25px
- **Uso:** Texto de botão principal de ação
- **Classe:** `btn btn-secondary`

### Bold M

- **Tamanho:** 14px / 21px
- **Uso:** Links de navegação do `topnav`
- **Exemplo:** `Início`

### Bold S

- **Tamanho:** 12px / 18px
- **Uso:** Tags / badges
- **Classe:** `tag`
- **Exemplo:** `Design Systems`

### Paragraph (Lead)

- **Tamanho:** 21px / 30px
- **Classe:** `lead`
- **Exemplo:** *A página certa organiza proposta de valor, remove ruído da decisão e conduz o visitante.*

### Regular L

- **Tamanho:** 17px / 25px
- **Uso:** Texto de suporte padrão para conteúdo principal e blocos descritivos.

### Regular M

- **Tamanho:** 14px / 21px
- **Classe:** `quote-author`
- **Exemplo:** *Cliente de serviços de UX e Dev*

### Regular S

- **Tamanho:** 12px / 18px
- **Classe:** `meta`
- **Uso:** Metadados, rótulos e informação auxiliar.

---

## Cores & Surfaces

> Superfícies, contrastes, bordas e gradientes em contexto.

### Paleta de Cores (Tokens)

As cores principais são definidas via CSS variables no `styles.css`.

| Token | Cor (Hex) | Função |
| --- | --- | --- |
| `--bg` | `#F3E9DC` | Background principal da página |
| `--surface` | `#F5ECE1` | Superfície secundária (cards, seções) |
| `--surface-warm` | `#F7F1E8` | Superfície alternativa quente (botões sec.) |
| `--fg` | `#2E2E2E` | Texto principal, fundos escuros |
| `--fg-2` | `#4D4D4D` | Texto secundário, subtítulos |
| `--muted` | `#777777` | Texto de apoio, descrições |
| `--meta` | `#969696` | Metadados, rótulos menores |
| `--border` | `#D6CDC2` | Bordas e divisores padrão |
| `--border-soft` | `#E6DDD3` | Bordas mais suaves, seções |
| `--accent` | `#2E2E2E` | Cor de destaque primária (Roxo) |
| `--accent-on` | `#ffffff` | Cor do texto sobre o destaque |
| `--accent-hover` | `#4D4D4D` | Hover da cor de destaque |
| `--accent-active` | `#202020` | Active/Pressed da cor de destaque |
| `--success` | `#16a34a` | Feedback positivo / Sucesso |
| `--warn` | `#eab308` | Feedback de alerta / Aviso |
| `--danger` | `#D63C3C` | Feedback negativo / Erro |

### Superfícies

| Token            | Classe        | Descrição                                                          |
| ---------------- | ------------- | ------------------------------------------------------------------ |
| `--bg`           | `card`        | Plano principal com fundo claro e leitura de alto contraste.       |
| `--surface`      | `card-soft`   | Superfície de apoio para blocos de conteúdo e separação visual.    |
| `--fg`           | `card-dark`   | Faixa de destaque para conteúdo estratégico e casos.               |

### Borders / Dividers

1. **Borda suave (`--border-soft`)** — Elementos usam separação com variações de contraste leve.
2. **Divisores (`--border`)** — Seções usam linhas discretas para ritmo vertical.

### Gradients / Overlays

- Overlay do hero aplicado sobre mídia para legibilidade e profundidade.
- Classe: `hero-overlay`
- Visual: exibido no bloco `case-visual`

---

## Componentes UI

> Elementos de interface e estados interativos.

### Botões

| Variante              | Classe(s)                         | Label exemplo           |
| --------------------- | --------------------------------- | ----------------------- |
| Button Default        | `btn btn-primary`                 | Solicitar orçamento     |
| Button Hover + Active | `btn btn-primary`                 | Passe o mouse e clique  |
| Button Focus          | `btn btn-secondary`               | Use Tab para foco       |
| Button Disabled       | `btn btn-secondary` + `disabled`  | Desabilitado            |
| Button Secondary      | `btn btn-secondary`               | Ver projetos            |
| Button Dark           | `btn btn-dark`                    | Enviar mensagem         |
| Button Ghost / Arrow  | `btn btn-ghost btn-arrow`         | Abrir projeto           |

### Inputs (Campos de formulário)

> Estados nativos com foco visual via borda e focus ring.

Componente: `contact-panel` com `form-grid`

| Campo          | Elemento    | Classe     | Placeholder                                               |
| -------------- | ----------- | ---------- | --------------------------------------------------------- |
| Nome           | `input`     | `input`    | Seu nome                                                  |
| E-mail         | `input`     | `input`    | voce@empresa.com                                          |
| Sobre o projeto| `textarea`  | `textarea` | Conte em poucas linhas o que você precisa construir.      |

**Status:** "Use Tab para visualizar o estado de foco." (`role="status"`, `aria-live="polite"`)

---

## Layout & Spacing

> Padrões de composição e ritmo entre blocos.

### Pattern 1 — Grid 2-1 Split

- **Classe:** `grid-2-1`
- **Descrição:** Relação de proporção 2:1 para hierarquia de leitura.
- **Uso:** Ideal para seções de explicação, credibilidade e narrativa estratégica.
- **Estrutura:**
  - Lado esquerdo (2fr): eyebrow + heading
  - Lado direito (1fr): lead + parágrafo de suporte

### Pattern 2 — Grid 3 Cards

- **Classe:** `grid-3`
- **Descrição:** Grade responsiva para apresentar serviços, benefícios ou blocos de valor.
- **Estrutura:** 3 cards (`card feature`) com:
  - Ícone SVG dentro de `feature-mark`
  - Título `h3`
  - Parágrafo descritivo

| Coluna    | Conteúdo                                                                   |
| --------- | -------------------------------------------------------------------------- |
| Coluna 1  | Card com conteúdo curto e ícone para agrupamento funcional.                |
| Coluna 2  | Grade responsiva para apresentar serviços, benefícios ou blocos de valor.  |
| Coluna 3  | Espaçamento consistente com ritmo vertical definido por tokens de espaço.  |

### Pattern 3 — Timeline

- **Classe:** `timeline` (`<ol>`)
- **Item:** `step` (`<li>`) com `.num` + `<strong>` + `<p>`

| Etapa | Título      | Descrição                          |
| ----- | ----------- | ---------------------------------- |
| 01    | Descoberta  | Entendimento inicial do problema.  |
| 02    | UX          | Estrutura de jornada e prioridade. |
| 03    | UI          | Direção visual e componentes.      |
| 04    | Dev         | Implementação com consistência.    |
| 05    | Entrega     | Ajustes e publicação orientada.    |

---

## Motion & Interaction

> Galeria de transições e comportamentos interativos.

### Button Hover / Active

- **Classe:** `btn btn-primary`
- **Comportamento:** Transição de background, border e escala no ativo.

### Ghost Arrow Motion

- **Classe:** `btn btn-ghost btn-arrow`
- **Comportamento:** Deslocamento horizontal no hover do texto e seta.

### Footer Link Hover

- **Classe:** `footer-links > a`
- **Comportamento:** Links com alteração de cor e leve escala no hover.

### Menu Toggle Transition

- **Componente:** `menu-toggle` (barras `toggle-bar1/2/3`)
- **Comportamento:** Morph das barras em viewport menor (hambúrguer → X).
- **Nota:** Use o botão de menu no topo em viewport menor para ver o efeito.

### Scroll / Reveal — Back to Top

- **Classe:** `back-to-top` → `is-visible`
- **Comportamento:** O botão de retorno aparece conforme rolagem e usa transição de opacidade e deslocamento.

---

## Ícones

> Sistema de ícones bibliotecas do React (lucide ou outra).


---

## Rodapé

- **Classe:** `pagefoot`
- **Conteúdo:** © 2026 Professor Alexandre Ivo
- **Links:**
  - Início → `/`
  - Agendamentos → `/agendamentos.html`
  - Política de Privacidade → `/privacidade.html`
  - Voltar ao início → `#inicio`

---

## Fontes Utilizadas

- **DM Sans** títulos e body
- **DM Mono** badges

Carregamento via Google Fonts com `media="print" onload="this.media='all'"` para performance.