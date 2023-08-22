import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { chatStyles as styles } from '../styles/Styles';

const MessageInput = ({ input, setInput, sendMessage, canSendMessage, toggleAttachmentOptions }) => (
    <View style={styles.inputContainer}>
        <View style={styles.textInputWrapper}>
            <TextInput
                value={input}
                onChangeText={setInput}
                style={styles.input}
                placeholder={canSendMessage ? "Type a message..." : "Text Input Disabled"}
                editable={canSendMessage}
            />
            {input.trim() !== "" && canSendMessage && (
                <MaterialCommunityIcons name="send-circle-outline" size={28} color="black" onPress={sendMessage} style={styles.insideIcon} />
            )}
        </View>
        {canSendMessage && (
            <MaterialIcons 
                name="add-circle-outline" 
                size={28} 
                color="black" 
                onPress={toggleAttachmentOptions}
            />
        )}
    </View>
);

export default MessageInput;
