# Spec: Cache e Estabilidade de Sessão

## Objetivo
Garantir que o site sempre carregue a versão mais recente após um build e que o sistema de login seja robusto contra "bypasses" causados por cache de navegador ou sessões locais obsoletas.

## Mecanismos Técnicos
1. **Cache Control (HTML):** Forçar o navegador a validar o `index.html` em cada carregamento.
2. **Build ID:** Gerar um identificador único por build para invalidar caches locais em caso de atualização.
3. **Active Auth Validation:** Mudar de verificação passiva (`getSession`) para ativa (`getUser`) no Supabase para garantir integridade da sessão.

## Impacto
- UX: Usuários sempre verão a versão mais nova sem precisar limpar o cache manualmente.
- Segurança: Sessões expiradas no backend serão refletidas instantaneamente no frontend.
