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
        if (req.method !== 'POST') {
            context.res = {
                status: 405,
                body: { error: 'Method not allowed' }
            };
            return;
        }

        // Log environment vars (without exposing secrets)
        context.log.info('Environment check:', {
            hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
            stripePrefixLength: process.env.STRIPE_SECRET_KEY?.substring(0, 3)
        });

        const { amount, renterName, rentLocation } = req.body;

        if (!amount) {
            context.res = {
                status: 400,
                body: { error: 'Amount is required' }
            };
            return;
        }

        // Get user from auth token
        const authData = req.headers['x-ms-client-principal'];
        if (!authData) {
            context.res = {
                status: 401,
                body: { error: 'Authentication required' }
            };
            return;
        }

        const buff = Buffer.from(authData, 'base64');
        const clientPrincipal = JSON.parse(buff.toString('ascii'));

        // Check multiple possible claim types for email
        const emailClaim = clientPrincipal.claims?.find(
            claim => claim.typ === 'emails'
        );

        const userEmail = emailClaim ? emailClaim.val : clientPrincipal.userDetails;
        context.log.info('User authenticated:', userEmail);

        // Create a PaymentIntent with the amount
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(amount) * 100), // Convert to cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                renterName,
                rentLocation
            }
        });

        // Store payment intent in database
        if (userEmail) {
            connection = await sql.connect(config);
            
            // Get tenant ID
            const tenantResult = await sql.query`
                SELECT TenantId FROM Tenants WHERE Email = ${userEmail}
            `;

            if (tenantResult.recordset.length > 0) {
                const tenantId = tenantResult.recordset[0].TenantId;
                context.log.info(`Found tenant ID: ${tenantId} for email: ${userEmail}`);
                
                // Insert payment record
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
                            ${tenantId},
                            ${parseFloat(amount)},
                            GETDATE(),
                            ${paymentIntent.id},
                            'pending'
                        )
                    `;
                    
                    context.log.info(`Payment record created: ${JSON.stringify(insertResult.recordset[0])}`);
                } catch (insertError) {
                    context.log.error('Error inserting payment record:', insertError);
                    // Continue processing, don't throw error
                }
            } else {
                context.log.warn(`No tenant found for email: ${userEmail}`);
            }
        }

        context.res = {
            status: 200,
            body: {
                clientSecret: paymentIntent.client_secret
            }
        };
    } catch (error) {
        context.log.error('Payment processing error:', error);
        context.res = {
            status: 500,
            body: { error: 'Failed to process payment: ' + error.message }
        };
    } finally {
        if (connection) {
            await sql.close();
        }
    }
}; 