import React from 'react';
import { Pressable, Text, Platform } from 'react-native';
import Styles from '../styles/Styles';

const Button = ({ onPress, title, icon }) => {
  return (
    <Pressable 
      style={({ pressed }) => [
        Styles.button,
        { backgroundColor: pressed ? Styles.accentColor : (icon ? Styles.iconButtonColor : Styles.primaryColor) },
      ]}
      onPress={onPress}
      android_ripple={Platform.OS === 'android' ? Styles.androidRipple : undefined}
    >
      {icon ? icon : <Text style={Styles.buttonText}>{title}</Text>}
    </Pressable>
  );
};

export default Button;
