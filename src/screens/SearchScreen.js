import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { auth, db } from '../utils/Firebase';
import { query, where, addDoc, getDocs, collection, updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';
import { searchStyles as styles } from '../styles/Styles'
import { AntDesign } from '@expo/vector-icons';
import PressButton from '../components/PressButton';

const SearchScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

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
      // add friend to current user's friend list
      const friendToAdd = {
        id: userDoc.id,
        email: userDoc.data().email,
        name: userDoc.data().name,
        // ... add other fields if necessary
      };

      const currentUserRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(currentUserRef, {
        friends: arrayUnion(friendToAdd)
      });

      // add current user to friend's friend list
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

      setMessage(`Successfully added ${userDoc.data().email} as a friend.`);
      // Automatically go back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error("Error updating friend list:", error);
      setMessage("Failed to add friend. Please try again.");
    }
  }

  const sendFriendRequest = async (userDoc) => {
    try {
      const friendRequestsRef = collection(db, 'friendRequests');
      const existingRequestQuery = query(friendRequestsRef, where("from", "==", auth.currentUser.uid), where("to", "==", userDoc.id));
      const existingRequests = await getDocs(existingRequestQuery);

      if (!existingRequests.empty) {
        setMessage("You've already sent a friend request. Please wait for a response.");
        return;
      }

      await addDoc(friendRequestsRef, {
        from: auth.currentUser.uid,
        to: userDoc.id,
        timestamp: new Date().toISOString()
      });
      
      setMessage(`Friend request sent to ${userDoc.data().email}.`);
    } catch (error) {
      console.error("Error sending friend request:", error);
      setMessage("Failed to send friend request. Please try again.");
    }
  }

  const searchFriendByEmail = async () => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];

      if (auth.currentUser.uid === userDoc.id) {
        setMessage("You can't add yourself as a friend.");
        return;
      }

      const currentUserRef = doc(db, 'users', auth.currentUser.uid);
      const currentUserDoc = await getDoc(currentUserRef);
      const currentFriends = currentUserDoc.data().friends || [];

      if (currentFriends.some(friend => friend.id === userDoc.id)) {
        setMessage(`${userDoc.data().email} is already your friend.`);
        return;
      }

      // Prompt to confirm the addition of the friend
      Alert.alert(
        "Add Friend",
        `Do you want to add ${userDoc.data().name} as a friend?`,
        [
          {
            text: "Cancel",
          },
          { 
            text: "Yes", 
            onPress: () => sendFriendRequest(userDoc)
          }
        ]
      );
    } else {
      setMessage('User not found.');
    }
  };

  const resetSearch = () => {
    setEmail('');  // clear input
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={20} color="#aaa" style={styles.searchIcon} />
        <TextInput 
          placeholder="Enter User Email"
          placeholderTextColor="#aaa" 
          value={email} 
          onChangeText={(text) => {
            setEmail(text);
            if (message) setMessage('');
          }}
          style={styles.searchInput} 
          autoCapitalize='none'
        />
      </View>
      <View style={styles.buttonContainer}>
        <PressButton text="Reset" handlePress={resetSearch} width="30%" />
        <PressButton text="Search" handlePress={searchFriendByEmail} width="30%" />
      </View>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

export default SearchScreen;