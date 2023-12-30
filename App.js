import MapView, {Marker, UrlTile} from '@splicer97/react-native-osmdroid';
import React, {useEffect} from 'react';
import {StyleSheet, View, Dimensions, NativeModules} from 'react-native';

const {AppServer} = NativeModules;

const LOCAL_TEMPLATE_ADDRESS = 'http://localhost:3000/tiles/{z}/{x}/{y}.png';
const INITIAL_REGION = {
  latitude: 29.5918,
  longitude: 52.5837,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1
};

const App = () => {
  useEffect(() => {
    startServer();
  }, []);

  const startServer = async () => {
    try {
      await AppServer.startServer();
      console.log('Server started successfully');
    } catch (error) {
      console.error('Failed to start the server:', error);
    }
  };

  const handleRegionChangeComplete = newRegion => {
    const newZoomLevel = getZoomLevel(newRegion.latitudeDelta);
    setZoomLevel(newZoomLevel);
    logScreenBoundaries(newRegion);
  };

  const logScreenBoundaries = ({latitude, longitude, latitudeDelta, longitudeDelta}) => {
    const topLatitude = latitude + latitudeDelta / 2;
    const bottomLatitude = latitude - latitudeDelta / 2;
    const leftLongitude = longitude - longitudeDelta / 2;
    const rightLongitude = longitude + longitudeDelta / 2;

    console.log('Top Left:', {latitude: topLatitude, longitude: leftLongitude});
    console.log('Top Right:', {latitude: topLatitude, longitude: rightLongitude});
    console.log('Bottom Left:', {latitude: bottomLatitude, longitude: leftLongitude});
    console.log('Bottom Right:', {latitude: bottomLatitude, longitude: rightLongitude});
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        zoomEnabled
        rotateEnabled={false}
        onRegionChangeComplete={handleRegionChangeComplete}>
        <Marker coordinate={INITIAL_REGION} />
        <UrlTile urlTemplate={LOCAL_TEMPLATE_ADDRESS} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }
});
export default App;
