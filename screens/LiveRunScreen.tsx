import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Card, Title, Paragraph, Button, FAB } from 'react-native-paper';

// Load react-native-maps only on native platforms
let MapView: any;
let Marker: any;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default || maps.MapView || maps;
  Marker = maps.Marker || maps.MapMarker || ((props: any) => null);
} else {
  MapView = (props: any) => (
    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, props.style]}>
      <Text>Maps are not available on web</Text>
      {props.children}
    </View>
  );
  Marker = (props: any) => (
    <View style={{ padding: 6 }}>
      <Text>{props.title || 'Marker'}</Text>
    </View>
  );
}
import * as Location from 'expo-location';

export default function LiveRunScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [partnerLocation, setPartnerLocation] = useState({ latitude: 0, longitude: 0 });
  const [paceSync, setPaceSync] = useState('Your partner is 50m ahead');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        // Mock partner location
        setPartnerLocation({
          latitude: loc.coords.latitude + 0.001,
          longitude: loc.coords.longitude + 0.001,
        });
      }
    })();
  }, []);

  const emergencyButton = () => {
    console.log('Emergency button pressed');
  };

  if (!location) {
    return <View style={styles.container}><Title>Loading...</Title></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You"
          pinColor="blue"
        />
        <Marker
          coordinate={partnerLocation}
          title="Partner"
          pinColor="green"
        />
      </MapView>
      <Card style={styles.card}>
        <Card.Title title="Live Run Mode" />
        <Card.Content>
          <Paragraph>{paceSync}</Paragraph>
          <Button mode="contained" onPress={emergencyButton} color="red">
            Emergency
          </Button>
        </Card.Content>
      </Card>
      <FAB
        style={styles.fab}
        icon="share"
        onPress={() => console.log('Share location')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});