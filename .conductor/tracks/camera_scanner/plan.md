# Camera Scanner - Plano de Implementação

## Fase 1: Componente Base da Câmera

### 1.1 Criar hook `useCameraStream`
- [x] Criar `frontend-ja-comprei/src/hooks/useCameraStream.js`
- [x] Implementar `navigator.mediaDevices.getUserMedia()` 
- [x] Configurar constraints: `{ video: { facingMode: { ideal: 'environment' } } }`
- [x] Retornar: `{ stream, error, isLoading, startCamera, stopCamera }`
- [x] Implementar cleanup automático no unmount

### 1.2 Criar componente `CameraScanner.jsx`
- [x] Criar `frontend-ja-comprei/src/components/CameraScanner.jsx`
- [x] Elemento `<video>` para exibir stream
- [x] Elemento `<canvas>` (hidden) para captura
- [x] UI do viewfinder baseada no mockup:
  - [x] Frame com corners estilizados (border primary)
  - [x] Grid sutil de alinhamento
  - [x] Scrim (overlay escuro ao redor)
- [x] Texto helper "Alinhe a nota dentro do quadro"

### 1.3 Implementar controles
- [x] Botão shutter (captura)
- [x] Botão voltar/fechar
- [x] Botão toggle flash (detectar suporte via `ImageCapture` API)
- [x] Botão galeria (atalho para opção existente)

---

## Fase 2: Captura e Envio

### 2.1 Função de captura
- [ ] Capturar frame do `<video>` em `<canvas>`
- [ ] Converter canvas para Blob: `canvas.toBlob(callback, 'image/jpeg', 0.9)`
- [ ] Criar File object para compatibilidade com fluxo existente

### 2.2 Integrar com fluxo existente
- [ ] Chamar `onScan(file)` do componente pai (`Scanner.jsx`)
- [ ] Reutilizar lógica de `handleFileChange` existente
- [ ] Garantir transição para `Analyzing`

---

## Fase 3: Integração no Modal

### 3.1 Modificar `ScanMethodModal.jsx`
- [x] Remover `disabled` do botão "Escanear Câmera"
- [x] Remover badge "Em breve"
- [x] Adicionar prop `onSelectCamera`
- [x] Aplicar estilos ativos (igual ao botão galeria)

### 3.2 Modificar `Scanner.jsx`
- [x] Adicionar estado `showCamera`
- [x] Renderizar `CameraScanner` condicionalmente
- [x] Passar handler `onCapture` para câmera
- [x] Implementar `handleCameraClick` no modal

---

## Fase 4: Gestão de Permissões

### 4.1 Tela de permissão negada
- [x] Criar estado para erro de permissão
- [x] Exibir UI amigável com instruções
- [x] Botão para tentar novamente
- [x] Link para configurações do navegador (se disponível)

### 4.2 Cleanup e lifecycle
- [x] Parar câmera ao navegar para outra tela
- [x] Parar câmera ao minimizar app/tab
- [x] Verificar se já existe stream ativo antes de iniciar novo

---

## Fase 5: Polish e UX

### 5.1 Animações e feedback
- [x] Animação de "flash" branco ao capturar
- [x] Transição suave ao abrir câmera
- [x] Loading state enquanto câmera inicializa

### 5.2 Responsividade
- [x] Testar em viewport mobile (375px)
- [x] Testar em viewport tablet/desktop
- [x] Ajustar tamanho do frame em diferentes telas

---

## Verificação

### Testes Manuais

#### Teste 1: Permissão de Câmera
1. Abrir app em dispositivo mobile (ou devtools mobile)
2. Clicar no botão "+" no Dashboard
3. Selecionar "Escanear Câmera"
4. **Verificar:** Browser solicita permissão de câmera
5. Aceitar permissão
6. **Verificar:** Feed da câmera aparece na tela

#### Teste 2: Captura e OCR
1. Após câmera ativa, posicionar nota fiscal no frame
2. Clicar no botão shutter
3. **Verificar:** Feedback visual de captura (flash)
4. **Verificar:** Transição para tela "Analisando..."
5. **Verificar:** Ingredientes extraídos aparecem na lista

#### Teste 3: Permissão Negada
1. Negar permissão de câmera quando solicitado
2. **Verificar:** Exibe mensagem amigável de erro
3. **Verificar:** Oferece opção de usar galeria como alternativa

#### Teste 4: Cleanup
1. Com câmera ativa, clicar no botão voltar
2. **Verificar:** LED da câmera apaga (stream liberado)
3. **Verificar:** Navega corretamente para tela anterior

### Teste Automatizado (Opcional)
- Verificar se `getUserMedia` é chamado com constraints corretos
- Verificar se cleanup é executado no unmount

---

## Arquivos Criados/Modificados

| Arquivo | Ação |
|---------|------|
| `src/hooks/useCameraStream.js` | CRIAR |
| `src/components/CameraScanner.jsx` | CRIAR |
| `src/components/ScanMethodModal.jsx` | MODIFICAR |
| `src/components/Scanner.jsx` | MODIFICAR |

## Estimativa
~2-3 horas de desenvolvimento
