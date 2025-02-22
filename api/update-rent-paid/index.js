import sql from 'mssql';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenantId, amount, transactionId } = req.body;

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

    // Record the payment
    const result = await sql.query`
      INSERT INTO PaymentHistory (
        TenantId,
        Amount,
        PaymentDate,
        PaymentMethod,
        TransactionId,
        Status,
        RentPeriod
      )
      VALUES (
        ${tenantId},
        ${amount},
        GETDATE(),
        'Credit Card',
        ${transactionId},
        'Succeeded',
        DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
      )
    `;

    res.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
} 