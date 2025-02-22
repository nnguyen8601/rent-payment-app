import sql from 'mssql';

export default async function handler(req, res) {
  console.log('Testing database connection');
  
  const requiredEnvVars = ['SQL_SERVER', 'SQL_DATABASE', 'SQL_USER', 'SQL_PASSWORD'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    return res.status(500).json({
      error: 'Missing environment variables',
      missing: missingEnvVars
    });
  }

  let pool;
  try {
    const config = {
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      server: process.env.SQL_SERVER,
      options: {
        encrypt: true
      }
    };

    pool = await sql.connect(config);
    const result = await sql.query`SELECT 1 as test`;
    
    return res.status(200).json({
      message: 'Database connection successful',
      test: result.recordset[0]
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Database connection failed',
      details: error.message
    });
  } finally {
    if (pool) await pool.close();
  }
} 