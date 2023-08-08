import React, { useState, useEffect } from 'react';
import { View, Text, TouchableHighlight, StyleSheet, TouchableOpacity } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { db, auth } from '../utils/Firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, getDoc, updateDoc, where } from 'firebase/firestore';

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
      orderBy('pinned', 'desc'),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(chatQuery, async (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setChats(chatsData);
      fetchUserNames(chatsData);
    });
    return () => unsubscribe();
  }, []);

  const navigateToChat = (chatId) => {
    navigation.navigate('Chat', { chatId });
  };

  const deleteChat = async (chatId) => {
    await deleteDoc(doc(db, 'chats', chatId));
  };

  const togglePinChat = async (chat, rowMap) => {
    const pinned = !chat.pinned;
    await updateDoc(doc(db, 'chats', chat.id), { pinned });

    // Close the open SwipeListView item
    if (rowMap[chat.id]) {
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
      onPress={() => navigateToChat(item.id)}
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
                { backgroundColor: data.item.pinned ? '#1E90FF' : '#32CD32' }  // change color based on pinned status
            ]}
            onPress={() => togglePinChat(data.item, rowMap)}
        >
            <Text style={styles.backTextWhite}>
                {data.item.pinned ? 'Unpin' : 'Pin'}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.backRightBtn, styles.backRightBtnRight]}
            onPress={() => deleteChat(data.item.id)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  listViewContent: {
    width: '100%',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    width: '100%',
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  backRightBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: 75,
    bottom: 1,
    top: 1,
  },
  backRightBtnLeft: {
    backgroundColor: '#32CD32',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: '#FF3333',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default ChatsScreen;
