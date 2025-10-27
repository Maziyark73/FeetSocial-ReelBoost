import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Load Stripe.js
let stripePromise: Promise<Stripe | null>;

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey);
}

/**
 * Get Stripe instance
 */
export const getStripe = () => {
  return stripePromise;
};

/**
 * Create payment intent via backend API
 * @param amount - Amount in dollars
 * @param currency - Currency code (default: usd)
 * @param metadata - Additional metadata
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
) => {
  try {
    const response = await fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Create checkout session via backend API
 * @param amount - Amount in dollars
 * @param currency - Currency code (default: usd)
 * @param metadata - Additional metadata
 */
export const createCheckoutSession = async (
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
) => {
  try {
    const response = await fetch('/api/payments/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export default getStripe;

// TODO: Implement tip/gift payment flow in the UI
// TODO: Add payment success/error handling
// TODO: Integrate with user balance system
