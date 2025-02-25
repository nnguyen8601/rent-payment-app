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
        const { email, firstName, lastName, propertyId } = req.body;

        if (!email || !firstName || !lastName || !propertyId) {
            context.res = {
                status: 400,
                body: { error: 'Missing required fields' }
            };
            return;
        }

        context.log.info(`Saving user data for email: ${email}`);
        
        connection = await sql.connect(config);
        
        // Check if user already exists
        const checkResult = await sql.query`
            SELECT TenantId FROM Tenants WHERE Email = ${email}
        `;
        
        if (checkResult.recordset.length > 0) {
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
            body: {
                message: 'User registered successfully',
                user: {
                    tenantId: result.recordset[0].TenantId,
                    email,
                    firstName,
                    lastName
                }
            }
        };
    } catch (error) {
        context.log.error('Database error:', error);
        context.res = {
            status: 500,
            body: { error: 'Failed to save user data', details: error.message }
        };
    } finally {
        if (connection) {
            await sql.close();
        }
    }
}; 