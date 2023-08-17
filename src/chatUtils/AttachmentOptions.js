import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import { chatStyles as styles } from '../styles/Styles';

const AttachmentOptions = ({ handlePhotoOption, handleCameraOption, handleLocationOption }) => (
    <View style={styles.attachmentOptionsContainer}>
      <TouchableOpacity style={styles.attachmentOption} onPress={handlePhotoOption}>
        <FontAwesome name="photo" size={24} color="black" />
        <Text>Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.attachmentOption} onPress={handleCameraOption}>
        <Entypo name="camera" size={24} color="black" />
        <Text>Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.attachmentOption} onPress={handleLocationOption}>
        <Entypo name="location" size={24} color="black" />
        <Text>Location</Text>
      </TouchableOpacity>
    </View>
);

export default AttachmentOptions;
