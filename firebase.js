// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);
// OAuth client IDs (placeholders) — replace with your app's values
export const oauthConfig = {
  google: {
    // Add Google OAuth client IDs from Google Cloud Console
    iosClientId: 'GOOGLE_IOS_CLIENT_ID',
    androidClientId: 'GOOGLE_ANDROID_CLIENT_ID',
    webClientId: 'GOOGLE_WEB_CLIENT_ID'
  },
  microsoft: {
    // Add Microsoft app client ID (Azure app registration)
    clientId: 'MICROSOFT_CLIENT_ID',
    tenant: 'common' // or your tenant id
  }
};