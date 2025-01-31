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
  Easing,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { parseISO, format, addDays } from 'date-fns';
import { SearchCallbacks } from './SearchCallbacks';

const { width } = Dimensions.get('window');

const TravelTicketForm = ({ onHeightChange }) => {
  const navigation = useNavigation();
  const route = useRoute();

  // Trip type state
  const [tripType, setTripType] = useState('round-trip');

  // Single/round trip state
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDates, setSelectedDates] = useState({ from: null, to: null });

  // Multi-trip state
  const [multiTripData, setMultiTripData] = useState([
    { 
      from: '', 
      to: '', 
      dates: { from: null, to: null },
    },
  ]);

  // UI states
  const [showDateModal, setShowDateModal] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [selectedTripIndex, setSelectedTripIndex] = useState(null);

  // Animations
  const animatedScale = useRef(new Animated.Value(1)).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // useEffect(() => {
  //   if (route.params?.selectedLocation && route.params?.type) {
  //     const { selectedLocation, type, tripIndex } = route.params;
  
  //     if (tripType === 'multi-trip' && tripIndex !== undefined) {
  //       // Update the specific multi-trip row
  //       setMultiTripData((prev) => {
  //         const updated = [...prev];
  //         updated[tripIndex] = { 
  //           ...updated[tripIndex], 
  //           [type]: selectedLocation  // type is either 'from' or 'to'
  //         };
  //         return updated;
  //       });
  //     } else {
  //       // Single or round-trip: update as before
  //       if (type === 'from') {
  //         setFromLocation(selectedLocation);
  //       } else {
  //         setToLocation(selectedLocation);
  //       }
  //     }
  
  //     // Clear the route parameters so they aren’t re-used accidentally.
  //     navigation.setParams({ selectedLocation: null, type: null, tripIndex: null });
  //   }
  // }, [route.params, tripType, navigation]);  

  useEffect(() => {
    // If single or round trip from & to are selected, animate the button
    if (tripType !== 'multi-trip') {
      if (fromLocation && toLocation) {
        Animated.timing(buttonAnimation, {
          toValue: 1,
          duration: 500,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }).start();
      } else {
        buttonAnimation.setValue(0);
      }
    }
  }, [tripType, fromLocation, toLocation, buttonAnimation]);

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
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const cityName =
            data.address.city || data.address.town || data.address.village;
          if (cityName) {
            // For single/round trip, set as from location by default
            if (tripType !== 'multi-trip') {
              setFromLocation(cityName);
            } else {
              // If multi-trip mode, set the first trip's from location if empty
              setMultiTripData((prev) => {
                const newArr = [...prev];
                if (!newArr[0].from) {
                  newArr[0].from = cityName;
                }
                return newArr;
              });
            }
          }
        } catch (error) {
          console.error('Error getting location name:', error);
        }
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
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

  const renderTripTypeSelector = () => (
    <View style={styles.tripTypeContainer}>
      {['Round-trip', 'One-way', 'Multi-trip'].map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.tripTypeButton,
            tripType === type.toLowerCase() && styles.tripTypeButtonActive,
          ]}
          onPress={() => setTripType(type.toLowerCase())}
        >
          <Text
            style={[
              styles.tripTypeText,
              tripType === type.toLowerCase() && styles.tripTypeTextActive,
            ]}
          >
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  /** Renders a single from/to input row (used in single/round-trip) */
  const renderLocationInput = (label, value, setValue, type) => (
    <TouchableOpacity
      style={[styles.inputContainer, focusedInput === type && styles.inputContainerFocused]}
      onPress={() => {
        // Set the callback in the global container
        SearchCallbacks.onSelect = (selectedLocation) => {
          if (type === 'from') {
            setFromLocation(selectedLocation);
          } else {
            setToLocation(selectedLocation);
          }
        };
  
        // Navigate without the non-serializable function in params
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

  /** Renders multi-trip from/to input (with an index) */
  const renderMultiTripInput = (trip, index) => {
    return (
      <View key={index} style={styles.multiTripRow}>
        {/* From */}
        <TouchableOpacity
  style={[
    styles.inputContainer,
    focusedInput === `from-${index}` && styles.inputContainerFocused,
  ]}
  onPress={() => {
    SearchCallbacks.onSelect = (selectedLocation) => {
      setMultiTripData((prev) => {
        const updated = [...prev];
        updated[index].from = selectedLocation;
        return updated;
      });
    };

    navigation.navigate('Search', {
      type: 'from',
      tripIndex: index,
      currentValue: trip.from,
    });
  }}
>
          <View style={styles.inputContent}>
            <View style={styles.labelContainer}>
              <Icon
                name="flight-takeoff"
                size={16}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.label}>{`Trip ${index + 1} - From`}</Text>
            </View>
            <Text style={styles.input}>
              {trip.from || `Select origin`}
            </Text>
          </View>
          {trip.from !== '' && (
            <View style={styles.locationInfo}>
              <Text style={styles.airportCode}>
                {trip.from.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* To */}
        <TouchableOpacity
  style={[
    styles.inputContainer,
    focusedInput === `to-${index}` && styles.inputContainerFocused,
  ]}
  onPress={() => {
    // Set the callback for 'to' selection without putting it into navigation params.
    SearchCallbacks.onSelect = (selectedLocation) => {
      setMultiTripData((prev) => {
        const updated = [...prev];
        updated[index].to = selectedLocation;
        return updated;
      });
    };

    // Navigate without the non-serializable callback.
    navigation.navigate('Search', {
      type: 'to',
      tripIndex: index,
      currentValue: trip.to,
    });
  }}
>
          <View style={styles.inputContent}>
            <View style={styles.labelContainer}>
              <Icon
                name="flight-land"
                size={16}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.label}>{`Trip ${index + 1} - To`}</Text>
            </View>
            <Text style={styles.input}>
              {trip.to || `Select destination`}
            </Text>
          </View>
          {trip.to !== '' && (
            <View style={styles.locationInfo}>
              <Text style={styles.airportCode}>
                {trip.to.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Date Range */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            setSelectedTripIndex(index);
            setShowDateModal(true);
          }}
        >
          <View style={styles.dateButtonContent}>
            <Icon
              name="calendar-today"
              size={20}
              color="#fff"
              style={styles.dateIcon}
            />
            <View style={styles.dateTextContainer}>
              {trip.dates.from ? (
                <Text style={styles.dateText}>
                  {trip.dates.from}
                  {trip.dates.to && (
                    <>
                      <Text style={styles.dateArrow}> → </Text>
                      {trip.dates.to}
                    </>
                  )}
                </Text>
              ) : (
                <Text style={styles.dateText}>Select date range</Text>
              )}
            </View>
            <Icon
              name="arrow-forward-ios"
              size={16}
              color="rgba(255,255,255,0.5)"
            />
          </View>
        </TouchableOpacity>

        {/* Delete button (show only on last trip if more than 1 trip) */}
        {index === multiTripData.length - 1 && multiTripData.length > 1 && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleRemoveTrip}
          >
            <Icon name="delete" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /** Add a new trip */
  const handleAddTrip = () => {
    if (multiTripData.length < 6) {
      const lastTrip = multiTripData[multiTripData.length - 1];
      const newTrip = {
        from: lastTrip.to || '', // carry over the "to" of last trip as the new "from"
        to: '',
        dates: { from: null, to: null },
      };
      setMultiTripData([...multiTripData, newTrip]);
    }
  };

  /** Remove the last trip if there's more than 1 */
  const handleRemoveTrip = () => {
    if (multiTripData.length > 1) {
      setMultiTripData(multiTripData.slice(0, -1));
    }
  };

  const handleCalendarPress = () => {
    // Pass along the relevant parameters (from, to, tripType) if needed.
    navigation.navigate('FlightResults', {
      from: fromLocation,
      to: toLocation,
      tripType,
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
            {renderTripTypeSelector()}

            {tripType !== 'multi-trip' && (
              <>
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

                {/* Single or round-trip date button */}
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDateModal(true)}
                >
                  <View style={styles.dateButtonContent}>
                    <Icon
                      name="calendar-today"
                      size={20}
                      color="#fff"
                      style={styles.dateIcon}
                    />
                    <View style={styles.dateTextContainer}>
                      {selectedDates.from ? (
                        <Text style={styles.dateText}>
                          {selectedDates.from}
                          {tripType !== 'one-way' && selectedDates.to && (
                            <>
                              <Text style={styles.dateArrow}> → </Text>
                              {selectedDates.to}
                            </>
                          )}
                        </Text>
                      ) : (
                        <Text style={styles.dateText}>
                          {tripType === 'one-way'
                            ? 'Select departure date'
                            : 'Select date range'}
                        </Text>
                      )}
                    </View>
                    <Icon
                      name="arrow-forward-ios"
                      size={16}
                      color="rgba(255,255,255,0.5)"
                    />
                  </View>
                </TouchableOpacity>

                {/* "View Flight Calendar" button only if from & to are selected */}
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
                      <Text style={styles.buttonText}>View Flight</Text>
                      <Icon name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </>
            )}

            {tripType === 'multi-trip' && (
              <>
                {/* Render each multi-trip row */}
                {multiTripData.map((trip, index) =>
                  renderMultiTripInput(trip, index)
                )}

                {/* Add trip button (if less than 6 trips) */}
                {multiTripData.length < 6 && (
                  <TouchableOpacity
                    style={styles.addTripButton}
                    onPress={handleAddTrip}
                  >
                    <Icon name="add" size={24} color="#fff" />
                    <Text style={styles.addTripText}>Add another trip</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </View>

      {/* DatePickerModal handles either single/round trip date or multi-trip date (depending on selectedTripIndex) */}
      <DatePickerModal
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onSelect={(dates) => {
          if (tripType === 'multi-trip' && selectedTripIndex !== null) {
            // Update the multiTripData for that specific index
            setMultiTripData((prev) => {
              const updated = [...prev];
              updated[selectedTripIndex].dates = dates;
              return updated;
            });
          } else {
            // Single / round trip date
            setSelectedDates(dates);
          }
        }}
        tripType={tripType}
        selectedDates={
          tripType === 'multi-trip' && selectedTripIndex !== null
            ? multiTripData[selectedTripIndex].dates
            : selectedDates
        }
        isMultiTrip={tripType === 'multi-trip'}
      />
    </Animated.View>
  );
};

// =======================================================
// DatePickerModal
// =======================================================
const DatePickerModal = ({
  visible,
  onClose,
  onSelect,
  tripType,
  selectedDates,
  isMultiTrip,
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    if (selectedDates?.from) {
      setStartDate(selectedDates.from);
      setEndDate(selectedDates.to);
    } else {
      setStartDate(null);
      setEndDate(null);
      setMarkedDates({});
    }
  }, [selectedDates]);

  const handleDayPress = (day) => {
    let newMarkedDates = {};
    const selectedDate = day.dateString;

    let newStartDate = startDate;
    let newEndDate = endDate;

    if (tripType === 'one-way') {
      newStartDate = selectedDate;
      newEndDate = null;
      newMarkedDates[selectedDate] = { selected: true, color: '#4A90E2' };
    } else {
      // Round-trip or multi-trip: treat them the same (date range)
      if (!startDate || endDate) {
        // Start a new range
        newStartDate = selectedDate;
        newEndDate = null;
        newMarkedDates[selectedDate] = { selected: true, color: '#4A90E2' };
      } else {
        if (new Date(selectedDate) < new Date(startDate)) {
          // If selected 'to' date is before 'from', swap them
          newStartDate = selectedDate;
          newEndDate = startDate;
        } else {
          newStartDate = startDate;
          newEndDate = selectedDate;
        }

        let currentDate = new Date(newStartDate);
        const finalEndDate = newEndDate
          ? new Date(newEndDate)
          : new Date(newStartDate);

        while (currentDate <= finalEndDate) {
          const formattedDate = format(currentDate, 'yyyy-MM-dd');
          newMarkedDates[formattedDate] = { selected: true, color: '#4A90E2' };
          currentDate = addDays(currentDate, 1);
        }

        newMarkedDates[newStartDate] = {
          startingDay: true,
          color: '#4A90E2',
        };
        newMarkedDates[newEndDate] = {
          endingDay: true,
          color: '#4A90E2',
        };
      }
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setMarkedDates(newMarkedDates);
  };

  const handleConfirm = () => {
    // For one-way: only need startDate
    if (tripType === 'one-way' && startDate) {
      onSelect({ from: startDate, to: null });
    } else if (startDate && endDate) {
      onSelect({ from: startDate, to: endDate });
    } else {
      // Nothing selected or incomplete
      onSelect({ from: null, to: null });
    }
    onClose();
  };

  // For one-way: 'Select Date'
  // For multi-trip or round-trip: 'Select Date Range'
  const title =
    tripType === 'one-way' ? 'Select Date' : 'Select Date Range';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Pressable
          style={styles.modalContent}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Calendar
            current={startDate || new Date().toISOString().split('T')[0]}
            minDate={new Date().toISOString().split('T')[0]}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType={
              tripType === 'one-way' ? 'dot' : 'period'
            }
            enableSwipeMonths={true}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: '#ffffff',
              selectedDayBackgroundColor: '#4A90E2',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#4A90E2',
              dayTextColor: '#ffffff',
              textDisabledColor: 'rgba(255,255,255,0.3)',
              arrowColor: '#4A90E2',
              monthTextColor: '#ffffff',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                // disable if no valid selection
                tripType === 'one-way'
                  ? !startDate && styles.confirmButtonDisabled
                  : (!startDate || !endDate) && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={
                tripType === 'one-way'
                  ? !startDate
                  : !startDate || !endDate
              }
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </TouchableOpacity>
    </Modal>
  );
};

// =======================================================
// Styles
// =======================================================
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 320,
    zIndex: 100,
  },
  mainContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  fallbackBackground: {
    backgroundColor: 'rgba(0, 0, 109, 0.45)',
  },
  content: {
    padding: 15,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 4,
  },
  tripTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripTypeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  tripTypeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  tripTypeTextActive: {
    color: '#ffffff',
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
  dottedLineContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  dottedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
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
  // Date button
  dateButton: {
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dateIcon: {
    marginRight: 12,
    opacity: 0.8,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  dateArrow: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '400',
  },
  // Multi-trip row
  multiTripRow: {
    marginBottom: 12,
  },
  // Add trip button
  addTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addTripText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Delete button for multi-trip row
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Search button (single/round trip)
  searchButtonContainer: {
    marginTop: 20,
    paddingHorizontal: 5,
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6E48A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1B1F6C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(74, 144, 226, 0.5)',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TravelTicketForm;
