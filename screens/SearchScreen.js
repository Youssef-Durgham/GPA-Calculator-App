// SearchScreen.js
import React, { useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { height } = Dimensions.get('window');

// SearchScreen.js
const SearchScreen = ({ route, navigation }) => {
  const { type, currentValue } = route.params;

  const handleSelectLocation = (item) => {
    // Navigate back to Home screen with parameters
    navigation.navigate('BottomTabs', {
      screen: 'Home',  // Specify the tab screen
      params: {
        selectedLocation: item,
        type: type
      }
    });
  };

  return (
    <View style={styles.container}>

        <View style={styles.searchContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color="rgba(255,255,255,0.6)" />
              <TextInput
                defaultValue={currentValue}
                placeholder={`Search ${type === 'from' ? 'departure' : 'destination'}`}
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.searchInput}
                autoFocus
              />
            </View>
          </View>
        </View>


      <FlatList
        data={["New York, USA", "London, UK", "Paris, France", "Tokyo, Japan"]}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.resultsList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelectLocation(item)}
          >
            <Icon
              name={type === 'from' ? 'flight-takeoff' : 'flight-land'}
              size={20}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.resultText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000B4D',
  },
  searchContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
});

export default SearchScreen;