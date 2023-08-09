import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { writeToDB } from '../utils/FirestoreHelper'

export default function CreatePost() {
  writeToDB
  return (
    <View>
      <Text>CreatePost</Text>
    </View>
  )
}

const styles = StyleSheet.create({})