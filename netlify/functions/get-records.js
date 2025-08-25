// netlify/functions/get-records.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event) => {
  try {
    const result = await pool.query('SELECT * FROM records ORDER BY record_date DESC, id DESC');

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };

  } catch (error) {
    console.error('Erro ao buscar os registros:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao buscar os registros.' }),
    };
  }
};
