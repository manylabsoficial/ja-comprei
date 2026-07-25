# Playbook universal para landing pages de aquisição

Este playbook serve para lançar páginas de aquisição de qualquer produto: SaaS, aplicativo, serviço, infoproduto, marketplace ou ferramenta interna. A meta é simples: em poucos segundos, a pessoa entende o produto, reconhece o problema e sabe qual ação tomar.

## Princípio central

Uma boa landing não tenta explicar tudo sobre a empresa. Ela conduz uma pessoa específica, que chegou por um contexto específico, até uma única ação principal.

O design, o texto, a prova e a animação devem responder a uma única pergunta: **isso torna a próxima ação mais óbvia?** Se não torna, é ruído.

## 1. Diagnóstico antes de desenhar

Antes de abrir o editor, registrar estas respostas em uma frase cada:

| Pergunta | Como responder |
| --- | --- |
| O que é? | Tipo concreto de produto, sem jargão. |
| Para quem? | Pessoa em um contexto real, não um público amplo. |
| Qual dor resolve? | A decisão, o custo, o risco ou o trabalho que desaparece. |
| Qual resultado entrega? | Resultado perceptível que a pessoa recebe. |
| Qual ação queremos? | Um único CTA mensurável. |
| Qual prova temos? | Tela real, output, vídeo, processo, números auditáveis ou caso real. |

### Teste dos 5 segundos

Mostre somente o primeiro viewport para alguém que não conhece o produto. Sem rolar, ela precisa conseguir responder:

1. O que é isso?
2. É para mim?
3. O que melhora se eu clicar?

Se uma resposta depender de interpretação, reescreva o título ou a demonstração.

## 2. Posicionamento e mensagem

### Escolha uma transformação, não uma lista de recursos

O título deve descrever a passagem entre um ponto de partida reconhecível e um resultado desejado.

```text
Transforme [entrada concreta] em [resultado desejado] sem [fricção principal].

De [situação atual] para [situação resolvida] em [mecanismo/tempo, somente se comprovável].

Pare de [dor cotidiana]. Comece a [resultado prático].
```

Exemplos de qualidade:

- “Transforme reuniões gravadas em decisões e tarefas compartilháveis.”
- “Organize os pedidos da sua loja sem depender de planilhas no WhatsApp.”
- “Envie uma nota e receba receitas que você pode fazer hoje.”

Evite:

- “Revolucione sua produtividade com IA.”
- “A solução completa para o futuro do seu negócio.”
- Benefícios sem mecanismo, número sem fonte ou promessa que o produto ainda não entrega.

### Hierarquia do hero

1. Contexto curto: para quem e em qual momento.
2. Título: a transformação concreta.
3. Subtítulo: como o produto entrega essa transformação.
4. CTA: uma ação no verbo.
5. Microcopy: reduz a objeção imediata com uma afirmação comprovável.
6. Demonstração: a prova do fluxo, não uma decoração.

## 3. Estrutura universal da página

Use a estrutura abaixo como ponto de partida. Remova seções que não ajudam a decisão; não preencha apenas para a página parecer completa.

```text
[Header mínimo: marca + acesso de quem já usa]

[Hero]
  Contexto → promessa → CTA → microcopy
  Demonstração do fluxo real

[Faixa de confiança]
  3 afirmações comprováveis e úteis

[Prova / Antes e depois]
  Entrada real → transformação → output real

[Como funciona]
  3 passos na mesma ordem do produto

[Alternativas, capacidades ou casos de uso]
  Somente os que removem uma objeção relevante

[FAQ honesta]
  Cartão, preço, limites, privacidade, revisão, compatibilidade

[CTA final]
  Mesma ação do hero, novo contexto

[Footer enxuto]
```

### Regra de CTA único

Defina uma ação primária e repita exatamente a mesma intenção no hero e no CTA final.

| Objetivo | CTA adequado |
| --- | --- |
| Teste de produto | “Testar agora” / “Criar minha primeira [coisa]” |
| Cadastro | “Criar conta grátis” |
| Diagnóstico | “Fazer meu diagnóstico” |
| Demonstração comercial | “Agendar uma demonstração” |
| Compra direta | “Começar agora” |

