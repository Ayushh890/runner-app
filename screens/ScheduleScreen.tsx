import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Button, TextInput, Switch, Paragraph } from 'react-native-paper';

export default function ScheduleScreen() {
  const [timeSlot, setTimeSlot] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [calendarEnabled, setCalendarEnabled] = useState(false);
  const [scheduledRuns, setScheduledRuns] = useState([
    { id: 1, time: '6:00 AM', date: '2026-02-25', partners: 2 },
    { id: 2, time: '7:30 AM', date: '2026-02-26', partners: 1 },
  ]);

  const addTimeSlot = () => {
    console.log('Adding time slot:', timeSlot);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Run Scheduling & Alerts" />
        <Card.Content>
          <TextInput
            label="Preferred Time Slot (e.g., 6-7 AM)"
            value={timeSlot}
            onChangeText={setTimeSlot}
            style={styles.input}
          />
          <Button mode="contained" onPress={addTimeSlot} style={styles.button}>
            Add Time Slot
          </Button>
          <View style={styles.switch}>
            <Paragraph>Enable Alerts for Nearby Active Runners</Paragraph>
            <Switch value={alertsEnabled} onValueChange={setAlertsEnabled} />
          </View>
          <View style={styles.switch}>
            <Paragraph>Integrate with Calendar</Paragraph>
            <Switch value={calendarEnabled} onValueChange={setCalendarEnabled} />
          </View>
        </Card.Content>
      </Card>
      <Title>Scheduled Runs</Title>
      {scheduledRuns.map((run) => (
        <Card key={run.id} style={styles.runCard}>
          <Card.Title title={`${run.date} at ${run.time}`} />
          <Card.Content>
            <Paragraph>Potential Partners: {run.partners}</Paragraph>
            <Button mode="outlined" onPress={() => console.log('Join run', run.id)}>
              Join Run
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
  switch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  runCard: {
    marginBottom: 10,
  },
});