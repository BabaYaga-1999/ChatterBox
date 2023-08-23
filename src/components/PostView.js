import { Button, Image, StyleSheet, Text, View, Alert } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import PressButton from './PressButton';
import { collection, query, where, getDoc, doc, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { db, auth, storage } from '../utils/Firebase';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity, BottomSheetScrollView, useBottomSheet } from '@gorhom/bottom-sheet';
import { getStorage, ref, deleteObject } from "firebase/storage";


export default function PostView({post}) {
  const [user, setUser] = useState();
  var color = "red";
  var image = require('../images/default_avatar.png');
  const {close} = useBottomSheet();

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
      return false;
    }

  }
  function deletePost(id){
    for(let i=0; i<post.photoList.length; i++){
      const position = post.photoList[i].search("user_posts%2F");
      const str = "user_posts/"+post.photoList[i].slice(position+13, position+46+13)
      deleteObject(ref(storage,str))
    }
    close()
    deleteDoc(doc(db, "posts", id))
  }

  return (
    <BottomSheetScrollView contentContainerStyle={styles.contentContainer} >
      <View style={styles.profile}>
        <View style={styles.nameContainer} >
          <Image
            style={styles.stretch}
            source={image}
          />
          <Text style={styles.text}>{user?.data().name}</Text>
        </View>
        {
          notShowButton() ? <Text style={styles.followed}>{post.authorId==auth.currentUser.uid ? "Yourself" : "Followed"}</Text> : <PressButton text='follow' width={80} handlePress={()=>sendFriendRequest(user)}/>
        }
      </View>
      <ScrollView style={styles.photoContainer} horizontal={true} >
        {
          post.photoList?.map((photo)=>{

            return <Image style={styles.image} source={{uri:photo}} />  
          })
        }
      </ScrollView>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.description}>{post.description}</Text>
      {
        post.authorId==auth.currentUser.uid ? 
        <TouchableOpacity onPress={()=>deletePost(post.key)}>
          <Text style={styles.delete}>DELETE</Text>
        </TouchableOpacity> : <></>
      }
      
    </BottomSheetScrollView>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
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
  },
  image: {
    minHeight:210,
    minWidth:150,
  },
  photoContainer: {
    flexDirection:"row",
    flexWrap:"wrap",

  },
  delete: {
    fontSize:20,
    color:"red",
    marginTop: 20
  }
})