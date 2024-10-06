import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { storage } from './firebase'; // Ensure your firebase config is correct

const App = () => {
  const [images, setImages] = useState(Array(10).fill(null)); // Initialize an array for 10 images

  useEffect(() => {
    // Load saved images from AsyncStorage on component mount
    const loadImages = async () => {
      try {
        const savedImages = await AsyncStorage.getItem('images');
        if (savedImages) {
          setImages(JSON.parse(savedImages)); // Parse the saved JSON string
        }
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };
    loadImages();
  }, []);

  const saveImages = async (newImages) => {
    try {
      await AsyncStorage.setItem('images', JSON.stringify(newImages)); // Save images as a JSON string
    } catch (error) {
      console.error('Failed to save images:', error);
    }
  };

  const uploadImage = async (uri, index) => {
    try {
      console.log('Uploading image:', uri); // Log the URI
      const response = await fetch(uri);

      if (!response.ok) {
        throw new Error('Failed to fetch image from URI');
      }

      const blob = await response.blob();
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const imageRef = ref(storage, filename);

      await uploadBytes(imageRef, blob);
      const url = await getDownloadURL(imageRef);
      console.log('File available at:', url);
      
      // Update the state with the uploaded image URL
      setImages(prevImages => {
        const newImages = [...prevImages];
        newImages[index] = url; // Store the uploaded URL in the corresponding index
        saveImages(newImages); // Save updated images to AsyncStorage
        return newImages;
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload failed', error.message);
    }
  };

  const selectImage = async (index) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Image Picker Result:', result); // Log the entire result

    if (!result.canceled) {
      const uri = result.assets[0]?.uri; // Use optional chaining
      console.log('Selected Image URI:', uri); // Log the selected URI
      if (uri) {
        await uploadImage(uri, index); // Pass the index to uploadImage
      } else {
        Alert.alert('Error', 'Could not get image URI');
      }
    } else {
      console.log('Image selection was canceled');
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity style={styles.imageContainer} onPress={() => selectImage(index)}>
      {images[index] ? (
        <Image source={{ uri: images[index] }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Tap to pick an image</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={Array.from({ length: 10 })} // Render 10 items
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2} // Two columns for a Pinterest-like layout
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  list: {
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 0.8, // Keep the images proportionate
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#888',
  },
});

export default App;
