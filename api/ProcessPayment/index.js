const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
    try {
        // Validate request
        if (!req.body || !req.body.paymentMethodId || !req.body.amount || 
            !req.body.renterName || !req.body.rentLocation) {
            context.res = {
                status: 400,
                body: "Missing required payment information"
            };
            return;
        }

        // Create a payment intent with the payment method
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(req.body.amount) * 100), // Convert to cents
            currency: 'usd',
            payment_method: req.body.paymentMethodId,
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