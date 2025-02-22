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
        const { email } = req.query;

        if (!email) {
            context.res = {
                status: 400,
                body: { error: 'Email parameter is required' }
            };
            return;
        }

        connection = await sql.connect(config);
        
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

        if (!result.recordset || result.recordset.length === 0) {
            context.res = {
                status: 404,
                body: { error: 'User not found' }
            };
            return;
        }

        context.res = {
            status: 200,
            body: result.recordset[0]
        };
    } catch (error) {
        context.log.error('Database error:', error);
        context.res = {
            status: 500,
            body: { error: 'Failed to fetch user data' }
        };
    } finally {
        if (connection) {
            await sql.close();
        }
    }
}; 