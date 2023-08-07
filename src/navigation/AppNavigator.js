import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ChatsScreen from '../screens/ChatsScreen';
import Chatcreen from '../screens/ChatScreen';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/Firebase";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // trigger when auth state changes
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });

    // Unsubscribe on cleanup
    return subscriber;
  }, [initializing]);

  if (initializing) {
    return null;  // or a loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
      }}
  >
    {!user ? (
      <>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Login/SignUp' }}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen}
          options={{ title: 'SignUp' }}
        />
      </>
    ) : (
      <>
        <Stack.Screen 
          name="Home" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ChatsScreen" component={ChatsScreen} />
      </>
    )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
