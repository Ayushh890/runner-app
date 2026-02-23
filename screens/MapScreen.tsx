import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';

// Load react-native-maps only on native platforms to avoid web bundler errors
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
import { Button, Card, Title, Paragraph, FAB, Portal, Modal, TextInput, Switch } from 'react-native-paper';
import * as Location from 'expo-location';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const { width, height } = Dimensions.get('window');

interface Runner {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  pace: string;
  online: boolean;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    radius: 5,
    pace: '',
    distance: '',
    ageGroup: '',
    gender: '',
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      fetchNearbyRunners(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const fetchNearbyRunners = async (lat: number, lon: number) => {
    try {
      const q = query(collection(db, 'runners'), where('online', '==', true));
      const querySnapshot = await getDocs(q);
      const fetchedRunners: Runner[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Calculate distance (simple approximation)
        const distance = Math.sqrt((data.latitude - lat) ** 2 + (data.longitude - lon) ** 2) * 111; // km
        if (distance <= filters.radius) {
          fetchedRunners.push({ id: doc.id, ...data } as Runner);
        }
      });
      setRunners(fetchedRunners);
    } catch (error) {
      console.error('Error fetching runners:', error);
    }
  };

  const applyFilters = () => {
    if (location) {
      fetchNearbyRunners(location.coords.latitude, location.coords.longitude);
    }
    setFiltersVisible(false);
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
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
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
        {runners.map((runner) => (
          <Marker
            key={runner.id}
            coordinate={{
              latitude: runner.latitude,
              longitude: runner.longitude,
            }}
            title={runner.name}
            description={`Pace: ${runner.pace}, Online: ${runner.online ? 'Yes' : 'No'}`}
            pinColor={runner.online ? 'green' : 'red'}
          />
        ))}
      </MapView>
      <FAB
        style={styles.fab}
        icon="filter"
        onPress={() => setFiltersVisible(true)}
      />
      <Portal>
        <Modal visible={filtersVisible} onDismiss={() => setFiltersVisible(false)} contentContainerStyle={styles.modal}>
          <Card>
            <Card.Title title="Filters" />
            <Card.Content>
              <TextInput
                label="Radius (km)"
                value={filters.radius.toString()}
                onChangeText={(text) => setFilters({ ...filters, radius: parseInt(text) || 5 })}
                keyboardType="numeric"
              />
              <TextInput
                label="Pace (min/km)"
                value={filters.pace}
                onChangeText={(text) => setFilters({ ...filters, pace: text })}
              />
              <TextInput
                label="Distance Goal (km)"
                value={filters.distance}
                onChangeText={(text) => setFilters({ ...filters, distance: text })}
                keyboardType="numeric"
              />
              <TextInput
                label="Age Group"
                value={filters.ageGroup}
                onChangeText={(text) => setFilters({ ...filters, ageGroup: text })}
              />
              <TextInput
                label="Gender Preference"
                value={filters.gender}
                onChangeText={(text) => setFilters({ ...filters, gender: text })}
              />
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setFiltersVisible(false)}>Cancel</Button>
              <Button onPress={applyFilters}>Apply</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    padding: 20,
  },
});