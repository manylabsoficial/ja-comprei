# Task: Refatorar CHEF_SYSTEM_PROMPT
**Task ID:** TASK-006
**Spec:** SPEC-003
**Criado:** 2026-06-26
**Status:** DONE
**Prioridade:** P1
**Esforço estimado:** 4h

---

## Descrição
Reescrever o CHEF_SYSTEM_PROMPT removendo contradições, CAPS NEGATIVOS hostis, e adicionando 2-3 exemplos few-shot de receitas completas. Transformar "princípios" absolutos em guidelines condicionais.

## Arquivos Afetados
| Ação | Arquivo | Descrição |
|---|---|---|
| MODIFY | `backend-ja-comprei/app/services/groq_service.py` | Reescrever `CHEF_SYSTEM_PROMPT` |
| NEW | `backend-ja-comprei/app/prompts/chef_v1.py` | Versão versionada do prompt |

## Checklist
- [ ] Remover CAPS NEGATIVOS ("Proibido", "NÃO", "JAMAIS", "OBRIGATÓRIO")
- [ ] Transformar "Princípios" em guidelines condicionais: "Quando houver proteínas, prefira selar/dourar..."
- [ ] Adicionar 2-3 exemplos few-shot (entrada: ingredientes; saída: receita completa)
- [ ] Resolver contradição: "sem limite de passos" vs "atomicidade"
- [ ] Reduzir Despensa Virtual de 11 para 5 itens realmente universais (sal, óleo, água, alho, cebola)
- [ ] Melhorar instrução de visual_tag com exemplos bons vs ruins
- [ ] Adicionar regra de fallback para ingredientes que não combinam
- [ ] Extrair prompt para arquivo versionado (`prompts/chef_v1.py`)

## Verificação
- [ ] Comando: gerar receitas com `["alface", "tomate", "azeite"]` → não deve sugerir dourar alface
- [ ] Comando: gerar receitas com `["frango", "batata"]` → deve selar/dourar o frango
- [ ] Comando: gerar com input contendo `{teste}` → não deve crashar
- [ ] Resultado: 2-3 receitas com modo_de_preparo detalhado e visual_tags em inglês

## Notas
- Usar `string.Template` da stdlib (não adicionar dependência Jinja2 ainda)
- Exemplos few-shot devem usar ingredientes genéricos, não os do usuário
