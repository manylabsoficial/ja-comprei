# Configuração Híbrida (Prod + Localhost)

## Goal Description
Configurar o backend para aceitar requisições tanto de `localhost` (desenvolvimento) quanto de `jacomprei.app` (produção) de forma segura e explícita, sem precisar alterar código manualmente a cada deploy.

## Proposed Changes

### [Backend] main.py
- Substituir `allow_origins=["*"]` por uma lista explícita que inclua:
  - `http://localhost:5173` (Frontend Dev)
  - `http://localhost:3000` (Alternativo)
  - `https://jacomprei.app` (Produção)
  - `https://www.jacomprei.app` (Produção WWW)
- Adicionar lógica para ler `ALLOWED_ORIGINS` do `.env` (opcional, para flexibilidade).

### [Frontend] .env.production (Novo)
- Criar arquivo para definir `VITE_API_URL` automaticamente quando for build de produção.
- Conteúdo: `VITE_API_URL=https://api.jacomprei.app/api`

## Verification Plan
### Manual Verification
1. **Localhost:** Rodar frontend localmente (`npm run dev`) e verificar se conecta ao backend local (ou remoto, se configurado).
2. **Produção (Simulação):** Verificar se a variável de ambiente `VITE_API_URL` é respeitada pelo `api.ts`.
