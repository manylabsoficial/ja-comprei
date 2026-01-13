# Conductor Tracks

This file will contain a list of your project tracks.

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
- [ ] [Integração Pexels](.conductor/tracks/pexels_integration/plan.md)
