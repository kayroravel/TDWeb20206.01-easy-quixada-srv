# Documentacao do Projeto EasyQuixada

Este projeto tem um backend em Node.js/Express conectado ao PostgreSQL e duas interfaces web:

- Painel administrativo: `EasyQuixada`
- Tela do cliente: `Cliente/EasyQuixadaCliente`

O backend e as duas telas rodam no mesmo servidor. Nao precisa abrir dois servidores.

## Como Rodar

Na raiz do projeto, execute:

```bash
npm start
```

ou:

```bash
node src/server.js
```

Tambem existem atalhos na raiz:

```bash
node server.js
node sever.js
```

O servidor usa a porta definida em `src/server.js`. Atualmente:

```js
const PORT = process.env.PORT || 5000;
```

Entao, por padrao, acesse:

- Admin: `http://localhost:5000/`
- Cliente: `http://localhost:5000/cliente/`
- Teste da API: `http://localhost:5000/api`

Se mudar a porta no `server.js`, troque tambem a porta no navegador.

## Banco de Dados

A conexao fica em:

```text
src/config/database.js
```

As configuracoes do PostgreSQL ficam no arquivo `.env`:

```env
DB_HOST="localhost"
DB_PORT=5432
DB_USER="postgres"
DB_PASSWORD="root"
DB_NAME="easyquixada"
```

O backend usa o pacote `pg` para conectar no PostgreSQL.

## Estrutura Principal

```text
src/
  app.js
  server.js
  config/
    database.js
  routes/
    avaliacaoRoutes.js
    categoriaRoutes.js
    comentarioRoutes.js
    estabelecimentoRoutes.js
    usuarioRoutes.js

EasyQuixada/
  index.html
  src/
    main.js
    styles.css

Cliente/
  EasyQuixadaCliente/
    index.html
    app.js
    styles.css
```

## Arquivo `src/app.js`

Esse arquivo monta o servidor Express.

Ele faz:

- habilita JSON com `express.json()`;
- libera CORS simples para o frontend chamar a API;
- registra as rotas da API;
- serve o painel admin;
- serve a tela do cliente em `/cliente/`.

Rotas estaticas:

```js
app.use('/cliente', express.static(clientePath));
app.use(express.static(path.join(__dirname, '..', 'EasyQuixada')));
```

O caminho `/cliente` redireciona para `/cliente/` para o navegador carregar corretamente:

```js
app.get(/^\/cliente$/, (req, res) => {
    res.redirect('/cliente/');
});
```

Isso evita tela branca causada por `app.js` e `styles.css` sendo buscados no lugar errado.

## Rotas da API

Base da API no servidor local:

```text
http://localhost:5000
```

### Categorias

Arquivo:

```text
src/routes/categoriaRoutes.js
```

Rotas:

```http
GET    /categorias
GET    /categorias/:id
POST   /categorias
PUT    /categorias/:id
DELETE /categorias/:id
```

Exemplo de `POST /categorias`:

```json
{
  "nome_categoria": "Alimentacao"
}
```

Observacao: ao criar categoria, a rota verifica se ja existe uma categoria com o mesmo nome, ignorando maiusculas/minusculas. Se existir, retorna a categoria existente em vez de duplicar.

### Estabelecimentos

Arquivo:

```text
src/routes/estabelecimentoRoutes.js
```

Rotas:

```http
GET    /estabelecimentos
GET    /estabelecimentos/:id
POST   /estabelecimentos
PUT    /estabelecimentos/:id
DELETE /estabelecimentos/:id
```

Exemplo de `POST /estabelecimentos`:

```json
{
  "descricao": "Mercado local",
  "nome": "Nosso Atacarejo",
  "endereco": "Av. Placido Castelo",
  "telefone": "(88) 99900-1212",
  "site": "",
  "imagem": "",
  "instagram": "@nossoatacarejo",
  "facebook": "",
  "whatsapp": "(88) 99900-1212",
  "id_categoria": 1
}
```

O `GET /estabelecimentos` retorna tambem `nome_categoria`, porque faz `INNER JOIN` com a tabela `categoria`.

### Usuarios

Arquivo:

