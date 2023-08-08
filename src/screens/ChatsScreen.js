import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { db, auth } from '../utils/Firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, getDoc } from 'firebase/firestore';

const ChatsScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [userNames, setUserNames] = useState({}); // 用于存储所有必要的用户名

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
    const chatQuery = query(collection(db, 'chats'), orderBy('pinned', 'desc'), orderBy('lastMessageTime', 'desc'));

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

  const togglePinChat = (chat) => {
    const pinned = !chat.pinned;
    const chatRef = doc(db, 'chats', chat.id);
    chatRef.update({
      pinned: pinned,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigateToChat(item.id)}>
      <View style={styles.chatItem}>
        <View style={{ flex: 1 }}>
          {/* 获取对方的名字 */}
          <Text style={{ fontWeight: 'bold' }}>{userNames[item.members.find(id => id !== auth.currentUser.uid)] || "Unknown"}</Text>
          <Text>{item.lastMessage || "No Message"}</Text>
        </View>
        <Text style={{ marginLeft: 10 }}>{new Date(item.lastMessageTime).toLocaleTimeString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={() => togglePinChat(data.item)}>
        <Text style={styles.backTextWhite}>Pin</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={() => deleteChat(data.item.id)}>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: 75,
    bottom: 0,
    top: 0,
  },
  backRightBtnLeft: {
    backgroundColor: 'blue',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
  },
});

export default ChatsScreen;
