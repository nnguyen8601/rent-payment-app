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
        context.log.info(`Starting direct payment update with request: ${JSON.stringify(req.body)}`);
        
        // Verify configuration
        context.log.info('Configuration check:', {
            hasServer: !!process.env.SQL_SERVER,
            hasDatabase: !!process.env.SQL_DATABASE,
            hasUser: !!process.env.SQL_USER,
            hasPassword: !!process.env.SQL_PASSWORD,
            hasStripeKey: !!process.env.STRIPE_SECRET_KEY
        });
        
        const { paymentIntentId, email } = req.body;

        if (!paymentIntentId || !email) {
            context.res = {
                status: 400,
                body: { error: 'Payment intent ID and email are required' }
            };
            return;
        }

        // Get payment intent details from Stripe
        let paymentIntent;
        try {
            paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            context.log.info(`Retrieved payment intent from Stripe: ${paymentIntent.id}, status: ${paymentIntent.status}`);
        } catch (stripeError) {
            context.log.error('Stripe error:', stripeError);
            throw new Error(`Failed to retrieve payment intent: ${stripeError.message}`);
        }
        
        // Connect to database - with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                context.log.info(`Connecting to database (attempt ${retryCount + 1})`);
                connection = await sql.connect(config);
                context.log.info('Successfully connected to database');
                break;
            } catch (connectError) {
                retryCount++;
                context.log.error(`Database connection error (attempt ${retryCount}):`, connectError);
                if (retryCount >= maxRetries) {
                    throw connectError;
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // First verify the tenant exists and get their ID
        context.log.info(`Looking up tenant with email: ${email}`);
        const tenantResult = await sql.query`
            SELECT TenantId, FirstName, LastName, Email 
            FROM Tenants 
            WHERE Email = ${email}
        `;
        
        if (tenantResult.recordset.length === 0) {
            context.log.error(`No tenant found with email: ${email}`);
            throw new Error(`No tenant found with email: ${email}`);
        }
        
        const tenant = tenantResult.recordset[0];
        context.log.info(`Found tenant: ID=${tenant.TenantId}, Name=${tenant.FirstName} ${tenant.LastName}`);
        
        // Now check for the payment record
        const existingPayment = await sql.query`
            SELECT PaymentId, Status 
            FROM RentPayments 
            WHERE StripePaymentId = ${paymentIntentId}
        `;
        
        const paymentExists = existingPayment.recordset.length > 0;
        context.log.info(`Payment record exists: ${paymentExists}`);
        
        if (!paymentExists) {
            // Insert new payment record
            context.log.info('Creating new payment record');
            try {
                const insertResult = await sql.query`
                    INSERT INTO RentPayments (
                        TenantId,
                        Amount,
                        PaymentDate,
                        StripePaymentId,
                        Status
                    )
                    OUTPUT INSERTED.*
                    VALUES (
                        ${tenant.TenantId},
                        ${paymentIntent.amount / 100},
                        GETDATE(),
                        ${paymentIntent.id},
                        ${paymentIntent.status}
                    )
                `;
                
                context.log.info(`Payment record created: ID=${insertResult.recordset[0].PaymentId}`);
            } catch (insertError) {
                context.log.error('Error creating payment record:', insertError);
                throw new Error(`Failed to create payment record: ${insertError.message}`);
            }
        } else {
            // Update existing payment record
            context.log.info(`Updating existing payment record: ID=${existingPayment.recordset[0].PaymentId}`);
            try {
                await sql.query`
                    UPDATE RentPayments
                    SET Status = ${paymentIntent.status}
                    WHERE StripePaymentId = ${paymentIntentId}
                `;
                context.log.info('Payment record updated successfully');
            } catch (updateError) {
                context.log.error('Error updating payment record:', updateError);
                throw new Error(`Failed to update payment record: ${updateError.message}`);
            }
        }
        
        // Process payment history for successful payments
        if (paymentIntent.status === 'succeeded') {
            context.log.info('Payment succeeded, checking payment history');
            
            // Check if payment is already in history
            const historyResult = await sql.query`
                SELECT HistoryId 
                FROM PaymentHistory 
                WHERE TransactionId = ${paymentIntentId}
            `;
            
            const historyExists = historyResult.recordset.length > 0;
            context.log.info(`Payment history record exists: ${historyExists}`);
            
            if (!historyExists) {
                // Add to payment history
                try {
                    context.log.info('Creating payment history record');
                    const historyInsert = await sql.query`
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
                            ${tenant.TenantId},
                            ${paymentIntent.amount / 100},
                            GETDATE(),
                            'Credit Card',
                            ${paymentIntent.id},
                            'Succeeded',
                            DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                        )
                    `;
                    
                    context.log.info(`Payment history record created: ID=${historyInsert.recordset[0].HistoryId}`);
                } catch (historyError) {
                    context.log.error('Error creating payment history:', historyError);
                    throw new Error(`Failed to create payment history: ${historyError.message}`);
                }
            }
        }
        
        // Final success
        context.res = {
            status: 200,
            body: { 
                message: 'Payment records updated successfully',
                status: paymentIntent.status,
                tenant: {
                    id: tenant.TenantId,
                    name: `${tenant.FirstName} ${tenant.LastName}`,
                    email: tenant.Email
                }
            }
        };
    } catch (error) {
        context.log.error('Error in direct payment update:', error);
        context.res = {
            status: 500,
            body: { 
                error: 'Failed to update payment records', 
                details: error.message,
                stack: error.stack
            }
        };
    } finally {
        if (connection) {
            try {
                await sql.close();
                context.log.info('Database connection closed');
            } catch (closeError) {
                context.log.error('Error closing database connection:', closeError);
            }
        }
    }
}; 