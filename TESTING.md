# GLP-1 Mindful Evenings - Testing Guide

## End-to-End Testing Checklist

### Prerequisites for Testing
- [ ] Development server running (`npm run dev`)
- [ ] Firebase project configured with test data
- [ ] Stripe test mode configured
- [ ] Grok API key configured
- [ ] Environment variables properly set

### 1. User Authentication Flow

#### New User Registration
- [ ] Navigate to app homepage
- [ ] Click "Start Evening Check-in" without authentication
- [ ] Verify auth modal opens
- [ ] Test email/password registration
  - [ ] Enter valid email and password
  - [ ] Verify account creation success
  - [ ] Check Firebase Auth console for new user
- [ ] Test Google sign-in (if configured)
  - [ ] Click Google sign-in button
  - [ ] Complete OAuth flow
  - [ ] Verify successful authentication

#### Existing User Sign-in
- [ ] Use existing test account credentials
- [ ] Test email/password sign-in
- [ ] Test "Remember me" functionality
- [ ] Test sign-out functionality

### 2. Free User Experience

#### Session Limits
- [ ] Sign in as free user
- [ ] Complete 3 check-ins (weekly limit)
- [ ] Attempt 4th check-in
- [ ] Verify session limit modal appears
- [ ] Check remaining sessions display is accurate
- [ ] Test "View History" button shows correct count

#### Check-in Flow (Free User)
- [ ] Complete full check-in flow:
  1. [ ] Welcome screen
  2. [ ] Timing check (meal timing selection)
  3. [ ] Feelings check (multiple selections + custom)
  4. [ ] Hunger/fullness scale (1-10)
  5. [ ] Route selection (eat/activity/pause)
  6. [ ] Route-specific screens
  7. [ ] Reflection notes
  8. [ ] Basic insights (non-premium)

### 3. Premium User Experience

#### Subscription Upgrade
- [ ] From session limit modal, click "Upgrade to Premium"
- [ ] Verify Stripe Checkout opens
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment flow
- [ ] Verify redirect back to app with success message
- [ ] Check user profile shows premium status
- [ ] Verify unlimited sessions available

#### Premium Features
- [ ] Complete check-in as premium user
- [ ] Verify AI-powered activity suggestions appear during flow
- [ ] Test AI suggestion selection and tracking
- [ ] Complete full flow to premium insights
- [ ] Verify detailed AI insights appear at end
- [ ] Test pattern analysis (requires multiple check-ins)

### 4. Check-in Flow Variations

#### Route: Mindful Eating
- [ ] Select "I'm thinking about eating" route
- [ ] Navigate through eating prompts
- [ ] Complete mindful eating exercise
- [ ] Add reflection notes
- [ ] Complete flow

#### Route: Nurturing Activity
- [ ] Select "I want to do something nurturing" route
- [ ] Browse activity suggestions
- [ ] For premium: test AI-powered suggestions
- [ ] Select activity and use timer
- [ ] Complete with reflection

#### Route: Pause and Reflect
- [ ] Select "I want to pause and reflect" route
- [ ] Try breathing exercise
- [ ] Test journaling feature
- [ ] Complete reflection

### 5. Back Button Navigation
- [ ] Start check-in flow
- [ ] At each step, test back button functionality:
  - [ ] From timing-check → welcome
  - [ ] From feelings-check → timing-check
  - [ ] From hunger-fullness → feelings-check
  - [ ] From routing → hunger-fullness
  - [ ] From activity-selection → routing
  - [ ] From pause-options → routing
  - [ ] From eating-prompts → routing
  - [ ] From timer → activity-selection
  - [ ] From breathing-exercise → pause-options
  - [ ] From mindful-eating → eating-prompts
  - [ ] From reflection → (depends on route taken)
  - [ ] From insights → reflection

### 6. Data Persistence

#### Local Storage
- [ ] Complete check-in
- [ ] Refresh browser
- [ ] Verify history is maintained
- [ ] Test "Clear Data" functionality
- [ ] Verify data is actually cleared

#### Firebase Storage (Authenticated Users)
- [ ] Complete check-in as authenticated user
- [ ] Check Firebase Firestore console
- [ ] Verify user document created
- [ ] Verify check-in data saved in subcollection
- [ ] Verify session count incremented

