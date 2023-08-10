import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ChatsScreen from '../screens/ChatsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import ChatScreen from '../screens/ChatScreen';
import { TouchableOpacity, View } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import Styles from '../styles/Styles';
import CreatePost from '../screens/CreatePost';

const Tab = createBottomTabNavigator();
const FriendStack = createStackNavigator();
const DiscoverStack = createStackNavigator();
const ChatStack = createStackNavigator();

const ChatStackNavigator = () => {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen 
        name="Chats List" 
        component={ChatsScreen} 
      />
      <ChatStack.Screen 
        name="Chat" 
        component={ChatScreen}
      />
    </ChatStack.Navigator>
  );
};

const FriendStackNavigator = () => {
  return (
    <FriendStack.Navigator>
      <FriendStack.Screen 
        name="Friends List" 
        component={FriendsScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Search Friend')}>
              <View style={{ marginRight: 15 }}>
                <Entypo name="plus" size={24} color="black" />
              </View>
            </TouchableOpacity>
          ),
        })}
      />
      <FriendStack.Screen name="Search Friend" component={SearchScreen} />
      <FriendStack.Screen 
        name="Chat" 
        component={ChatScreen} 
      />
    </FriendStack.Navigator>
  );
};

const DiscoverStackNavigator = () => {
  return (
    <DiscoverStack.Navigator>
      <DiscoverStack.Screen 
        name="Discover Screen" 
        component={DiscoverScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Create Post')}>
              <View style={{ marginRight: 15 }}>
                <Entypo name="plus" size={24} color="black" />
              </View>
            </TouchableOpacity>
          ),
        })}
      />
    <DiscoverStack.Screen name="Create Post" component={CreatePost} />
  </DiscoverStack.Navigator>
  )
}

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarVisible: route.name !== 'Chat',  // Hide tabBar for Chat screen
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
              case 'Chats':
                return <Ionicons name="chatbubble-ellipses" size={size} color={color} />;
              case 'Friends':
                return <Ionicons name="people" size={size} color={color} />;
              case 'Discover':
                return <Ionicons name="compass" size={size} color={color} />;
              case 'Profile':
                return <Ionicons name="person-circle" size={size} color={color} />;
              default:
                return;
          }
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: Styles.tabBarLabel,
        headerTitleAlign: 'center',
        headerShown: route.name === 'Friends' || route.name==="Discover" || route.name==="Chats"? false : true,
        // headerRight: () => (
        //   <TouchableOpacity onPress={() => navigation.navigate('Add Entry')}>
        //     <View style={{ marginRight: 15 }}>
        //       <Entypo name="plus" size={24} color="black" />
        //     </View>
        //   </TouchableOpacity>
        // ),
      })}
    >
      <Tab.Screen name="Chats" component={ChatStackNavigator} />
      <Tab.Screen name="Friends" component={FriendStackNavigator} />
      <Tab.Screen name="Discover" component={DiscoverStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
