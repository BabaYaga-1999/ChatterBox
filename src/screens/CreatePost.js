import {TextInput, StyleSheet, Text, View, Image } from 'react-native'
import React, { useState } from 'react'
import PressButton from '../components/PressButton'
import colors from "../styles/Color"
import { Ionicons } from '@expo/vector-icons';
import { writeToDB } from '../utils/FirestoreHelper';
import * as Location from 'expo-location';
import { auth, storage } from '../utils/Firebase';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from '@firebase/storage';

export default function CreatePost({navigation}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoList, setPhotoList] = useState([])

  function reset(){
    setTitle("");
    setDescription("");
    setPhotoList([])
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
    var uploadList=[];
    for(let i=0; i<photoList.length; i++){
      const photoUri = await uploadImage(photoList[i]);
      uploadList.push(photoUri);
    }
    writeToDB({title, description, gps, authorId: auth.currentUser.uid, photoList:uploadList});
    reset();
    navigation.goBack();
  }

  const handlePhotoOption = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status!="granted") return;
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        // upload the image to firebase storage
        setPhotoList([...photoList, result.assets[0].uri]);
    }
  };

  const uploadImage = async (uri) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const uniqueImageName = `${auth.currentUser.uid}_${new Date().getTime()}.jpg`;
        const imageRef = storageRef(storage, "user_posts/" + uniqueImageName);
        const uploadResult = await uploadBytesResumable(imageRef, blob);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        return downloadURL;

    } catch (error) {
        console.error("Error in uploadImage:", error);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.text}>Title </Text>
        <TextInput style={[styles.input, styles.text]} onChangeText={(text)=>setTitle(text)} value={title}/>
      </View>
      <View style={styles.container}>
        <Text style={styles.text}>Description </Text>
        <TextInput style={[styles.input, styles.text, styles.description]} multiline={true} textAlignVertical="top" onChangeText={(text)=>setDescription(text)} value={description}/>
      </View>
      <View style={styles.photoContainer}>
        {
          photoList.map((photo)=>{
            return <Image style={styles.image} source={{uri:photo}} />  
          })
        }
        <TouchableOpacity onPress={handlePhotoOption}>
          <Image style={styles.image} source={require('../images/add-photo.jpg')} />
        </TouchableOpacity>
      </View>
      <View style={[styles.container, styles.buttonContainer]}>
        <PressButton handlePress={reset} text="Reset" width={100}></PressButton>
        <PressButton handlePress={submit} text="Submit" width={100}></PressButton>
      </View>
    </ScrollView>
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
  },
  image: {
    height:120,
    width:120,
  },
  photoContainer: {
    flexDirection:"row",
    flexWrap: "wrap"
  }
})