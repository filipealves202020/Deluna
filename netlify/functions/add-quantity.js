// netlify/functions/add-quantity.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método não permitido. Use PUT.' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { id, quantityToAdd } = data;

    if (!id || typeof quantityToAdd !== 'number' || quantityToAdd <= 0) {
      return { statusCode: 400, body: JSON.stringify({ message: 'ID ou quantidade inválida.' }) };
    }

    const query = `
      UPDATE records
      SET quantity = quantity + $1
      WHERE id = $2
      RETURNING *;
    `;
    const values = [quantityToAdd, id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Registro não encontrado.' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Quantidade adicionada com sucesso!', record: result.rows[0] }),
    };

  } catch (error) {
    console.error('Erro ao adicionar quantidade:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao adicionar quantidade.', error: error.message }),
    };
  }
};
