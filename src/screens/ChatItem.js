import React, { useState, useEffect } from 'react';
import { TouchableHighlight, Image, Text, View } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../utils/Firebase';
import { chatsStyles as styles } from '../styles/Styles';

const ChatItem = ({ item, onPress, userName, formatDate }) => {
  const [avatarUri, setAvatarUri] = useState(null);

  useEffect(() => {
    const friendRef = doc(db, 'users', item.members.find(id => id !== auth.currentUser.uid));
    const unsubscribe = onSnapshot(friendRef, (friendDoc) => {
      if (friendDoc.exists) {
        const friendData = friendDoc.data();
        setAvatarUri(friendData.avatar ? { uri: friendData.avatar } : require('../images/default_avatar.png'));
      }
    });

    return () => unsubscribe();
  }, [item.id]);

  return (
    <TouchableHighlight
      underlayColor={'#f0f0f0'}
      onPress={onPress}
      style={styles.chatItem}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Image source={avatarUri} style={styles.chatAvatar} />
        <View style={styles.chatTextContainer}>
          <Text style={styles.chatFriendName}>{userName}</Text>
          <Text style={styles.chatLastMessage}>{item.lastMessage}</Text>
        </View>
        {item.lastMessage && 
          <Text style={styles.chatTime}>{formatDate(item.lastMessageTime)}</Text>}
      </View>
    </TouchableHighlight>
  );
};

export default ChatItem;
