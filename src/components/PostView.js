import { Button, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import PressButton from './PressButton';
import { collection, query, where, getDoc, doc } from "firebase/firestore";
import { db, auth } from '../utils/Firebase';

export default function PostView({post}) {
  const [user, setUser] = useState();

  var image = require('../images/Unknown_person.jpg');
  useEffect(()=>{
    (async () => {
      const tempUser = await getDoc(doc(db, "users", post.authorId))
      setUser(tempUser);
      console.log(tempUser.data())
    })();
  }, [])

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
        <PressButton text='follow' width={70} handlePress={{}}/>
      </View>
      <Text style={styles.title}>{post.title}</Text>
      <Text>{post.description}</Text>
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
  }
})