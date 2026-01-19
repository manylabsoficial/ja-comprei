# Camera Scanner - Especificação

## Objetivo
Implementar a funcionalidade de leitura de notas fiscais em tempo real utilizando a câmera do dispositivo, integrando com o backend de OCR já existente (Groq Vision).

## Contexto
- O backend já possui endpoint `/analisar-nota` que processa imagens via Groq Vision (Maverick)
- O frontend tem `ScanMethodModal.jsx` com opção de câmera desabilitada ("Em breve")
- Mockup do scanner com câmera disponível em `mockups/scanner.html`
- A opção de upload via galeria já funciona

## Requisitos Funcionais

### RF1 - Acesso à Câmera
- Solicitar permissão de câmera ao usuário
- Priorizar câmera traseira em dispositivos móveis
- Exibir mensagem amigável se permissão for negada

### RF2 - Visualização em Tempo Real
- Exibir feed da câmera em tela cheia (mobile-first)
- Implementar viewfinder com frame de enquadramento
- Adicionar corners estilizados conforme mockup

### RF3 - Captura de Imagem
- Botão shutter para capturar frame atual
- Converter captura para formato aceito pelo backend (JPEG/PNG blob)
- Feedback visual ao capturar (flash breve)

### RF4 - Integração com Fluxo Existente
- Após captura, enviar imagem ao `/analisar-nota`
- Navegar para tela `Analyzing` durante processamento
- Exibir ingredientes extraídos na tela `Ingredients`

### RF5 - Toggle Flash (Nice to Have)
- Botão para ligar/desligar flash (torch) se disponível
- Detectar suporte do dispositivo

## Requisitos Não-Funcionais

### RNF1 - Performance
- Liberar stream da câmera ao sair da tela (cleanup)
- Não consumir recursos quando em background

### RNF2 - Compatibilidade
- iOS Safari (14+)
- Android Chrome
- Desktop (câmera webcam)

### RNF3 - UX
- Transição suave ao abrir/fechar câmera
- Indicador visual de câmera ativa (pill vermelho no header mobile)

## Arquivos Impactados
- `frontend-ja-comprei/src/components/CameraScanner.jsx` [NOVO]
- `frontend-ja-comprei/src/components/ScanMethodModal.jsx` [MODIFICAR]
- `frontend-ja-comprei/src/components/Scanner.jsx` [MODIFICAR]

## Dependências
- Nenhuma biblioteca externa necessária (Web APIs nativas)
