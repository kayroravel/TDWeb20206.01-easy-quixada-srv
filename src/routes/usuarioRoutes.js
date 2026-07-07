const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM usuario ORDER BY id_usuario');
        res.json(resultado.rows);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await pool.query(
            'SELECT * FROM usuario WHERE id_usuario = $1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.post('/', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const resultado = await pool.query(
            'INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
            [nome, email, senha]
        );

        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, senha } = req.body;

    try {
        const resultado = await pool.query(
            `UPDATE usuario 
             SET nome = $1, email = $2, senha = $3 
             WHERE id_usuario = $4 
             RETURNING *`,
            [nome, email, senha, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
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
            'DELETE FROM usuario WHERE id_usuario = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        res.json({ mensagem: 'Usuário deletado com sucesso' });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

module.exports = router;