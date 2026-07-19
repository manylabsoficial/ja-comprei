# Visão UX Desktop — Já Comprei

## Norte do produto

No desktop, o Já Comprei deixa de ser um aplicativo mobile ampliado e passa a funcionar como uma **bancada de cozinha digital**: navegação persistente, contexto sempre visível, mais de uma informação útil por tela e menos passos para alternar entre leitura, lista e receitas.

O mobile continua sendo o melhor lugar para captura rápida. O desktop se torna o melhor lugar para **revisar, organizar, comparar e retomar**.

## Princípios

1. **Uma tarefa principal por tela.** A ação de maior valor deve ser inequívoca; alternativas ficam próximas, mas subordinadas.
2. **Persistência no desktop, foco no mobile.** Sidebar e contexto permanecem visíveis em telas grandes; no celular, a navegação inferior preserva espaço e alcance do polegar.
3. **Aproveitar largura, não apenas preencher largura.** Conteúdo usa colunas por função: orientação + execução, imagem + receita, resumo + atividade.
4. **Continuidade da jornada.** O usuário sempre entende em que etapa está: capturar → revisar → gerar → escolher → cozinhar/salvar.
5. **Dados reais ou estado vazio.** Métricas fictícias não aparecem. Sem dados, a interface explica o próximo passo útil.
6. **A comida é a cor.** A interface usa neutros quentes e dourado de forma disciplinada; fotografias carregam variedade visual.
7. **Acessibilidade por padrão.** Hierarquia semântica, foco visível, alvos generosos, teclado no desktop e respeito a movimento reduzido.

## Arquitetura de informação

### Navegação primária

- Visão geral
- Minhas receitas
- Minhas listas
- Perfil

### Criação

- Nova leitura (ação global principal)
- Entrada manual
- Entrada por voz

Esses caminhos aparecem de forma persistente na sidebar desktop. No mobile, a navegação inferior continua priorizando Início, Perfil, Escanear, Listas e Receitas.

## Modelo responsivo

### Mobile — até 767 px

- Fluxos verticais e focados.
- Navegação inferior fixa.
- Ações primárias ocupam a largura disponível.
- Captura e gravação recebem prioridade espacial.

### Tablet — 768 a 1023 px

- Grades de duas colunas onde há ganho real.
- Navegação inferior ainda presente.
- Conteúdo limitado para não criar linhas de texto longas.

### Desktop — a partir de 1024 px

- Sidebar fixa de 280 px.
- Cabeçalho contextual de 80 px.
- Conteúdo fluido com largura máxima entre 1260 e 1480 px, conforme a tarefa.
- Padrões de duas colunas para captura, voz, entrada manual e detalhe.
- Grades de biblioteca com 2–4 colunas conforme a largura.

## Padrões por fluxo

### Visão geral

- Hero de ação para iniciar leitura.
- Saldo e contadores vindos das fontes reais do produto.
- Métodos alternativos claramente subordinados.
- Atividade recente une listas e receitas em uma linha do tempo curta.

### Captura

- Desktop: orientação à esquerda e dropzone à direita.
- Aceita arrastar imagem, escolher arquivo ou usar câmera.
- Explica o que acontecerá antes de pedir permissão ou processar dados.

### Entrada manual

- Formato de planilha leve, sem parecer uma planilha complexa.
- Colunas previsíveis para ingrediente, quantidade e ação.
- Enter cria a próxima linha; exclusão é explícita; CTA só ativa com conteúdo válido.

### Entrada por voz

- Gravação e resultado coexistem no desktop.
- O usuário pode revisar a transcrição antes de transformar o texto em itens.
- Estados de gravação, processamento, erro e vazio são visualmente distintos.

### Revisão da despensa

- Itens usam grade no desktop e lista no mobile.
- Quantidade selecionada permanece visível.
- CTA de gerar receitas fica persistente sem cobrir a navegação lateral.

### Sugestões e bibliotecas

- Cards ganham densidade progressiva: uma coluna no mobile, até quatro no desktop.
- Fotografia permanece dominante.
- Estados vazios orientam uma ação, em vez de apenas informar ausência.

### Detalhe da receita

- Desktop: imagem persistente à esquerda e conteúdo rolável à direita.
- Mobile: imagem no topo e leitura linear.
- Ingredientes, metadados e preparo têm hierarquia própria, sem competir com salvar.

## Critérios de qualidade

- Nenhuma rolagem horizontal entre 320 e 1440 px.
- Toda ação interativa deve funcionar por teclado.
- Estados de carregamento, vazio e erro devem existir antes do estado ideal.
- Nenhum número de negócio pode ser inventado para preencher a interface.
- Cabeçalhos internos não devem duplicar o cabeçalho contextual desktop.
- CTAs fixos precisam respeitar sidebar, navegação inferior e safe area.
- Alterações visuais devem passar por build, lint dos arquivos tocados e verificação nos breakpoints de 390 e 1440 px.

## Métricas recomendadas

- Taxa de início de leitura no dashboard.
- Conclusão por etapa: captura → revisão → geração → abertura de receita.
- Tempo para corrigir uma leitura no desktop.
- Uso relativo de scanner, voz e entrada manual.
- Taxa de salvamento de listas e receitas.
- Retorno por atividade recente.
- Abandono por estado de erro ou permissão de câmera/microfone.
