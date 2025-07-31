#!/usr/bin/env node

/**
 * Health Check Script
 * 
 * Tests key application services and reports their status.
 * Run this before deployment or after changes to verify everything works.
 */

const https = require('https');
const http = require('http');

// Configuration  
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(TIMEOUT, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function checkEndpoint(name, path, method = 'GET', body = null, expectedStatus = 200) {
  try {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      protocol: url.protocol,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Health-Check-Script/1.0'
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const startTime = Date.now();
    const response = await makeRequest({ ...options, body });
    const duration = Date.now() - startTime;

    const isHealthy = response.statusCode === expectedStatus;
    const status = isHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY';
    const statusColor = isHealthy ? colors.green : colors.red;

    log(`${status} ${name} (${duration}ms) - Status: ${response.statusCode}`, statusColor);
    
    return { 
      name, 
      healthy: isHealthy, 
      duration, 
      statusCode: response.statusCode,
      response: response.data 
    };
  } catch (error) {
    log(`❌ FAILED ${name} - ${error.message}`, colors.red);
    return { 
      name, 
      healthy: false, 
      error: error.message 
    };
  }
}

async function runHealthChecks() {
  log(`${colors.bold}🏥 Running Health Checks for GLP-1 Mindful Evenings${colors.reset}`);
  log(`Target: ${BASE_URL}`);
  log('─'.repeat(60));

  const results = [];

  // 1. Homepage
  results.push(await checkEndpoint('Homepage', '/'));

  // 2. API Health Check Endpoints
  results.push(await checkEndpoint('AI Insights API', '/api/ai-insights', 'POST', JSON.stringify({
    checkInData: {
      feelings: ['test'],
      emotionalIntensity: 5,
      hungerFullnessLevel: 5
    },
    userHistory: [],
    type: 'insights'
  }), 500)); // We expect this to fail without proper auth, but should return 500 not network error

  // 3. Stripe Checkout API (should require auth)
  results.push(await checkEndpoint('Stripe Checkout API', '/api/create-checkout-session', 'POST', JSON.stringify({
    userId: 'test',
    customerEmail: 'test@example.com'
  }), 500)); // Expected to fail without proper data

  // 4. Stripe Webhook API (should require signature)
  results.push(await checkEndpoint('Stripe Webhook API', '/api/stripe-webhook', 'POST', JSON.stringify({
    type: 'test'
  }), 400)); // Expected to fail due to missing signature

  // 5. Static Assets
  results.push(await checkEndpoint('Favicon', '/favicon.ico'));

  log('─'.repeat(60));

  // Summary
  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;
  const overallHealthy = healthyCount === totalCount;

  log(`${colors.bold}📊 SUMMARY${colors.reset}`);
  log(`Healthy: ${healthyCount}/${totalCount}`, overallHealthy ? colors.green : colors.yellow);

  if (!overallHealthy) {
    log(`${colors.red}⚠️  Some services are unhealthy. Check the details above.${colors.reset}`);
  } else {
    log(`${colors.green}🎉 All services are healthy!${colors.reset}`);
  }

  // Environment check
  log(`${colors.bold}🔧 ENVIRONMENT${colors.reset}`);
  log(`Node.js: ${process.version}`);
  log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'GROK_API_KEY'
  ];

  let envHealthy = true;
  requiredEnvVars.forEach(envVar => {
    const exists = !!process.env[envVar];
    const status = exists ? '✅' : '❌';
    const color = exists ? colors.green : colors.red;
    log(`${status} ${envVar}`, color);
    if (!exists) envHealthy = false;
  });

  log('─'.repeat(60));

  // Exit code
  const exitCode = overallHealthy && envHealthy ? 0 : 1;
  process.exit(exitCode);
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
GLP-1 Mindful Evenings Health Check

Usage: node scripts/health-check.js [options]

Options:
  --help, -h     Show this help message
  
Environment Variables:
  NEXT_PUBLIC_APP_URL    Base URL for the application (default: http://localhost:3000)

Examples:
  node scripts/health-check.js
  NEXT_PUBLIC_APP_URL=https://myapp.vercel.app node scripts/health-check.js
`);
  process.exit(0);
}

// Run the health checks
runHealthChecks().catch(error => {
  log(`❌ Health check failed: ${error.message}`, colors.red);
  process.exit(1);
});