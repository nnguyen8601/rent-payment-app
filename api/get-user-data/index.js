import sql from 'mssql';

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  let pool;
  try {
    const config = {
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      server: process.env.SQL_SERVER,
      options: { encrypt: true }
    };

    pool = await sql.connect(config);
    
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

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  } finally {
    if (pool) await pool.close();
  }
} 