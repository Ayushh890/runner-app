import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Card, Paragraph, Title } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

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
          <Button onPress={() => navigation.navigate('Signup')} style={styles.link}>Create account</Button>
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
