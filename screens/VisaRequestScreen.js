// screens/VisaRequestScreen.js

import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { VisaFormContext } from '../contexts/VisaFormContext'; // Import the context

const { width, height } = Dimensions.get('window');

const DatePickerModal = ({ visible, onClose, date, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(date || new Date());

  const handleConfirm = () => {
    onDateChange(selectedDate);
    onClose();
  };

  return (
<<<<<<< HEAD
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => setSelectedDate(date || selectedDate)}
              style={styles.datePicker}
              textColor="#fff"
            />
          ) : (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                if (date) {
                  setSelectedDate(date);
                  handleConfirm();
                } else {
                  onClose();
                }
              }}
            />
          )
          }

          {Platform.OS === 'ios' && (
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
=======
    <View style={styles.container}>
      <Animated.View style={[styles.stars, { transform: [{ rotate: starInterpolation }] }]}> 
        <Icon name="star" size={15} color="#fff" style={[styles.starIcon, { top: 50, left: 20 }]} />
        <Icon name="star" size={10} color="#fff" style={[styles.starIcon, { top: 100, left: 150 }]} />
        <Icon name="star" size={20} color="#fff" style={[styles.starIcon, { top: 200, left: 300 }]} />
      </Animated.View>
      <Text style={styles.text}>Visa Passport Request</Text>
    </View>
>>>>>>> bc1c5c1c95bee45d4e1644fb86a0f9388588e568
  );
};

const Star = ({ style }) => (
  <Text style={[styles.star, style]}>✦</Text>
);

