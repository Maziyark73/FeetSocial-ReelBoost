require('dotenv').config();
const Stripe = require('stripe');

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Create payment intent for tips/gifts
async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Create checkout session for one-time payments
async function createCheckoutSession(amount, currency = 'usd', metadata = {}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: metadata.product_name || 'Payment',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata,
      success_url: `${process.env.baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.baseUrl}/payment/cancel`,
    });
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Verify webhook signature
function verifyWebhookSignature(payload, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET in environment variables');
  }
  
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
}

// Handle webhook events
async function handleWebhookEvent(event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      // TODO: Update user balance or process gift/tip
      console.log('Payment succeeded:', event.data.object.id);
      break;
    case 'payment_intent.payment_failed':
      // TODO: Handle failed payment
      console.log('Payment failed:', event.data.object.id);
      break;
    case 'checkout.session.completed':
      // TODO: Process completed checkout session
      console.log('Checkout completed:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

module.exports = {
  stripe,
  createPaymentIntent,
  createCheckoutSession,
  verifyWebhookSignature,
  handleWebhookEvent,
};
