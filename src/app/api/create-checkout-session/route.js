import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Verify Stripe key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Dynamically import Stripe to avoid build-time initialization
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      maxNetworkRetries: 0, // Disable retries to get faster error responses
      timeout: 20000, // 20 second timeout
    });

    const { userId, userEmail, priceId } = await req.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const cleanPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID?.trim();
    
    console.log('Creating checkout session for:', { userId, userEmail, cleanPriceId });
    console.log('Environment variables:', {
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      hasPriceId: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      rawPriceId: JSON.stringify(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID),
      cleanPriceId: JSON.stringify(cleanPriceId)
    });

    if (!cleanPriceId) {
      return NextResponse.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      );
    }

    // Create or retrieve customer
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUserId: userId,
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: cleanPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://evening-toolkit-standalone.vercel.app/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://evening-toolkit-standalone.vercel.app/?canceled=true`,
      metadata: {
        firebaseUserId: userId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw
    });
    
    // Handle specific Stripe errors
    if (error.type === 'StripeConnectionError') {
      return NextResponse.json(
        { error: 'Unable to connect to payment processor. Please try again.' },
        { status: 503 }
      );
    }
    
    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'Payment configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}