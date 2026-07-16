# Conductor Tracks

> **Sistema SDD ativo:** Novas iniciativas usam `.conductor/specs/` (specs) e `.conductor/tasks/` (tarefas).
> Tracks abaixo são o sistema legado — mantidas para referência histórica.
> Consulte `.conductor/CHANGELOG.md` para o histórico temporal canônico.

## refatoracao_ia_hibrida
**Objective:** Refatorar o backend (`src/services/groqService.ts`) para implementar uma estratégia de múltiplos modelos ("Router"), otimizando o consumo de cotas da API Groq e evitando erros de Rate Limit (429). Além disso, implementar suporte a transcrição de áudio (Whisper).
**Plan:** conductor/tracks/refatoracao_ia_hibrida/plan.md

## integracao_backend_frontend
**Objective:** Integrar o Frontend React com o novo Backend FastAPI (Groq/Whisper), implementando a camada de serviço no cliente e conectando as interações de UI (Voz, Receitas).
- [x] Integração Backend-Frontend <!-- id: 4, link: "tracks/integracao_backend_frontend/plan.md" -->
- [x] Refinamento e Responsividade <!-- id: 5, link: "tracks/refinamento_responsividade/plan.md" -->
- [x] Tema e Navegação <!-- id: 6, link: "tracks/tema_e_navegacao/plan.md" -->

## dashboard
**Objective:** Criar a tela principal do usuário autenticado (Dashboard), um hub de acesso rápido às funcionalidades do app. Bypass de login temporário.
- [x] Dashboard <!-- id: 7, link: "tracks/dashboard/plan.md" -->

## pollinations_integration
**Objective:** Adicionar camada visual (OCR e Geração de Imagem) ao backend usando Pollinations API. Injetar URLs de imagens de capas nas receitas geradas.
- [ ] Integração Pollinations <!-- id: 9, link: "tracks/pollinations_integration/plan.md" -->

## controle_camera
**Objective:** Garantir que a câmera seja usada APENAS na tela Scanner, liberando o stream imediatamente ao navegar para outras telas. Transparência com o usuário.
- [x] Controle de Câmera <!-- id: 8, link: "tracks/controle_camera/plan.md" -->

## receitas_imagens_polidas
**Objective:** Garantir coerência entre receitas e imagens geradas via `descricao_imagem` no Groq. Melhorar UX de espera com carrossel de dicas. Verificar visualização da receita pronta.
- [x] Receitas com Imagens Coerentes <!-- id: 10, link: "tracks/receitas_imagens_polidas/plan.md" -->

## react_router
**Objective:** Implementar roteamento real com `react-router-dom` para URLs amigáveis, navegação com histórico do navegador e links compartilháveis.
- [ ] React Router DOM <!-- id: 11, link: "tracks/react_router/plan.md" -->

## ocr_scanner_connection
**Objective:** Conectar o Scanner (Frontend) à API de OCR (Backend via Pollinations Vision), permitindo upload de imagens e extração de ingredientes.
- [ ] [Conexão OCR Scanner](.conductor/tracks/ocr_scanner_connection/plan.md)
- [ ] [Refatoração Groq Vision](.conductor/tracks/groq_vision_refactor/plan.md)

## refinamento_ia_listas
**Objective:** Tornar a IA de processamento de listas de compras mais inteligente via prompt engineering: escala dinâmica de receitas, contextualização brasileira sem hardcode, e descrições otimizadas para geração de imagens.
- [ ] [Refinamento IA Listas](.conductor/tracks/refinamento_ia_listas/plan.md)

## testes_receitas_ui
**Objective:** Criar página de testes com injeção de dados mockados para bypassar o scanner e agilizar a validação das receitas.
- [ ] [UI Testes Receitas](.conductor/tracks/testes_receitas_ui/plan.md)

## filtro_inteligente_itens
**Objective:** Implementar filtragem de itens não-comestíveis em duas camadas (OCR com classificação e Chef com verificação de segurança).
- [ ] [Filtro Inteligente](.conductor/tracks/filtro_inteligente_itens/plan.md)

## pexels_integration
**Objective:** Substituir geração de imagens do Pollinations por busca no Pexels para thumbnails de receitas, mantendo código do Pollinations para fallback.
- [x] [Integração Pexels](.conductor/tracks/pexels_integration/plan.md)

