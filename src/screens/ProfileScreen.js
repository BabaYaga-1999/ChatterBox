import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Image, TextInput } from 'react-native';
import { auth } from '../utils/Firebase';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [locationSharing, setLocationSharing] = useState(false);
  const [reminder, setReminder] = useState(false);
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
      
      {/* Sign Out Button */}
      <TouchableOpacity onPress={handleSignOut} style={{ marginTop: 20, alignSelf: 'center' }}>
        <Text style={{ color: 'red' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;
