import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Button, Card, Paragraph, Title } from 'react-native-paper';
import * as AuthSession from 'expo-auth-session';
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth, oauthConfig } from '../firebase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Profile');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card>
        <Card.Title title="Login" />
        <Card.Content>
          <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
          {error ? <Paragraph style={styles.error}>{error}</Paragraph> : null}
          <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.button}>Login</Button>
          <Button mode="outlined" onPress={signInWithGoogle} style={styles.button}>Sign in with Google</Button>
          <Button mode="outlined" onPress={signInWithMicrosoft} style={styles.button}>Sign in with Microsoft</Button>
          <Button onPress={() => navigation.navigate('Signup')} style={styles.link}>Create account</Button>
        </Card.Content>
      </Card>
    </View>
  );
}

// Google OAuth using expo-auth-session
async function signInWithGoogle() {
  try {
    const clientId = oauthConfig.google.webClientId || oauthConfig.google.androidClientId || oauthConfig.google.iosClientId;
    if (!clientId) throw new Error('Google client ID not configured in firebase.js');

    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token%20token&scope=profile%20email`;
    const result = await AuthSession.startAsync({ authUrl });
    if (result.type === 'success' && (result.params?.id_token || result.params?.access_token)) {
      const idToken = result.params.id_token as string | undefined;
      const accessToken = result.params.access_token as string | undefined;
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      await signInWithCredential(auth, credential);
    } else {
      console.warn('Google sign-in canceled or failed', result);
    }
  } catch (e) {
    console.error('Google sign-in error', e);
    alert('Google sign-in error: ' + (e as any).message);
  }
}

// Microsoft OAuth using expo-auth-session
async function signInWithMicrosoft() {
  try {
    const clientId = oauthConfig.microsoft.clientId;
    const tenant = oauthConfig.microsoft.tenant || 'common';
    if (!clientId) throw new Error('Microsoft client ID not configured in firebase.js');

    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(redirectUri)}`;
    const result = await AuthSession.startAsync({ authUrl });
    if (result.type === 'success' && result.params?.access_token) {
      const accessToken = result.params.access_token as string;
      // Create credential for Microsoft and sign in
      const provider = new OAuthProvider('microsoft.com');
      const credential = provider.credential(accessToken);
      await signInWithCredential(auth, credential as any);
    } else {
      console.warn('Microsoft sign-in canceled or failed', result);
    }
  } catch (e) {
    console.error('Microsoft sign-in error', e);
    alert('Microsoft sign-in error: ' + (e as any).message);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, justifyContent: 'center' },
  input: { marginTop: 10 },
  button: { marginTop: 12 },
  link: { marginTop: 8 },
  error: { color: 'red', marginTop: 8 },
});
