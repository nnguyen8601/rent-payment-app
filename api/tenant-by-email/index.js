import sql from 'mssql';
import { getGraphClient } from '../utils/graphClient';

export default async function handler(req, res) {
  // Get email from query parameter instead of route parameter
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  let pool;
  try {
    console.log('Attempting to connect to SQL database...');
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
    console.log('Successfully connected to SQL database');
    
    // Query to get tenant information
    const result = await sql.query`
      SELECT 
        t.TenantId,
        t.FirstName,
        t.LastName,
        t.Age,
        t.Gender,
        t.Phone,
        t.EmergencyContact,
        t.MoveInDate,
        t.LeaseEndDate,
        p.PropertyName,
        t.UnitNumber,
        t.MonthlyRent,
        t.LeaseType
      FROM Tenants t
      LEFT JOIN Properties p ON t.PropertyId = p.PropertyId
      WHERE t.Email = ${email}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ 
        error: 'Tenant not found',
        message: 'No tenant record found for this email'
      });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tenant information',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: error.code
    });
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