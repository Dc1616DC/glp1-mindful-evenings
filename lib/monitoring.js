/**
 * Error Monitoring and Logging System
 * 
 * Provides centralized error logging and monitoring for the application.
 * Integrates with analytics for error tracking and user experience insights.
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Lazy load Firebase to avoid initialization during build
let db;
const getDB = async () => {
  if (!db) {
    const { db: firebaseDB } = await import('./firebase');
    db = firebaseDB;
  }
  return db;
};
import { analytics } from './analytics';

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error categories for better organization
export const ErrorCategory = {
  AUTHENTICATION: 'authentication',
  PAYMENT: 'payment',
  AI_SERVICE: 'ai_service',
  DATABASE: 'database',
  API: 'api',
  UI: 'ui',
  WEBHOOK: 'webhook',
  UNKNOWN: 'unknown'
};

/**
 * Log an error to Firebase and analytics
 */
export const logError = async (error, context = {}) => {
  try {
    const errorData = {
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      name: error.name || 'Error',
      severity: context.severity || ErrorSeverity.MEDIUM,
      category: context.category || ErrorCategory.UNKNOWN,
      userId: context.userId || null,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : context.url || 'server',
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        nodeEnv: process.env.NODE_ENV,
        buildId: process.env.NEXT_BUILD_ID || 'unknown'
      }
    };

    // Don't log to Firebase in development unless explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ERROR_LOGGING) {
      const database = await getDB();
      const errorsRef = collection(database, 'error_logs');
      await addDoc(errorsRef, {
        ...errorData,
        serverTimestamp: serverTimestamp()
      });
    }

    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${errorData.severity}] - ${errorData.category}`);
      console.error('Message:', errorData.message);
      console.error('Context:', context);
      console.error('Stack:', errorData.stack);
      console.groupEnd();
    }

    // Track in analytics if user is available
    if (context.userId) {
      analytics.error(context.userId, errorData.category, errorData.message, {
        severity: errorData.severity,
        url: errorData.url
      });
    }

    return { success: true, errorId: `error_${Date.now()}` };
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError);
    return { success: false, error: loggingError.message };
  }
};

/**
 * Specialized error loggers for different parts of the application
 */
export const errorLogger = {
  // Authentication errors
  auth: (error, userId = null, action = 'unknown') => 
    logError(error, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      userId,
      action
    }),

  // Payment/Stripe errors
  payment: (error, userId = null, context = {}) => 
    logError(error, {
      category: ErrorCategory.PAYMENT,
      severity: ErrorSeverity.CRITICAL,
      userId,
      ...context
    }),

  // AI service errors (Grok)
  aiService: (error, userId = null, context = {}) => 
    logError(error, {
      category: ErrorCategory.AI_SERVICE,
      severity: ErrorSeverity.MEDIUM,
      userId,
      ...context
    }),

  // Database/Firestore errors
  database: (error, userId = null, operation = 'unknown') => 
    logError(error, {
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
      userId,
      operation
    }),

  // API route errors
  api: (error, endpoint = 'unknown', context = {}) => 
    logError(error, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.HIGH,
      endpoint,
      ...context
    }),

  // UI/Component errors
  ui: (error, component = 'unknown', userId = null) => 
    logError(error, {
      category: ErrorCategory.UI,
      severity: ErrorSeverity.LOW,
      userId,
      component
    }),

  // Webhook errors
  webhook: (error, webhookType = 'unknown', context = {}) => 
    logError(error, {
      category: ErrorCategory.WEBHOOK,
      severity: ErrorSeverity.CRITICAL,
      webhookType,
      ...context
    })
};

/**
 * React Error Boundary helper
 */
export const handleReactError = (error, errorInfo, userId = null) => {
  logError(error, {
    category: ErrorCategory.UI,
    severity: ErrorSeverity.MEDIUM,
    userId,
    componentStack: errorInfo.componentStack,
    errorBoundary: true
  });
};

/**
 * Global error handler setup
 */
export const setupGlobalErrorHandling = () => {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(new Error(event.reason), {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      type: 'unhandledrejection'
    });
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    logError(new Error(event.message), {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'javascript_error'
    });
  });
};

/**
 * Performance monitoring helpers
 */
export const performanceLogger = {
  // Log slow operations
  logSlowOperation: (operationName, duration, threshold = 1000, context = {}) => {
    if (duration > threshold) {
      logError(new Error(`Slow operation: ${operationName} took ${duration}ms`), {
        category: ErrorCategory.API,
        severity: ErrorSeverity.LOW,
        operationName,
        duration,
        threshold,
        ...context
      });
    }
  },

  // Time an operation
  timeOperation: async (operationName, operation, context = {}) => {
    const startTime = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      // Log if operation is slow
      performanceLogger.logSlowOperation(operationName, duration, 1000, context);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logError(error, {
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH,
        operationName,
        duration,
        failed: true,
        ...context
      });
      throw error;
    }
  }
};

/**
 * Health check utilities
 */
export const healthCheck = {
  // Test database connectivity
  testDatabase: async () => {
    try {
      // Simple test - try to read from a collection
      const database = await getDB();
      const testRef = collection(database, 'health_check');
      await addDoc(testRef, { timestamp: serverTimestamp(), test: true });
      return { status: 'healthy', service: 'database' };
    } catch (error) {
      errorLogger.database(error, null, 'health_check');
      return { status: 'unhealthy', service: 'database', error: error.message };
    }
  },

  // Test AI service connectivity
  testAIService: async () => {
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkInData: { feelings: ['test'], emotionalIntensity: 5, hungerFullnessLevel: 5 },
          userHistory: [],
          type: 'insights'
        })
      });
      
      if (response.ok) {
        return { status: 'healthy', service: 'ai' };
      } else {
        throw new Error(`AI service returned ${response.status}`);
      }
    } catch (error) {
      errorLogger.aiService(error, null, { operation: 'health_check' });
      return { status: 'unhealthy', service: 'ai', error: error.message };
    }
  }
};

// Initialize global error handling when this module is imported
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
}