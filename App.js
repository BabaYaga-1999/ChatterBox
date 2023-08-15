import React, { useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';

const App = () => {
  const navigationRef = useRef();
  
  useEffect(() => {
    // init notification listener
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Received notification: ', notification);
    });

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

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
