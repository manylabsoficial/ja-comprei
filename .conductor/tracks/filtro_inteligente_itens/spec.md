# Spec: Filtro Inteligente de Itens (Dupla Camada)
**Track ID:** filtro_inteligente_itens
**Status:** DRAFT

## Objetivo
Implementar um sistema de filtragem robusto para impedir que itens não comestíveis (limpeza, higiene, ração) sejam incluídos na geração de receitas.

## Arquitetura de Segurança (Defense in Depth)

### Camada 1: Classificação na Origem (OCR/Scanner)
- **Responsabilidade**: O serviço de OCR (`extract_text_vision`) deve classificar item a item.
- **Categorias**:
  - `alimento` (Incluído por padrão)
  - `limpeza` (Excluído)
  - `higiene` (Excluído)
  - `outros` (Excluído)
- **UX**: O Frontend recebe todos os itens, mas **pré-desmarca** aqueles que não são alimentos. O usuário mantém controle total para remarcar se o sistema errar.

### Camada 2: Validação de Segurança (Chef IA)
- **Responsabilidade**: O Prompt do Chef (`CHEF_SYSTEM_PROMPT`) deve ter uma instrução explícita de "Safety Barrier".
- **Regra**: "Ignore estritamente qualquer item de limpeza ou higiene que tenha passado despercebido na lista."

## Requisitos Técnicos
1.  **Schema Robusto**: Atualizar retorno do Vision para incluir `categoria`.
2.  **Tratamento de Erros**:
    - Se o Vision falhar em categorizar, fallback seguro (ou avisar usuário).
    - Validação com Pydantic no Vision (novo) para garantir integridade do JSON.
3.  **Frontend**:
    - Lógica de `checked = categoria === 'alimento'`.
    - Feedback visual (opcional/futuro): Ícone ou cor diferente para itens ignorados.

## Mock Data
- Atualizar `mockLists.js` para refletir a nova estrutura e permitir testes manuais desse fluxo.
