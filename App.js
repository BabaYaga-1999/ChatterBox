import React, { useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const navigationRef = useRef();
  
  useEffect(() => {
    // init notification listener
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Received notification: ', notification);
    });

    // request permissions and schedule notification
    requestPermissionsAndSchedule();

    const notificationTapSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const targetScreen = response.notification.request.content.data.screen;

      if (targetScreen === 'DiscoverScreen') {
        navigationRef.current?.navigate('Home', { screen: 'HomeTabs', params: { screen: 'Discover' } });
      }
    });

    return () => {
      // clean up listeners
      subscription.remove();
      notificationTapSubscription.remove();
    };
  }, []);

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
      
      // Cancel all scheduled notifications before setting a new one
      // await Notifications.cancelAllScheduledNotificationsAsync();

      scheduleNotification();
    } else {
      console.warn('Notification permissions not granted');
    }
  };
  
  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hey!",
        body: "Check out new interesting posts from your friends!",
        data: { screen: 'DiscoverScreen' },
        android: {
          channelId: 'default',
        },
        ios: {
          sound: true, // plays a sound on notification
        }
      },
      trigger: {
        seconds: 6 * 60 * 60, // 6 hours
        // seconds: 60, // 1 minute
        repeats: true,
      }
    });
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
