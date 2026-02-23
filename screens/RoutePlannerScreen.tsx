import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, TextInput } from 'react-native-paper';
import { googleMapsApiKey, auth } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

// Polyline decoder (small utility)
function decodePolyline(encoded: string) {
  if (!encoded) return [];
  const points: Array<{ latitude: number; longitude: number }> = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export default function RoutePlannerScreen() {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);

  const planRoute = () => {
    if (!startLocation || !endLocation) return Alert.alert('Enter both start and end');
    if (!googleMapsApiKey || googleMapsApiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      // fallback to opening google maps directions
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(endLocation)}&travelmode=walking`;
      Linking.openURL(url);
      return;
    }

    // Use Google Directions API to get route and save to Firestore
    (async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(endLocation)}&key=${googleMapsApiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const overview = data.routes[0].overview_polyline?.points;
          const coords = decodePolyline(overview);
          // save route to Firestore so MapScreen can show it
          await addDoc(collection(db, 'routes'), {
            name: `${startLocation} → ${endLocation}`,
            creator: auth.currentUser?.uid || 'anonymous',
            coords,
            createdAt: new Date(),
          });
          Alert.alert('Route saved and displayed on map');
        } else {
          Alert.alert('No route found');
        }
      } catch (e) {
        console.error('Error fetching directions', e);
        Alert.alert('Error fetching directions');
      }
    })();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Smart Route Planner" />
        <Card.Content>
          <TextInput
            label="Start Location"
            value={startLocation}
            onChangeText={setStartLocation}
            style={styles.input}
          />
          <TextInput
            label="End Location"
            value={endLocation}
            onChangeText={setEndLocation}
            style={styles.input}
          />
          <Button mode="contained" onPress={planRoute} style={styles.button}>
            Plan Peaceful Route
          </Button>
        </Card.Content>
      </Card>
      <Title style={styles.title}>Suggested Routes</Title>
      {routes.length === 0 ? (
        <Paragraph>No saved routes yet. Plan a route to create one.</Paragraph>
      ) : (
        routes.map((route) => (
          <Card key={route.id} style={styles.routeCard}>
            <Card.Title title={route.name} />
            <Card.Content>
              <Paragraph>Creator: {route.creator}</Paragraph>
              <Button mode="outlined" onPress={() => {
                // open route in Google Maps
                if (route.coords && route.coords.length > 0) {
                  const dest = `${route.coords[route.coords.length-1].latitude},${route.coords[route.coords.length-1].longitude}`;
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=walking`;
                  Linking.openURL(url);
                }
              }}>
                Open in Maps
              </Button>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  title: {
    marginVertical: 10,
  },
  routeCard: {
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    marginVertical: 10,
  },
});