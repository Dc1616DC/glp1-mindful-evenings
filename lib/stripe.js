import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe.js with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export const getStripe = () => stripePromise;

// Create checkout session
export const createCheckoutSession = async (userId, userEmail) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userEmail,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      }),
    });

    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create customer portal session for managing subscriptions
export const createPortalSession = async (customerId) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });

    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }

    return session;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};