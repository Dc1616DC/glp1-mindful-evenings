import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Dynamically import Stripe to avoid build-time initialization
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });

    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing customer ID' },
        { status: 400 }
      );
    }

    // Create portal session for customer to manage their subscription
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://evening-toolkit-standalone.vercel.app/',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}