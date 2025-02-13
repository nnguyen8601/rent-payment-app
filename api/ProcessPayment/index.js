const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sql = require('mssql');

// SQL configuration
const config = {
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    options: {
        encrypt: true // For Azure SQL
    }
};

// Payment processing function that:
// 1. Validates payment request
// 2. Creates Stripe payment intent
// 3. Stores transaction in Azure SQL Database
// 4. Returns payment status to frontend
module.exports = async function (context, req) {
    try {
        // Validate request
        if (!req.body || !req.body.amount || 
            !req.body.renterName || !req.body.rentLocation) {
            context.res = {
                status: 400,
                body: { error: "Missing required payment information" }
            };
            return;
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(req.body.amount) * 100), // convert to cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                renterName: req.body.renterName,
                rentLocation: req.body.rentLocation,
                zipCode: req.body.zipCode || ''
            }
        });

        // Return the client secret
        context.res = {
            status: 200,
            body: {
                clientSecret: paymentIntent.client_secret
            }
        };

        // Store transaction intent in database
        await sql.connect(config);
        await sql.query`
            INSERT INTO RentPayments (
                TransactionId,
                RenterName,
                RentLocation,
                Amount,
                PaymentDate,
                Status,
                StripePaymentId,
                ZipCode
            )
            VALUES (
                ${paymentIntent.id},
                ${req.body.renterName},
                ${req.body.rentLocation},
                ${parseFloat(req.body.amount)},
                ${new Date()},
                'pending',
                ${paymentIntent.id},
                ${req.body.zipCode || ''}
            )
        `;

    } catch (error) {
        context.log.error('Payment error:', error);
        context.res = {
            status: 500,
            body: {
                error: error.message
            }
        };
    } finally {
        if (sql.connected) {
            await sql.close();
        }
    }
}; 