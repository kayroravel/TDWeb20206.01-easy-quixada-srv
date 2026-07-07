const express = require("express");
const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "..", "uploads");

function salvarImagem(imagem) {
  if (!imagem || typeof imagem !== "string") {
    return imagem || "";
  }

  if (!imagem.startsWith("data:image/")) {
    return imagem;
  }

  const resultado = imagem.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);

  if (!resultado) {
    return "";
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const extensao = resultado[1] === "jpeg" ? "jpg" : resultado[1];
  const conteudoBase64 = resultado[2];
  const nomeArquivo = `estabelecimento-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extensao}`;
  const caminhoArquivo = path.join(uploadsDir, nomeArquivo);

  fs.writeFileSync(caminhoArquivo, Buffer.from(conteudoBase64, "base64"));

  return `/uploads/${nomeArquivo}`;
}

// LISTAR TODOS
router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT 
                estabelecimento.*,
                categoria.nome_categoria
            FROM estabelecimento
            INNER JOIN categoria
                ON estabelecimento.id_categoria = categoria.id_categoria
            ORDER BY estabelecimento.id_estabelecimento
        `);

    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

//=========================================================================================

// BUSCAR POR ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      `SELECT
                estabelecimento.*,
                categoria.nome_categoria
             FROM estabelecimento
             INNER JOIN categoria
                ON estabelecimento.id_categoria = categoria.id_categoria
             WHERE estabelecimento.id_estabelecimento = $1`,
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Estabelecimento não encontrado",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// CADASTRAR
router.post("/", async (req, res) => {
  const {
    descricao,
    nome,
    endereco,
    telefone,
    site,
    imagem,
    instagram,
    facebook,
    whatsapp,
    id_categoria,
  } = req.body;

  try {
    const caminhoImagem = salvarImagem(imagem);

    const resultado = await pool.query(
      `INSERT INTO estabelecimento (
                descricao,
                nome,
                endereco,
                telefone,
                site,
                imagem,
                instagram,
                facebook,
                whatsapp,
                id_categoria
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *`,
      [
        descricao,
        nome,
        endereco,
        telefone,
        site,
        caminhoImagem,
        instagram,
        facebook,
        whatsapp,
        id_categoria,
      ],
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// ATUALIZAR
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    descricao,
    nome,
    endereco,
    telefone,
    site,
    imagem,
    instagram,
    facebook,
    whatsapp,
    id_categoria,
  } = req.body;

  try {
    const caminhoImagem = salvarImagem(imagem);

    const resultado = await pool.query(
      `UPDATE estabelecimento
             SET
                descricao = $1,
                nome = $2,
                endereco = $3,
                telefone = $4,
                site = $5,
                imagem = $6,
                instagram = $7,
                facebook = $8,
                whatsapp = $9,
                id_categoria = $10
             WHERE id_estabelecimento = $11
             RETURNING *`,
      [
        descricao,
        nome,
        endereco,
        telefone,
        site,
        caminhoImagem,
        instagram,
        facebook,
        whatsapp,
        id_categoria,
        id,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Estabelecimento não encontrado",
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// DELETAR
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      "DELETE FROM estabelecimento WHERE id_estabelecimento = $1 RETURNING *",
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Estabelecimento não encontrado",
      });
    }

    res.json({
      mensagem: "Estabelecimento deletado com sucesso",
    });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

module.exports = router;
