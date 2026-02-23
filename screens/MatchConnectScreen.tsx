import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, FAB, Portal, Modal, TextInput } from 'react-native-paper';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Runner {
  id: string;
  name: string;
  pace: string;
  distance: number;
  online: boolean;
}

export default function MatchConnectScreen() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    fetchRunners();
  }, []);

  const fetchRunners = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'runners'));
      const fetchedRunners: Runner[] = [];
      querySnapshot.forEach((doc) => {
        fetchedRunners.push({ id: doc.id, ...doc.data() } as Runner);
      });
      setRunners(fetchedRunners);
    } catch (error) {
      console.error('Error fetching runners:', error);
    }
  };

  const requestTeamUp = async (runnerId: string) => {
    try {
      await addDoc(collection(db, 'teamRequests'), {
        from: 'currentUserId', // Replace with actual user ID
        to: runnerId,
        status: 'pending',
      });
      console.log('Team up request sent');
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const createGroup = async () => {
    try {
      await addDoc(collection(db, 'groups'), {
        name: groupName,
        members: ['currentUserId'], // Replace with actual user ID
        createdAt: new Date(),
      });
      setGroupModalVisible(false);
      setGroupName('');
      console.log('Group created');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const renderRunner = ({ item }: { item: Runner }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.name}
        subtitle={`Pace: ${item.pace} | ${item.distance} km away`}
        left={(props) => <Avatar.Text {...props} label={item.name[0]} />}
        right={(props) => (
          <View style={styles.onlineIndicator}>
            <View style={[styles.dot, { backgroundColor: item.online ? 'green' : 'red' }]} />
          </View>
        )}
      />
      <Card.Actions>
        <Button onPress={() => requestTeamUp(item.id)}>Team Up</Button>
        <Button onPress={() => console.log('Chat with', item.id)}>Chat</Button>
        <Button onPress={() => console.log('Voice call', item.id)}>Call</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Title>Nearby Runners</Title>
      <FlatList
        data={runners}
        renderItem={renderRunner}
        keyExtractor={(item) => item.id.toString()}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setGroupModalVisible(true)}
      />
      <Portal>
        <Modal visible={groupModalVisible} onDismiss={() => setGroupModalVisible(false)} contentContainerStyle={styles.modal}>
          <Card>
            <Card.Title title="Create Group" />
            <Card.Content>
              <TextInput
                label="Group Name"
                value={groupName}
                onChangeText={setGroupName}
              />
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setGroupModalVisible(false)}>Cancel</Button>
              <Button onPress={createGroup}>Create</Button>
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
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
  onlineIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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