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

module.exports = async function (context, req) {
    try {
        // Validate request
        if (!req.body || !req.body.paymentMethodId || !req.body.amount || 
            !req.body.renterName || !req.body.rentLocation || !req.body.userId) {
            context.res = {
                status: 400,
                body: { error: "Missing required payment information" }
            };
            return;
        }

        // Connect to database
        await sql.connect(config);

        // Verify user exists
        const userResult = await sql.query`
            SELECT UserId FROM Users 
            WHERE UserId = ${req.body.userId}
        `;

        if (userResult.recordset.length === 0) {
            context.res = {
                status: 401,
                body: { error: "Invalid user" }
            };
            return;
        }

        // Process payment with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(req.body.amount) * 100),
            currency: 'usd',
            payment_method: req.body.paymentMethodId,
            confirmation_method: 'manual',
            confirm: true,
            description: `Rent payment for ${req.body.renterName} - ${req.body.rentLocation}`,
        });

        // If payment successful, store transaction
        if (paymentIntent.status === 'succeeded') {
            const transaction = {
                transactionId: paymentIntent.id,
                userId: req.body.userId,
                renterName: req.body.renterName,
                rentLocation: req.body.rentLocation,
                amount: parseFloat(req.body.amount),
                paymentDate: new Date(),
                status: paymentIntent.status,
                stripePaymentId: paymentIntent.id,
                zipCode: req.body.zipCode
            };

            await sql.query`
                INSERT INTO RentPayments (
                    TransactionId,
                    UserId,
                    RenterName,
                    RentLocation,
                    Amount,
                    PaymentDate,
                    Status,
                    StripePaymentId,
                    ZipCode
                )
                VALUES (
                    ${transaction.transactionId},
                    ${transaction.userId},
                    ${transaction.renterName},
                    ${transaction.rentLocation},
                    ${transaction.amount},
                    ${transaction.paymentDate},
                    ${transaction.status},
                    ${transaction.stripePaymentId},
                    ${transaction.zipCode}
                )
            `;

            context.res = {
                status: 200,
                body: {
                    success: true,
                    paymentIntent: paymentIntent,
                    transactionId: transaction.transactionId
                }
            };
        }
    } catch (error) {
        context.log.error('Payment error:', error);
        context.res = {
            status: 500,
            body: {
                success: false,
                error: error.message
            }
        };
    } finally {
        // Close SQL connection
        if (sql.connected) {
            await sql.close();
        }
    }
}; 