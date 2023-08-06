import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ChatsScreen from '../screens/ChatsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { TouchableOpacity, View } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import Styles from '../styles/Styles';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
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
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('Add Entry')}>
            <View style={{ marginRight: 15 }}>
              <Entypo name="plus" size={24} color="black" />
            </View>
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
