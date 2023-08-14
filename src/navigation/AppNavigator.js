import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ChatScreen from '../screens/ChatScreen';
import SearchScreen from '../screens/SearchScreen';
import CreatePost from '../screens/CreatePost';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/Firebase";

const Stack = createStackNavigator();
const MainStack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
          headerBackTitle: ' ',
        }}
    >
      <MainStack.Screen 
        name="HomeTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="Chat" 
        component={ChatScreen} 
      />
      <MainStack.Screen 
        name="Add Friend" 
        component={SearchScreen} 
      />
      <MainStack.Screen 
        name="Create Post" 
        component={CreatePost}
      />
    </MainStack.Navigator>
  );
};

const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [initializing]);

  if (initializing) {
    return null;  // or a loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerBackTitle: ' ',
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
        <Stack.Screen 
          name="Home" 
          component={MainStackNavigator} 
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
