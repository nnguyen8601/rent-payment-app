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
        // Verify authentication
        const authData = req.headers['x-ms-client-principal'];
        if (!authData) {
            context.res = {
                status: 401,
                body: { error: 'Authentication required' }
            };
            return;
        }

        const { paymentIntentId, status, amount, tenantId } = req.body;

        if (!paymentIntentId || !status) {
            context.res = {
                status: 400,
                body: { error: 'Payment intent ID and status are required' }
            };
            return;
        }

        context.log.info(`Payment update request received: ${JSON.stringify(req.body)}`);
        context.log.info(`Processing payment status for: ${paymentIntentId} to ${status}`);
        
        connection = await sql.connect(config);
        
        // First check if the record exists
        const existingRecord = await sql.query`
            SELECT COUNT(*) as count 
            FROM RentPayments 
            WHERE StripePaymentId = ${paymentIntentId}
        `;

        if (existingRecord.recordset[0].count === 0) {
            // No existing record, perform INSERT
            context.log.info(`No existing record found for ${paymentIntentId}, creating new record`);
            await sql.query`
                INSERT INTO RentPayments (
                    TenantId,
                    Amount,
                    PaymentDate,
                    Status,
                    StripePaymentId
                )
                VALUES (
                    ${tenantId},
                    ${amount},
                    GETDATE(),
                    ${status},
                    ${paymentIntentId}
                )
            `;
        } else {
            // Record exists, perform UPDATE
            context.log.info(`Updating existing record for ${paymentIntentId}`);
            await sql.query`
                UPDATE RentPayments
                SET Status = ${status}
                WHERE StripePaymentId = ${paymentIntentId}
            `;
        }
        
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
                context.log.info(`Found payment record: ${JSON.stringify(payment)}`);
                
                // Add to payment history with try/catch
                try {
                    const historyResult = await sql.query`
                        INSERT INTO PaymentHistory (
                            TenantId,
                            Amount,
                            PaymentDate,
                            PaymentMethod,
                            TransactionId,
                            Status,
                            RentPeriod
                        ) 
                        OUTPUT INSERTED.*
                        VALUES (
                            ${payment.TenantId},
                            ${payment.Amount},
                            ${payment.PaymentDate},
                            'Credit Card',
                            ${paymentIntentId},
                            'Succeeded',
                            DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                        )
                    `;
                    context.log.info(`Payment history created: ${JSON.stringify(historyResult.recordset[0])}`);
                } catch (historyError) {
                    context.log.error('Error creating payment history:', historyError);
                    throw historyError; // Re-throw to ensure transaction fails
                }
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
