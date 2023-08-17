import { Button, Image, StyleSheet, Text, View, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import PressButton from './PressButton';
import { collection, query, where, getDoc, doc, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from '../utils/Firebase';

export default function PostView({post}) {
  const [user, setUser] = useState();

  var image = require('../images/Unknown_person.jpg');
  const sendFriendRequest = async (userDoc) => {
    try {
      const friendRequestsRef = collection(db, 'friendRequests');
      const existingRequestQuery = query(friendRequestsRef, where("from", "==", auth.currentUser.uid), where("to", "==", userDoc.id));
      const existingRequests = await getDocs(existingRequestQuery);

      if (!existingRequests.empty) {
        Alert.alert("You've already sent a friend request");
        return;
      }

      await addDoc(friendRequestsRef, {
        from: auth.currentUser.uid,
        to: userDoc.id,
        timestamp: new Date().toISOString()
      });
      
      Alert.alert(`Friend request sent to ${userDoc.data().email}.`);
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Failed to send friend request. Please try again.");
    }
  }
  useEffect(()=>{
    (async () => {
      const tempUser = await getDoc(doc(db, "users", post.authorId))
      setUser(tempUser);

    })();
  }, [post])

  if (post.avatar){
    image=post.avatar
  }
  
  return (
    <View style={styles.contentContainer} >
      <View style={styles.profile}>
        <Image
          style={styles.stretch}
          source={image}
        />
        <Text style={styles.text}>{user?.data().name}</Text>
        <PressButton text='follow' width={70} handlePress={()=>sendFriendRequest(user)}/>
      </View>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.description}>{post.description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stretch: {
    height:47,
    width:47,
    borderRadius:100
  },
  profile: {
    flexDirection:"row"
  },
  text: {
    fontSize: 18,
    color: "green",
    maxWidth: 200,
  },
  button: {
    borderRadius:10,
  },
  title: {
    fontSize: 24
  },
  description: {
    fontSize: 17
  }
})