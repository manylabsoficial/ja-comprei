# Spec: UI de Testes de Receitas (Mock Bypass)
**Track ID:** testes_receitas_ui
**Status:** DRAFT

## Objetivo
Criar uma interface de desenvolvimento/teste para validar a geração de receitas sem depender da leitura de notas fiscais (OCR) ou entrada manual demorada. 

## Requisitos
1.  **Simulação de Cenários**: Permitir a seleção de 4 cenários predefinidos de listas de compras (Pequena, Média, Média-Grande, Grande).
2.  **Dados Mockados**: Utilizar os dados fornecidos em `mockups/lista_mocks.md` como fonte.
3.  **Fluxo de Bypass**: Ao selecionar um cenário, o sistema deve:
    *   Carregar os ingredientes no contexto global (`RecipeContext`).
    *   Redirecionar automaticamente para a tela de Lista de Compras (`/lista`).
    *   Simular o estado "pós-scan".
4.  **Acesso Facilitado**: O acesso à tela de testes deve ser via Dashboard, de forma discreta (ex: rodapé).

## UI/UX
-   **Página Dedicada**: `/debug/recipes`
-   **Cards de Seleção**: Mostrar o nome da lista e a quantidade de itens.
-   **Feedback Visual**: Transição fluida para a lista.

## Dados (Mocks)
Converter o conteúdo de `lista_mocks.md` para uma estrutura JS importável.
