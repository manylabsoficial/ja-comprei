# Spec: Correção do MODEL_VISION
**Spec ID:** SPEC-001
**Criado:** 2026-06-26
**Status:** APPROVED
**Prioridade:** P0
**Autor:** Auditoria de IA

---

## Objetivo
Substituir o modelo de OCR/Vision deprecado (`llama-4-maverick`) pelo modelo ativo `llama-4-scout-17b-16e-instruct`.

## Motivação
O modelo `meta-llama/llama-4-maverick-17b-128e-instruct` não consta em nenhuma lista da Groq (Production, Preview ou Deprecated). As chamadas de OCR podem estar falhando silenciosamente ou prestes a falhar. A extração de ingredientes de notas fiscais é o ponto de entrada principal do app — sem OCR funcional, o fluxo inteiro quebra.

## Requisitos
### Funcionais
- [ ] REQ-01: MODEL_VISION deve apontar para modelo ativo na Groq
- [ ] REQ-02: OCR de notas fiscais deve continuar funcionando com classificação de categorias
- [ ] REQ-03: Resposta deve manter o formato JSON `{ ingredientes: [{ item, quantidade, categoria }] }`

### Não-Funcionais
- [ ] NFR-01: Latência equivalente ou inferior ao modelo anterior
- [ ] NFR-02: Custo por chamada aceitável (Scout: $0.11 input / $0.34 output)

## Escopo
### Dentro do escopo
- Alterar `MODEL_VISION` em `config.py`
- Testar OCR com imagem de nota fiscal real
- Ajustar prompt se o comportamento do Scout diferir do Maverick

### Fora do escopo (v1)
- Migrar OCR para outro provedor
- Adicionar chain-of-thought no prompt de OCR (SPEC-003)

## Critérios de Aceite
- [ ] AC-01: `MODEL_VISION` aponta para `meta-llama/llama-4-scout-17b-16e-instruct`
- [ ] AC-02: Chamada a `/api/analisar-nota` com nota fiscal real retorna JSON válido com itens e categorias
- [ ] AC-03: Nenhum erro 404 ou "model not found" nos logs

## Riscos
| Risco | Impacto | Mitigação |
|---|---|---|
| Scout ser removido do Preview | Alto | Monitorar status do modelo; fallback para Qwen3.6-27B (mais caro) |
| Comportamento diferente do Maverick | Médio | Testar com recibos reais; ajustar prompt se necessário |

## Tasks Relacionadas
- TASK-001: Corrigir MODEL_VISION e testar OCR
