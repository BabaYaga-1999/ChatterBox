import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import ChatsScreen from '../screens/ChatsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { TouchableOpacity, View, Alert } from 'react-native';
import Styles from '../styles/Styles';
import CreatePost from '../screens/CreatePost';
import { collection, addDoc, query, where, getDoc, getDocs, doc, onSnapshot, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../utils/Firebase';

const Tab = createBottomTabNavigator();

const TabNavigator = ({ navigation }) => {
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const friendRequestsRef = collection(db, 'friendRequests');
    const requestsToMeQuery = query(friendRequestsRef, where("to", "==", auth.currentUser.uid));

    const unsubscribe = onSnapshot(requestsToMeQuery, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFriendRequests(requests);
    });

    return () => unsubscribe();
  }, []);

  const getCurrentUserName = async () => {
    const userEmail = auth.currentUser.email;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const currentUserDoc = querySnapshot.docs[0];
      return currentUserDoc.data().name;
    }

    // Handle case where user is not found in Firestore (this shouldn't happen normally)
    throw new Error('Current user not found in Firestore.');
  };
  
  const addFriend = async (userDoc) => {
    try {
      const friendToAdd = {
        id: userDoc.id,
        email: userDoc.data().email,
        name: userDoc.data().name,
      };

      const currentUserRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(currentUserRef, {
        friends: arrayUnion(friendToAdd)
      });

      const currentUserName = await getCurrentUserName();
      const currentUserInfo = {
        id: auth.currentUser.uid,
        email: auth.currentUser.email,
        name: currentUserName
      };

      const userDocRef = doc(db, 'users', userDoc.id);
      await updateDoc(userDocRef, {
        friends: arrayUnion(currentUserInfo)
      });
    } catch (error) {
      console.error("Error updating friend list:", error);
    }
  }

  const handleFriendRequest = async (request) => {
    try {
      const senderDocRef = doc(db, 'users', request.from);
      const senderDoc = await getDoc(senderDocRef);
      const senderData = senderDoc.data();
      
      Alert.alert(
        "Friend Request",
        `${senderData.name} wants to add you as a friend.`,
        [
          {
            text: "Decline",
            onPress: async () => {
              await deleteDoc(doc(db, 'friendRequests', request.id));
            }
          },
          {
            text: "Accept",
            onPress: async () => {
              // Add each other as friends
              await addFriend(senderDoc);
              
              // Remove the friend request
              await deleteDoc(doc(db, 'friendRequests', request.id));
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
        // headerShown: route.name === 'Friends' || route.name === "Discover" || route.name === "Chats" ? false : true,
      })}
    >
      <Tab.Screen 
        name="Chats" 
        component={ChatsScreen} 
      />
      <Tab.Screen 
        name="Friends"
        component={FriendsScreen}
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {friendRequests.length > 0 && (
                <Ionicons 
                  name="people-circle-outline" 
                  size={24} 
                  color="black" 
                  onPress={() => handleFriendRequest(friendRequests[0])}
                  style={{ marginRight: 15 }}
                />
              )}
              <TouchableOpacity onPress={() => navigation.navigate('Add Friend')}>
                <View style={{ marginRight: 15 }}>
                  <Entypo name="plus" size={24} color="black" />
                </View>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Create Post')}>
              <View style={{ marginRight: 15 }}>
                <Entypo name="plus" size={24} color="black" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
