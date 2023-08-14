import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../utils/Firebase';
import { SafeAreaView } from 'react-native';

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userDeletionTimestamp, setUserDeletionTimestamp] = useState(null);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const flatListRef = useRef(null);
  const { chatId, friendName } = route.params;

  useEffect(() => {
    let unsubscribe = null;

    const checkFriendshipStatus = async () => {
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        const members = chatDoc.data().members;
        const friendId = members.find(id => id !== auth.currentUser.uid);

        const friendRef = doc(db, 'users', friendId);
        unsubscribe = onSnapshot(friendRef, (friendDoc) => {
            if (!friendDoc.exists()) {
                console.error("Friend doesn't exist:", friendId);
                return;
            }

            const friendList = friendDoc.data().friends || [];
            const currentUserInFriendList = friendList.find(f => f.id === auth.currentUser.uid);

            if (!currentUserInFriendList) {
                setCanSendMessage(false);
            } else {
                setCanSendMessage(true);
            }
        });
    };

    checkFriendshipStatus();
    
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [chatId]);

  useEffect(() => {
    navigation.setOptions({ title: friendName });
  }, [friendName, navigation]);

  useEffect(() => {
    const fetchChatDeletionTimestamp = async () => {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      const deletionData = chatDoc.data().deletedBy;
      const currentUserDeletion = deletionData.find(item => item.uid === auth.currentUser.uid);
      if (currentUserDeletion) {
        setUserDeletionTimestamp(currentUserDeletion.timestamp);
      }
    };
    fetchChatDeletionTimestamp();
  }, [chatId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chats', chatId, 'messages'), (snapshot) => {
      let fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      if (userDeletionTimestamp) {
        fetchedMessages = fetchedMessages.filter(message => 
          new Date(message.createdAt).getTime() > userDeletionTimestamp
        );
      }
      fetchedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, [chatId, userDeletionTimestamp]);

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessage = {
          text: input,
          createdAt: new Date().toISOString(),
          userId: auth.currentUser.uid,
      };

      await addDoc(collection(db, 'chats', chatId, 'messages'), newMessage);

      // Update the chat's lastMessage and lastMessageTime fields
      await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: input,
          lastMessageTime: newMessage.createdAt,
      });

      // When a new message is sent, mark the chat as inactive for all users
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
          const deletedByData = chatDoc.data().deletedBy;
          const updatedDeletedBy = deletedByData.map(user => ({
              ...user,
              active: false
          }));

          await updateDoc(chatRef, {
              deletedBy: updatedDeletedBy
          });
      }

      setInput('');
      }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();

    const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // If the message was sent today, only return the time
    if (date.toDateString() === today.toDateString()) {
      return { time: timeString };
    }

    // If the message was sent before today, return the date and time
    const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return {
      date: dateString,
      time: timeString
    };
  };

  // Scroll to the bottom of the FlatList when a new message is sent
  const scrollToBottom = () => {
    if (messages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const checkIfInFriendList = async () => {
    try {
      // 获取当前聊天的成员
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) {
        console.error("Chat doesn't exist:", chatId);
        return;
      }

      const members = chatDoc.data().members;
      // 获取对方的ID
      const friendId = members.find(id => id !== auth.currentUser.uid);

      // 检查对方的朋友列表
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (!friendDoc.exists()) {
        console.error("Friend doesn't exist:", friendId);
        return;
      }

      const friendList = friendDoc.data().friends;
      const currentUserInFriendList = friendList.find(f => f.id === auth.currentUser.uid);

      // 如果当前用户不在对方的朋友列表中，弹出警告
      if (!currentUserInFriendList) {
        Alert.alert(
          "Friend removed you",
          "You have been removed from this friend's list. Do you also want to remove this friend?",
          [
            {
              text: "Yes",
              onPress: async () => {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (!userDoc.exists()) {
                  console.error("User doesn't exist:", auth.currentUser.uid);
                  return;
                }

                const userFriends = userDoc.data().friends;
                const updatedFriends = userFriends.filter(friend => friend.id !== friendId);
                await updateDoc(doc(db, 'users', auth.currentUser.uid), { friends: updatedFriends });

                // Delete the chat from Firebase
                const chatRef = doc(db, 'chats', chatId);
                await deleteDoc(chatRef);

                navigation.goBack();
                }
            },
            {
              text: "No, I want to keep the chat",
              onPress: () => {
                setCanSendMessage(false);
              }
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error("Error checking if current user is in friend's list:", error);
    }
  };

  useEffect(() => {
      checkIfInFriendList();
  }, []);


return (
  <SafeAreaView style={styles.SafeAreaView}>
    <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 95 : 95}
  >
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={({ item }) => (
        <View style={{ padding: 10 }}>
          <View style={{ alignItems: 'center' }}>
            {formatTimestamp(item.createdAt).date && 
              <Text style={{ textAlign: 'center', color: 'grey' }}>{formatTimestamp(item.createdAt).date}</Text>
            }
            <Text style={{ textAlign: 'center', color: 'grey' }}>{formatTimestamp(item.createdAt).time}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {item.userId !== auth.currentUser.uid && <Text style={{ color: 'grey', fontWeight: 'bold', flex: 1 }}>{friendName}</Text>}
          </View>
          <View style={[
            styles.messageBox,
            item.userId === auth.currentUser.uid ? styles.rightMsg : styles.leftMsg
          ]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        </View>
      )}
      keyExtractor={(item) => item.id}
      onContentSizeChange={scrollToBottom}
      onLayout={scrollToBottom}
    />
      {canSendMessage && (
          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              style={styles.input}
              placeholder="Type a message..."
            />
            <Button title="Send" onPress={sendMessage} />
          </View>
        )}
    </KeyboardAvoidingView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'white'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    marginBottom: 5,
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    padding: 10,
  },
  messageBox: {
    padding: 10,
    borderRadius: 10,
    margin: 5,
    maxWidth: '75%',
  },
  leftMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD1DC',
    flex: 2
  },
  rightMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#A8E6CF',
    flex: 2  // Adjust flex for message alignment
  },
  messageText: {
    fontSize: 16,
  },
  SafeAreaView: {
    flex: 1,
    backgroundColor: 'white'
  }
});

export default ChatScreen;
