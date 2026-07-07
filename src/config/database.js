const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then((client) => {
    console.log("Banco PostgreSQL conectado com sucesso!");
    client.release();
  })
  .catch((erro) => console.error("Erro ao conectar no banco:", erro.message));

module.exports = pool;