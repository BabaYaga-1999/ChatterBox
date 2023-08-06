import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';

const friendsData = [
  // 示例数据
  { id: '1', name: 'John' },
  // ... add more friends here
];

const FriendsScreen = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => { /* navigate to chat */ }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: item.avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
        <Text>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <TextInput placeholder="Search for friends..." />
      <FlatList
        data={friendsData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default FriendsScreen;
