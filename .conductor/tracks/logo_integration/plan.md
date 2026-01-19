# Integração do Logotipo no Site

## Goal Description
Adicionar o novo logotipo (`Logo.png`) em locais estratégicos do site seguindo boas práticas de UX, reforçando a identidade visual da marca "Já Comprei".

## Proposed Changes

### [Frontend] Tela de Loading (`Loading.jsx`)
- **O que:** Substituir o ícone `ChefHat` pelo logotipo PNG.
- **Como:** Importar a imagem e usar `<img>` no lugar do componente Lucide.
- **Por quê (UX):** A tela de loading é um momento de espera onde o usuário absorve a marca. Mostrar o logo reforça o branding.

### [Frontend] Página de Confirmação (`ConfirmationPage.jsx`)
- **O que:** Adicionar o logo acima do título de sucesso/erro.
- **Por quê:** Quando o usuário clica no link do email, ele está "entrando na casa". Ver o logo gera confiança e consistência.

### [Frontend] Landing Page (`Index2.jsx`)
- **O que:** Verificar se já existe logo na hero/nav e padronizar.
- **Por quê (UX):** A Landing Page é a vitrine. O logo deve estar visível no header para todos os visitantes.

### [Frontend] Templates de Email (Opcional)
- **O que:** Adicionar versão do logo em URL pública para uso nos templates do Brevo.
- **Por quê:** Emails precisam de URL absoluta para imagens. Podemos hospedar o logo em `jacomprei.app/logo.png` ou usar serviço externo.

## Verification Plan
### Manual Verification
1. **Loading:** Navegar para `/scanning` ou qualquer tela que exiba o loading e verificar se o logo aparece animado.
2. **Confirmation:** Simular confirmação clicando no link do email (ou navegando para `/confirmacao`) e verificar presença do logo.
3. **Landing Page:** Abrir `/` e verificar se o logo está no header/hero.
