Guia prático da API do Pexels
=============================

Este documento resume a documentação oficial da API do Pexels, cobrindo visão geral, endpoints principais e exemplos de uso da API para fotos e vídeos.​

1\. Visão geral
---------------

*   A API do Pexels fornece acesso programático a fotos e vídeos gratuitos via REST, com respostas em JSON.​
    
*   O uso do conteúdo deve seguir os termos de uso, incluindo atribuição ao Pexels e aos autores quando possível.​
    

2\. Autenticação e cabeçalhos
-----------------------------

2.1 Obtenção da API Key
-----------------------

*   É necessário ter uma conta no Pexels e solicitar uma chave em [https://www.pexels.com/api.](https://www.pexels.com/api.)​
    

2.2 Envio da chave na requisição
--------------------------------

*   Todas as requisições devem incluir o cabeçalho HTTP Authorization com a API key.​
    

Exemplo de chamada HTTP (cURL):

curl -H "Authorization: YOUR\_API\_KEY""[https://api.pexels.com/v1/search?query=people](https://api.pexels.com/v1/search?query=people)"

3\. Diretrizes de uso
---------------------

*   Exibir um link visível para o Pexels quando mostrar fotos ou vídeos, por exemplo “Fotos fornecidas pelo Pexels”.​
    
*   Creditar o fotógrafo ou videomaker com link para a página do conteúdo sempre que possível.​
    
*   Não replicar a funcionalidade principal do site Pexels nem criar aplicativos focados apenas em papel de parede usando o conteúdo da API.​
    

4\. Limites de uso (Rate limit)
-------------------------------

*   Limite padrão: 200 requisições por hora e 20.000 por mês.​
    
*   Cabeçalhos retornados em respostas bem-sucedidas: X-Ratelimit-Limit, X-Ratelimit-Remaining, X-Ratelimit-Reset.​
    

Exemplo de cabeçalhos:

X-Ratelimit-Limit: 20000X-Ratelimit-Remaining: 19684X-Ratelimit-Reset: 1590529646

5\. Paginação
-------------

*   Endpoints que retornam listas usam paginação com parâmetros page e per\_page.​
    
*   per\_page tem valor padrão 15 e máximo 80.​
    

Exemplo de requisição paginada:

GET [https://api.pexels.com/v1/curated?page=2&per\_page=40](https://api.pexels.com/v1/curated?page=2&per_page=40)

Exemplo de resposta JSON de paginação:

{"page": 2,"per\_page": 40,"total\_results": 8000,"next\_page": "[https://api.pexels.com/v1/curated?page=3&per\_page=40](https://api.pexels.com/v1/curated?page=3&per_page=40)","prev\_page": "[https://api.pexels.com/v1/curated?page=1&per\_page=40](https://api.pexels.com/v1/curated?page=1&per_page=40)"}

6\. Recurso Photo
-----------------

Um objeto Photo representa uma foto da plataforma.​

6.1 Campos principais
---------------------

*   id: identificador da foto.​
    
*   width, height: dimensões em pixels.​
    
*   url: URL da página da foto no Pexels.​
    
*   photographer, photographer\_url, photographer\_id: dados do autor.​
    
*   avg\_color: cor média, útil como placeholder.​
    
*   src: conjunto de URLs em tamanhos diferentes (original, large, medium, small, portrait, landscape, tiny).​
    
*   alt: texto alternativo da imagem.​
    

6.2 Exemplo de Photo
--------------------

{"id": 2014422,"width": 3024,"height": 3024,"url": "[https://www.pexels.com/photo/brown-rocks-during-golden-hour-2014422/](https://www.pexels.com/photo/brown-rocks-during-golden-hour-2014422/)","photographer": "Joey Farina","photographer\_url": "[https://www.pexels.com/@joey](https://www.pexels.com/@joey)","photographer\_id": 680589,"avg\_color": "#978E82","src": {"original": "[https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg](https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg)","large2x": "[https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940](https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)","large": "[https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=650&w=940](https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)","medium": "[https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=350](https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=350)","small": "[https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=130](https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=130)","portrait": "[https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800](https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800)","landscape": "[https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200](https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200)","tiny": "[https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280](https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280)"},"liked": false,"alt": "Brown Rocks During Golden Hour"}

7\. Endpoints de fotos
----------------------

7.1 Buscar fotos
----------------

Endpoint:GET [https://api.pexels.com/v1/search](https://api.pexels.com/v1/search)​

Parâmetros principais:

*   query (obrigatório): termo de busca.​
    
*   orientation: landscape, portrait ou square.​
    
*   size: large, medium ou small.​
    
*   color: nome de cor ou código hexadecimal.​
    
*   locale: por exemplo pt-BR, en-US, es-ES.​
    
*   page, per\_page: paginação.​
    

Resposta:

*   photos: array de Photo.​
    
*   Campos de paginação: page, per\_page, total\_results, prev\_page, next\_page.​
    

Exemplo de requisição:

curl -H "Authorization: YOUR\_API\_KEY""[https://api.pexels.com/v1/search?query=nature&per\_page=1](https://api.pexels.com/v1/search?query=nature&per_page=1)"

7.2 Fotos curated
-----------------

Endpoint:GET [https://api.pexels.com/v1/curated](https://api.pexels.com/v1/curated)​

*   Retorna fotos escolhidas a dedo pela equipe Pexels.​
    

Parâmetros:

*   page, per\_page com as mesmas regras gerais de paginação.​
    

7.3 Obter foto por ID
---------------------

Endpoint:GET [https://api.pexels.com/v1/photos/:id](https://api.pexels.com/v1/photos/:id)​

*   Retorna um único objeto Photo com todos os campos disponíveis.​
    

Exemplo de requisição:

curl -H "Authorization: YOUR\_API\_KEY""[https://api.pexels.com/v1/photos/2014422](https://api.pexels.com/v1/photos/2014422)"

8\. Recurso Video
-----------------

Um objeto Video representa um vídeo do Pexels.​

8.1 Campos principais
---------------------

*   id, width, height: metadados básicos.​
    
*   url: página do vídeo no Pexels.​
    
*   image: thumbnail do vídeo.​
    
*   duration: duração em segundos.​
    
*   user: objeto com dados do criador (id, name, url).​
    
*   video\_files: arquivos em diferentes resoluções e formatos.​
    
*   video\_pictures: frames de preview.​
    

9\. Endpoints de vídeos
-----------------------

9.1 Buscar vídeos
-----------------

Endpoint:GET [https://api.pexels.com/videos/search](https://api.pexels.com/videos/search)​

Parâmetros principais:

*   query (obrigatório).​
    
*   orientation: landscape, portrait, square.​
    
*   size: large, medium, small.​
    
*   locale, page, per\_page.​
    

Resposta:

*   videos: array de Video.​
    
*   Campos de paginação semelhantes à busca de fotos.​
    

9.2 Vídeos populares
--------------------

Endpoint:GET [https://api.pexels.com/videos/popular](https://api.pexels.com/videos/popular)​

Parâmetros:

*   min\_width, min\_height.​
    
*   min\_duration, max\_duration.​
    
*   page, per\_page.​
    

Resposta:

*   videos: array de Video com metadados completos.​
    

9.3 Obter vídeo por ID
----------------------

Endpoint:GET [https://api.pexels.com/videos/videos/:id](https://api.pexels.com/videos/videos/:id)​

*   Retorna um objeto Video único.​
    

10\. Coleções
-------------

*   Coleções agrupam fotos e vídeos em galerias temáticas.​
    
*   A documentação cita endpoints para listar coleções, coleções em destaque, coleções do usuário e seus conteúdos, mas a criação ou edição de coleções via API não é descrita.​
    
*   Para detalhes de rotas e payloads de coleções, use sempre a documentação oficial, pois a interface pode evoluir.​
    

11\. Bibliotecas cliente
------------------------

Linguagens com SDKs oficiais:

*   Ruby: pacote pexels (RubyGems), repositório pexels/pexels-ruby.​
    
*   JavaScript: pacote pexels (npm), repositório pexels/pexels-javascript.​
    
*   .NET: pacote PexelsDotNetSDK (NuGet), repositório pexels/PexelsDotNetSDK.​
    

12\. Boas práticas de integração
--------------------------------

*   Centralizar configuração de cabeçalhos e base URL em um cliente HTTP reutilizável.​
    
*   Monitorar o rate limit e aplicar backoff ou cache para evitar erros 429.​
    
*   Utilizar URLs tiny ou small como placeholders de carregamento e avg\_color como fundo.​
    
*   Explorar filtros de orientation, size, color e locale para resultados mais relevantes.​