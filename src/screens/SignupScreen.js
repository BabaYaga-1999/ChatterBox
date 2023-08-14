import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { db, auth } from '../utils/Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { loginSignUpStyles as styles } from '../styles/Styles';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const loginHandler = () => {
    navigation.replace("Login");
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const signupHandler = async () => {
    if (!name.trim()) {
      Alert.alert("Name is required.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Password should be at least 6 characters.");
      return;
    }
    //check password with confirmpassword
    if (password !== confirmPassword) {
      Alert.alert("The passwords don't match");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Initialize user document in Firestore
      const userDocRef = doc(db, 'users', userCred.user.uid);
      await setDoc(userDocRef, {
        friends: [],
        email: userCred.user.email,
        name: name,
        // ... any other initial data for user
      });

      // await auth.signOut();

      console.log(userCred);
      // navigation.replace("Login"); // Take user to the Login after successful registration
    } catch (err) {
      if (err.code === "auth/weak-password") {
        Alert.alert("The password is not strong enough");
      } else {
        console.log("signup ", err);
        Alert.alert(err.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>Join ChatterBox</Text>
      {/* <Text style={styles.appDescription}>ChatterBox is committed to breaking language barriers, fostering global connections, and making language learning an enjoyable journey. Let's chat, learn, and grow together!</Text> */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={(newText) => setName(newText)}
        autoCapitalize='none'
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
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
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry={true}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={(newText) => setConfirmPassword(newText)}
        autoCapitalize='none'
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={signupHandler}>
          <Text style={styles.buttonText}>Register and Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={loginHandler}>
          <Text style={styles.secondaryButtonText}>Already Registered? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
