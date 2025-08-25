// netlify/functions/update-record.js

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
    const { id, date, quantity, route, driver } = data;

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ message: 'ID do registro não fornecido.' }) };
    }

    const query = `
      UPDATE records
      SET record_date = $1, quantity = $2, route = $3, driver = $4
      WHERE id = $5
      RETURNING *;
    `;
    const values = [date, quantity, route, driver, id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Registro não encontrado.' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Registro atualizado com sucesso!', record: result.rows[0] }),
    };

  } catch (error) {
    console.error('Erro ao atualizar o registro:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao atualizar o registro.', error: error.message }),
    };
  }
};
