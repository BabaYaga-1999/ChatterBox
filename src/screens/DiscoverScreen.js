import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Button, StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Pressable } from 'react-native';
import MapView , {Circle, Marker} from "react-native-maps";
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/Firebase';
import PressButton from '../components/PressButton';
import { MaterialIcons } from '@expo/vector-icons';
import { discoverStyle } from '../styles/Styles';
import { FontAwesome } from '@expo/vector-icons';
import BottomSheet, { useBottomSheet } from '@gorhom/bottom-sheet';
import PostView from '../components/PostView';
import { auth } from '../utils/Firebase';
import { Entypo } from '@expo/vector-icons';

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
  const [user, setUser] = useState();
  const [reload, setReload] = useState(0);
  const [permissionResponse, requestPermission] = Location.useForegroundPermissions();
  const ref = useRef();
  const bottomSheetRef = useRef();
  const snapPoints = useMemo(() => ['50%', '50%'], []);
  

  function calculateDistance(userLoc, postLoc){
    const latDistance = userLoc.coords.latitude-postLoc.coords.latitude;
    const longDistance = userLoc.coords.longitude-postLoc.coords.longitude;
    const distance = Math.sqrt(Math.pow(latDistance, 2) + Math.pow(longDistance, 2))
    return distance;
  }

  function onMarkerPress(item){
    if (isInFriendList(item.authorId) || item.authorId==auth.currentUser.uid){
      bottomSheetRef.current.expand();
      setPost(item);
    } else {
      if (!location){
        alert("Please turn on the location")
        return;
      }
      if(calculateDistance(location, item.gps) > 0.00565){
        alert("You are out of distance")
        return;
      }
      bottomSheetRef.current.expand();
      setPost(item);
    }

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
  function isInFriendList(authorId){
    if (!user){
      return false;
    }
    for (let i=0;i<user.friends.length;i++){
      if (user.friends[i].id==authorId){
        return true;
      }
    }
    return false;
  }
  function setColor(item){
    if (item.authorId==auth.currentUser.uid){
      return "orange"
    }else if (isInFriendList(item.authorId)){
      return "green"
    }else if (location && calculateDistance(location,item.gps) > 0.00565){
      return "#b1b0b0"
    }else{
      return "red"
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

  useEffect(()=>{
    (async () =>{
      const tempUser = await getDoc(doc(db, "users", auth.currentUser.uid));
      setUser(tempUser.data())

    })();
  },[])

  return (
    <View style={discoverStyle.container}>
      <MapView 
        style={discoverStyle.map} 
        initialRegion={vanRegion} 
        customMapStyle={mapStyle}
        ref={ref}>
        {
          location ? <Marker coordinate={{latitude: location.coords?.latitude, longitude: location.coords?.longitude}} key={1} style={{paddingTop:10}}>
            <View >
              <Entypo name="location-pin" size={35} color="#3462fa" />
            </View>
            
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
                <Ionicons name="chatbox-ellipses-sharp" size={40} color={setColor(item)} />
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
        index={-1}
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
