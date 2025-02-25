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
                body: { error: 'Payment intent ID and status are required' }
            };
            return;
        }

        context.log.info(`Updating payment status for: ${paymentIntentId} to ${status}`);
        
        connection = await sql.connect(config);
        
        // Update RentPayments status
        await sql.query`
            UPDATE RentPayments
            SET Status = ${status}
            WHERE StripePaymentId = ${paymentIntentId}
        `;
        
        // If payment succeeded, add to PaymentHistory
        if (status === 'succeeded') {
            const paymentResult = await sql.query`
                SELECT 
                    TenantId, 
                    Amount,
                    PaymentDate 
                FROM RentPayments 
                WHERE StripePaymentId = ${paymentIntentId}
            `;
            
            if (paymentResult.recordset.length > 0) {
                const payment = paymentResult.recordset[0];
                
                // Add to payment history
                await sql.query`
                    INSERT INTO PaymentHistory (
                        TenantId,
                        Amount,
                        PaymentDate,
                        PaymentMethod,
                        TransactionId,
                        Status,
                        RentPeriod
                    ) VALUES (
                        ${payment.TenantId},
                        ${payment.Amount},
                        ${payment.PaymentDate},
                        'Credit Card',
                        ${paymentIntentId},
                        'Succeeded',
                        DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                    )
                `;
            }
        }
        
        context.res = {
            status: 200,
            body: { message: 'Payment status updated successfully' }
        };
    } catch (error) {
        context.log.error('Error updating payment status:', error);
        context.res = {
            status: 500,
            body: { error: 'Failed to update payment status', details: error.message }
        };
    } finally {
        if (connection) {
            await sql.close();
        }
    }
}; 