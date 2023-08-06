import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';

const postsData = [
  // 示例数据
  { id: '1', name: 'John', postText: 'This is a tweet.' },
  // ... add more posts here
];

const DiscoverScreen = () => {
  const renderItem = ({ item }) => (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: item.avatar }} style={{ width: 30, height: 30, borderRadius: 15 }} />
        <Text>{item.name}</Text>
      </View>
      <Image source={{ uri: item.postImage }} style={{ width: '100%', height: 200 }} />
      <Text>{item.postText}</Text>
      <TouchableOpacity onPress={() => { /* interaction with ChatGPT */ }}>
        <Text>Translate</Text>
      </TouchableOpacity>
      {/* add more interactions */}
    </View>
  );

  return (
    <View>
      <TouchableOpacity onPress={() => { /* open camera or gallery */ }}>
        <Text>Post a new tweet</Text>
      </TouchableOpacity>
      <FlatList
        data={postsData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default DiscoverScreen;
