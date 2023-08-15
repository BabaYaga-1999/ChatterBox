import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, Image, TextInput } from 'react-native';
import { auth } from '../utils/Firebase';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ProfileScreen = () => {
  const [locationSharing, setLocationSharing] = useState(false);
  const [reminder, setReminder] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (reminder) {
      requestPermissionsAndSchedule();
    } else {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  }, [reminder]);

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

  const requestPermissionsAndSchedule = async () => {
    const { status } = await Notifications.requestPermissionsAsync({
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    });

    if (status === 'granted') {
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Immediately notify once
      await Notifications.presentNotificationAsync({
        title: "Hey!",
        body: "Check out new interesting posts from your friends!",
        data: { screen: 'DiscoverScreen' },
        android: {
          channelId: 'default',
        },
        ios: {
          sound: true,
        }
      });

      // Schedule repeated notifications
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hey!",
          body: "Check out new interesting posts from your friends!",
          data: { screen: 'DiscoverScreen' },
          android: {
            channelId: 'default',
          },
          ios: {
            sound: true,
          }
        },
        trigger: {
          // seconds: 6 * 60 * 60, // 6 hours
          seconds: 60, // 6 hours
          repeats: true,
        }
      });
    } else {
      console.warn('Notification permissions not granted');
    }
  };

  return (
    <View>
      {/* <Image source={{ uri: 'user_avatar_url' }} style={{ width: 100, height: 100, borderRadius: 50 }} /> */}
      <TextInput placeholder="Your name..." />
      <TextInput placeholder="Your bio..." multiline />
      
      <Text>Share Location:</Text>
      <Switch value={locationSharing} onValueChange={setLocationSharing} />
      
      <Text>Discover Reminder:</Text>
      <Switch value={reminder} onValueChange={newValue => setReminder(newValue)} />

      {/* Sign Out Button */}
      <TouchableOpacity onPress={handleSignOut} style={{ marginTop: 20, alignSelf: 'center' }}>
        <Text style={{ color: 'red' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;
