import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variable exists
    const hasKey = !!process.env.STRIPE_SECRET_KEY;
    const keyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 7);
    
    if (!hasKey) {
      return NextResponse.json({ 
        status: 'error',
        message: 'STRIPE_SECRET_KEY not found in environment'
      });
    }

    // Try to initialize Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      maxNetworkRetries: 0,
      timeout: 10000,
    });

    // Try a simple API call
    const balance = await stripe.balance.retrieve();
    
    return NextResponse.json({ 
      status: 'success',
      keyPrefix,
      balance: {
        available: balance.available.map(b => ({
          amount: b.amount,
          currency: b.currency
        })),
        pending: balance.pending.map(b => ({
          amount: b.amount,
          currency: b.currency
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: error.message,
      type: error.type,
      code: error.code,
    });
  }
}