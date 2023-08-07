import React from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';

const ChatScreen = ({ route, navigation }) => {
  // TODO: Fetch chat messages based on chatId from route.params.chatId
  // Let's assume chatMessages is the fetched data
  const chatMessages = []; // placeholder

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Display chat messages here */}
        <FlatList
          data={chatMessages}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row' }}>
              {/* Depending on whether the message is from the current user or friend, you can align the message to left or right */}
              <Text>{item.message}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
        <TextInput
          style={{ flex: 1, borderColor: 'gray', borderWidth: 1, borderRadius: 5 }}
          placeholder="Type a message..."
        />
        {/* Add other functionalities like send images, location, etc. next to this input */}
        <Button title="Send" onPress={() => { /* Handle sending the message */ }} />
      </View>
    </View>
  );
};

export default ChatScreen;