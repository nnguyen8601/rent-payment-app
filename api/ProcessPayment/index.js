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
    let connection;
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

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(req.body.amount) * 100),
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

        // Connect to database
        connection = await sql.connect(config);

        // Store initial transaction record
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
                ${paymentIntent.status},
                ${paymentIntent.id},
                ${req.body.zipCode || ''}
            )
        `;

        // Return the client secret
        context.res = {
            status: 200,
            body: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            }
        };

    } catch (error) {
        context.log.error('Payment error:', error);
        context.res = {
            status: 500,
            body: {
                error: error.message
            }
        };
    } finally {
        if (connection) {
            await sql.close();
        }
    }
}; 