import { Button, Image, StyleSheet, Text, View, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import PressButton from './PressButton';
import { collection, query, where, getDoc, doc, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from '../utils/Firebase';

export default function PostView({post}) {
  const [user, setUser] = useState();
  var color = "red";
  var image = require('../images/default_avatar.png');
  try{
    if(user.data().avatar){
      image={uri:user.data().avatar}
    }
    if(user.friends.some(friend => friend.id === post.authorId)){
      color = "green"
    }
    if(post.authorId==auth.currentUser.id){
      color = "black"
    }
  }catch{}

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

  function notShowButton(){
    try{
      if(user.data().friends.some(friend => friend.id == auth.currentUser.uid) || post.authorId==auth.currentUser.uid){
        return true;
      }
      else{
        return false;
      }
    } catch{
      console.log(111)
      return false;
    }

  }
  
  return (
    <View style={styles.contentContainer} >
      <View style={styles.profile}>
        <View style={styles.nameContainer} >
          <Image
            style={styles.stretch}
            source={image}
          />
          <Text style={styles.text}>{user?.data().name}</Text>
        </View>
        {
          notShowButton() ? <Text style={styles.followed}>{post.authorId==auth.currentUser.uid ? "" : "Followed"}</Text> : <PressButton text='follow' width={80} handlePress={()=>sendFriendRequest(user)}/>
        }
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
  nameContainer: {
    flexDirection:"row"
  },
  stretch: {
    height:40,
    width:40,
    borderRadius:100
  },
  profile: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent: "space-between",
    width:"100%"
  },
  text: {
    fontSize: 27,
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
  },
  followed: {
    fontSize:18,
    color:"#a8a8a8"
  }
})