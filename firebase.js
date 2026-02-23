// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import Constants from 'expo-constants';

const extra = (Constants.manifest && Constants.manifest.extra) || (Constants.expoConfig && Constants.expoConfig.extra) || process.env;

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY || 'your-api-key',
  authDomain: extra.FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: extra.FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: extra.FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: extra.FIREBASE_APP_ID || 'your-app-id'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);
// OAuth client IDs (from runtime config)
export const oauthConfig = {
  google: {
    iosClientId: extra.GOOGLE_IOS_CLIENT_ID || 'GOOGLE_IOS_CLIENT_ID',
    androidClientId: extra.GOOGLE_ANDROID_CLIENT_ID || 'GOOGLE_ANDROID_CLIENT_ID',
    webClientId: extra.GOOGLE_WEB_CLIENT_ID || 'GOOGLE_WEB_CLIENT_ID'
  },
  microsoft: {
    clientId: extra.MICROSOFT_CLIENT_ID || 'MICROSOFT_CLIENT_ID',
    tenant: 'common'
  }
};
// Google Maps API Key (runtime)
export const googleMapsApiKey = extra.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';