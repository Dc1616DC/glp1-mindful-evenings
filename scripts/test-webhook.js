#!/usr/bin/env node

/**
 * Stripe Webhook Testing Utility
 * 
 * This script helps test your webhook locally by sending sample events
 * to your local development server.
 * 
 * Usage:
 * node scripts/test-webhook.js [event-type]
 * 
 * Examples:
 * node scripts/test-webhook.js checkout.session.completed
 * node scripts/test-webhook.js customer.subscription.updated
 */

const crypto = require('crypto');
const https = require('https');

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/stripe-webhook';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

// Sample event data
const sampleEvents = {
  'checkout.session.completed': {
    id: 'evt_test_webhook',
    object: 'event',
    created: Math.floor(Date.now() / 1000),
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_session',
        object: 'checkout.session',
        customer: 'cus_test_customer',
        subscription: 'sub_test_subscription',
        metadata: {
          firebaseUserId: 'test_user_123'
        }
      }
    }
  },
  
  'customer.subscription.updated': {
    id: 'evt_test_webhook',
    object: 'event',
    created: Math.floor(Date.now() / 1000),
    type: 'customer.subscription.updated',
    data: {
      object: {
        id: 'sub_test_subscription',
        object: 'subscription',
        customer: 'cus_test_customer',
        status: 'active'
      }
    }
  },
  
  'customer.subscription.deleted': {
    id: 'evt_test_webhook',
    object: 'event',
    created: Math.floor(Date.now() / 1000),
    type: 'customer.subscription.deleted',
    data: {
      object: {
        id: 'sub_test_subscription',
        object: 'subscription',
        customer: 'cus_test_customer',
        status: 'canceled'
      }
    }
  },
  
  'invoice.payment_succeeded': {
    id: 'evt_test_webhook',
    object: 'event',
    created: Math.floor(Date.now() / 1000),
    type: 'invoice.payment_succeeded',
    data: {
      object: {
        id: 'in_test_invoice',
        object: 'invoice',
        customer: 'cus_test_customer',
        subscription: 'sub_test_subscription'
      }
    }
  },
  
  'invoice.payment_failed': {
    id: 'evt_test_webhook',
    object: 'event',
    created: Math.floor(Date.now() / 1000),
    type: 'invoice.payment_failed',
    data: {
      object: {
        id: 'in_test_invoice',
        object: 'invoice',
        customer: 'cus_test_customer',
        subscription: 'sub_test_subscription'
      }
    }
  }
};

function createStripeSignature(payload, secret, timestamp) {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  
  return `t=${timestamp},v1=${computedSignature}`;
}

function sendWebhook(eventType) {
  const event = sampleEvents[eventType];
  if (!event) {
    console.error(`❌ Unknown event type: ${eventType}`);
    console.log('Available events:', Object.keys(sampleEvents).join(', '));
    process.exit(1);
  }

  const payload = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createStripeSignature(payload, WEBHOOK_SECRET, timestamp);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/stripe-webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'stripe-signature': signature
    }
  };

  console.log(`🚀 Sending ${eventType} webhook to ${WEBHOOK_URL}`);
  console.log(`📦 Payload:`, JSON.stringify(event, null, 2));
  console.log(`🔐 Signature: ${signature}`);

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📨 Response Status: ${res.statusCode}`);
      console.log(`📨 Response Body:`, data);
      
      if (res.statusCode === 200) {
        console.log('✅ Webhook sent successfully!');
      } else {
        console.log('❌ Webhook failed');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
    console.log('💡 Make sure your Next.js development server is running on port 3000');
  });

  req.write(payload);
  req.end();
}

// Main execution
const eventType = process.argv[2] || 'checkout.session.completed';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Stripe Webhook Testing Utility

Usage: node scripts/test-webhook.js [event-type]

Available event types:
${Object.keys(sampleEvents).map(type => `  - ${type}`).join('\n')}

Examples:
  node scripts/test-webhook.js checkout.session.completed
  node scripts/test-webhook.js customer.subscription.updated
  node scripts/test-webhook.js invoice.payment_failed

Environment Variables:
  STRIPE_WEBHOOK_SECRET - Your webhook signing secret (defaults to test secret)
`);
  process.exit(0);
}

sendWebhook(eventType);