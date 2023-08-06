import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db }  from '../utils/Firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const ChatsScreen = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    let unsubscribe;

    // Create a query to order chats by lastMessageTime in descending order
    const chatQuery = query(collection(db, 'chats'), orderBy('lastMessageTime', 'desc'));

    // Subscribe to real-time updates from Firestore
    unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setChats(chatsData);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.chatItem}>
      <Text>{item.friendName}</Text>
      <Text>{item.lastMessage}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default ChatsScreen;
