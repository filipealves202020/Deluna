// O Netlify Functions já inclui essas bibliotecas
// require('dotenv').config() não é necessário aqui, o Netlify gerencia isso
const { Pool } = require('pg');

// Configura a conexão com o Neon usando a variável de ambiente segura
// `process.env` busca a variável que você vai configurar no painel do Netlify
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// A função 'handler' é o ponto de entrada para o Netlify Function
exports.handler = async (event, context) => {
  // Garante que a função só responda a requisições do tipo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Status de "Método Não Permitido"
      body: JSON.stringify({ message: 'Método não permitido. Use POST.' }),
    };
  }

  try {
    // Analisa os dados JSON enviados pelo seu site
    const data = JSON.parse(event.body);
    const { date, quantity, route, driver } = data;

    // Comando SQL para inserir um novo registro na tabela 'records'
    const query = `
      INSERT INTO records (record_date, quantity, route, driver)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    // Os valores dos campos do formulário
    const values = [date, quantity, route, driver];

    // Executa a query no banco de dados Neon
    const result = await pool.query(query, values);

    // Retorna uma resposta de sucesso para o seu site
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Registro salvo com sucesso!', 
        record: result.rows[0] 
      }),
    };

  } catch (error) {
    console.error('Erro ao salvar o registro:', error);
    
    // Retorna uma resposta de erro para o seu site
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Erro ao salvar o registro. Verifique a conexão com o banco de dados.', 
        error: error.message 
      }),
    };
  }
};
