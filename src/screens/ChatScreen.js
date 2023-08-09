import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { collection, addDoc, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../utils/Firebase';

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const { chatId } = route.params;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chats', chatId, 'messages'), (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMessages(fetchedMessages.reverse());
    });

    return () => unsubscribe();
  }, [chatId]);

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
