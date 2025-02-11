const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
    try {
        // Validate request
        if (!req.body || !req.body.cardNumber || !req.body.expirationDate || 
            !req.body.cvc || !req.body.amount || !req.body.renterName) {
            context.res = {
                status: 400,
                body: "Missing required payment information"
            };
            return;
        }

        // Create a payment method using card details
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: req.body.cardNumber,
                exp_month: parseInt(req.body.expirationDate.split('/')[0]),
                exp_year: parseInt('20' + req.body.expirationDate.split('/')[1]),
                cvc: req.body.cvc,
            },
        });

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(req.body.amount) * 100), // Convert to cents
            currency: 'usd',
            payment_method: paymentMethod.id,
            confirmation_method: 'manual',
            confirm: true,
            description: `Rent payment for ${req.body.renterName} - ${req.body.rentLocation}`,
        });

        context.res = {
            status: 200,
            body: {
                success: true,
                paymentIntent: paymentIntent
            }
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: {
                success: false,
                error: error.message
            }
        };
    }
}; 