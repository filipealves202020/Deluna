// netlify/functions/delete-record.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Método não permitido.' };
  }

  try {
    const id = event.queryStringParameters.id;

    if (!id) {
      return { statusCode: 400, body: 'ID do registro não fornecido.' };
    }

    const result = await pool.query('DELETE FROM records WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return { statusCode: 404, body: 'Registro não encontrado.' };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Registro excluído com sucesso.' }),
    };

  } catch (error) {
    console.error('Erro ao deletar o registro:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao deletar o registro.' }),
    };
  }
};
