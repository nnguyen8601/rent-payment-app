import sql from 'mssql';

export default async function handler(req, res) {
  console.log('Received request for tenant data');
  const { email } = req.query;
  console.log('Email parameter:', email);

  if (!email) {
    console.log('No email provided');
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  let pool;
  try {
    console.log('Attempting database connection...');
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

    console.log('Query result:', result);

    if (result.recordset.length === 0) {
      console.log('No tenant found');
      return res.status(404).json({ error: 'Tenant not found' });
    }

    console.log('Sending tenant data');
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tenant information',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    if (pool) await pool.close();
  }
} 