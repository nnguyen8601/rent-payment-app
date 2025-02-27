import sql from 'mssql';
import { getGraphClient } from '../../utils/graphClient';

export default async function handler(req, res) {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  try {
    // Connect to your Azure SQL Database
    await sql.connect(process.env.AZURE_SQL_CONNECTION_STRING);
    
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
      // Fetch user details from B2C
      const graphClient = await getGraphClient();
      const b2cUsers = await graphClient.api('/users')
        .filter(`identities/any(i:i/issuerAssignedId eq '${email}')`)
        .select('id,displayName,extension_FirstName,extension_LastName,extension_Age,extension_Gender,extension_Phone')
        .get();

      if (b2cUsers.value && b2cUsers.value.length > 0) {
        const b2cUser = b2cUsers.value[0];
        
        // Insert new tenant using B2C data
        const insertResult = await sql.query`
          INSERT INTO Tenants (
            Email, FirstName, LastName, Age, Gender,
            Phone, EmergencyContact, PropertyId,
            MoveInDate, LeaseEndDate, MonthlyRent, LeaseType
          )
          OUTPUT INSERTED.*
          VALUES (
            ${email}, ${b2cUser.extension_FirstName}, ${b2cUser.extension_LastName}, ${parseInt(b2cUser.extension_Age)}, ${b2cUser.extension_Gender},
            ${b2cUser.extension_Phone}, ${null}, ${1}, -- Default property, update as needed
            GETDATE(), -- MoveInDate
            DATEADD(year, 1, GETDATE()), -- LeaseEndDate
            1200.00, -- Default MonthlyRent
            'Annual' -- Default LeaseType
          )
        `;

        return res.json(insertResult.recordset[0]);
      }

      return res.status(404).json({ error: 'User not found in B2C' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tenant information',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    sql.close();
  }
} 