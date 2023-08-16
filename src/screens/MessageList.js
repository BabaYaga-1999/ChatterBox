import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Image, Modal, TouchableOpacity } from 'react-native';
import { chatStyles as styles } from '../styles/Styles';
import MapView, { Marker } from 'react-native-maps';

const MessageList = ({ messages, friendName, auth }) => {
  const flatListRef = useRef(null);
  const [isModalVisible, setModalVisible] = useState(false); // controls whether the modal is visible or not
  const [currentImage, setCurrentImage] = useState(null); // the image that is currently being displayed in the modal

  const openImageModal = (imageUrl) => {
    setCurrentImage(imageUrl);
    setModalVisible(true);
  }

  const closeImageModal = () => {
    setModalVisible(false);
    setCurrentImage(null);
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();

    const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // If the message was sent today, only return the time
    if (date.toDateString() === today.toDateString()) {
      return { time: timeString };
    }

    // If the message was sent before today, return the date and time
    const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return {
      date: dateString,
      time: timeString
    };
  };

  // Scroll to the bottom of the FlatList when a new message is sent
  const scrollToBottom = () => {
    if (messages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const RenderMap = ({ location }) => {
    return (
        <MapView
        style={{ width: 200, height: 200 }}
        initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
        }}
        >
        <Marker
            coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
            }}
            />
        </MapView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={({ item, index }) => {
        let showDate = true;
        let showTime = true;
        let showName = true;

        if (index > 0) {
          const prevMessage = messages[index - 1];

          const diffInMinutes = (new Date(item.createdAt) - new Date(prevMessage.createdAt)) / (60 * 1000); // difference in minutes
          if (diffInMinutes < 1) {
            showTime = false;
          }

          if (item.userId === prevMessage.userId) {
            showName = false;
          }
        }

        const timestampFormat = formatTimestamp(item.createdAt);
        
        return (
          <View style={{ padding: 10, paddingTop: showName ? 10 : 0 }}>
            <View style={{ alignItems: 'center' }}>
              {showDate && timestampFormat.date && 
                <Text style={{ textAlign: 'center', color: 'grey' }}>{timestampFormat.date}</Text>
              }
              {showTime && 
                <Text style={{ textAlign: 'center', color: 'grey' }}>{timestampFormat.time}</Text>
              }
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {showName && item.userId !== auth.currentUser.uid && <Text style={{ color: 'grey', fontWeight: 'bold', flex: 1, paddingLeft: 5 }}>{friendName}</Text>}
            </View>
            <View style={[
              styles.messageBox,
              item.userId === auth.currentUser.uid ? styles.rightMsg : styles.leftMsg
            ]}>
                {item && item.location && 
                <RenderMap location={item.location} />
                }
                {item && item.imageUrl && 
                    <TouchableOpacity onPress={() => openImageModal(item.imageUrl)}>
                    <Image 
                        source={{ uri: item.imageUrl }} 
                        style={styles.messageImage}
                    />
                    </TouchableOpacity>
                }
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          </View>
        );
      }}

      keyExtractor={(item) => item.id}
      onContentSizeChange={scrollToBottom}
      onLayout={scrollToBottom}
    />

    <Modal
          animationType="slide"
          transparent={false}
          visible={isModalVisible}
          onRequestClose={closeImageModal} 
      >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
              <Image 
                  source={{ uri: currentImage }} 
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
              />
              <TouchableOpacity onPress={closeImageModal} style={{ position: 'absolute', top: 630, right: 330 }}>
                  <Text style={{ color: 'white', fontSize: 18 }}>Close</Text>
              </TouchableOpacity>
          </View>
      </Modal>

    </View>
  );
};

export default MessageList;
