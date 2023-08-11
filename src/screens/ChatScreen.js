import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, addDoc, onSnapshot, updateDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../utils/Firebase';
import { SafeAreaView } from 'react-native';

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userDeletionTimestamp, setUserDeletionTimestamp] = useState(null);
  const flatListRef = useRef(null);

  const { chatId, friendName } = route.params;

  useEffect(() => {
    // Set the friend's name as the header title when the component mounts
    navigation.setOptions({ title: friendName });
  }, [friendName, navigation]);

  useEffect(() => {
    // Fetch the chat document to get the deletedBy data for the current user
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

  // Fetch messages from the database
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chats', chatId, 'messages'), (snapshot) => {
      let fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
      // Filter messages that were sent before the user deleted the chat
      if (userDeletionTimestamp) {
        fetchedMessages = fetchedMessages.filter(message => 
          new Date(message.createdAt).getTime() > userDeletionTimestamp
        );
      }

      // Sort messages by createdAt to ensure they're displayed in order
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

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  // Scroll to the bottom of the FlatList when a new message is sent
  const scrollToBottom = () => {
    if (messages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: true });
    }
};

return (
  <SafeAreaView style={{ flex: 1 }}>
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
          <Text style={{ textAlign: 'center', color: 'grey' }}>{formatTimestamp(item.createdAt)}</Text>
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

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    // backgroundColor: 'white'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    marginBottom: 5
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
  }
});

export default ChatScreen;
