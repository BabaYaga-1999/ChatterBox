
import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Image, TextInput } from 'react-native';

const ProfileScreen = () => {
  const [locationSharing, setLocationSharing] = useState(false);
  const [reminder, setReminder] = useState(false);

  return (
    <View>
      {/* <Image source={{ uri: 'user_avatar_url' }} style={{ width: 100, height: 100, borderRadius: 50 }} /> */}
      <TextInput placeholder="Your name..." />
      <TextInput placeholder="Your bio..." multiline />
      
      <Text>Share Location:</Text>
      <Switch value={locationSharing} onValueChange={setLocationSharing} />
      
      <Text>Learning Reminder:</Text>
      <Switch value={reminder} onValueChange={setReminder} />
      {/* maybe add a time picker for the reminder time */}
    </View>
  );
};

export default ProfileScreen;
