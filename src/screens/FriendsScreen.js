import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { db, auth } from '../utils/Firebase';
import { collection, addDoc, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';

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
      navigation.navigate('Chat', { chatId: existingChat.id });
    } else {
      // Create a new chat in the database with the pinned field
      const newChatData = {
        members: [currentUserId, friend.id],
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        pinned: false,  // default value for pinned
      };
      const newChatDocRef = await addDoc(chatsRef, newChatData);
      
      // Navigate to the new chat
      navigation.navigate('Chat', { chatId: newChatDocRef.id });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => startChat(item)}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: item.avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
        <Text>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      {/* <TextInput
        placeholder="Search for friends..."
        value={searchText}
        onChangeText={setSearchText}
      /> */}
      <FlatList
        data={filteredFriends}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default FriendsScreen;
