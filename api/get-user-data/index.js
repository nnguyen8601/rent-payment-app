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
        const email = req.query.email;
        
        if (!email) {
            context.res = {
                status: 400,
                body: { error: 'Email parameter is required' }
            };
            return;
        }

        context.log.info(`Fetching user data for email: ${email}`);
        
        connection = await sql.connect(config);
        
        // Get tenant data including the TenantId
        const result = await sql.query`
            SELECT 
                t.TenantId,
                t.FirstName,
                t.LastName,
                t.Email,
                p.PropertyName,
                t.PropertyId,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM PaymentHistory ph 
                        WHERE ph.TenantId = t.TenantId 
                        AND MONTH(ph.PaymentDate) = MONTH(GETDATE())
                        AND YEAR(ph.PaymentDate) = YEAR(GETDATE())
                    ) THEN 1 
                    ELSE 0 
                END as hasPaidCurrentMonth
            FROM Tenants t
            LEFT JOIN Properties p ON t.PropertyId = p.PropertyId
            WHERE t.Email = ${email}
        `;

        if (result.recordset.length === 0) {
            context.log.warn(`No tenant found for email: ${email}`);
            context.res = {
                status: 404,
                body: { error: 'Tenant not found' }
            };
            return;
        }

        const tenant = result.recordset[0];
        context.log.info(`Found tenant data: ${JSON.stringify(tenant)}`);

        context.res = {
            status: 200,
            body: {
                tenantId: tenant.TenantId,  // Make sure TenantId is included
                firstName: tenant.FirstName,
                lastName: tenant.LastName,
                email: tenant.Email,
                propertyName: tenant.PropertyName,
                propertyId: tenant.PropertyId,
                hasPaidCurrentMonth: tenant.hasPaidCurrentMonth === 1
            }
        };
    } catch (error) {
        context.log.error('Error fetching user data:', error);
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