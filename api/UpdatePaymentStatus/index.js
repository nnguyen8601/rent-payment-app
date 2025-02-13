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
        await sql.query`
            UPDATE RentPayments
            SET Status = ${status}
            WHERE StripePaymentId = ${paymentIntentId}
        `;

        context.res = {
            status: 200,
            body: { success: true }
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