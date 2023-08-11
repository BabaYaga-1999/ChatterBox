import React, { useState, useEffect } from 'react';
import { View, Text, TouchableHighlight, StyleSheet, TouchableOpacity } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { db, auth } from '../utils/Firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, getDoc, updateDoc, where } from 'firebase/firestore';
import { chatStyles as styles } from '../styles/Styles';

// Utility function to check if user has deleted the chat
const hasUserDeletedChat = (deletedBy, uid) => {
  return deletedBy.some(user => user.uid === uid);
};

const getDeletionTimestampForUser = (deletedBy, uid) => {
  const deletionInfo = deletedBy.find(user => user.uid === uid);
  return deletionInfo ? deletionInfo.timestamp : null;
};

const ChatsScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [userNames, setUserNames] = useState({}); 

  const fetchUserNames = async (chatsData) => {
    let newNames = {};
    const friendIds = chatsData.map(chat => chat.members.find(id => id !== auth.currentUser.uid));
    for (let id of friendIds) {
      const userDoc = await getDoc(doc(db, 'users', id));
      if (userDoc.exists()) {
        newNames[id] = userDoc.data().name;
      }
    }
    setUserNames(newNames);
  }

  useEffect(() => {
    const currentUserId = auth.currentUser.uid;

    // Only query chats that the current user is a member of
    const chatQuery = query(
      collection(db, 'chats'),
      where('members', 'array-contains', currentUserId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(chatQuery, async (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      // Filter out chats that the current user has deleted
      // And only include chats that have a lastMessage
      const visibleChats = chatsData.filter(chat => {
        if (chat.lastMessage) {
          const lastMessageTimestamp = new Date(chat.lastMessageTime).getTime();

          if (!hasUserDeletedChat(chat.deletedBy, currentUserId)) {
            return true;
          }

          const userDeletionTimestamp = getDeletionTimestampForUser(chat.deletedBy, currentUserId);

          if (userDeletionTimestamp && lastMessageTimestamp > userDeletionTimestamp) {
            return true;
          }
        }
        return false;
      });

      const pinnedChats = visibleChats.filter(chat => chat.pinnedUsers.some(p => p.uid === currentUserId));
      const unpinnedChats = visibleChats.filter(chat => !chat.pinnedUsers.some(p => p.uid === currentUserId));

      // Sort each list based on lastMessageTime
      pinnedChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      unpinnedChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

      // Combine the two lists
      const allChats = [...pinnedChats, ...unpinnedChats];

      setChats(allChats);
      fetchUserNames(allChats);

      // setChats(visibleChats);
      // fetchUserNames(visibleChats);
    });
    return () => unsubscribe();
  }, []);

  const navigateToChat = (chatId, friendName) => {
    navigation.navigate('Chat', { chatId, friendName });
  };

  const deleteChat = async (chatId, rowMap) => {
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const data = chatDoc.data();

      // Check if chat is pinned and unpin it
      if (data.pinned) {
        await updateDoc(chatRef, { pinned: false });
      }

      let updatedDeletedBy = [...data.deletedBy];
      const currentUserDeletionIndex = updatedDeletedBy.findIndex(user => user.uid === auth.currentUser.uid);

      const currentUserDeletionInfo = {
        uid: auth.currentUser.uid,
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

      await updateDoc(chatRef, {
        deletedBy: updatedDeletedBy
      });

      // Check if all members have deleted the chat and their status is active
      const allMembersDeleted = data.members.every(memberId => {
        const userDeletionInfo = updatedDeletedBy.find(user => user.uid === memberId);
        return userDeletionInfo && userDeletionInfo.active;
      });

      // If all members have deleted the chat, delete the chat document in Firebase
      if (allMembersDeleted) {
        await deleteDoc(chatRef);
      }
    }

      // Close the open SwipeListView item
      if (rowMap[chatId] && rowMap[chatId].closeRow) {
        rowMap[chatId].closeRow();
      }
  };

  const togglePinChat = async (chat, rowMap) => {
    const userPinned = chat.pinnedUsers.some(p => p.uid === auth.currentUser.uid);
    let updatedPinnedUsers = [...chat.pinnedUsers];

    if (userPinned) {
        // Unpin: Remove user from the array
        updatedPinnedUsers = updatedPinnedUsers.filter(p => p.uid !== auth.currentUser.uid);
    } else {
        // Pin: Add user to the array
        updatedPinnedUsers.push({ uid: auth.currentUser.uid });
    }

    await updateDoc(doc(db, 'chats', chat.id), { pinnedUsers: updatedPinnedUsers });

    // Close the open SwipeListView item
    if (rowMap[chat.id] && rowMap[chat.id].closeRow) {
        rowMap[chat.id].closeRow();
    }
  };

  const formatDate = (lastMessageTime) => {
    const messageDate = new Date(lastMessageTime);
    const currentDate = new Date();

    // transfer UTC time (time on server) to local time
    const localTime = messageDate.toLocaleTimeString('default', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const localDate = messageDate.toLocaleDateString();

    if (
        messageDate.getFullYear() === currentDate.getFullYear() &&
        messageDate.getMonth() === currentDate.getMonth() &&
        messageDate.getDate() === currentDate.getDate()
    ) {
        return localTime;
    } else {
        return localDate;
    }
};

  const renderItem = ({ item }) => (
    <TouchableHighlight
      onPress={() => {
        const friendName = userNames[item.members.find(id => id !== auth.currentUser.uid)] || "Unknown";
        navigateToChat(item.id, friendName);
      }}
      underlayColor={'#fff'}
    >
      <View style={styles.chatItem}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold' }}>
            {userNames[item.members.find(id => id !== auth.currentUser.uid)] || "Unknown"}
          </Text>
          <Text>{item.lastMessage}</Text>
        </View>
        {item.lastMessage && 
          <Text style={{ marginLeft: 10 }}>{formatDate(item.lastMessageTime)}</Text>}
      </View>
    </TouchableHighlight>
);

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
        <TouchableOpacity
            style={[
                styles.backRightBtn,
                styles.backRightBtnLeft,
                { backgroundColor: data.item.pinnedUsers.some(p => p.uid === auth.currentUser.uid) ? '#1E90FF' : '#32CD32' }  // change color based on pinned status
            ]}
            onPress={() => togglePinChat(data.item, rowMap)}
        >
            <Text style={styles.backTextWhite}>
                {data.item.pinnedUsers.some(p => p.uid === auth.currentUser.uid) ? 'Unpin' : 'Pin'}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.backRightBtn, styles.backRightBtnRight]}
            onPress={() => deleteChat(data.item.id, rowMap)}  // Add rowMap as a parameter
        >
            <Text style={styles.backTextWhite}>Delete</Text>
        </TouchableOpacity>
    </View>
);

  return (
    <View style={styles.container}>
      <SwipeListView
        data={chats}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-150}
        keyExtractor={item => item.id}
        useFlatList
        disableRightSwipe
        contentContainerStyle={styles.listViewContent}
      />
    </View>
  );
};

export default ChatsScreen;
