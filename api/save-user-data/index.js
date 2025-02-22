const sql = require('mssql');

const config = {
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    options: {
        encrypt: true
    }
};

module.exports = async function (context, req) {
    let connection;
    try {
        if (req.method !== 'POST') {
            context.res = {
                status: 405,
                body: { error: 'Method not allowed' }
            };
            return;
        }

        const { email, firstName, lastName, propertyId } = req.body;

        if (!email || !firstName || !lastName || !propertyId) {
            context.res = {
                status: 400,
                body: { error: 'Missing required fields' }
            };
            return;
        }

        connection = await sql.connect(config);

        // Check if user already exists
        const existingUser = await sql.query`
            SELECT TenantId FROM Tenants WHERE Email = ${email}
        `;

        if (existingUser.recordset.length > 0) {
            context.res = {
                status: 409,
                body: { error: 'User already exists' }
            };
            return;
        }

        // Insert new tenant
        const result = await sql.query`
            INSERT INTO Tenants (Email, FirstName, LastName, PropertyId)
            OUTPUT INSERTED.*
            VALUES (${email}, ${firstName}, ${lastName}, ${propertyId})
        `;

        context.res = {
            status: 201,
            body: result.recordset[0]
        };
    } catch (error) {
        context.log.error('Database error:', error);
        context.res = {
            status: 500,
            body: { error: 'Failed to save user data' }
        };
    } finally {
        if (connection) {
            await sql.close();
        }
    }
}; 