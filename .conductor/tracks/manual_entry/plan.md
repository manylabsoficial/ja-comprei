# Manual Item Entry

**Goal:** Allow users to manually input ingredients/items instead of relying solely on the receipt scanner.

## Context
Currently, the app requires users to scan a receipt or upload an image to populate the ingredients list. To improve accessibility and usability (failover for OCR), we need a text-based input method.

## Proposed Changes

1.  **New Page: `ManualEntryPage`**
    *   A simple, clean interface with a large textarea.
    *   Instruction: "Digite seus itens separados por vírgula ou linha".
    *   Button: "Adicionar à Lista".

2.  **App Logic Update (`App.jsx`)**
    *   Add route `/manual-entry`.
    *   Implement `handleManualEntry(textInput)`:
        *   Parse text: split by `,` or `\n`.
        *   Clean whitespace.
        *   Update `ingredients` state.
        *   Navigate to `/lista` (reusing the existing review flow).

3.  **Dashboard Update (`Dashboard.jsx`)**
    *   Add a new card/button for "Entrada Manual".

## Implementation Steps
- [x] Create `src/pages/ManualEntryPage.jsx`
- [x] Register route `/manual-entry` in `App.jsx`
- [x] Implement `handleManualEntry` logic in `App.jsx`
- [x] Add entry point in `src/components/Dashboard.jsx`

## Verification
- **Manual Test:**
    1. Go to Dashboard.
    2. Click "Entrada Manual".
    3. Type "Arroz, Feijão, Frango".
    4. Click Confirm.
    5. Verify redirection to Shopping List (`/lista`).
    6. Verify items "Arroz", "Feijão", "Frango" are present.
    7. Proceed to "Gerar Receitas" to ensure end-to-end flow works.
