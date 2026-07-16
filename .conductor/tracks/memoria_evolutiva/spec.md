# Especificação: Sistema de Memória Evolutiva

## Resumo
Implementar um mecanismo de "Memória Evolutiva" que extrai metadados das receitas salvas pelo usuário e utiliza esses dados para personalizar futuras sugestões do Chef de IA.

## Objetivo
Quando uma receita for salva, a IA deve:
1. Analisar a receita e extrair metadados técnicos (proteínas, dificuldade, perfil de sabor, etc.)
2. Armazenar esses metadados vinculados ao usuário
3. Cruzar dados de múltiplas receitas para identificar padrões de preferência
4. Injetar essas preferências no prompt de geração de novas receitas

## Escopo MVP
- Extração automática de metadados no momento do save
- Armazenamento em nova tabela `user_preferences`
- Agregação simples de preferências (contagem de padrões)
- Injeção de contexto no `CHEF_SYSTEM_PROMPT`

## Fora de Escopo (v1)
- Interface de visualização das preferências
- Edição manual das preferências
- Machine Learning avançado (clustering, NLP embeddings)
