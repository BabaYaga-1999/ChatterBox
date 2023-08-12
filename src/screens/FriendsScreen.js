import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableHighlight, Image, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { db, auth } from '../utils/Firebase';
import { collection, addDoc, query, where, getDoc, getDocs, doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { friendStyles as styles } from '../styles/Styles';
import { AntDesign } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';

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

  const deleteFriend = async (friendId, rowMap) => {
    try {
      const currentUserDoc = doc(db, 'users', auth.currentUser.uid);
      const currentUserData = await getDoc(currentUserDoc);

      if (currentUserData.exists()) {
        const currentFriends = currentUserData.data().friends;
        const updatedFriends = currentFriends.filter(friend => friend.id !== friendId);
        await updateDoc(currentUserDoc, { friends: updatedFriends });

        // Fetch all chats associated with the current user
        const currentUserId = auth.currentUser.uid;
        const chatQuery = query(
          collection(db, 'chats'),
          where('members', 'array-contains', currentUserId)
        );

        const chatSnapshot = await getDocs(chatQuery);
        
        chatSnapshot.docs.forEach(async (chatDoc) => {
          if (chatDoc.exists) {
            const chatData = chatDoc.data();

            // Check if both the friend and the user are members of this chat
            if (chatData.members.includes(friendId)) {
              let updatedDeletedBy = [...chatData.deletedBy];
              const currentUserDeletionIndex = updatedDeletedBy.findIndex(user => user.uid === currentUserId);

              const currentUserDeletionInfo = {
                uid: currentUserId,
                timestamp: Date.now(),
                active: true,
              };

              // Update or add the current user's deletion info
              if (currentUserDeletionIndex === -1) {
                // User not in deletedBy, add them
                updatedDeletedBy.push(currentUserDeletionInfo);
              } else {
                // User already in deletedBy, update their timestamp
                updatedDeletedBy[currentUserDeletionIndex] = currentUserDeletionInfo;
              }

              await updateDoc(doc(db, 'chats', chatDoc.id), {
                deletedBy: updatedDeletedBy
              });

              // Check if all members have deleted the chat and their status is active
              const allMembersDeleted = chatData.members.every(memberId => {
                const userDeletionInfo = updatedDeletedBy.find(user => user.uid === memberId);
                return userDeletionInfo && userDeletionInfo.active;
              });

              // If all members have deleted the chat, delete the chat document in Firebase
              if (allMembersDeleted) {
                await deleteDoc(doc(db, 'chats', chatDoc.id));
              }
            }
          }
        });
      }

      if (rowMap[friendId] && rowMap[friendId].closeRow) {
        rowMap[friendId].closeRow();
      }
    } catch (error) {
      console.error("Failed to delete friend:", error);
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

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnRight]}
          onPress={() => deleteFriend(data.item.id, rowMap)}
      >
          <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
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
              autoCapitalize='none'
          />
      </View>
      <SwipeListView
          data={sortedFriends}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-75}
          keyExtractor={item => item.id}
          disableRightSwipe
      />
    </View>
  );
};

export default FriendsScreen;
