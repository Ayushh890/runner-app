import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';

// Load react-native-maps only on native platforms to avoid web bundler errors
let MapView: any;
let Marker: any;
let Polyline: any;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default || maps.MapView || maps;
  Marker = maps.Marker || maps.MapMarker || ((props: any) => null);
  // Polyline for native maps
  Polyline = maps.Polyline || maps.mapPolyline || null;
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
import { collection, addDoc, getDocs, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Alert, Linking } from 'react-native';

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
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    radius: 5,
    pace: '',
    distance: '',
    ageGroup: '',
    gender: '',
  });

  useEffect(() => {
    let subscriber: any;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      fetchNearbyRunners(loc.coords.latitude, loc.coords.longitude);

      // start watching location and update Firestore (live location)
      subscriber = await Location.watchPositionAsync({ distanceInterval: 5, timeInterval: 5000 }, async (pos) => {
        setLocation(pos);
        try {
          const userId = auth.currentUser?.uid || 'anonymous';
          await setDoc(doc(db, 'runners', userId), {
            name: auth.currentUser?.email || 'Anonymous',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            online: true,
            updatedAt: new Date()
          }, { merge: true });
        } catch (e) {
          console.error('Error updating location in firestore', e);
        }
      });
    })();

    // listen for live runners updates
    const runnersUnsub = onSnapshot(collection(db, 'runners'), (snap) => {
      const items: Runner[] = [];
      snap.forEach((d) => {
        const data: any = d.data();
        if (data && data.latitude && data.longitude && data.online) {
          items.push({ id: d.id, latitude: data.latitude, longitude: data.longitude, name: data.name || 'Runner', pace: data.pace || '', online: data.online });
        }
      });
      setRunners(items);
    });

    return () => {
      if (subscriber && subscriber.remove) subscriber.remove();
      runnersUnsub();
    };
  }, []);

  // listen for saved routes and display polylines (native only)
  useEffect(() => {
    const routesUnsub = onSnapshot(collection(db, 'routes'), (snap) => {
      const rs: any[] = [];
      snap.forEach((d) => {
        const data: any = d.data();
        if (data && data.coords) rs.push({ id: d.id, coords: data.coords });
      });
      setSavedRoutes(rs);
    });
    return () => routesUnsub();
  }, []);

  const fetchNearbyRunners = async (lat: number, lon: number) => {
    try {
      const q = query(collection(db, 'runners'), where('online', '==', true));
      const querySnapshot = await getDocs(q);
      const fetchedRunners: Runner[] = [];
      querySnapshot.forEach((d) => {
        const data: any = d.data();
        // Calculate distance (simple approximation)
        const distance = Math.sqrt((data.latitude - lat) ** 2 + (data.longitude - lon) ** 2) * 111; // km
        if (distance <= filters.radius) {
          fetchedRunners.push({ id: d.id, latitude: data.latitude, longitude: data.longitude, name: data.name || 'Runner', pace: data.pace || '', online: data.online });
        }
      });
      setRunners(fetchedRunners);
    } catch (error) {
      console.error('Error fetching runners:', error);
    }
  };

  const handleMarkerPress = (runner: Runner) => {
    const currentUserId = auth.currentUser?.uid;
    Alert.alert(runner.name, `ID: ${runner.id}`, [
      { text: 'Add Friend', onPress: async () => {
        if (!currentUserId) return Alert.alert('Not signed in');
        try {
          await setDoc(doc(db, 'friends', currentUserId + '_' + runner.id), { from: currentUserId, to: runner.id, createdAt: new Date() });
          Alert.alert('Friend request sent');
        } catch (e) {
          console.error('Error adding friend', e);
          Alert.alert('Error sending friend request');
        }
      }},
      { text: 'Navigate', onPress: () => openNavigation(runner.latitude, runner.longitude) },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const openNavigation = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
    Linking.openURL(url).catch((err) => console.error('Error opening maps', err));
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
            onPress={() => handleMarkerPress(runner)}
          />
        ))}
        {Platform.OS !== 'web' && Polyline && savedRoutes.map((r) => (
          <Polyline
            key={r.id}
            coordinates={r.coords}
            strokeColor="rgba(33,150,243,0.9)"
            strokeWidth={4}
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