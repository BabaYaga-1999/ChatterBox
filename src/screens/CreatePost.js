import {TextInput, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import PressButton from '../components/PressButton'
import colors from "../styles/Color"
import { Ionicons } from '@expo/vector-icons';
import { writeToDB } from '../utils/FirestoreHelper';
import * as Location from 'expo-location';

export default function CreatePost({navigation}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function reset(){
    setTitle("");
    setDescription("");
  }
  async function submit(){
    var overLimit = false;
    if (!title){
      alert("Invalid title input");
      return;
    }
    if (!description){
      alert("Invalid description");
      return;
    }
    let gps = await Location.getCurrentPositionAsync({});
    console.log(gps)

    writeToDB({title, description, gps});
    reset();
    navigation.goBack();
  }

  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.text}>Title </Text>
        <TextInput style={[styles.input, styles.text]} onChangeText={(text)=>setTitle(text)} value={title}/>
      </View>
      <View style={styles.container}>
        <Text style={styles.text}>Description </Text>
        <TextInput style={[styles.input, styles.text, styles.description]} multiline={true} textAlignVertical="top" onChangeText={(text)=>setDescription(text)} value={description}/>
      </View>
      <View style={[styles.container, styles.buttonContainer]}>
        <PressButton handlePress={reset} text="Reset" width={100}></PressButton>
        <PressButton handlePress={submit} text="Submit" width={100}></PressButton>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection:"row",
    justifyContent: "flex-end",
    marginRight: 30,
    marginTop: 20
  },
  text: {
    fontSize: 18,
    color: "black",
  },
  input: {
    backgroundColor: "white",
    width: 240,
    borderRadius: 7
  },
  description: {
    minHeight: 150,
  },
  buttonContainer: {
    marginRight: 0,
    justifyContent: "space-evenly",
  }
})