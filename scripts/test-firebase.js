#!/usr/bin/env node

/**
 * Firebase Production Test Script
 * 
 * Tests Firebase connection and basic operations for production environment.
 */

async function testFirebase() {
  console.log('🔥 Testing Firebase Production Connection...\n');

  try {
    // Test environment variables
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];

    console.log('📋 Checking Environment Variables:');
    let allVarsPresent = true;
    requiredVars.forEach(varName => {
      const exists = !!process.env[varName];
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${varName}: ${exists ? 'Set' : 'Missing'}`);
      if (!exists) allVarsPresent = false;
    });

    if (!allVarsPresent) {
      console.log('\n❌ Missing required environment variables. Please set them first.');
      process.exit(1);
    }

    // Test Firebase initialization
    console.log('\n🔧 Testing Firebase Initialization...');
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, connectFirestoreEmulator, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    console.log('✅ Firebase initialized successfully');
    console.log(`📊 Project ID: ${firebaseConfig.projectId}`);
    console.log(`🔐 Auth Domain: ${firebaseConfig.authDomain}`);

    // Test Firestore connection
    console.log('\n🗄️  Testing Firestore Connection...');
    
    try {
      const testRef = collection(db, 'connection_test');
      const docRef = await addDoc(testRef, {
        message: 'Firebase connection test',
        timestamp: serverTimestamp(),
        testId: `test_${Date.now()}`
      });
      console.log('✅ Firestore write successful');
      console.log(`📝 Document ID: ${docRef.id}`);
    } catch (firestoreError) {
      console.log('❌ Firestore test failed:', firestoreError.message);
      
      if (firestoreError.message.includes('permission-denied')) {
        console.log('💡 This might be due to Firestore security rules. Check your rules in Firebase Console.');
      }
    }

    console.log('\n🎉 Firebase production test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Check Firebase Console for test data');
    console.log('2. Verify authentication is working');
    console.log('3. Test your app at: https://evening-toolkit-standalone-xm43abw16-dans-projects-9331cd36.vercel.app');

  } catch (error) {
    console.log('❌ Firebase test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify all environment variables are set correctly');
    console.log('2. Check Firebase project configuration');
    console.log('3. Ensure Firestore is enabled in Firebase Console');
    process.exit(1);
  }
}

testFirebase().catch(console.error);