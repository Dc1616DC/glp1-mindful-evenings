# GLP-1 Mindful Evenings - Production Deployment Guide

## Prerequisites
- GitHub repository with latest code
- Vercel account (recommended) or Netlify account
- Production Firebase project
- Live Stripe account with products configured
- Grok API key

## Step 1: Prepare Production Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project for production (or use existing)
3. Enable Authentication with Email/Password and Google
4. Enable Firestore Database
5. Copy production config values

## Step 2: Set up Live Stripe Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Switch to "Live" mode (top-left toggle)
3. Create your premium subscription product:
   - Product name: "GLP-1 Mindful Evenings Premium"
   - Price: $2.99/month recurring
   - Copy the live price ID (starts with `price_`)

## Step 3: Deploy to Vercel (Recommended)

### Option A: Deploy via GitHub Integration
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Framework will auto-detect as Next.js
5. Add environment variables (see below)
6. Deploy!

### Option B: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Step 4: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### Firebase (Production)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Stripe (Live)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_... (set after webhook setup)
```

### AI Integration
```
GROK_API_KEY=your_grok_api_key
```

## Step 5: Set up Stripe Webhooks

1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/stripe-webhook`
4. Events to send:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 6: Configure Domain Settings

### Stripe
- Add your production domain to Stripe's allowed redirect URLs
- Update success/cancel URLs in checkout sessions

### Firebase
- Add your production domain to Firebase Auth authorized domains
- Configure OAuth redirect URLs for Google sign-in

## Step 7: Test Production Deployment

1. Visit your deployed app
2. Test user registration/login
3. Test free user flow (3 sessions limit)
4. Test premium upgrade flow
5. Test AI insights functionality
6. Verify webhook handling

## Post-Deployment Checklist

- [ ] SSL certificate active (Vercel handles automatically)
- [ ] Custom domain configured (optional)
- [ ] Firebase security rules reviewed
- [ ] Stripe webhooks receiving events
- [ ] Error monitoring set up
- [ ] Analytics tracking active
- [ ] Backup strategy in place

## Monitoring & Maintenance

- Monitor Vercel function logs
- Check Stripe webhook delivery logs
- Monitor Firebase usage and costs
- Track user engagement analytics
- Regular security updates

## Support

For deployment issues:
- Vercel: [Vercel Support](https://vercel.com/support)
- Firebase: [Firebase Support](https://firebase.google.com/support)
- Stripe: [Stripe Support](https://support.stripe.com/)