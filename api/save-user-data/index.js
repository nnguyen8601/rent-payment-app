import sql from 'mssql';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, propertyId } = req.body;

  if (!email || !firstName || !lastName || !propertyId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let pool;
  try {
    const config = {
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      server: process.env.SQL_SERVER,
      options: {
        encrypt: true,
        trustServerCertificate: false
      }
    };

    pool = await sql.connect(config);

    // Check if user already exists
    const existingUser = await sql.query`
      SELECT TenantId FROM Tenants WHERE Email = ${email}
    `;

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Insert new tenant
    const result = await sql.query`
      INSERT INTO Tenants (Email, FirstName, LastName, PropertyId)
      OUTPUT INSERTED.*
      VALUES (${email}, ${firstName}, ${lastName}, ${propertyId})
    `;

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to save user data' });
  } finally {
    if (pool) await pool.close();
  }
} 