## ghibli_migration
**Objective:** Pivotar identidade visual para ilustrações AI estilo Studio Ghibli (Anime Food), removendo Pexels e unificando o estilo.
- [x] [Migração Ghibli](.conductor/tracks/ghibli_migration/plan.md)

## supabase_persistence
**Objective:** Implementar persistência de receitas no Supabase com autenticação dev mode.
- [x] [Persistência Supabase](.conductor/tracks/supabase_persistence/plan.md)

## saved_recipes_page
**Objective:** Criar página para visualização das receitas salvas pelo usuário.
- [x] [Página Minhas Receitas](.conductor/tracks/saved_recipes_page/plan.md)

## navigation_bar
**Objective:** Implementar barra de navegação persistente no rodapé.
- [x] [Barra de Navegação](.conductor/tracks/navigation_bar/plan.md)

## shopping_list_persistence
**Objective:** Salvar e gerenciar listas de compras no Supabase.
- [x] [Persistência de Listas](.conductor/tracks/shopping_list_persistence/plan.md)
- [x] [Página de Perfil](.conductor/tracks/profile_page/plan.md)
- [x] [Sistema de Créditos](.conductor/tracks/credits_system/plan.md)
- [x] [Sistema de Slug para Receitas](.conductor/tracks/recipe_slug_system/plan.md)
- [ ] [Serviço de Email (Brevo)](.conductor/tracks/brevo_email_service/plan.md)
- [ ] [Entrada Manual de Itens](.conductor/tracks/manual_entry/plan.md)

## camera_scanner
**Objective:** Implementar leitura de notas fiscais em tempo real com a câmera do dispositivo, integrando com backend OCR existente (Groq Vision).
- [x] [Scanner com Câmera](.conductor/tracks/camera_scanner/plan.md)

## route_protection
**Objective:** Implementar proteção de rotas para garantir que áreas autenticadas (dashboard, perfil, listas) sejam inacessíveis sem login.
- [x] [Proteção de Rotas](.conductor/tracks/route_protection/plan.md)

## cache_stability
**Objective:** Garantir que o usuário sempre use a versão mais recente do site e que a sessão seja validada ativamente contra o backend, evitando bypasses de login e cache antigo.
- [ ] [Cache e Estabilidade](.conductor/tracks/cache_stability/plan.md)

## debug_scanner
**Objective:** Diagnosticar e resolver o erro 404 no endpoint do scanner de notas, adicionando logs robustos no backend e frontend.
- [ ] [Diagnóstico de Erros no Scanner](.conductor/tracks/debug_scanner/plan.md)

## memoria_evolutiva
**Objective:** Implementar sistema de Memória Evolutiva que extrai metadados das receitas salvas e personaliza futuras sugestões com base nas preferências do usuário.
- [ ] [Memória Evolutiva RAG](.conductor/tracks/memoria_evolutiva/plan.md)

## landing_page_v2
**Objective:** Criar nova landing page para testes A/B com design mobile-first e destaque para a Memória Evolutiva (IA que aprende com suas receitas).
- [ ] [Landing Page V2](.conductor/tracks/landing_page_v2/plan.md)

## voice_input
**Objective:** Implementar entrada por voz no frontend para criação de listas de compras, usando o backend já pronto (`/api/voice/transcribe` com Groq Whisper).
- [ ] [Entrada por Voz](.conductor/tracks/voice_input/plan.md)

---

## Specs Ativas (SDD — 2026-06-26)

| Spec | Título | Prioridade | Tasks |
|---|---|---|---|
| [SPEC-001](specs/SPEC-001-model-vision.md) | Correção MODEL_VISION | P0 | TASK-001 |
| [SPEC-002](specs/SPEC-002-migracao-modelos.md) | Migração de Modelos de IA | P0 | TASK-002 a TASK-005 |
| [SPEC-003](specs/SPEC-003-refatoracao-prompts.md) | Refatoração de Prompts | P1 | TASK-006 a TASK-010 |
| [SPEC-004](specs/SPEC-004-imagens-ghibli.md) | Variação e Qualidade de Imagens | P1 | TASK-011 |
