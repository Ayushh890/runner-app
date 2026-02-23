// seedData.js - Run this once to add sample data to Firestore
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export const seedData = async () => {
  try {
    // Add sample runners
    await addDoc(collection(db, 'runners'), {
      name: 'Alice',
      pace: '6 min/km',
      latitude: 37.7749, // Sample coordinates
      longitude: -122.4194,
      online: true,
    });
    await addDoc(collection(db, 'runners'), {
      name: 'Bob',
      pace: '7 min/km',
      latitude: 37.7849,
      longitude: -122.4294,
      online: true,
    });
    await addDoc(collection(db, 'runners'), {
      name: 'Charlie',
      pace: '5.5 min/km',
      latitude: 37.7649,
      longitude: -122.4094,
      online: false,
    });

    // Add sample badges
    await addDoc(collection(db, 'badges'), {
      name: '7 Day Streak',
      description: 'Run for 7 consecutive days',
    });
    await addDoc(collection(db, 'badges'), {
      name: 'Peaceful Runner',
      description: 'Complete 10 peaceful routes',
    });

    console.log('Sample data added');
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
};