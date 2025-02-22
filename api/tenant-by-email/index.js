import sql from 'mssql';

export default async function handler(req, res) {
  console.log('Received request for tenant data');
  const { email } = req.query;
  console.log('Email parameter:', email);

  // Check environment variables before attempting connection
  const requiredEnvVars = ['SQL_SERVER', 'SQL_DATABASE', 'SQL_USER', 'SQL_PASSWORD'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    console.error('Missing environment variables:', missingEnvVars);
    return res.status(500).json({
      error: 'Server configuration error',
      details: `Missing environment variables: ${missingEnvVars.join(', ')}`
    });
  }

  if (!email) {
    console.log('No email provided');
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  let pool;
  try {
    console.log('Creating database config...');
    const config = {
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      server: process.env.SQL_SERVER,
      options: {
        encrypt: true,
        trustServerCertificate: false,
        connectionTimeout: 30000
      }
    };

    console.log('Database server:', config.server);
    console.log('Database name:', config.database);
    
    console.log('Attempting database connection...');
    pool = await sql.connect(config);
    console.log('Database connected successfully');
    
    const result = await sql.query`
      SELECT 
        t.FirstName,
        t.LastName,
        t.Email,
        p.PropertyName,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM PaymentHistory ph 
            WHERE ph.TenantId = t.TenantId 
            AND MONTH(ph.PaymentDate) = MONTH(GETDATE())
            AND YEAR(ph.PaymentDate) = YEAR(GETDATE())
          ) THEN 1 
          ELSE 0 
        END as hasPaidCurrentMonth
      FROM Tenants t
      JOIN Properties p ON t.PropertyId = p.PropertyId
      WHERE t.Email = ${email}
    `;

    console.log('Query executed successfully');

    if (!result.recordset || result.recordset.length === 0) {
      console.log('No tenant found for email:', email);
      return res.status(404).json({ 
        error: 'Tenant not found',
        message: `No tenant found for email: ${email}`
      });
    }

    console.log('Tenant found, sending data');
    return res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Database error details:', {
      message: error.message,
      code: error.code,
      state: error.state,
      stack: error.stack
    });
    
    return res.status(500).json({ 
      error: 'Database connection error',
      details: error.message,
      code: error.code
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
} 