import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, TextInput } from 'react-native-paper';

export default function RoutePlannerScreen() {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routes, setRoutes] = useState([
    {
      id: 1,
      name: 'Peaceful Park Path',
      distance: '5.2 km',
      time: '35 min',
      difficulty: 'Easy',
      elevation: 'Low',
      aqi: 'Good',
      traffic: 'Low',
    },
    {
      id: 2,
      name: 'Lakeside Trail',
      distance: '7.1 km',
      time: '50 min',
      difficulty: 'Medium',
      elevation: 'Moderate',
      aqi: 'Excellent',
      traffic: 'Very Low',
    },
  ]);

  const planRoute = () => {
    // Mock route planning
    console.log('Planning route from', startLocation, 'to', endLocation);
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
      {routes.map((route) => (
        <Card key={route.id} style={styles.routeCard}>
          <Card.Title title={route.name} />
          <Card.Content>
            <Paragraph>Distance: {route.distance}</Paragraph>
            <Paragraph>Time: {route.time}</Paragraph>
            <Paragraph>Difficulty: {route.difficulty}</Paragraph>
            <Paragraph>Elevation: {route.elevation}</Paragraph>
            <View style={styles.chips}>
              <Chip icon="weather-windy">AQI: {route.aqi}</Chip>
              <Chip icon="car">Traffic: {route.traffic}</Chip>
            </View>
            <Button mode="outlined" onPress={() => console.log('Select route', route.id)}>
              Select Route
            </Button>
          </Card.Content>
        </Card>
      ))}
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