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

        // Get user from auth token
        const authData = req.headers['x-ms-client-principal'];
        let userEmail = '';
        
        if (authData) {
            const buff = Buffer.from(authData, 'base64');
            const clientPrincipal = JSON.parse(buff.toString('ascii'));
            
            // Try to get email from claims
            const emailClaim = clientPrincipal.claims?.find(
                claim => claim.typ === 'emails' || claim.typ === 'email'
            );
            
            userEmail = emailClaim ? emailClaim.val : clientPrincipal.userDetails;
            context.log.info('Using email:', userEmail);
        }

        // Store payment intent in database
        if (userEmail) {
            connection = await sql.connect(config);
            
            // Get tenant ID
            const tenantResult = await sql.query`
                SELECT TenantId FROM Tenants WHERE Email = ${userEmail}
            `;

            if (tenantResult.recordset.length > 0) {
                const tenantId = tenantResult.recordset[0].TenantId;
                
                // Insert payment record
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
                        ${parseFloat(amount)},
                        GETDATE(),
                        ${paymentIntent.id},
                        'pending'
                    )
                `;
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