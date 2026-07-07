const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT 
                comentario.*,
                avaliacao.nota,
                usuario.nome AS nome_usuario,
                estabelecimento.nome AS nome_estabelecimento
            FROM comentario
            INNER JOIN avaliacao 
                ON comentario.id_avaliacao = avaliacao.id_avaliacao
            INNER JOIN usuario 
                ON avaliacao.id_usuario = usuario.id_usuario
            INNER JOIN estabelecimento 
                ON avaliacao.id_estabelecimento = estabelecimento.id_estabelecimento
            ORDER BY comentario.id_comentario
        `);

        res.json(resultado.rows);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await pool.query(
            `SELECT 
                comentario.*,
                avaliacao.nota,
                usuario.nome AS nome_usuario,
                estabelecimento.nome AS nome_estabelecimento
             FROM comentario
             INNER JOIN avaliacao 
                ON comentario.id_avaliacao = avaliacao.id_avaliacao
             INNER JOIN usuario 
                ON avaliacao.id_usuario = usuario.id_usuario
             INNER JOIN estabelecimento 
                ON avaliacao.id_estabelecimento = estabelecimento.id_estabelecimento
             WHERE comentario.id_comentario = $1`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Comentário não encontrado' });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.post('/', async (req, res) => {
    const { texto_comentario, id_avaliacao } = req.body;

    try {
        const resultado = await pool.query(
            `INSERT INTO comentario 
            (texto_comentario, id_avaliacao)
            VALUES ($1, $2)
            RETURNING *`,
            [texto_comentario, id_avaliacao]
        );

        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { texto_comentario, id_avaliacao } = req.body;

    try {
        const resultado = await pool.query(
            `UPDATE comentario 
             SET texto_comentario = $1, id_avaliacao = $2
             WHERE id_comentario = $3
             RETURNING *`,
            [texto_comentario, id_avaliacao, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Comentário não encontrado' });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await pool.query(
            'DELETE FROM comentario WHERE id_comentario = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Comentário não encontrado' });
        }

        res.json({ mensagem: 'Comentário deletado com sucesso' });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

module.exports = router;