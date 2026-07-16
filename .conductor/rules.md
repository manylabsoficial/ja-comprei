# Regras de Desenvolvimento

## 1. Princípios Gerais
- **Simplicidade:** Código limpo e autodocumentável.
- **Foco no Usuário:** UX deve ser fluida e "premium".
- **IA Híbrida:** Priorizar uso eficiente de modelos (Groq para velocidade/custo, DeepSeek para custo/qualidade).
- **Privacidade & Transparência:** Câmera e microfone devem ser ativos APENAS nas telas de uso, com indicador visual, e liberados imediatamente ao sair.

## 2. Fluxo SDD (Spec-Driven Development)

Toda alteração segue o ciclo:

```
SPEC (aprovada) → TASK(s) registrada(s) → IMPLEMENTAÇÃO → VERIFICAÇÃO → CHANGELOG
```

### 2.1 Specs
- Local: `.conductor/specs/SPEC-NNN-*.md`
- Template: `.conductor/templates/spec.md`
- IDs sequenciais: SPEC-001, SPEC-002...
- Status: DRAFT → APPROVED → IN_PROGRESS → DONE
- Uma spec = um objetivo coeso (não um épico)

### 2.2 Tasks
- Local: `.conductor/tasks/TASK-NNN.md`
- Template: `.conductor/templates/task.md`
- Toda task referencia uma spec (SPEC-XXX)
- Status: TODO → IN_PROGRESS → DONE | BLOCKED
- Checklist de verificação obrigatório

### 2.3 Changelog
- Local: `.conductor/CHANGELOG.md`
- **Atualizar a cada alteração** — independe de commit git
- Formato: data, tipo (Created/Changed/Fixed/Completed), referência a spec/task
- Este é o registro temporal canônico do projeto

### 2.4 Tracks (Legado)
- Tracks em `.conductor/tracks/` são o sistema anterior
- Gradualmente migrar tracks existentes para specs/tasks
- Novas iniciativas usam spec + task; tracks ficam para documentação histórica

## 3. Frontend (React)
- Use componentes funcionais e Hooks.
- Estilize com TailwindCSS (evite CSS puro se possível, exceto `index.css`).
- Use `lucide-react` para ícones.

## 4. Backend (FastAPI)
- Use Pydantic para validação de dados (Input/Output schemas).
- Services devem ser isolados dos Routers.
- Use `logging` para rastreabilidade de chamadas de IA.
- Variáveis de ambiente via `app/core/config.py`.

## 5. Prompts de IA
- Prompts versionados em `backend-ja-comprei/app/prompts/` (NÃO inline no código)
- Todo prompt deve ter: versão, data, modelo alvo, changelog no topo do arquivo
- Rollback: trocar import de v2 para v1
- Sanitizar input do usuário antes de injetar em prompt

## 6. Git
- Sempre verifique o `tech-stack.md` antes de adicionar bibliotecas.
- Commits atômicos e descritivos.
- O CHANGELOG.md é o registro primário; commits são secundários.
