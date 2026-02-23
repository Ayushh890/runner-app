import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Avatar } from 'react-native-paper';

export default function CommunityScreen() {
  const [badges, setBadges] = useState([
    { id: 1, name: '7 Day Streak', earned: true },
    { id: 2, name: 'Peaceful Runner', earned: true },
    { id: 3, name: 'Marathon Master', earned: false },
  ]);
  const [posts, setPosts] = useState([
    { id: 1, user: 'Alice', content: 'Completed a peaceful 5km run by the lake!', likes: 12 },
    { id: 2, user: 'Bob', content: 'New badge unlocked: 7 Day Streak!', likes: 8 },
  ]);

  return (
    <ScrollView style={styles.container}>
      <Title>Challenges & Badges</Title>
      <View style={styles.badges}>
        {badges.map((badge) => (
          <Chip
            key={badge.id}
            icon={badge.earned ? 'check' : 'lock'}
            style={badge.earned ? styles.earnedBadge : styles.lockedBadge}
          >
            {badge.name}
          </Chip>
        ))}
      </View>
      <Title>Community Feed</Title>
      {posts.map((post) => (
        <Card key={post.id} style={styles.postCard}>
          <Card.Title
            title={post.user}
            left={(props) => <Avatar.Text {...props} label={post.user[0]} />}
          />
          <Card.Content>
            <Paragraph>{post.content}</Paragraph>
            <Paragraph>Likes: {post.likes}</Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => console.log('Like post', post.id)}>Like</Button>
            <Button onPress={() => console.log('Comment on post', post.id)}>Comment</Button>
          </Card.Actions>
        </Card>
      ))}
      <Card style={styles.card}>
        <Card.Title title="Solo Mode" />
        <Card.Content>
          <Paragraph>No partner available? Get motivational audio suggestions.</Paragraph>
          <Button mode="outlined" onPress={() => console.log('Play motivational audio')}>
            Play Audio
          </Button>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="Music Sync" />
        <Card.Content>
          <Paragraph>Match with runners who have similar playlist vibes.</Paragraph>
          <Button mode="outlined" onPress={() => console.log('Sync music')}>
            Sync Music
          </Button>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="Spotify Integration" />
        <Card.Content>
          <Paragraph>Connect your Spotify account to sync playlists and find running buddies with similar music tastes.</Paragraph>
          <Button mode="contained" onPress={() => console.log('Connect to Spotify')}>
            Connect Spotify
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  earnedBadge: {
    margin: 5,
    backgroundColor: 'green',
  },
  lockedBadge: {
    margin: 5,
    backgroundColor: 'gray',
  },
  postCard: {
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
  },
});