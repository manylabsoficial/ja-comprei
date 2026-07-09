"""
Prompts versionados do Já Comprei.

Estrutura:
  prompts/
  ├── __init__.py          # Este arquivo
  ├── chef_v1.py           # CHEF_SYSTEM_PROMPT — Geração de receitas
  ├── ocr_vision_v1.py     # VISION_SYSTEM_PROMPT — OCR de notas fiscais
  ├── parse_ingredients_v1.py  # PARSE_SYSTEM_PROMPT — Parsing de ingredientes
  └── metadata_v1.py       # METADATA_EXTRACTION_PROMPT — Extração de metadados

Versionamento:
  - Cada prompt tem versão independente (v1, v2...)
  - Rollback: trocar import de chef_v2 para chef_v1
  - Metadata no topo de cada arquivo: versão, data, modelo alvo, changelog

Para criar uma nova versão:
  1. Copie o arquivo atual (ex: chef_v1.py → chef_v2.py)
  2. Atualize o changelog no topo
  3. Modifique o prompt
  4. Teste com conjunto fixo de ingredientes
  5. Atualize o import em groq_service.py
"""

# Lista de prompts disponíveis com suas versões atuais
AVAILABLE_PROMPTS = {
    "chef": "chef_v1",
    "ocr_vision": "ocr_vision_v1", 
    "parse_ingredients": "parse_ingredients_v1",
    "metadata": "metadata_v1",
}