### 7. Mobile Responsiveness
- [ ] Test on mobile device or browser dev tools
- [ ] Verify all screens are mobile-friendly
- [ ] Test touch interactions
- [ ] Verify modals work properly on mobile
- [ ] Test virtual keyboard interactions

### 8. Error Scenarios

#### Network Issues
- [ ] Disconnect internet during check-in
- [ ] Verify graceful error handling
- [ ] Reconnect and verify data recovery

#### API Failures
- [ ] Test with invalid Grok API key
- [ ] Verify fallback behavior for AI features
- [ ] Test Firebase connection issues
- [ ] Test Stripe payment failures

#### Invalid Data
- [ ] Test with empty form submissions
- [ ] Test with invalid email formats
- [ ] Test with extremely long text inputs
- [ ] Verify validation messages appear

### 9. Webhook Testing

#### Local Webhook Testing
```bash
# Start dev server
npm run dev

# In another terminal, test webhooks
npm run test:webhook checkout.session.completed
npm run test:webhook customer.subscription.updated
npm run test:webhook customer.subscription.deleted
npm run test:webhook invoice.payment_succeeded
npm run test:webhook invoice.payment_failed
```

#### Production Webhook Testing
- [ ] Deploy to production
- [ ] Configure Stripe webhook endpoint
- [ ] Test subscription creation
- [ ] Test subscription cancellation
- [ ] Test payment success/failure
- [ ] Verify user status updates correctly

### 10. Analytics and Monitoring

#### Analytics Events
- [ ] Verify analytics events fire (check console in dev mode)
- [ ] Test key events:
  - [ ] User sign up/sign in
  - [ ] Check-in started/completed
  - [ ] Upgrade clicked/completed
  - [ ] AI suggestions viewed/selected
  - [ ] Back button usage
  - [ ] Session limit reached

#### Error Monitoring
- [ ] Trigger intentional errors
- [ ] Verify error logging works
- [ ] Check Firebase error_logs collection
- [ ] Test error tracking in analytics

### 11. Performance Testing

#### Load Times
- [ ] Measure initial page load
- [ ] Test AI response times
- [ ] Verify image loading performance
- [ ] Test with slow network conditions

#### Memory Usage
- [ ] Monitor memory usage during extended use
- [ ] Test for memory leaks in timer components
- [ ] Verify proper cleanup on component unmount

### 12. Security Testing

#### Authentication
- [ ] Test access to protected routes without auth
- [ ] Verify JWT token expiration handling
- [ ] Test session persistence across browser restarts

#### Data Privacy
- [ ] Verify user data isolation in Firebase
- [ ] Test that users can only access their own data
- [ ] Verify sensitive data is not exposed in client-side code

### 13. Browser Compatibility
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)
- [ ] Test in mobile browsers

### 14. Accessibility Testing
- [ ] Test with screen reader
- [ ] Verify keyboard navigation works
- [ ] Check color contrast ratios
- [ ] Test with different zoom levels
- [ ] Verify alt text on images

## Test Data Setup

### Test User Accounts
Create these test accounts for thorough testing:

1. **Free User (Limit Reached)**
   - Email: test-free-limit@example.com
   - Has used 3 sessions this week

2. **Free User (Sessions Available)**
   - Email: test-free-active@example.com
   - Has 2 sessions remaining

3. **Premium User**
   - Email: test-premium@example.com
   - Active subscription

### Stripe Test Cards
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Insufficient funds**: 4000 0000 0000 9995
- **Expired**: 4000 0000 0000 0069

## Automation Scripts

### Health Check Script
```bash
# Run health checks
node scripts/health-check.js
```

### Data Reset Script
```bash
# Reset test data
node scripts/reset-test-data.js
```

## Bug Reporting Template

When bugs are found, use this template:

```
**Bug Title**: Brief description

**Environment**: 
- Browser: 
- Device: 
- User Type: (Free/Premium/Unauthenticated)

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**: 

**Actual Behavior**: 

**Screenshots/Console Errors**: 

**Additional Context**: 
```

## Production Readiness Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] No console errors in production build
- [ ] Environment variables configured
- [ ] Stripe webhooks set up
- [ ] Firebase security rules reviewed
- [ ] Analytics tracking verified
- [ ] Error monitoring active
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Accessibility audit passed