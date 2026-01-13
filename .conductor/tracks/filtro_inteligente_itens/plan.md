# Plano de Implementação: Filtro Inteligente de Itens

## Contexto
Atualmente, o sistema gera receitas com qualquer item da lista, incluindo produtos de limpeza se o usuário não os remover. Precisamos de automação e segurança.

---

## Componentes

### Componente 1: Backend - OCR Vision com Classificação
#### [MODIFY] [groq_service.py](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/backend-ja-comprei/app/services/groq_service.py)
- Atualizar prompt `extract_text_vision`:
  - Instruir classificação: `categoria: "alimento" | "limpeza" | "higiene" | "outros"`.
  - Instruir JSON estrito.
- Adicionar validação Pydantic para a resposta do Vision (Output `VisionResponse`).

#### [NEW] [schemas.py](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/backend-ja-comprei/app/schemas.py)
- Adicionar models: `ItemVision`, `VisionResponse`.

### Componente 2: Backend - Chef Safety Barrier
#### [MODIFY] [groq_service.py](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/backend-ja-comprei/app/services/groq_service.py)
- Adicionar seção **SEGURANÇA ALIMENTAR** no `CHEF_SYSTEM_PROMPT`.

### Componente 3: Frontend - Filtragem Automática
#### [MODIFY] [App.jsx](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/frontend-ja-comprei/src/App.jsx)
- Atualizar `handleScan`:
  - Receber `categoria`.
  - Lógica: `checked: ing.categoria === 'alimento'`.

#### [MODIFY] [RecipeTestPage.jsx](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/frontend-ja-comprei/src/pages/RecipeTestPage.jsx)
- Suportar mocks com e sem categoria (retrocompatibilidade).

### Componente 4: Dados Mockados
#### [MODIFY] [mockLists.js](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/frontend-ja-comprei/src/data/mockLists.js)
- Enriquecer mocks com categorias para teste.

---

## Verification Plan
### Teste de Mocks (RecipeTestUI)
1. Carregar "Lista Pequena" (contém Detergente).
2. Verificar se "Detergente" aparece na lista mas **desmarcado**.
3. Gerar Receita -> Chef deve ignorar qualquer não-alimento que por acaso esteja marcado (teste de stress).

---

## Checklist
- [x] 1.1 Atualizar `schemas.py` (ItemVision)
- [x] 1.2 Atualizar `extract_text_vision` no GroqService (Prompt + Pydantic)
- [x] 2.0 Atualizar `CHEF_SYSTEM_PROMPT` (Safety)
- [x] 3.1 Atualizar `App.jsx` (Lógica de checked)
- [x] 4.0 Atualizar `mockLists.js` (Categorias)
