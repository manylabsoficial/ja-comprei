# Plan: Diagnóstico de Erros no Scanner

## Passos Atômicos

### Fase 1: Visibilidade (Logs)
- [x] Implementar middleware de logging no backend (`main.py`) <!-- id: dbg_1 -->
- [x] Adicionar logs de URL no frontend (`api.ts`) <!-- id: dbg_2 -->

### Fase 2: Correção de Rota
- [x] Normalizar o tratamento da `API_URL` no frontend para garantir o prefixo `/api` <!-- id: dbg_3 -->
- [x] Verificar se há divergência entre os nomes de rota definidos no router e chamados no front <!-- id: dbg_4 -->

### Fase 3: Verificação
- [x] Testar em ambiente de desenvolvimento se os logs aparecem no console <!-- id: dbg_5 -->
- [x] Confirmar com o usuário se o erro 404 persiste em produção após o deploy das melhorias de log <!-- id: dbg_6 -->
- [x] Corrigir conflito de dependências no requirements.txt (Railway Build) <!-- id: dbg_7 -->
