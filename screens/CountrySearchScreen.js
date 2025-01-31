// screens/CountrySearchScreen.js

import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CountryFlag from 'react-native-country-flag';
import countriesData from 'i18n-iso-countries';
import { VisaFormContext } from '../contexts/VisaFormContext'; // Import the context

// Register the English locale for country names
countriesData.registerLocale(require('i18n-iso-countries/langs/en.json'));

const { height } = Dimensions.get('window');

const CountrySearchScreen = ({ route, navigation }) => {
  const { updateFormData } = useContext(VisaFormContext); // Consume the context
  const [searchQuery, setSearchQuery] = useState('');
  const [countryList, setCountryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch country list on component mount
  useEffect(() => {
    const fetchCountries = () => {
      try {
        const countriesObj = countriesData.getNames('en', { select: 'official' });
        const countriesArray = Object.entries(countriesObj)
          .map(([code, name]) => ({
            code,
            name,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setCountryList(countriesArray);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Memoized filtered countries
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countryList;
    
    const query = searchQuery.toLowerCase().trim();
    return countryList.filter(country => 
      country.name.toLowerCase().includes(query)
    );
  }, [searchQuery, countryList]);

  const handleSelectCountry = (country) => {
    // Update the context with the selected country
    updateFormData({ country: country.name });
    // Navigate back to the Visa screen
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loader]}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()} // Use goBack without params
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color="rgba(255,255,255,0.6)" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search country"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={styles.searchInput}
              autoFocus
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.resultsList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelectCountry(item)} // Update context and navigate back
            activeOpacity={0.7}
          >
            <CountryFlag isoCode={item.code} size={25} style={styles.flagImage} />
            <Text style={styles.resultText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.noResults}>No countries found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B3B',
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
  flagImage: {
    marginRight: 12,
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default CountrySearchScreen;
