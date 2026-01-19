# Spec: Diagnóstico e Correção do Scanner (404 Error)

## Objetivo
Identificar e corrigir a causa raiz do erro 404 ao tentar escanear notas fiscais em produção. Implementar logs estruturados para facilitar diagnósticos futuros.

## Diagnóstico Inicial
Os logs do Railway indicam que o frontend está solicitando `POST /analisar-nota`, mas o backend FastAPI espera `/api/analisar-nota`. Isso sugere uma configuração incorreta de `API_URL` no ambiente de produção.

## Solução Proposta
1. **Logs de Backend:** Adicionar um middleware de log no FastAPI para registrar cada requisição recebida (Método, Path, Query Params) e o status retornado.
2. **Logs de Frontend:** Adicionar logs no `api.ts` para mostrar a URL absoluta que está sendo chamada.
3. **Robustez de URL:** Garantir que o prefixo `/api` seja tratado de forma consistente, independentemente da variável de ambiente `VITE_API_URL` terminar ou não com `/api`.
