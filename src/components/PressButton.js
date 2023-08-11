import { StyleSheet, Pressable, View, Text } from 'react-native'
import React from 'react'
import colors from "../styles/Color.js"

export default function PressButton({handlePress, text, width}) {
  return (
    <Pressable style={({pressed}) => [
        {
          backgroundColor: pressed ? colors.inputBackground : colors.header,
        },
        styles.button, 
        {width:width}
      ]} onPress={handlePress}>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 5,
    padding: 10,
  },
  text: {
    color: "white",
    fontSize: 16, 
  }
})