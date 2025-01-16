// CustomTopBar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';

const CustomTopBar = ({
  navigation,
  title = 'My Screen',
  showBackButton = false,
  rightComponent = null,
}) => {
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Left Section (Back Button) */}
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <ArrowLeftIcon color={'#000'} size={24} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      {/* Right Section (any custom element) */}
      <View style={styles.rightContainer}>
        {rightComponent}
      </View>
    </View>
  );
};

export default CustomTopBar;

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    // You can add shadows or borderBottom here if desired
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  leftContainer: {
    width: 50,
    justifyContent: 'center',
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    fontWeight: '600',
    fontSize: 18,
    color: '#0f172a',
  },
  rightContainer: {
    width: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
