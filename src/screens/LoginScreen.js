import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/Firebase';
import { loginSignUpStyles as styles } from '../styles/Styles';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const loginHandler = async () => {
    if (!isValidEmail(email)) {
    Alert.alert("Please enter a valid email address.");
    return;
    }

    if (password.length < 6) {
      Alert.alert("Password should be at least 6 characters.");
      return;
    }
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      // console.log(userCred);
      navigation.navigate('Home');
    } catch (err) {
      console.log("Login error: ", err);
      Alert.alert(err.message);
    }
  };

  const signupHandler = () => {
    navigation.replace('Signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>ChatterBox</Text>
      <Text style={styles.appDescription}>Speak. Learn. Connect. The world is in your language.</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={(newText) => setEmail(newText)}
        autoCapitalize='none'
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry={true}
        placeholder="Password"
        value={password}
        onChangeText={(newText) => setPassword(newText)}
        autoCapitalize='none'
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={loginHandler}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={signupHandler}>
          <Text style={styles.secondaryButtonText}>New User? Create An Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
