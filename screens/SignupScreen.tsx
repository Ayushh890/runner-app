import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Card, Paragraph } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Profile');
    } catch (e: any) {
      setError(e.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card>
        <Card.Title title="Create Account" />
        <Card.Content>
          <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
          {error ? <Paragraph style={styles.error}>{error}</Paragraph> : null}
          <Button mode="contained" onPress={handleSignup} loading={loading} style={styles.button}>Create account</Button>
          <Button onPress={() => navigation.navigate('Login')} style={styles.link}>Have an account? Login</Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, justifyContent: 'center' },
  input: { marginTop: 10 },
  button: { marginTop: 12 },
  link: { marginTop: 8 },
  error: { color: 'red', marginTop: 8 },
});