```text
src/routes/usuarioRoutes.js
```

Rotas:

```http
GET    /usuarios
GET    /usuarios/:id
POST   /usuarios
PUT    /usuarios/:id
DELETE /usuarios/:id
```

Exemplo de `POST /usuarios`:

```json
{
  "nome": "Arthur",
  "email": "arthur@email.com",
  "senha": "123456"
}
```

### Avaliacoes

Arquivo:

```text
src/routes/avaliacaoRoutes.js
```

Rotas:

```http
GET    /avaliacoes
GET    /avaliacoes/:id
POST   /avaliacoes
PUT    /avaliacoes/:id
DELETE /avaliacoes/:id
```

Exemplo de `POST /avaliacoes`:

```json
{
  "nota": 5,
  "data_avaliacao": "2026-06-16",
  "id_usuario": 1,
  "id_estabelecimento": 1
}
```

### Comentarios

Arquivo:

```text
src/routes/comentarioRoutes.js
```

Rotas:

```http
GET    /comentarios
GET    /comentarios/:id
POST   /comentarios
PUT    /comentarios/:id
DELETE /comentarios/:id
```

Exemplo de `POST /comentarios`:

```json
{
  "texto_comentario": "Muito bom!",
  "id_avaliacao": 1
}
```

## Painel Admin

Pasta:

```text
EasyQuixada/
```

URL:

```text
http://localhost:5000/
```

Arquivo principal:

```text
EasyQuixada/src/main.js
```

O painel admin:

- lista estabelecimentos usando `GET /estabelecimentos`;
- busca categorias usando `GET /categorias`;
- ao selecionar uma categoria no cadastro, cria a categoria no banco se ainda nao existir;
- cadastra loja usando `POST /estabelecimentos`.

Fluxo de categoria no admin:

1. Usuario seleciona categoria no formulario.
2. O JS verifica se a categoria existe em `categories`.
3. Se nao existir, chama `POST /categorias`.
4. Usa o `id_categoria` retornado para cadastrar o estabelecimento.

## Tela do Cliente

Pasta:

```text
Cliente/EasyQuixadaCliente/
```

URL:

```text
http://localhost:5000/cliente/
```

Arquivo principal:

```text
Cliente/EasyQuixadaCliente/app.js
```

A tela do cliente:

- carrega estabelecimentos usando `GET /estabelecimentos`;
- transforma os dados do banco para o formato visual da tela;
- usa uma lista antiga como fallback caso o banco esteja vazio ou a API falhe.

Campos vindos do banco usados no cliente:

- `id_estabelecimento`
- `nome`
- `nome_categoria`
- `imagem`
- `endereco`
- `telefone`
- `instagram`
- `descricao`

## Problemas Comuns

### `Cannot GET /cliente`

Use:

```text
http://localhost:5000/cliente/
```

Tambem reinicie o servidor depois de alterar `src/app.js`.

### Tela branca em `/cliente`

Normalmente acontece quando o navegador nao carrega `app.js` e `styles.css`.

A rota correta e:

```text
http://localhost:5000/cliente/
```

Com barra no final.

### `Cannot find module sever.js`

O servidor real fica em:

```text
src/server.js
```

Foram criados atalhos na raiz:

```text
server.js
sever.js
```

Mas o comando recomendado e:

```bash
npm start
```

### Porta errada

O projeto esta configurado para porta `5000`, nao `3000`.

Use:

```text
http://localhost:5000/
http://localhost:5000/cliente/
```

### Dois servidores rodando

Nao abra dois servidores ao mesmo tempo.

Use apenas um terminal com:

```bash
npm start
```

Para parar o servidor atual:

```text
Ctrl + C
```

Depois rode de novo.

## Testes Rapidos

Com o servidor rodando, abra no navegador:

```text
http://localhost:5000/api
```

Deve aparecer:

```text
API funcionando!
```

Teste categorias:

```text
http://localhost:5000/categorias
```

Teste estabelecimentos:

```text
http://localhost:5000/estabelecimentos
```

Teste admin:

```text
http://localhost:5000/
```

Teste cliente:

```text
http://localhost:5000/cliente/
```
