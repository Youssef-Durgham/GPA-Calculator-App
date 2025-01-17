// App.js
import React, { useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { MMKV } from 'react-native-mmkv';


const storage = new MMKV();  // Initialize MMKV storage
const Stack = createNativeStackNavigator();

// Custom header component
const CustomHeader = ({ 
  title,
  showBack = true,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  hideTitle = false,
  backgroundColor = 'rgba(255, 255, 255, 0.85)',
  titleColor = '#000000',
  iconColor = '#007AFF'
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleLeftPress = () => {
    if (onLeftPress) {
      onLeftPress();
    } else if (showBack) {
      navigation.goBack();
    }
  };

  const renderLeftComponent = () => {
    if (!showBack && !leftIcon) return null;
  
    return (
      <TouchableOpacity onPress={handleLeftPress} style={styles.iconButton}>
        <Icon 
          name={leftIcon || 'chevron-back'}
          size={24}
          color={iconColor}
        />
      </TouchableOpacity>
    );
  };
  
  const renderRightComponent = () => {
    if (!rightIcon) return null;
  
    return (
      <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
        <Icon name={rightIcon} size={24} color={iconColor} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.headerContainer, 
      { paddingTop: insets.top, backgroundColor }
    ]}>
      <BlurView
        style={StyleSheet.absoluteFillObject}
        blurType={Platform.OS === 'ios' ? 'light' : 'light'}
        blurAmount={20}
      />
      <View style={styles.headerContent}>
        <View style={styles.leftContainer}>
          {renderLeftComponent()}
        </View>
        
        {!hideTitle && (
          <View style={[
            styles.titleContainer,
            (!showBack && !leftIcon) && styles.titleWithoutLeft,
            !rightIcon && styles.titleWithoutRight
          ]}>
            <Text 
              style={[styles.titleText, { color: titleColor }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        )}
        
        <View style={styles.rightContainer}>
          {renderRightComponent()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  titleWithoutLeft: {
    alignItems: 'flex-start',
    marginLeft: 0,
  },
  titleWithoutRight: {
    marginRight: 0,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: -8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});


export default CustomHeader;