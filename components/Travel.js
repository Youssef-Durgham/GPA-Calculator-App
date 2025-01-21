import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Easing
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const TravelTicketForm = ({ onHeightChange }) => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [focusedInput, setFocusedInput] = useState(null);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const animatedScale = useRef(new Animated.Value(1)).current;

  // Use useRef for persistent animated value
  const buttonAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (route.params?.selectedLocation && route.params?.type) {
      const { selectedLocation, type } = route.params;
      if (type === 'from') {
        setFromLocation(selectedLocation);
      } else {
        setToLocation(selectedLocation);
      }
    }
  }, [route.params]);

  useEffect(() => {
    if (fromLocation && toLocation) {
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }).start();
    } else {
      // Reset the animation instantly when conditions not met
      buttonAnimation.setValue(0);
    }
  }, [fromLocation, toLocation, buttonAnimation]);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        getCurrentLocation();
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const cityName = data.address.city || data.address.town || data.address.village;
          if (cityName) {
            setFromLocation(cityName);
          }
        } catch (error) {
          console.error('Error getting location name:', error);
        }
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  };

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleReverseLocations = () => {
    const tempFrom = fromLocation;
    setFromLocation(toLocation);
    setToLocation(tempFrom);
  };

  const renderLocationInput = (label, value, setValue, type) => (
    <TouchableOpacity
      style={[
        styles.inputContainer,
        focusedInput === type && styles.inputContainerFocused,
      ]}
      onPress={() => {
        navigation.navigate('Search', {
          type,
          currentValue: value,
        });
      }}
    >
      <View style={styles.inputContent}>
        <View style={styles.labelContainer}>
          <Icon
            name={type === 'from' ? 'flight-takeoff' : 'flight-land'}
            size={16}
            color="rgba(255,255,255,0.8)"
          />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.input}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
      </View>
      {value !== '' && (
        <View style={styles.locationInfo}>
          <Text style={styles.airportCode}>
            {value.slice(0, 3).toUpperCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const handleCalendarPress = () => {
    navigation.navigate('Calendar', {
      from: fromLocation,
      to: toLocation
    });
  };

  return (
    <Animated.View
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        onHeightChange && onHeightChange(height);
      }}
      style={[styles.container, { transform: [{ scale: animatedScale }] }]}
    >
      <View style={[styles.mainContainer, styles.fallbackBackground]}>
        <BlurView
          style={[StyleSheet.absoluteFill, styles.mainContainer]}
          blurAmount={10}
        />
        <View style={styles.mainContainer}>
          <View style={styles.content}>
            {renderLocationInput('From', fromLocation, setFromLocation, 'from')}

            <View style={styles.decorativeContainer}>
              <View style={styles.leftCircle} />

              <View style={styles.dottedLineContainer}>
                <View style={styles.dottedLine}>
                  {[...Array(20)].map((_, i) => (
                    <View key={i} style={styles.dot} />
                  ))}
                </View>

                <Pressable
                  onPress={handleReverseLocations}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.reverseButtonContainer}
                >
                  <View style={styles.reverseButton}>
                    <Icon name="swap-vert" size={20} color="#fff" />
                  </View>
                </Pressable>
              </View>

              <View style={styles.rightCircle} />
            </View>

            {renderLocationInput('To', toLocation, setToLocation, 'to')}

            {fromLocation && toLocation && (
              <Animated.View
                style={[
                  styles.searchButtonContainer,
                  {
                    transform: [
                      {
                        translateY: buttonAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [100, 0],
                        }),
                      },
                    ],
                    opacity: buttonAnimation,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleCalendarPress}
                >
                  <Icon
                    name="calendar-today"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>View Flight Calendar</Text>
                  <Icon name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '37%',
    zIndex: 100,
  },
  mainContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  fallbackBackground: {
    backgroundColor: 'rgba(0, 0, 109, 0.45)', // Fallback background color
  },
  content: {
    padding: 15,
  },
  inputContainer: {
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputContainerFocused: {
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  inputContent: {
    padding: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 4,
    fontWeight: '500',
  },
  locationInfo: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  airportCode: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.9,
  },
  reverseButtonContainer: {
    position: 'absolute',
    top: -16,
    zIndex: 2,
  },
  reverseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dottedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  dottedLineContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  decorativeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  leftCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  rightCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  searchButtonContainer: {
    marginTop: 20,
    paddingHorizontal: 5,
  },
  searchButton: {
    backgroundColor: '#6E48A6',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6E48A6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default TravelTicketForm;