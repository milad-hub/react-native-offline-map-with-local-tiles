import MapView, {Marker} from '@splicer97/react-native-osmdroid';
import React, {useState} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {LocalTile} from 'react-native-maps';
import RNFetchBlob from 'rn-fetch-blob';

const App = () => {
  const localTemplate =
    RNFetchBlob.fs.dirs.DownloadDir + 'map/tiles/{z}/{x}/{y}.png';
  const initialRegion = {
    latitude: 29.5918,
    longitude: 52.5837,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const [zoomLevel, setZoomLevel] = useState(initialRegion.latitudeDelta);

  const getZoomLevel = latitudeDelta => {
    const ZOOM_MAX_DELTA = 360;
    const ZOOM_LEVELS = 16;
    const zoom = Math.round(Math.log2(ZOOM_MAX_DELTA / latitudeDelta));
    return Math.min(Math.max(zoom, 0), ZOOM_LEVELS - 1);
  };

  const handleRegionChange = newRegion => {
    const {latitude, longitude, latitudeDelta, longitudeDelta} = newRegion;

    const topLat = latitude + latitudeDelta / 2;
    const bottomLat = latitude - latitudeDelta / 2;
    const leftLng = longitude - longitudeDelta / 2;
    const rightLng = longitude + longitudeDelta / 2;

    console.log('Top Left:', {latitude: topLat, longitude: leftLng});
    console.log('Top Right:', {latitude: topLat, longitude: rightLng});
    console.log('Bottom Left:', {latitude: bottomLat, longitude: leftLng});
    console.log('Bottom Right:', {latitude: bottomLat, longitude: rightLng});

    const latitudeDeltaValue = Math.abs(topLat - bottomLat);
    setZoomLevel(latitudeDeltaValue);
    const zoomLevel = getZoomLevel(latitudeDeltaValue);
    console.log('Current Zoom Level (0-15):', zoomLevel);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={initialRegion}
        zoomEnabled={true}
        onRegionChangeComplete={handleRegionChange}>
        <Marker coordinate={{longitude: 52.5837, latitude: 29.5918}} />
        <LocalTile useAssets={true} pathTemplate={localTemplate} zIndex={-1} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    zIndex: 1,
  },
});

export default App;
