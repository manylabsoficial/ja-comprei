from pydantic import BaseModel, Field
from typing import Literal

class Receita(BaseModel):
    nome_do_prato: str
    tempo_preparo: str
    porcoes: int = Field(default=2, ge=1)
    ingredientes_usados: list[str]
    modo_de_preparo: list[str]
    descricao_imagem: str | None = None
    visual_tag: str = Field(description="Short visual description in English for image generation")
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

class UserRegister(BaseModel):
    email: str
    password: str
    nome: str

class PasswordResetRequest(BaseModel):
    email: str
