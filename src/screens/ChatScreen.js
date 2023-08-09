import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { collection, addDoc, onSnapshot, updateDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../utils/Firebase';

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userDeletionTimestamp, setUserDeletionTimestamp] = useState(null);

  const { chatId } = route.params;

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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chats', chatId, 'messages'), (snapshot) => {
      let fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      // Filter messages that were sent before the user deleted the chat
      if (userDeletionTimestamp) {
          fetchedMessages = fetchedMessages.filter(message => 
              new Date(message.createdAt).getTime() > userDeletionTimestamp
          );
      }

      setMessages(fetchedMessages.reverse());
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

          // Log to see the current state of deletedByData
          console.log('Before Update:', deletedByData);

          const updatedDeletedBy = deletedByData.map(user => ({
              ...user,
              active: false
          }));

          // Log to see the updated state
          console.log('After Update:', updatedDeletedBy);

          await updateDoc(chatRef, {
              deletedBy: updatedDeletedBy
          });
      }

      setInput('');
      }
  };


  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row' }}>
              <Text>{item.text}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={{ flex: 1, borderColor: 'gray', borderWidth: 1, borderRadius: 5 }}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default ChatScreen;
