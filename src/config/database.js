const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "easyquixada-bd",
  connectionTimeoutMillis: 5000,
});

pool
  .connect()
  .then((client) => {
    console.log("Banco PostgreSQL conectado com sucesso!");
    client.release();
  })
  .catch((erro) => console.error("Erro ao conectar no banco:", erro.message));

module.exports = pool;
