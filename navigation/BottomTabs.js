import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, Animated, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import {
  HomeIcon,
  PaperAirplaneIcon,
  CalendarDaysIcon,
  HeartIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VisaRequestScreen from '../screens/VisaRequestScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const AnimatedIndicator = ({ measureLayout, currentIndex }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: currentIndex * (width - 32) / 5,
      useNativeDriver: true,
      tension: 30,
      friction: 8,
    }).start();
  }, [currentIndex]);

};

const TabBarIcon = ({ Icon, focused }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.2 : 1,
        useNativeDriver: true,
        tension: 30,
        friction: 7,
      }),
     
      Animated.timing(glowOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 60 }}>
      {/* Glow Radial Effect */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: -30,
          width: 80,
          height: 30,
          backgroundColor: '#29286D',
          opacity: glowOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.2],
          }),
          transform: [
            {
              scaleX: glowOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1.3],
              }),
            },
            {
              scaleY: glowOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ],
          shadowColor: '#0096FF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,

        }}
      />

      {/* Icon */}
      <Animated.View
        style={{
          transform: [{ scale }, { translateY }],
        }}
      >
        <Icon color={focused ? '#fff' : '#484873'} size={28} />
      </Animated.View>
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#0B0B3B' }}>
      <View
 style={{
      flexDirection: 'row',
      height: 60,
      backgroundColor: '#0B0B3B',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -5 }, // Negative height to apply shadow at the top
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10, // Works on Android, but only applies below the View
    }}

      >
        <AnimatedIndicator currentIndex={state.index} />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,


              }}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                label,
              })}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: '#0f172a',
          fontSize: 16,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} Icon={HomeIcon} label="Home" />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Flights"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} Icon={PaperAirplaneIcon} label="Flights" />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} />}
      </Tab.Screen>
      {/* <Tab.Screen
        name="Bookings"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} Icon={CalendarDaysIcon} label="Bookings" />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} />}
      </Tab.Screen> */}
      <Tab.Screen
        name="Visa"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} Icon={CalendarDaysIcon} label="Visa" />
          ),
        }}
      >
        {(props) => <VisaRequestScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Favorites"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} Icon={HeartIcon} label="Favorites" />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} Icon={UserIcon} label="Profile" />
          ),
        }}
      >
        {(props) => <SettingsScreen {...props} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}