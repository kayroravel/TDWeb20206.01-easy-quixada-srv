const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT 
                avaliacao.*,
                usuario.nome AS nome_usuario,
                estabelecimento.nome AS nome_estabelecimento
            FROM avaliacao
            INNER JOIN usuario 
                ON avaliacao.id_usuario = usuario.id_usuario
            INNER JOIN estabelecimento 
                ON avaliacao.id_estabelecimento = estabelecimento.id_estabelecimento
            ORDER BY avaliacao.id_avaliacao
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
                avaliacao.*,
                usuario.nome AS nome_usuario,
                estabelecimento.nome AS nome_estabelecimento
             FROM avaliacao
             INNER JOIN usuario 
                ON avaliacao.id_usuario = usuario.id_usuario
             INNER JOIN estabelecimento 
                ON avaliacao.id_estabelecimento = estabelecimento.id_estabelecimento
             WHERE avaliacao.id_avaliacao = $1`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Avaliação não encontrada' });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.post('/', async (req, res) => {
    const { nota, data_avaliacao, id_usuario, id_estabelecimento } = req.body;

    try {
        const resultado = await pool.query(
            `INSERT INTO avaliacao 
            (nota, data_avaliacao, id_usuario, id_estabelecimento)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [nota, data_avaliacao, id_usuario, id_estabelecimento]
        );

        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nota, data_avaliacao, id_usuario, id_estabelecimento } = req.body;

    try {
        const resultado = await pool.query(
            `UPDATE avaliacao 
             SET nota = $1, data_avaliacao = $2, id_usuario = $3, id_estabelecimento = $4
             WHERE id_avaliacao = $5
             RETURNING *`,
            [nota, data_avaliacao, id_usuario, id_estabelecimento, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Avaliação não encontrada' });
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
            'DELETE FROM avaliacao WHERE id_avaliacao = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Avaliação não encontrada' });
        }

        res.json({ mensagem: 'Avaliação deletada com sucesso' });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

module.exports = router;