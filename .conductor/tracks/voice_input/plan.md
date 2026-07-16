# Entrada por Voz para Listas de Compras

## Objetivo
Implementar a funcionalidade de entrada por voz no frontend, permitindo que o usuário dite sua lista de compras. O backend (`/api/voice/transcribe`) já está pronto usando Groq Whisper.

## Contexto Técnico

### Backend (Pronto ✅)
- **Endpoint**: `POST /api/voice/transcribe`
- **Serviço**: [groq_service.py](file:///c:/Users/emanu/Documents/Projetos/Já comprei/backend-ja-comprei/app/services/groq_service.py) → `transcribe_audio()`
- **Modelo**: Whisper (via Groq API)

### Frontend (A Implementar)
- **Dashboard**: Card "Entrada por Voz" já existe, mas `route: null`
- **Necessidade**: Criar página/componente com UI de gravação e integração com backend

---

## Proposed Changes

### Fase 1: Componente de Gravação de Áudio

#### [NEW] [VoiceInputPage.jsx](file:///c:/Users/emanu/Documents/Projetos/Já comprei/frontend-ja-comprei/src/pages/VoiceInputPage.jsx)

Página dedicada para entrada por voz:
- [ ] Botão grande de "Gravar" (estilo push-to-talk ou toggle)
- [ ] Indicador visual de gravação ativa (animação de ondas/pulso)
- [ ] Feedback de estado: "Pronto", "Gravando...", "Processando..."
- [ ] Área de preview do texto transcrito
- [ ] Botão "Usar Lista" para prosseguir com os itens extraídos

#### [NEW] [useAudioRecorder.js](file:///c:/Users/emanu/Documents/Projetos/Já comprei/frontend-ja-comprei/src/hooks/useAudioRecorder.js)

Hook customizado para gerenciar gravação:
- [ ] Usar `MediaRecorder` API do navegador
- [ ] Gerenciar permissões de microfone
- [ ] Retornar blob de áudio para upload
- [ ] Suportar formatos compatíveis com Whisper (webm, m4a, mp3)

---

### Fase 2: Integração com Backend

#### [MODIFY] [api.js](file:///c:/Users/emanu/Documents/Projetos/Já comprei/frontend-ja-comprei/src/services/api.js)

- [ ] Adicionar função `transcribeAudio(audioBlob)` que envia para `/api/voice/transcribe`

---

### Fase 3: Roteamento e Navegação

#### [MODIFY] [App.jsx](file:///c:/Users/emanu/Documents/Projetos/Já comprei/frontend-ja-comprei/src/App.jsx)

- [ ] Adicionar rota `/entrada-voz` apontando para `VoiceInputPage`

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/emanu/Documents/Projetos/Já comprei/frontend-ja-comprei/src/components/Dashboard.jsx)

- [ ] Alterar `route: null` para `route: 'entrada-voz'` no card de voz

---

### Fase 4: Fluxo Pós-Transcrição

- [ ] Após transcrição, exibir itens parseados (IA ou regex simples)
- [ ] Botão para editar manualmente antes de salvar
- [ ] Redirecionar para tela de receitas ou salvar lista

---

## User Review Required

> [!IMPORTANT]
> **Decisão de UX**: Você prefere:
> 1. **Push-to-Talk**: Usuário segura o botão enquanto fala
> 2. **Toggle**: Usuário clica para iniciar, clica novamente para parar
>
> Toggle é mais simples de implementar e melhor para listas longas.

> [!WARNING]
> **Privacidade**: Assim como a câmera, o microfone deve ser liberado imediatamente ao sair da tela. Implementar cleanup no `useEffect`.

---

## Verification Plan

### Testes Manuais
1. Acessar `/entrada-voz` via Dashboard
2. Permitir acesso ao microfone
3. Gravar uma lista simples ("arroz, feijão, carne moída")
4. Verificar transcrição exibida
5. Verificar que microfone é liberado ao sair da página
