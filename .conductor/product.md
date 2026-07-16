# Product: Já Comprei

## Visão Geral
Aplicação inteligente para gerenciamento de compras domésticas e culinária, utilizando IA para sugerir receitas, transcrever listas de compras por voz e analisar notas fiscais.

## Funcionalidades Principais
1.  **Lista de Compras Inteligente:** Adição rápida de itens, categorização automática.
2.  **Sugestão de Receitas:** IA analisa os ingredientes disponíveis e sugere receitas criativas (Chef Brasileiro).
3.  **Entrada por Voz:** Transcrição de áudio para listas ou comandos (Whisper).
4.  **Scanner de Notas:** Leitura de notas fiscais com feedback visual e animação dedicada.
5.  **Interface Moderna:** Design responsivo (Mobile-First) com suporte total a Light/Dark Mode.
6.  **Dashboard:** Hub centralizado para acesso rápido a todos os serviços.
7.  **Privacidade:** Controle rigoroso de câmera (ativa apenas na tela de Scanner com indicador visual).
8.  **Experiência Visual Imersiva:** Geração de imagens exclusivas em estilo "Studio Ghibli" (Pollinations AI) para todas as receitas, garantindo identidade visual única e apetitosa.
9.  **Livro de Receitas (Persistence):**
    - Salve suas receitas favoritas geradas pela IA.
    - Acesse a qualquer momento na aba "Minhas Receitas".
    - Sincronização automática na nuvem (Supabase).
10. **Navegação Simplificada:** Barra de menu inferior persistente (Home, Novo, Receitas) para acesso rápido.
11. **Memória Evolutiva (Personalização RAG):** O Chef de IA aprende com suas receitas salvas, identificando proteínas favoritas, restrições e métodos de preparo para personalizar sugestões futuras sem perder a originalidade.

## Público Alvo
Pessoas responsáveis pelas compras da casa e cozinha, buscando otimizar tempo e reduzir desperdício.

---

## Backlog (Funcionalidades Futuras)

### Receitas Públicas/Privadas e Compartilhamento
Configuração de visibilidade por receita:
- **Privada (padrão):** Apenas o criador pode acessar.
- **Pública:** URL acessível por qualquer pessoa, sem autenticação.
- **Link Secreto:** URL única não-indexada, compartilhável diretamente.

**Considerações Técnicas (Análise Preliminar):**
- Campo `visibility` na tabela de receitas: `private | public | unlisted`.
- Middleware de autorização no backend para verificar permissões.
- No frontend, botão "Compartilhar" que copia a URL ou abre modal de configuração.

### Segurança e Dívida Técnica
- [ ] **Segurança (Backend):** Mover lógica de desconto de créditos para RPC/Backend para evitar manipulação via cliente (RLS permissiva atual é risco para produção).
