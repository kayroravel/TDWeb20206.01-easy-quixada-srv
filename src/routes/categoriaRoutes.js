const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM categoria ORDER BY id_categoria');
        res.json(resultado.rows);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await pool.query(
            'SELECT * FROM categoria WHERE id_categoria = $1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada' });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.post('/', async (req, res) => {
    const { nome_categoria } = req.body;

    try {
        const categoriaExistente = await pool.query(
            'SELECT * FROM categoria WHERE LOWER(nome_categoria) = LOWER($1) LIMIT 1',
            [nome_categoria]
        );

        if (categoriaExistente.rows.length > 0) {
            return res.status(200).json(categoriaExistente.rows[0]);
        }

        const resultado = await pool.query(
            'INSERT INTO categoria (nome_categoria) VALUES ($1) RETURNING *',
            [nome_categoria]
        );

        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_categoria } = req.body;

    try {
        const resultado = await pool.query(
            'UPDATE categoria SET nome_categoria = $1 WHERE id_categoria = $2 RETURNING *',
            [nome_categoria, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada' });
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
            'DELETE FROM categoria WHERE id_categoria = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada' });
        }

        res.json({ mensagem: 'Categoria deletada com sucesso' });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

module.exports = router;
