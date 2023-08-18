import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Modal, TextInput, Text, Button } from 'react-native';
import { MaterialCommunityIcons, FontAwesome, Entypo } from '@expo/vector-icons';
import { chatStyles as styles } from '../styles/Styles';
import * as Clipboard from 'expo-clipboard';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.OPENAI_API_KEY;  // Use API key from .env

const MessageActions = ({ text }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  
  const callOpenAIApi = async (messages) => {
    try {
      const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          temperature: 0.8,
          max_tokens: 2000,
          messages: messages
        })
      });

      if (!response.ok) {
        console.error("API response not OK:", await response.text());
        return null;
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected API response format:", data);
        return null;
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return null;
    }
  };

  const showAlertWithCopy = (title, message) => {
    setModalTitle(title);
    setModalContent(message);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalTitle("");
    setModalContent("");
  };

  const handleTranslate = async () => {
    const messages = [
      { "role": "user", "content": `Translate this to English: ${text}` }
    ];
    const result = await callOpenAIApi(messages);
    showAlertWithCopy(`Translation for ${text}: `, result);
  };

  const handleReplySuggestion = async () => {
    const messages = [
      { "role": "user", "content": `Reply to: ${text}` }
    ];
    const result = await callOpenAIApi(messages);
    showAlertWithCopy(`Suggested Reply to ${text}: `, result);
  };

  const handleMore = async () => {
    Alert.prompt(
      `The message is ${text}`,
      'Please provide more details for your query:',
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Submit",
          onPress: async queryDetail => {
            const messages = [
              { "role": "user", "content": `My contact sends me message: ${text}, I'd like to query that ${queryDetail}` }
            ];
            const result = await callOpenAIApi(messages);
            showAlertWithCopy('Query Result', result);
          }
        }
      ]
    );
  };

  return (
    <>
      <View style={styles.actionIconsContainer}>
        <TouchableOpacity onPress={handleTranslate} style={styles.actionIcon}>
          <FontAwesome name="language" size={22} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReplySuggestion} style={styles.actionIcon}>
          <MaterialCommunityIcons name="comment-text-multiple" size={22} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMore} style={styles.actionIcon}>
          <Entypo name="dots-three-horizontal" size={22} color="black" />
        </TouchableOpacity>
    </View>
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <TextInput
              value={modalContent}
              editable={false}
              multiline
              style={styles.modalTextInput}
              selectTextOnFocus
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
    

  );
};

export default MessageActions;
