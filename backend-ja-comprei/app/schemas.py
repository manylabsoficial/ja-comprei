from pydantic import BaseModel, Field
from typing import Literal

class Receita(BaseModel):
    nome_do_prato: str
    tempo_preparo: str
    porcoes: int = Field(default=2, ge=1)
    ingredientes_usados: list[str]
    modo_de_preparo: list[str]
    descricao_imagem: str
    tipo_receita: Literal["destaque", "pratica"]

class ReceitasResponse(BaseModel):
    receitas: list[Receita]

class ItemVision(BaseModel):
    item: str
    quantidade: str
    categoria: Literal["alimento", "limpeza", "higiene", "outros"] = Field(
        description="Classificação do item para filtragem de segurança"
    )

class VisionResponse(BaseModel):
    ingredientes: list[ItemVision]
