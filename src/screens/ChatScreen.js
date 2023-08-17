import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth, storage } from '../utils/Firebase';
import { SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { chatStyles as styles } from '../styles/Styles';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from '@firebase/storage';

import MessageList from '../chatUtils/MessageList';
import AttachmentOptions from '../chatUtils/AttachmentOptions';
import MessageInput from '../chatUtils/MessageInput';

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userDeletionTimestamp, setUserDeletionTimestamp] = useState(null);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const { chatId, friendName } = route.params;
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  useEffect(() => {
    let unsubscribe = null;

    const checkFriendshipStatus = async () => {
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        const members = chatDoc.data().members;
        const friendId = members.find(id => id !== auth.currentUser.uid);

        const friendRef = doc(db, 'users', friendId);
        unsubscribe = onSnapshot(friendRef, (friendDoc) => {
            if (!friendDoc.exists()) {
                console.error("Friend doesn't exist:", friendId);
                return;
            }

            const friendList = friendDoc.data().friends || [];
            const currentUserInFriendList = friendList.find(f => f.id === auth.currentUser.uid);

            if (!currentUserInFriendList) {
                setCanSendMessage(false);
            } else {
                setCanSendMessage(true);
            }
        });
    };

    checkFriendshipStatus();
    
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [chatId]);

  useEffect(() => {
    navigation.setOptions({ title: friendName });
  }, [friendName, navigation]);

  useEffect(() => {
    const fetchChatDeletionTimestamp = async () => {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      const deletionData = chatDoc.data().deletedBy;
      const currentUserDeletion = deletionData.find(item => item.uid === auth.currentUser.uid);
      if (currentUserDeletion) {
        setUserDeletionTimestamp(currentUserDeletion.timestamp);
      }
    };
    fetchChatDeletionTimestamp();
  }, [chatId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chats', chatId, 'messages'), (snapshot) => {
      let fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      if (userDeletionTimestamp) {
        fetchedMessages = fetchedMessages.filter(message => 
          new Date(message.createdAt).getTime() > userDeletionTimestamp
        );
      }
      fetchedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, [chatId, userDeletionTimestamp]);

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessage = {
          text: input,
          createdAt: new Date().toISOString(),
          userId: auth.currentUser.uid,
      };

      await addDoc(collection(db, 'chats', chatId, 'messages'), newMessage);

      // Update the chat's lastMessage and lastMessageTime fields
      await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: input,
          lastMessageTime: newMessage.createdAt,
      });

      // When a new message is sent, mark the chat as inactive for all users
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
          const deletedByData = chatDoc.data().deletedBy;
          const updatedDeletedBy = deletedByData.map(user => ({
              ...user,
              active: false
          }));

          await updateDoc(chatRef, {
              deletedBy: updatedDeletedBy
          });
      }

      setInput('');
      }
  };

  const checkIfInFriendList = async () => {
    try {
      // 获取当前聊天的成员
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) {
        console.error("Chat doesn't exist:", chatId);
        return;
      }

      const members = chatDoc.data().members;
      // 获取对方的ID
      const friendId = members.find(id => id !== auth.currentUser.uid);

      // 检查对方的朋友列表
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (!friendDoc.exists()) {
        console.error("Friend doesn't exist:", friendId);
        return;
      }

      const friendList = friendDoc.data().friends;
      const currentUserInFriendList = friendList.find(f => f.id === auth.currentUser.uid);

      // 如果当前用户不在对方的朋友列表中，弹出警告
      if (!currentUserInFriendList) {
        Alert.alert(
          "Friend removed you",
          "You have been removed from this friend's list. Do you also want to remove this friend?",
          [
            {
              text: "Yes",
              onPress: async () => {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (!userDoc.exists()) {
                  console.error("User doesn't exist:", auth.currentUser.uid);
                  return;
                }

                const userFriends = userDoc.data().friends;
                const updatedFriends = userFriends.filter(friend => friend.id !== friendId);
                await updateDoc(doc(db, 'users', auth.currentUser.uid), { friends: updatedFriends });

                // Delete the chat from Firebase
                const chatRef = doc(db, 'chats', chatId);
                await deleteDoc(chatRef);

                navigation.goBack();
                }
            },
            {
              text: "No, I want to keep the chat",
              onPress: () => {
                setCanSendMessage(false);
              }
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error("Error checking if current user is in friend's list:", error);
    }
  };

  useEffect(() => {
      checkIfInFriendList();
  }, []);

  const requestImagePermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return false;
    }
    return true;
  };
  
  const uploadImage = async (uri) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        const uniqueImageName = `${auth.currentUser.uid}_${new Date().getTime()}.jpg`;
        const imageRef = storageRef(storage, "chat_images/" + uniqueImageName);
        const uploadResult = await uploadBytesResumable(imageRef, blob);

        const downloadURL = await getDownloadURL(uploadResult.ref);
        const newMessage = {
            imageUrl: downloadURL,
            createdAt: new Date().toISOString(),
            userId: auth.currentUser.uid,
        };
        await addDoc(collection(db, 'chats', chatId, 'messages'), newMessage);
    } catch (error) {
        console.error("Error in uploadImage:", error);
    }
  };

  const handlePhotoOption = async () => {
    const permission = await requestImagePermissions();
    if (!permission) return;
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
    const permission = await requestCameraPermissions();
    if (!permission) return;
    let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });

    if (!result.canceled) {
        // upload the image to firebase storage
        if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
  }
    }
  };
  
  const handleLocationOption = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
    }
    // will take a few seconds to fetch the location
    let location = await Location.getCurrentPositionAsync({});
    if (!location || !location.coords) {
      Alert.alert('Error', 'Unable to fetch the location.');
      return;
    }

    // Confirm with the user before sending the location
    Alert.alert(
      'Send Location',
      'Do you want to send your location to the user?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Send', 
          onPress: async () => {
            // you can send location.coords.latitude and location.coords.longitude to firebase
            const newMessage = {
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                },
                createdAt: new Date().toISOString(),
                userId: auth.currentUser.uid,
            };
            console.log(location);
            await addDoc(collection(db, 'chats', chatId, 'messages'), newMessage);
          }
        }
      ],
      { cancelable: false }
    );
  };

return (
  <SafeAreaView style={styles.SafeAreaView}>
    <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 95 : 95}
  >
    <MessageList messages={messages} friendName={friendName} auth={auth} />
    <MessageInput 
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        canSendMessage={canSendMessage}
        toggleAttachmentOptions={() => setShowAttachmentOptions(!showAttachmentOptions)}
    />
    {showAttachmentOptions && 
        <AttachmentOptions 
            handlePhotoOption={handlePhotoOption}
            handleCameraOption={handleCameraOption}
            handleLocationOption={handleLocationOption}
        />
    }
    </KeyboardAvoidingView>
  </SafeAreaView>
);
};

export default ChatScreen;
