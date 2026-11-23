# Página inicial (`/`)

Landing pública da LAWD: uma tela só, com o logo em 3D e o pedido de aviso do processo seletivo. Fica em `app/page.tsx`, com os componentes em `app/_components/`.

| Arquivo | Papel |
|---|---|
| `landing_page.tsx` | Estrutura: cabeçalho (marca só com "Lawd", tema, Entrar), título, texto e formulário centralizados, e a área livre embaixo onde a esfera aparece |
| `logo_globe.tsx` | Logo da LAWD como esfera 3D em canvas |
| `selection_notice_form.tsx` | Formulário de aviso (só e-mail) |

## Layout

Conteúdo centralizado no alto e a esfera grande subindo de baixo, cortada pela borda da tela (só a calota de cima aparece). O canvas cobre a página inteira, atrás do conteúdo (`z-10`); a posição da esfera vem da área livre abaixo do formulário (`stageRef`), então ela nunca fica por baixo do texto. Em telas estreitas a esfera passa das laterais, para a calota não ficar pequena.

## Esfera do logo (`logo_globe.tsx`)

Desenhada em **canvas 2D, sem biblioteca 3D** (o projeto não tem three.js e a ideia foi não instalar nada): os pontos são girados e projetados em perspectiva no próprio código.

- **Forma**: casca roxa oca. Os traços brancos do logo são **recortes** nela; pelos recortes aparece o interior da casca, e cada recorte tem parede (a espessura dela)
- **De onde vêm os traços**: os três nós da frente foram medidos sobre `public/logo.png`. Os traços que no logo chegam à borda continuam até outros nós (quatro logo atrás da borda e um no lado oposto), formando uma rede só de oito nós, com cada traço num círculo máximo. Só um par de traços se cruza, como no logo. A primeira versão levava cada traço até o ponto oposto do seu nó: todos convergiam no lado de trás e picotavam a casca em lascas
- **Paredes nas quinas**: onde dois recortes se emendam (traço com anel, traço com traço), a parede de cada um acaba exatamente na divisa do outro, calculada uma vez ao montar o modelo
- **No horizonte**: onde um recorte passa para o lado de trás, o perfil da esfera fica aberto (dá para ver através) e aparece a parede do outro lado. Desenhar só a face da frente deixava a esfera com cara de geometria cortada
- **Órbitas**: seis círculos finos em volta da esfera, com pontos de conexão circulando. Somem quando passam atrás dela, e a opacidade varia de forma contínua com a profundidade (um degradê por órbita), sem degraus
- **Movimento**: gira sozinha (uma volta a cada 90 s) em torno de um eixo quase horizontal, com o desenho surgindo por trás do horizonte. Na entrada, a esfera já aparece completa: sobe um pouco, ganha opacidade e desacelera o giro, enquanto as órbitas se desenham. Abrir os recortes aos poucos foi descartado, porque deixava anéis e traços pela metade
- **Arrastar**: mouse ou dedo giram a esfera, com um pouco de impulso ao soltar; depois o giro automático volta aos poucos. No celular, arrastar na vertical continua rolando a página (`touch-pan-y`)
- **Sem animação** (`prefers-reduced-motion`): esfera parada e completa; só se mexe se a pessoa arrastar
- **Tema**: a casca é igual nos dois modos. O interior visto pelos recortes é escuro no tema escuro e branco no claro (como os traços brancos do logo), e órbitas e pontos trocam de cor para contrastar com o fundo. O tema é lido da classe `light-mode` do `<html>`
- **Desempenho**: para de animar fora da tela, e o canvas tem um teto de pixels reais (`MAX_BACKING_SIZE`)

As cores são os tons da paleta `brand` de `styles/lawd-theme.css`, repetidos em RGB no arquivo porque o canvas monta os degradês em código.

## Formulário de aviso

Só o e-mail, com validação Zod (`react-hook-form`), numa barra de vidro com o botão. O envio segue o fluxo padrão: `useSubscribeToSelection` (`hooks/recruitment/`) → `subscribeToSelection` (`services/recruitment/`) → `POST /recruitment/selection-subscribers` ([backend](../back/recruitment/selection_subscribers.md)).

- Enquanto envia, o botão fica carregando
- Deu certo: toast de confirmação com o e-mail e o campo é limpo. Quem já estava na lista recebe a mesma confirmação
- Deu errado: erro de validação do backend aparece no campo; qualquer outro vira toast (`handleApiError`)
