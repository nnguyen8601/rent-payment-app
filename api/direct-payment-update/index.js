const sql = require('mssql');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
        const { paymentIntentId, email } = req.body;

        if (!paymentIntentId || !email) {
            context.res = {
                status: 400,
                body: { error: 'Payment intent ID and email are required' }
            };
            return;
        }

        context.log.info(`Manual payment update request: ${JSON.stringify(req.body)}`);
        
        // Get payment intent details from Stripe
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (!paymentIntent) {
            throw new Error('Payment intent not found in Stripe');
        }
        
        context.log.info(`Retrieved payment intent: ${paymentIntent.id}, status: ${paymentIntent.status}`);
        
        connection = await sql.connect(config);
        
        // Check if payment record already exists
        const existingPayment = await sql.query`
            SELECT COUNT(*) as count FROM RentPayments
            WHERE StripePaymentId = ${paymentIntentId}
        `;
        
        // Get tenant ID
        const tenantResult = await sql.query`
            SELECT TenantId FROM Tenants WHERE Email = ${email}
        `;
        
        if (tenantResult.recordset.length === 0) {
            throw new Error(`No tenant found for email: ${email}`);
        }
        
        const tenantId = tenantResult.recordset[0].TenantId;
        context.log.info(`Found tenant ID: ${tenantId} for email: ${email}`);
        
        // If payment doesn't exist, create it
        if (existingPayment.recordset[0].count === 0) {
            context.log.info('Creating new payment record');
            
            await sql.query`
                INSERT INTO RentPayments (
                    TenantId,
                    Amount,
                    PaymentDate,
                    StripePaymentId,
                    Status
                )
                VALUES (
                    ${tenantId},
                    ${paymentIntent.amount / 100},
                    GETDATE(),
                    ${paymentIntent.id},
                    ${paymentIntent.status}
                )
            `;
        } else {
            context.log.info('Updating existing payment record');
            
            // Update existing payment
            await sql.query`
                UPDATE RentPayments
                SET Status = ${paymentIntent.status}
                WHERE StripePaymentId = ${paymentIntentId}
            `;
        }
        
        // Add to payment history if successful payment
        if (paymentIntent.status === 'succeeded') {
            // Check if already in payment history
            const existingHistory = await sql.query`
                SELECT COUNT(*) as count FROM PaymentHistory
                WHERE TransactionId = ${paymentIntentId}
            `;
            
            if (existingHistory.recordset[0].count === 0) {
                context.log.info('Adding to payment history');
                
                await sql.query`
                    INSERT INTO PaymentHistory (
                        TenantId,
                        Amount,
                        PaymentDate,
                        PaymentMethod,
                        TransactionId,
                        Status,
                        RentPeriod
                    )
                    VALUES (
                        ${tenantId},
                        ${paymentIntent.amount / 100},
                        GETDATE(),
                        'Credit Card',
                        ${paymentIntent.id},
                        'Succeeded',
                        DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                    )
                `;
            }
        }
        
        context.res = {
            status: 200,
            body: { 
                message: 'Payment records updated successfully',
                status: paymentIntent.status
            }
        };
    } catch (error) {
        context.log.error('Error in direct payment update:', error);
        context.res = {
            status: 500,
            body: { error: 'Failed to update payment records', details: error.message }
        };
    } finally {
        if (connection) {
            await sql.close();
        }
    }
}; 