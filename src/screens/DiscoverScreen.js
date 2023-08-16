import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Button, StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Pressable } from 'react-native';
import MapView , {Circle, Marker} from "react-native-maps";
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/Firebase';
import PressButton from '../components/PressButton';
import { MaterialIcons } from '@expo/vector-icons';
import { discoverStyle } from '../styles/Styles';
import { FontAwesome } from '@expo/vector-icons';
import BottomSheet, { useBottomSheet } from '@gorhom/bottom-sheet';
import PostView from '../components/PostView';

const vanRegion = {
  latitude: 49.229292, 
  longitude: -123.008225,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const mapStyle=[
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
  const [post, setPost] = useState();
  const [reload, setReload] = useState(0);
  const [permissionResponse, requestPermission] = Location.useForegroundPermissions();
  const ref = useRef();
  const bottomSheetRef = useRef();
  const snapPoints = useMemo(() => ['50%', '50%'], []);
  



  function onMarkerPress(item){
    bottomSheetRef.current.expand();
    setPost(item);
  }
  function centerUserLocation(e){
    if (location){
      ref.current.animateToRegion({
        latitude: location.coords?.latitude, 
        longitude: location.coords?.longitude,           
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,})
      console.log(1)
    }
  }

  useEffect(() => {
    (async () => {
      console.log(1)
      Location.set
      let { status } = await requestPermission();
      
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
    <View style={discoverStyle.container}>
      <MapView 
        style={discoverStyle.map} 
        initialRegion={vanRegion} 
        customMapStyle={mapStyle}
        ref={ref}>
        {
          location ? <Marker coordinate={{latitude: location.coords?.latitude, longitude: location.coords?.longitude}} key={1}>
            <FontAwesome name="dot-circle-o" size={30} color="#3462fa" />
          </Marker> : <></>
        }
        {
          location ? <Circle center={{latitude: location.coords?.latitude, longitude: location.coords?.longitude }} radius={400} /> : <></>
        }

        {
          postList.map((item)=>{
            return (
              <Marker 
              coordinate={{latitude: item.gps.coords.latitude, longitude: item.gps.coords.longitude }} 
              key={item.key}
              onPress={()=>onMarkerPress(item)}>
                <Ionicons name="chatbox-ellipses-sharp" size={40} color="red" />
              </Marker>)
          })
        }
        
      </MapView>
      <View style={discoverStyle.buttonWrapper}>
        <Pressable style={discoverStyle.button} onPress={()=>setReload(reload+1)}>
          <MaterialIcons name="refresh" size={50} color="black" />
        </Pressable>
      </View>
      <View style={discoverStyle.centerButtonWrapper}>
        <Pressable style={discoverStyle.button} onPress={()=>centerUserLocation()}>
          <Ionicons name="location-outline" size={50} color="black" />
        </Pressable>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
      >
        {post ? <PostView post={post} /> : <></>}
        
      </BottomSheet>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
export default DiscoverScreen;
