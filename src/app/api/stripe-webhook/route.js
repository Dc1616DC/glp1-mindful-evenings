import { NextResponse } from 'next/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    // Dynamically import dependencies to avoid build-time initialization
    const Stripe = (await import('stripe')).default;
    const { updateSubscription, findUserByCustomerId } = await import('../../../../lib/userService');
    const { errorLogger } = await import('../../../../lib/monitoring');
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing stripe signature or webhook secret' },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      errorLogger.webhook(err, 'stripe', { 
        operation: 'signature_verification',
        hasSignature: !!signature,
        hasSecret: !!webhookSecret
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`Processing webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.firebaseUserId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!userId) {
          console.error('No firebaseUserId in session metadata');
          break;
        }

        // Update user's subscription status in Firebase
        await updateSubscription(userId, {
          status: 'active',
          tier: 'premium',
          customerId: customerId,
          subscriptionId: subscriptionId,
          updatedAt: new Date().toISOString(),
        });

        console.log(`✅ Subscription activated for user ${userId}`);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        const userId = await findUserByCustomerId(customerId);
        if (userId) {
          await updateSubscription(userId, {
            status: subscription.status,
            tier: subscription.status === 'active' ? 'premium' : 'free',
            subscriptionId: subscription.id,
            updatedAt: new Date().toISOString(),
          });
          console.log(`✅ Subscription created for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        const userId = await findUserByCustomerId(customerId);
        if (userId) {
          const tier = ['active', 'trialing'].includes(subscription.status) ? 'premium' : 'free';
          await updateSubscription(userId, {
            status: subscription.status,
            tier: tier,
            subscriptionId: subscription.id,
            updatedAt: new Date().toISOString(),
          });
          console.log(`✅ Subscription updated for user ${userId}: ${subscription.status}`);
        } else {
          console.error(`❌ User not found for customer ${customerId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        const userId = await findUserByCustomerId(customerId);
        if (userId) {
          await updateSubscription(userId, {
            status: 'cancelled',
            tier: 'free',
            subscriptionId: null,
            updatedAt: new Date().toISOString(),
          });
          console.log(`✅ Subscription cancelled for user ${userId}`);
        } else {
          console.error(`❌ User not found for customer ${customerId}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          const userId = await findUserByCustomerId(customerId);
          if (userId) {
            await updateSubscription(userId, {
              status: 'active',
              tier: 'premium',
              lastPaymentAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            console.log(`✅ Payment succeeded for user ${userId}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          const userId = await findUserByCustomerId(customerId);
          if (userId) {
            await updateSubscription(userId, {
              status: 'past_due',
              tier: 'free', // Revoke premium access on failed payment
              updatedAt: new Date().toISOString(),
            });
            console.log(`❌ Payment failed for user ${userId}`);
          }
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    errorLogger.webhook(error, 'stripe', {
      operation: 'webhook_processing',
      eventType: event?.type || 'unknown'
    });
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}