# Plano de Implementação: UI de Testes de Receitas

## Contexto
Para acelerar o teste de refinamento da IA de receitas, precisamos de um modo de injetar listas prontas (mocks) sem usar a câmera ou OCR.

---

## Proposed Changes

### Componente 1: Dados Mockados
#### [NEW] [mockLists.js](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/frontend-ja-comprei/src/data/mockLists.js)
Criar arquivo com os 4 cenários definidos em `lista_mocks.md` exportados como constantes.

```javascript
export const MOCK_LISTS = [
    {
        id: 'small',
        label: 'Lista Pequena',
        description: 'Foco em praticidade (8 itens)',
        ingredientes: [ ... ]
    },
    // ... outros cenáriosple
];
```

### Componente 2: Página de Seleção
#### [NEW] [RecipeTestPage.jsx](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/frontend-ja-comprei/src/pages/RecipeTestPage.jsx)
Criar página com layout simples listando os mocks disponíveis.
- Usa `useRecipes` para setar `ingredients`.
- Redireciona para `/lista` no click.

### Componente 3: Roteamento e Acesso
#### [MODIFY] [App.jsx](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/frontend-ja-comprei/src/App.jsx)
- Adicionar rota `/debug/recipes`.

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/frontend-ja-comprei/src/components/Dashboard.jsx)
- Adicionar botão "Modo Teste" no rodapé ou header.

---

## Verification Plan
### Teste Manual
1. Abrir Dashboard.
2. Clicar em "Modo Teste".
3. Selecionar "Lista Média-Grande".
4. Verificar se foi redirecionado para `/lista`.
5. Verificar se os 31 itens estão carregados corretamente.
6. Clicar em "Gerar Receitas" e validar o fluxo da IA.

---

## Checklist
- [x] 1.0 Extrair mocks para `src/data/mockLists.js`
- [x] 2.0 Criar `RecipeTestPage.jsx`
- [x] 3.1 Adicionar rota em `App.jsx`
- [x] 3.2 Adicionar link de acesso em `Dashboard.jsx`
