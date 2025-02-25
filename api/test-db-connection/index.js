import sql from 'mssql';

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
        context.log.info('Testing database connection');
        connection = await sql.connect(config);
        
        // Test query - check tables
        const tablesResult = await sql.query`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `;

        // Test query - check RentPayments permissions
        const insertTest = await sql.query`
            BEGIN TRANSACTION
            DECLARE @TestId INT
            INSERT INTO RentPayments (TenantId, Amount, PaymentDate, StripePaymentId, Status)
            VALUES (1, 0.01, GETDATE(), 'test_' + CONVERT(VARCHAR, NEWID()), 'test')
            SET @TestId = SCOPE_IDENTITY()
            DELETE FROM RentPayments WHERE PaymentId = @TestId
            ROLLBACK TRANSACTION
            SELECT 'Success' AS Result
        `;
        
        context.res = {
            status: 200,
            body: {
                message: 'Database connection successful',
                tables: tablesResult.recordset.map(r => r.TABLE_NAME),
                insertTest: insertTest.recordset
            }
        };
    } catch (error) {
        context.log.error('Database test error:', error);
        context.res = {
            status: 500,
            body: {
                error: 'Database connection failed',
                details: error.message,
                stack: error.stack
            }
        };
    } finally {
        if (connection) {
            await sql.close();
        }
    }
}; 