Links legais e “já tenho conta” podem existir, mas não devem competir visualmente com a ação principal.

## 4. Prova antes de argumento

Toda página precisa mostrar algo que seria difícil fingir:

- Uma tela real do produto.
- Um fluxo em funcionamento com dados de demonstração realistas.
- Um output final que a pessoa vai receber.
- Um antes e depois verificável.
- Um estudo de caso com fonte e contexto.

### Regras para demonstrações

1. Mostre uma entrada comum do público, não um exemplo perfeito.
2. Mostre o processamento apenas se ele ajuda a entender o “como”.
3. Termine no resultado que importa para o usuário.
4. Não use dados pessoais, métricas inventadas ou interfaces que não existem.
5. Prefira interação ou animação leve à reprodução automática pesada.

## 5. Sistema visual antes do código

Feche este pequeno manifesto antes de implementar:

| Item | Decisão necessária |
| --- | --- |
| Âncora emocional | O que a pessoa deve sentir ao entender o produto. |
| Contraste principal | Qual elemento orienta a atenção para a ação. |
| Tipografia | Tom, ritmo e hierarquia — não apenas fonte. |
| Espaçamento | Denso, arejado, técnico, editorial, acolhedor etc. |
| Superfícies | Fundo, cards, bordas, sombras e textura. |
| Elemento-surpresa | Um detalhe memorável que vem do produto. |
| Não é | Duas referências visuais que o design não deve imitar. |

### Elemento-surpresa útil

O melhor detalhe inesperado é uma metáfora de produto transformada em interface. Exemplos:

- Uma nota fiscal que se transforma em ingredientes e receitas.
- Um áudio que ganha trechos, tarefas e decisões.
- Uma planilha que vira um plano de ação.
- Um rascunho que se organiza em páginas publicáveis.

Não adicione partículas, gradientes, 3D ou parallax apenas porque parecem modernos.

## 6. Movimento com intenção

A rolagem deve revelar causalidade, não apenas aplicar fade-in em tudo.

### Modelo de animação recomendado

```text
Entrada aparece
        ↓
Informação é interpretada ou revisada
        ↓
Resultado aparece
        ↓
Pessoa vê o próximo passo
```

Boas práticas:

- Uma animação deve durar normalmente entre 200 e 600 ms.
- Use revelação em sequência para grupos relacionados.
- Use `once: true` em elementos de aquisição para evitar distração ao subir e descer.
- Preserve o layout final; animação não pode esconder conteúdo essencial.
- Respeite `prefers-reduced-motion` e mostre todos os elementos sem transição nesse caso.
- Evite animações de scroll pesadas no hero de tráfego pago, principalmente em celular.

## 7. FAQ que realmente converte

FAQ não é decoração. Ela elimina as dúvidas que impedem o clique.

Prioridade sugerida:

1. “Funciona para o meu caso?”
2. “Posso revisar ou desfazer antes de avançar?”
3. “Preciso informar cartão?”
4. “Qual é o limite do teste/plano?”
5. “O que acontece com meus dados?”
6. “O que não está incluso?”

Se a resposta for “ainda não temos”, diga isso de forma objetiva. Honestidade tende a aumentar confiança mais do que uma promessa vaga.

## 8. Performance é parte da conversão

Principalmente para anúncios, assumir conexão e aparelho medianos.

Checklist:

- Primeiro viewport funcional sem vídeo grande obrigatório.
- Imagens comprimidas e com tamanho definido.
- Sem fontes, bibliotecas ou animações que não contribuam para a decisão.
- CTA clicável e visível em celular sem depender de hover.
- Formulários curtos e encaminhamento correto depois do cadastro.
- UTM e origem do anúncio preservadas até a primeira ação relevante.

## 9. Eventos mínimos de medição

Defina os eventos antes de publicar:

