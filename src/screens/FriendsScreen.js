import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableHighlight, Image, TextInput, StyleSheet } from 'react-native';
import { db, auth } from '../utils/Firebase';
import { collection, addDoc, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { friendStyles as styles } from '../styles/Styles';
import { AntDesign } from '@expo/vector-icons';

const FriendsScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const currentUserDoc = doc(db, 'users', auth.currentUser.uid);

    // Monitor the current user's friends list
    const unsubscribe = onSnapshot(currentUserDoc, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userFriends = docSnapshot.data().friends || [];
        setFriends(userFriends);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredFriends = friends.filter(friend => friend.name.toLowerCase().includes(searchText.toLowerCase()));
  const sortedFriends = filteredFriends.sort((a, b) => a.name.localeCompare(b.name));

  const startChat = async (friend) => {
    const currentUserId = auth.currentUser.uid;

    // Check if chat already exists between the two users
    const chatsRef = collection(db, 'chats');
    const chatQuery = query(chatsRef, where('members', 'array-contains', currentUserId));
    const chatSnapshots = await getDocs(chatQuery);
    
    let existingChat;
    chatSnapshots.forEach(docSnapshot => {
      const chatData = docSnapshot.data();
      if (chatData.members.includes(friend.id)) {
        existingChat = { ...chatData, id: docSnapshot.id };
      }
    });

    if (existingChat) {
      // Navigate to the existing chat
      navigation.navigate('Chat', { chatId: existingChat.id, friendName: friend.name });
    } else {
      // Create a new chat in the database with the pinned field
      const newChatData = {
        members: [currentUserId, friend.id],
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        pinnedUsers: [],  // keeping track of users who pinned the chat
        deletedBy: []
      };
      const newChatDocRef = await addDoc(chatsRef, newChatData);
      
      // Navigate to the new chat
      navigation.navigate('Chat', { chatId: newChatDocRef.id, friendName: friend.name });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableHighlight
      underlayColor={'#f0f0f0'}
      onPress={() => startChat(item)}
      style={styles.listItem}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <Text style={styles.friendName}>{item.name}</Text>
      </View>
    </TouchableHighlight>
    );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
          <AntDesign name="search1" size={20} color="#aaa" style={styles.searchIcon} />
          <TextInput
              placeholder="Search"
              placeholderTextColor="#aaa" 
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
          />
      </View>
      <FlatList
          data={sortedFriends}
          renderItem={renderItem}
          keyExtractor={item => item.id}
      />
    </View>
  );
};

export default FriendsScreen;
