import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Paragraph, Card } from 'react-native-paper';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

export default function AccountScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  const handleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      setError(e.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error', e);
    }
  };

  if (user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Account" />
          <Card.Content>
            <Title>Welcome</Title>
            <Paragraph>{user.email}</Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={handleSignOut}>Sign Out</Button>
          </Card.Actions>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={mode === 'login' ? 'Login' : 'Create Account'} />
        <Card.Content>
          <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
          {error ? <Paragraph style={styles.error}>{error}</Paragraph> : null}
          {mode === 'login' ? (
            <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.button}>Login</Button>
          ) : (
            <Button mode="contained" onPress={handleSignup} loading={loading} style={styles.button}>Create account</Button>
          )}
          <Button onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} style={styles.link}>
            {mode === 'login' ? "Don't have an account? Create one" : 'Have an account? Login'}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, justifyContent: 'center' },
  card: { padding: 10 },
  input: { marginTop: 10 },
  button: { marginTop: 12 },
  link: { marginTop: 8 },
  error: { color: 'red', marginTop: 8 },
});
