# Configuração dos Templates de E-mail (Brevo)

Este documento contém os textos para você copiar e colar na criação dos templates no painel da Brevo (Transactional > Templates).

> **Tom de Voz:** Acolhedor, amigável e focado na experiência de cozinhar.

---

## 🏗️ Template 1: Boas-vindas (Confirmação)

**Nome do Template (Interno):** `Welcome Signup`
**Assunto:** ✨ Bem-vindo(a) à sua nova cozinha, {{params.nome}}!
**Pré-visualização (Preheader):** Tudo pronto para começar a organizar suas compras e descobrir receitas.

### Design / Conteúdo

**Título (H1):** Bem-vindo(a) ao Já Comprei!

**Corpo (Texto):**
Olá, {{params.nome}}!

Ficamos muito felizes em ter você aqui. Os ingredientes já estão na mesa e estamos prontos para te ajudar a transformar suas compras do dia a dia em experiências deliciosas.

Só falta um pequeno passo para começarmos. Clique no botão abaixo para acessar sua conta.

**Botão (CTA):**
- **Texto:** Confirmar meu cadastro
- **Link:** `{{params.link}}`

---

## 🔑 Template 2: Recuperação de Senha

**Nome do Template (Interno):** `Password Reset`
**Assunto:** 🗝️ Link para criar sua nova senha
**Pré-visualização (Preheader):** Recebemos seu pedido de recuperação de conta.

### Design / Conteúdo

**Título (H1):** Esqueceu a senha? Acontece!

**Corpo (Texto):**
Oi, {{params.nome}}.

Na correria do dia a dia, às vezes a gente perde a chave da despensa. Não se preocupe, é fácil resolver.

Clique no botão abaixo para criar uma nova senha e voltar a acessar suas listas e receitas.

**Botão (CTA):**
- **Texto:** Redefinir Senha
- **Link:** `{{params.link}}`

---

## ⚙️ Variáveis para Teste (Brevo)
Ao editar o template, você pode usar este JSON para testar a visualização:

```json
{
  "nome": "Chef Iniciante",
  "link": "https://jacomprei.app/confirmacao?token=123"
}
```
