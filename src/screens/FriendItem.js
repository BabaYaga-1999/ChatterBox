import React, { useState, useEffect } from 'react';
import { TouchableHighlight, Image, Text, View } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/Firebase';
import { friendStyles as styles } from '../styles/Styles';

const FriendItem = ({ item, onPress }) => {
  const [avatarUri, setAvatarUri] = useState(item.avatar ? { uri: item.avatar } : require('../images/default_avatar.png'));

  useEffect(() => {
    const friendRef = doc(db, 'users', item.id);
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
      style={styles.listItem}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Image source={avatarUri} style={styles.avatar} />
        <Text style={styles.friendName}>{item.name}</Text>
      </View>
    </TouchableHighlight>
  );
};

export default FriendItem;
