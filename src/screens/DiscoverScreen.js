import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import MapView , {Marker} from "react-native-maps";
import { Ionicons } from '@expo/vector-icons';

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
  const renderItem = ({ item }) => (
    <View>
      <MapView>
        <Marker />
      </MapView>
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={vanRegion} 
        customMapStyle={mapStyle}>

        <Marker coordinate={{latitude: 49.229292, longitude: -123.008225 }}>
          <Ionicons name="chatbox-ellipses-sharp" size={40} color="red" />
        </Marker>
      </MapView>
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
