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

class RecipeMetadata(BaseModel):
    proteina_principal: Literal["frango", "carne_bovina", "peixe", "porco", "ovos", "vegetariano", "misto"]
    metodo_cocao: list[str]
    perfil_sabor: list[str]
    nivel_dificuldade: Literal["facil", "medio", "dificil"]
    tempo_estimado_minutos: int = Field(ge=5, le=180)
    tipo_refeicao: Literal["cafe_manha", "almoco", "jantar", "lanche", "sobremesa"]
    utensilios_especiais: list[str] = []
    ingredientes_chave: list[str] = Field(min_length=3, max_length=5)
    restricoes_detectadas: list[str] | None = None
    custo_estimado: Literal["baixo", "medio", "alto"]
    ocasiao: Literal["dia_a_dia", "especial", "festa"]
    num_ingredientes: int = Field(ge=1)

class PasswordResetRequest(BaseModel):
    email: str
