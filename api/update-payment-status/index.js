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
        
        // Add validation for required fields
        if (!paymentIntentId || !status || !tenantId || !amount) {
            context.res = {
                status: 400,
                body: { 
                    error: 'Missing required fields',
                    details: {
                        paymentIntentId: !paymentIntentId ? 'missing' : 'present',
                        status: !status ? 'missing' : 'present',
                        tenantId: !tenantId ? 'missing' : 'present',
                        amount: !amount ? 'missing' : 'present'
                    }
                }
            };
            return;
        }

        context.log.info(`Payment update request received: ${JSON.stringify({
            paymentIntentId,
            status,
            amount,
            tenantId
        })}`);
        
        connection = await sql.connect(config);
        
        // First check if payment already exists for this month
        const currentMonth = await sql.query`
            SELECT COUNT(*) as count 
            FROM RentPayments 
            WHERE TenantId = ${tenantId}
            AND MONTH(PaymentDate) = MONTH(GETDATE())
            AND YEAR(PaymentDate) = YEAR(GETDATE())
            AND Status = 'succeeded'
        `;

        if (currentMonth.recordset[0].count > 0) {
            context.res = {
                status: 400,
                body: { error: 'Payment already exists for current month' }
            };
            return;
        }
        
        // First check if the record exists
        const existingRecord = await sql.query`
            SELECT COUNT(*) as count 
            FROM RentPayments 
            WHERE StripePaymentId = ${paymentIntentId}
        `;

        if (existingRecord.recordset[0].count === 0) {
            // No existing record, perform INSERT
            context.log.info(`Creating new payment record - TenantId: ${tenantId}, Amount: ${amount}`);
            const insertResult = await sql.query`
                INSERT INTO RentPayments (
                    TenantId,
                    Amount,
                    PaymentDate,
                    Status,
                    StripePaymentId
                )
                OUTPUT INSERTED.*
                VALUES (
                    ${tenantId},
                    ${amount},
                    GETDATE(),
                    ${status},
                    ${paymentIntentId}
                )
            `;
            context.log.info(`Inserted payment record: ${JSON.stringify(insertResult.recordset[0])}`);
        } else {
            // Record exists, perform UPDATE
            context.log.info(`Updating existing record for ${paymentIntentId} - TenantId: ${tenantId}`);
            await sql.query`
                UPDATE RentPayments
                SET Status = ${status},
                    TenantId = ${tenantId}
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
                context.log.info(`Found payment record for history: ${JSON.stringify(payment)}`);
                
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
                            ${tenantId},
                            ${amount},
                            GETDATE(),
                            'Credit Card',
                            ${paymentIntentId},
                            'Succeeded',
                            DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                        )
                    `;
                    context.log.info(`Payment history created: ${JSON.stringify(historyResult.recordset[0])}`);
                } catch (historyError) {
                    context.log.error(`Error creating payment history for TenantId ${tenantId}:`, historyError);
                    throw historyError;
                }
            }
        }
        
        context.res = {
            status: 200,
            body: { 
                message: 'Payment status updated successfully',
                tenantId: tenantId,
                paymentDate: new Date().toISOString()
            }
        };
    } catch (error) {
        context.log.error(`Error updating payment status for TenantId ${req.body?.tenantId}:`, error);
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
