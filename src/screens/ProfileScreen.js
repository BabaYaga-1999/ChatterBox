import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { auth, db, storage } from '../utils/Firebase';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from '@firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { EvilIcons } from '@expo/vector-icons';
import DialogInput from 'react-native-dialog-input';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ProfileScreen = () => {

  const [reminder, setReminder] = useState(false);
  const navigation = useNavigation();
  const [user, setUser] = useState();
  const [refresh, setRefresh] = useState(true);
  const [visible, setVisible] = useState(false);
  var image = require('../images/default_avatar.png')

  try{
    if(user.data().avatar){
      image={uri:user.data().avatar}
    }
    
  }catch{}
  useEffect(()=>{
    (async () => {
      const tempUser = await getDoc(doc(db, "users", auth.currentUser.uid))
      setUser(tempUser);

    })();
  }, [refresh])

  function createThreeButtonAlert(){ 
    Alert.alert('Change avatar', 'Upload from', [
      {text: 'Cancel', onPress: () => {}},

      {text: 'Camera', onPress: handleCameraOption},

      {text: 'Gallery', onPress: handlePhotoOption},
    ])
  };

  const uploadImage = async (uri) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        const uniqueImageName = `${auth.currentUser.uid}.jpg`;
        const imageRef = storageRef(storage, "user_avatars/" + uniqueImageName);
            
        const uploadResult = await uploadBytesResumable(imageRef, blob);

        const downloadURL = await getDownloadURL(uploadResult.ref);
 
        await setDoc(doc(db, "users", auth.currentUser.uid), {avatar:downloadURL},{merge:true});
        setRefresh(!refresh)
    } catch (error) {
        console.error("Error in uploadImage:", error);
    }
  };

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
        uploadImage(result.assets[0].uri);
    }
  };

  const handleCameraOption = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (permission.status!="granted") return;
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
        // upload the image to firebase storage
      if (result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    }
  };

  useEffect(() => {
    if (reminder) {
      requestPermissionsAndSchedule();
    } else {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  }, [reminder]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const requestPermissionsAndSchedule = async () => {
    const { status } = await Notifications.requestPermissionsAsync({
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    });

    if (status === 'granted') {
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Immediately notify once
      await Notifications.presentNotificationAsync({
        title: "Hey!",
        body: "Check out new interesting posts from your friends!",
        data: { screen: 'DiscoverScreen' },
        android: {
          channelId: 'default',
        },
        ios: {
          sound: true,
        }
      });

      // Schedule repeated notifications
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hey!",
          body: "Check out new interesting posts from your friends!",
          data: { screen: 'DiscoverScreen' },
          android: {
            channelId: 'default',
          },
          ios: {
            sound: true,
          }
        },
        trigger: {
          // seconds: 6 * 60 * 60, // 6 hours
          seconds: 60, // 6 hours
          repeats: true,
        }
      });
    } else {
      console.warn('Notification permissions not granted');
    }
  };

  async function setInput(name){
    await setDoc(doc(db, "users", auth.currentUser.uid), {name:name}, {merge:true});
  }
  

  return (
    <View>
      <View style={styles.contentContainer}>
        <TouchableOpacity onPress={createThreeButtonAlert}>
          <Image style={styles.stretch} source={image} />
        </TouchableOpacity>
        
      </View>
      <View style={styles.nameContainer}>
        <Text style={styles.textName}>{user?.data().name}</Text>
        <TouchableOpacity onPress={()=>setVisible(!visible)}>
          <EvilIcons name="pencil" size={40} color="black" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.text}>{"Email: "+user?.data().email}</Text>
      <View style={styles.container}>
        <Text style={styles.text}>Discover Reminder</Text>
        <Switch value={reminder} onValueChange={newValue => setReminder(newValue)} />
      </View>


      {/* Sign Out Button */}
      <TouchableOpacity onPress={handleSignOut} style={{ marginTop: 20, alignSelf: 'center' }}>
        <Text style={{ color: 'red' }}>Sign Out</Text>
      </TouchableOpacity>
      <DialogInput 
        isDialogVisible={visible}
        title={"Change user name"}
        message={"Please type your new name"}
        hintInput ={"Enter Text"}
        initValueTextInput={user?.data().name}
        submitInput={ (inputText) => {
          setInput(inputText);
          setVisible(false);
          setRefresh(!refresh);
        }}
        closeDialog={() => setVisible(false)}>
      </DialogInput>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
  },
  container: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between"
  },
  nameContainer: {
    flexDirection:"row",
    alignItems:"baseline",
    justifyContent:"center",
    marginLeft: 40
  },
  stretch: {
    height:200,
    width:200,
    borderRadius:1000
  },
  textName: {
    fontSize:30,
    marginBottom:40
  },
  text: {
    fontSize:18,
  }
})
export default ProfileScreen;
