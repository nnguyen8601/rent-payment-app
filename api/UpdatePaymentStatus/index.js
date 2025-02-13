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
        const { paymentIntentId, status } = req.body;
        context.log('Updating payment status:', { paymentIntentId, status });

        if (!paymentIntentId || !status) {
            context.res = {
                status: 400,
                body: { error: "Missing paymentIntentId or status" }
            };
            return;
        }

        // Connect to database
        connection = await sql.connect(config);

        // Update payment status
        const result = await sql.query`
            UPDATE RentPayments
            SET Status = ${status},
                UpdatedAt = GETDATE()
            OUTPUT INSERTED.*
            WHERE StripePaymentId = ${paymentIntentId}
        `;

        context.log('Update result:', result);

        if (result.rowsAffected[0] === 0) {
            context.res = {
                status: 404,
                body: { error: "Payment record not found" }
            };
            return;
        }

        context.res = {
            status: 200,
            body: { 
                success: true,
                updatedStatus: status,
                paymentIntentId: paymentIntentId
            }
        };

    } catch (error) {
        context.log.error('Status update error:', error);
        context.res = {
            status: 500,
            body: { error: error.message }
        };
    } finally {
        if (connection) {
            await sql.close();
        }
    }
}; 