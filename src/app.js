const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const categoriaRoutes = require("./routes/categoriaRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const estabelecimentoRoutes = require("./routes/estabelecimentoRoutes");
const avaliacaoRoutes = require("./routes/avaliacaoRoutes");
const comentarioRoutes = require("./routes/comentarioRoutes");

const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use("/uploads", express.static(uploadsDir));

// Rotas da API (ANTES das rotas estáticas)
app.use("/categorias", categoriaRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/estabelecimentos", estabelecimentoRoutes);
app.use("/avaliacoes", avaliacaoRoutes);
app.use("/comentarios", comentarioRoutes);

// Rotas estáticas (DEPOIS das rotas da API)
const clientePath = path.join(__dirname, "..", "Cliente", "EasyQuixadaCliente");

app.get(/^\/cliente$/, (req, res) => {
  res.redirect("/cliente/");
});

app.use("/cliente", express.static(clientePath));
app.use(express.static(path.join(__dirname, "..", "EasyQuixada")));

app.get("/api", (req, res) => {
  res.send("API funcionando!");
});

module.exports = app;
