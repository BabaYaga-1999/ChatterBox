import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Pressable } from 'react-native';
import MapView , {Marker} from "react-native-maps";
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/Firebase';
import PressButton from '../components/PressButton';
import { MaterialIcons } from '@expo/vector-icons';
import { mapStyle } from '../styles/Styles';

const vanRegion = {
  latitude: 49.229292, 
  longitude: -123.008225,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

mapStyle=[
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
]

const DiscoverScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [postList, setPostList] = useState([]);
  const [reload, setReload] = useState(0);


  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      await Location.watchPositionAsync(
        {accuracy:Location.Accuracy.High,
        distanceInterval:1},
        (loc) => {
          console.log(loc);
          setLocation(loc);
        }
      );
      
    })();
  }, [reload]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "posts"), (querySnapshot) => {
        const newList = querySnapshot.docs.map((item) => {
          return { ...item.data(), key: item.id };
        });
        setPostList(newList);

      }
    );
    return () => {
      unsubscribe();
    };
  }, []);



  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={vanRegion} 
        >
        {
          location ? <Marker coordinate={{latitude: location.coords?.latitude, longitude: location.coords?.longitude }} /> : <></>
        }
        {
          postList.map((item)=>{
            return (
              <Marker coordinate={{latitude: item.gps.coords.latitude, longitude: item.gps.coords.longitude }} key={item.key}>
                <Ionicons name="chatbox-ellipses-sharp" size={40} color="red" />
              </Marker>)
          })
        }
        
      </MapView>
      <View style={mapStyle.buttonWrapper}>
        <Pressable style={mapStyle.button} onPress={()=>setReload(reload+1)}>
          <MaterialIcons name="refresh" size={50} color="black" />
        </Pressable>
      </View>
      <View style={mapStyle.buttonWrapper}>
        <Pressable style={mapStyle.button} onPress={()=>setReload(reload+1)}>
          <Ionicons name="location-outline" size={50} color="black" />
        </Pressable>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default DiscoverScreen;
