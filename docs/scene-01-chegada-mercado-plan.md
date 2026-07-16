# Plano da Cena 01: Chegada do Mercado

## Objetivo

Configurar a primeira cena do filme scrollable do Ja Comprei: uma bancada de cozinha brasileira moderna, com sacolas de mercado, nota fiscal e ingredientes reais, antes da leitura por IA. A cena precisa comunicar a pergunta emocional do produto: "comprei tudo isso, e agora?"

## Estado Configurado

- Arquivo Blender: `C:\Users\emanu\Documents\Projetos\Já comprei\blend.blend`
- Colecao: `SCENE_01_CHEGADA_MERCADO_SCROLLABLE`
- Protocolo validado: TCP `127.0.0.1:9876`, JSON com `type: execute`, `strict_json: true` e byte nulo final.
- Cliente direto: `tools/blender-mcp-socket-client.mjs`
- Servidor MCP stdio local: `tools/blender-mcp-stdio-server.mjs`

## Direcao Cinematografica

### Logline

Da compra esquecida ao prato pronto: a abertura mostra uma compra comum, ainda caotica e sem destino, pronta para ser entendida pelo Ja Comprei.

### Composicao

- Camera macro em 16:9, baixa e proxima da bancada.
- Nota fiscal no primeiro plano, levemente diagonal, com linhas abstratas sem texto legivel.
- Sacolas de papel no fundo medio, com verduras saindo de uma delas.
- Ingredientes espalhados: tomate, limao, pao, arroz, cebola e folhas.
- Espaco negativo lateral para headline e UI HTML/CSS por cima no site.

### Luz e Materiais

- Key light quente simulando fim de tarde.
- Fill sutil verde/salvia para conectar com a ideia de IA sem parecer sci-fi.
- Pedra/wood/thermal paper com materiais foscos e realistas.
- Particulas discretas de poeira para profundidade e ar cinematografico.

## Implementacao 3D

### Ja Criado

- Bancada de pedra quente.
- Parede/faixa de madeira ao fundo.
- Nota fiscal curvada com linhas abstratas.
- Duas sacolas de papel kraft abertas.
- Ingredientes 3D procedurais.
- Camera principal com DOF e keyframes de dolly-in entre frames 1 e 90.
- Luzes: area light quente, fill salvia, practical glow quente.
- Objeto oculto `S01_hidden_sage_scan_reflection_ready_for_frame_045` para ativar na transicao da cena 02.

### Proximos Ajustes de Qualidade

1. Substituir ingredientes procedurais principais por modelos asset-grade quando houver biblioteca disponivel.
2. Adicionar deformacoes discretas nas sacolas para reduzir aparencia geometrica.
3. Aplicar textura procedural mais rica ao papel termico e pedra da bancada.
4. Ajustar a camera com render previews em desktop e mobile crop.
5. Preparar passes separados: beauty, shadow, mist/depth e emission do brilho salvia.

## Plano de Animacao Scrollable

### Faixa de Scroll

- Cena 01 ocupa o primeiro bloco de scroll: frames 1 a 90.
- Frame 1: estado mais quieto, bancada e nota como primeiro sinal.
- Frame 45: a camera se aproxima da nota; o brilho salvia pode aparecer bem fraco.
- Frame 90: enquadramento pronto para a cena 02, onde a nota passa a ser escaneada.

### Movimento

- Camera faz dolly-in curto, lento e caro, sem giro agressivo.
- A profundidade de campo prende o olhar na nota e nos ingredientes proximos.
- Objetos permanecem praticamente parados na cena 01; a magia comeca apenas no fim.

### Web Overlay

- Headline HTML sugerida: "Voltou do mercado e nao sabe o que cozinhar?"
- Subcopy: "Escaneie sua nota fiscal e descubra receitas com o que voce ja comprou."
- A UI real deve ser HTML/CSS sobreposta, nunca renderizada como texto dentro do video.

## Pipeline de Render

1. Renderizar preview rapido em 960x540 para revisar enquadramento.
2. Renderizar master em 1920x1080, 30 fps, 120 frames para o trecho inicial.
3. Exportar image sequence EXR/PNG para composicao se houver glow/mist.
4. Gerar MP4 H.264 e WebM VP9/AV1 para web.
5. Integrar com scroll scrubbing no frontend usando video frame control ou image-sequence canvas.

## Criterios de Aceite

- O `blend.blend` abre com a colecao `SCENE_01_CHEGADA_MERCADO_SCROLLABLE`.
- A cena possui camera ativa `S01_Camera_scroll_scene_01_macro_hero`.
- A timeline vai de 1 a 120 frames, com foco de uso em 1 a 90.
- Existem sacolas, nota fiscal, bancada, ingredientes e luzes nomeadas com prefixo `S01_`.
- A nota fiscal nao contem texto legivel.
- A cena deixa espaco visual para headline e UI web sobrepostas.
- O MCP/socket local responde na porta `9876`.

## Refino V2/V3

- V2: materiais com bump procedural, bevels, dobras nas sacolas, microdetalhes em alimentos, luz Filmic e parede lateral escura.
- V3: substitui o saco de arroz blocado por um saco organico arredondado, corrige os cortes do pao como sulcos baixos e adiciona ervas soltas para quebrar a geometria procedural.
- V4: troca o saco organico grande por um pacote de arroz secundario, mais baixo e fosco; achata os cortes do pao para nao parecerem hastes soltas.
- Preview atual: C:\tmp\ja_comprei_scene01_refine_v4.png

