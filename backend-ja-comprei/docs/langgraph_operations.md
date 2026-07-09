# Documentação Operacional: Orquestração de Receitas com LangGraph

Esta documentação fornece informações técnicas para desenvolvedores e operadores sobre o funcionamento, debugging e manutenção do fluxo de IA baseado em **LangGraph** no projeto **Já Comprei**.

---

## 1. Visão Geral do Grafo

A geração de receitas utiliza o grafo `recipe_graph` definido em [app/services/recipe_graph.py](file:///c:/Users/emanu/Documents/Projetos/Já comprei/backend-ja-comprei/app/services/recipe_graph.py). Ele substitui o fluxo síncrono antigo por uma máquina de estados finitos que orquestra a sanitização, a personalização de preferências culinárias (RAG), a geração via LLM, a validação de formato e qualidade, loops de auto-correção e a geração paralela de imagens.

### Arquitetura de Nós e Transições

1. **`PrepareContext` (prepare_context_node)**: Sanitiza os ingredientes fornecidos e busca o perfil histórico do usuário no Supabase.
2. **`GenerateRecipesDeepseek` (generate_recipes_deepseek_node)**: Tenta gerar as receitas usando o modelo primário `deepseek-v4-flash` via API da DeepSeek com temperatura elevada (`0.85`) para receitas gourmet.
3. **`ValidateRecipes` (validate_recipes_node)**: Tenta parsear o JSON retornado e valida contra o schema Pydantic `ReceitasResponse`. Além disso, checa se a `visual_tag` em inglês está preenchida e se a receita possui pelo menos 4 passos substantivos de preparo.
4. **`CorrectRecipes` (correct_recipes_node)**: Se a validação falhar, este nó de reflexão aciona o LLM ativo enviando a resposta quebrada e a lista exata de erros encontrados para que o modelo corrija a si mesmo.
5. **`GenerateRecipesGroq` (generate_recipes_groq_node)**: Se o DeepSeek atingir o teto de 3 tentativas de auto-correção sem sucesso, o roteador do grafo escalona o fluxo para a API do Groq (`openai/gpt-oss-120b` ou `openai/gpt-oss-20b`).
6. **`GenerateImagesParallel` (generate_images_parallel_node)**: Executado de forma assíncrona concorrente via `asyncio.gather`. Gera imagens temáticas no estilo Ghibli para todas as receitas usando o **Roteador de Imagens Tríplice** (`image_service.py`):
   - *Primário*: OpenRouter (`black-forest-labs/flux-1-schnell` ou similar).
   - *Secundário*: Gemini Image API (REST base64).
   - *Terciário*: Pollinations AI (URL estática Flux).
7. **`AggregateAndRespond` (aggregate_and_respond_node)**: Consolida as imagens geradas dentro do JSON de receitas e retorna para a API.

---

## 2. Guia de Debugging

### Como Executar os Testes de Validação Localmente
Para simular falhas, retentativas de auto-correção e chaveamento de provedores (fallbacks), execute o script de testes:
```bash
python scripts/test_recipe_graph.py
```

### Como inspecionar os passos de execução do Grafo
O LangGraph permite iterar sobre os estados do grafo passo a passo em tempo de execução. Para debugar de forma interativa em um script de desenvolvimento:

```python
from app.services.recipe_graph import recipe_graph

inputs = {
    "ingredients": ["frango", "batata", "cebola"],
    "user_id": None
}

# Itera sobre os eventos do grafo
async def debug_graph():
    async for event in recipe_graph.astream(inputs):
        for node_name, state in event.items():
            print(f"\n=== Executing Node: {node_name} ===")
            print(f"  Attempt Count: {state.get('attempt_count')}")
            print(f"  Provider Active: {state.get('provider')}")
            print(f"  Is Valid?: {state.get('is_valid')}")
            if state.get('validation_errors'):
                print(f"  Validation Errors: {state['validation_errors']}")
```

---

## 3. Como Adicionar Novos Nós ao Grafo

Caso precise plugar novas etapas de negócio (ex: checagem de alergênicos ou cálculo de custo real em banco de dados), siga este padrão:

1. **Atualize o Estado (`RecipeState`)** em `recipe_graph.py` se precisar de novas chaves de controle.
2. **Escreva a função do Nó** (deve receber o estado atual e retornar um dicionário contendo as chaves atualizadas):
   ```python
   async def my_new_node(state: RecipeState) -> Dict[str, Any]:
       # Lógica de processamento
       return {"some_state_key": "updated_value"}
   ```
3. **Registre o Nó no Grafo**:
   ```python
   workflow.add_node("my_new_node", my_new_node)
   ```
4. **Defina as Transições**:
   ```python
   workflow.add_edge("my_new_node", "next_node")
   ```

---

## 4. Métricas e Logs Recomendados para Monitoramento

Para identificar instabilidades de provedores em produção, monitore as seguintes strings e estruturas nos logs centralizados do FastAPI:

*   `RecipeGraph [Node: CorrectRecipes]: Attempting Self-Correction (Attempt X/3)...` ➔ Indica que o LLM enviou um JSON inválido e o loop de auto-correção foi ativado.
*   `RecipeGraph: DeepSeek validation attempts exhausted. Escalating to Groq fallback.` ➔ Indica exaustão do modelo primário e ativação do fallback de provedor.
*   `ImageService: Attempting OpenRouter Image Generation...` e `ImageService: Falling back to Gemini Image API...` ➔ Permite rastrear falhas de cota no OpenRouter e transições para o Gemini.
*   `Orchestrator: Invoking LangGraph Recipe Graph...` ➔ Início da requisição.