| Evento | Pergunta que responde |
| --- | --- |
| `landing_view` | Quantas pessoas chegaram? |
| `hero_demo_seen` | A prova principal foi vista? |
| `cta_click` | A promessa motivou ação? |
| `signup_started` | O encaminhamento funcionou? |
| `signup_completed` | A fricção de cadastro está aceitável? |
| `activation_started` | A pessoa entrou no fluxo real? |
| `activation_completed` | O produto entregou o primeiro valor? |

Meça o funil por campanha, anúncio, dispositivo e variante de mensagem. Não otimize apenas por clique; otimize por ativação.

## 10. Checklist de publicação

### Verdade do produto

- [ ] Todo recurso mostrado existe ou está claramente marcado como futuro.
- [ ] Números, depoimentos e economia têm fonte verificável.
- [ ] Preços, créditos e limites estão corretos.

### Clareza

- [ ] O teste dos 5 segundos passa.
- [ ] Há somente um CTA principal.
- [ ] A demonstração mostra entrada e resultado.
- [ ] O texto usa palavras do público, não jargão interno.

### UX e acessibilidade

- [ ] Navegação por teclado funciona.
- [ ] Botões têm rótulos claros.
- [ ] Contraste de texto está suficiente.
- [ ] Movimento reduzido é respeitado.
- [ ] A versão mobile foi avaliada antes da desktop.

### Técnica

- [ ] Build de produção passa.
- [ ] Links, destino do CTA e redirecionamento pós-cadastro foram testados.
- [ ] Imagem Open Graph, título e descrição estão configurados.
- [ ] Eventos de funil estão disparando.
- [ ] A página foi aberta em conexão e aparelho modestos, quando possível.

## 11. Briefing reutilizável para criar uma landing

Copie, preencha e entregue para design ou desenvolvimento:

```md
# Briefing de landing page

## Produto
- O que é:
- Público e momento de chegada:
- Dor principal:
- Resultado concreto:

## Conversão
- Ação principal:
- Destino após CTA:
- Microcopy de redução de fricção:
- Objeções a responder:

## Prova
- Entrada real a demonstrar:
- Transformação que o produto realiza:
- Output a mostrar:
- Evidências verificáveis disponíveis:

## Direção visual
- Âncora emocional:
- Referências e os princípios que devem ser aproveitados:
- Cores e elementos de marca obrigatórios:
- O que o design não deve parecer:
- Elemento-surpresa ligado ao produto:

## Técnica
- Stack e rota:
- Público predominante: mobile / desktop / misto
- Eventos a instrumentar:
- Limites de performance ou ativos disponíveis:
```

## 12. Prompt de implementação para um agente de código

```text
Crie uma landing page de aquisição para [PRODUTO] na rota [ROTA].

Objetivo único: [CTA E DESTINO].
Público e contexto: [PÚBLICO / MOMENTO].
Promessa concreta: [TÍTULO].
Como o produto funciona: [ENTRADA → TRANSFORMAÇÃO → RESULTADO].
Provas reais disponíveis: [TELAS / OUTPUTS / MÉTRICAS VERIFICÁVEIS].
Objeções reais: [LISTA].

Direção visual:
- Âncora emocional: [SENSAÇÃO].
- Referências: [REFERÊNCIAS E PRINCÍPIOS, NÃO APENAS ESTILO].
- Não usar: [ANTIPADRÕES].
- Elemento surpresa: [METÁFORA DO PRODUTO].

Requisitos:
- A primeira dobra precisa passar o teste dos 5 segundos.
- Mostrar uma demonstração fiel do produto antes de argumentos longos.
- Repetir somente o mesmo CTA principal.
- Usar movimento de scroll para explicar causalidade, com suporte a prefers-reduced-motion.
- Não inventar números, depoimentos, funcionalidades ou preços.
- Implementar versão mobile antes de polir desktop.
- Validar build, acessibilidade básica e destino do CTA.
```

## Regra final

Uma landing forte não é “uma página bonita sobre a empresa”. É uma demonstração clara de que, para uma pessoa em um momento específico, o produto é a forma mais simples de sair da situação atual e chegar ao resultado que ela quer.