const VisaRequestScreen = ({ navigation, route }) => {
  const { formData, updateFormData } = useContext(VisaFormContext); // Consume the context

  const [isFormComplete, setIsFormComplete] = useState(false);
  const [passportImage, setPassportImage] = useState(formData.passportPhoto ? { uri: formData.passportPhoto } : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const animatedScale = useRef(new Animated.Value(1)).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;

  // Listen for selectedCountry changes via route params
  useEffect(() => {
    if (route.params?.selectedCountry) {
      updateFormData({ country: route.params.selectedCountry.name });
      // Clear the param to prevent re-updating on re-renders
      navigation.setParams({ selectedCountry: undefined });
    }
  }, [route.params?.selectedCountry]);

  useEffect(() => {
    const complete = !!(
      formData.name &&
      formData.dateOfBirth &&
      formData.passportNumber &&
      formData.country &&
      formData.passportPhoto
    );
    setIsFormComplete(complete);

    if (complete) {
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(buttonAnimation, {
        toValue: 0,
        duration: 500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }).start();
    }
  }, [formData]);

  const handleSelectImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 1200,
      maxHeight: 1600,
      includeBase64: false,
    };
  
    try {
      const result = await launchImageLibrary(options);
  
      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.errorCode) {
        console.log('ImagePicker Error: ', result.errorMessage);
      } else if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const source = { uri: asset.uri };
        setPassportImage(source);
        updateFormData({ passportPhoto: asset.uri }); // Update context
      }
    } catch (error) {
      console.log('ImagePicker Error:', error);
    }
  };  

  // Navigate to CountrySearch without passing params
  const handleCountrySelect = () => {
    navigation.navigate('CountrySearch');
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

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    // Implement your submit logic here
    // For example, navigate to a confirmation screen or send data to an API
  };

  const handleDateChange = (selectedDate) => {
    if (selectedDate) {
      updateFormData({ dateOfBirth: selectedDate }); // Update context
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Stars */}
      {[...Array(20)].map((_, i) => (
        <Star
          key={i}
          style={{
            position: 'absolute',
            top: Math.random() * height,
            left: Math.random() * width,
            opacity: Math.random() * 0.5 + 0.1,
          }}
        />
      ))}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Header Box */}
        <View style={styles.headerBox}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Visa Application</Text>
              <Text style={styles.headerSubtitle}>Complete your request</Text>
            </View>
            <View style={styles.headerImageContainer}>
              <LottieView
                style={{
                  height: '100%',
                  width: '100%',
                  position: 'absolute',
                  left: 0,
                  transform: [{ scale: 1.1 }],
                }}
                source={require('../animation/bag1.json')}
                autoPlay={true}
                loop
              />
            </View>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.cardContainer}>
          <View style={[styles.mainContainer, styles.fallbackBackground]}>
            <BlurView
              style={[StyleSheet.absoluteFill, styles.mainContainer]}
              blurAmount={10}
            />
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.headerText}>International Passport</Text>
              </View>

              <View style={styles.cardContent}>
                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Icon name="person" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.label}>Name</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={formData.name}
                    onChangeText={(text) => updateFormData({ name: text })}
                  />
                </View>

                {/* Country Selection */}
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={handleCountrySelect} // Navigate without params
                >
                  <View style={styles.labelContainer}>
                    <Icon name="place" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.label}>Country</Text>
                  </View>
                  <View style={styles.countrySelector}>
                    <Text style={[styles.input, !formData.country && styles.placeholder]}>
                      {formData.country || "Select country"}
                    </Text>
                    <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.6)" />
                  </View>
                </TouchableOpacity>

                {/* Date of Birth Input */}
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.labelContainer}>
                    <Icon name="cake" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.label}>Date of Birth</Text>
                  </View>
                  <View style={styles.dateSelector}>
                    <Text style={[styles.input, !formData.dateOfBirth && styles.placeholder]}>
                      {formData.dateOfBirth ? formData.dateOfBirth.toLocaleDateString('en-GB') : "Select date"}
                    </Text>
                    <Icon name="calendar-today" size={20} color="rgba(255,255,255,0.6)" />
                  </View>
                </TouchableOpacity>

                <DatePickerModal
                  visible={showDatePicker}
                  onClose={() => setShowDatePicker(false)}
                  date={formData.dateOfBirth || new Date()}
                  onDateChange={handleDateChange}
                />

                {/* Passport Number Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Icon name="assignment-ind" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.label}>Passport Number</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter passport number"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={formData.passportNumber}
                    onChangeText={(text) => updateFormData({ passportNumber: text })}
                  />
                </View>

                {/* Passport Photo Upload */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Icon name="photo-camera" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.label}>Passport Photo</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.imageUploadContainer}
                    onPress={handleSelectImage}
                  >
                    {passportImage ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image 
                          source={passportImage}
                          style={styles.passportPreview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity 
                          style={styles.changeImageButton}
                          onPress={handleSelectImage}
                        >
                          <Text style={styles.changeImageText}>Change Photo</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.uploadPrompt}>
                        <Icon name="add-photo-alternate" size={32} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.uploadText}>Upload Passport Photo</Text>
                        <Text style={styles.uploadSubtext}>Tap to select from gallery</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <View style={styles.submitButtonWrapper}>
                  <View style={styles.submitButtonContainer}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleSubmit}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      disabled={!isFormComplete}
                      style={styles.touchableContainer}
                    >
                      <Animated.View
                        style={{
                          transform: [{ scale: animatedScale }],
                        }}
                      >
                        <LinearGradient
                          colors={isFormComplete ? ['#4C1D95', '#7C3AED'] : ['#6B7280', '#9CA3AF']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[
                            styles.enhancedSubmitButton,
                            !isFormComplete && styles.disabledButton
                          ]}
                        >
                          <Icon 
                            name="send" 
                            size={20} 
                            color="#fff" 
                            style={[
                              styles.submitIcon,
                              !isFormComplete && styles.disabledIcon
                            ]} 
                          />
                          <Text style={[
                            styles.enhancedSubmitButtonText,
                            !isFormComplete && styles.disabledButtonText
                          ]}>
                            Submit Request
                          </Text>
                        </LinearGradient>
                      </Animated.View>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            </View>
          </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
  // ... your existing styles remain unchanged
  container: {
    flex: 1,
    backgroundColor: '#0B0B3B',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  submitButtonWrapper: {
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonContainer: {
    width: '100%',
    maxWidth: 500, // Maximum width for larger screens
    minWidth: 200, // Minimum width for smaller screens
    paddingHorizontal: 16,
  },
  touchableContainer: {
    width: '100%',
  },
  enhancedSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
    paddingHorizontal: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: '#4C1D95',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    minHeight: 56, // Ensures minimum touch target size
  },
  submitIcon: {
    marginRight: 12,
    opacity: 1,
  },
  enhancedSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.7,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
  headerBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  headerImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  star: {
    color: '#ffffff',
    fontSize: 16,
  },
  cardContainer: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    // Elevation for Android
    elevation: 8,
    paddingHorizontal: 10, // Added horizontal padding
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent to show BlurView
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContent: {
    gap: 15,
  },
  inputContainer: {
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
  verificationStrip: {
    backgroundColor: '#40E0D0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 15,
  },
  verificationText: {
    color: '#fff',
    textAlign: 'center',
  },
  // Updated Submit Button with Barcode-like Text
  submitBarcodeButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10, // Added margin for spacing
  },
  submitBarcodeText: {
    letterSpacing: 3,
    color: '#fff',
    fontSize: 24, // Adjust font size as needed
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mainContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  fallbackBackground: {
    backgroundColor: 'rgba(0, 0, 109, 0.45)', // Fallback background color
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholder: {
    color: 'rgba(255,255,255,0.6)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a3a',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  datePicker: {
    height: 200,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#6E48A6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  imageUploadContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  uploadPrompt: {
    alignItems: 'center',
    padding: 20,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  uploadSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  passportPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  changeImageButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  }
});

export default VisaRequestScreen;
