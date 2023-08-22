import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { auth, db } from '../utils/Firebase';
import { query, where, addDoc, getDocs, collection, updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';
import { searchStyles as styles } from '../styles/Styles'
import { AntDesign } from '@expo/vector-icons';
import PressButton from '../components/PressButton';
import { SwipeListView } from 'react-native-swipe-list-view';
import FriendItem from './FriendItem';

const SearchScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [searchResult, setSearchResult] = useState(null);

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

  const sendFriendRequest = async (userDoc, rowMap) => {
    try {
      const friendRequestsRef = collection(db, 'friendRequests');
      const existingRequestQuery = query(friendRequestsRef, where("from", "==", auth.currentUser.uid), where("to", "==", userDoc.id));
      const existingRequests = await getDocs(existingRequestQuery);

      if (!existingRequests.empty) {
        setMessage("You've already sent a friend request. Please wait for a response.");
        if (rowMap && rowMap[userDoc.id] && rowMap[userDoc.id].closeRow) {
            rowMap[userDoc.id].closeRow();
        }
        return;
      }

      await addDoc(friendRequestsRef, {
        from: auth.currentUser.uid,
        to: userDoc.id,
        timestamp: new Date().toISOString()
      });
      
      setMessage(`Friend request sent to ${userDoc.email}.`);
      if (rowMap && rowMap[userDoc.id] && rowMap[userDoc.id].closeRow) {
            rowMap[userDoc.id].closeRow();
        }
    } catch (error) {
      // console.error("Error sending friend request:", error);
      // setMessage("Failed to send friend request. Please try again.");
      if (rowMap && rowMap[userDoc.id] && rowMap[userDoc.id].closeRow) {
            rowMap[userDoc.id].closeRow();
        }
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

      // Set the search result
      setSearchResult({
        id: userDoc.id,
        name: userDoc.data().name,
        email: userDoc.data().email,
        // Add other fields if needed
      });

    } else {
      setMessage('User not found.');
      setSearchResult(null); // Clear previous search results
    }
  };

  const resetSearch = () => {
    setEmail('');  // clear input
    setSearchResult(null);
  }

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnRight]}
          onPress={() => {
            Alert.alert(
              "Add Friend",
              `Do you want to add ${data.item.name} as a friend?`,
              [
                {
                  text: "Cancel",
                  onPress: () => {
                    if (rowMap && rowMap[data.item.id] && rowMap[data.item.id].closeRow) {
                        rowMap[data.item.id].closeRow();
                    }
                  }
                },
                { 
                  text: "Yes", 
                  onPress: () => sendFriendRequest(data.item, rowMap)
                }
              ]
            );
          }}
      >
          <Text style={styles.backTextWhite}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  const searchResultData = searchResult ? [searchResult] : []; // Convert to array for FlatList

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
            setSearchResult(null);
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

      <SwipeListView
          data={searchResultData}
          renderItem={({ item }) => <FriendItem item={item} />}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-75}
          keyExtractor={item => item.id}
          disableRightSwipe
      />
    </View>
  );
};

export default SearchScreen;