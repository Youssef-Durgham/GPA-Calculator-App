import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, Animated, Dimensions, TouchableOpacity } from 'react-native';
import {
  HomeIcon,
  PaperAirplaneIcon,
  CalendarDaysIcon,
  HeartIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import HomeScreen from '../screens/HomeScreen';

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

const TabBarIcon = ({ Icon, focused, label }) => {
  const animatedValues = {
    scale: useRef(new Animated.Value(1)).current,
    translateY: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0.8)).current,
  };

  useEffect(() => {
    const { scale, translateY, opacity } = animatedValues;
    
    if (focused) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.15,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  const iconColor = focused ? '#2563eb' : '#64748b';
  const containerStyle = focused ? {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 16,
    padding: 12,
  } : {};

  return (
    <Animated.View
      style={{
        alignItems: 'center',
        transform: [
          { scale: animatedValues.scale },
          { translateY: animatedValues.translateY },
        ],
        opacity: animatedValues.opacity,
      }}
    >
      <View style={containerStyle}>
        <Icon
          color={iconColor}
          size={24}
          style={{
            transform: [{ rotate: Icon === PaperAirplaneIcon ? '45deg' : '0deg' }],
          }}
        />
      </View>
      <Text
        style={{
          color: iconColor,
          fontSize: 11,
          fontWeight: focused ? '600' : '500',
          marginTop: 6,
          letterSpacing: focused ? 0.3 : 0,
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 24 : 16,
        left: 16,
        right: 16,
        height: 72,
        backgroundColor: '#ffffff',
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
        paddingHorizontal: 8,
        borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
        borderColor: 'rgba(0, 0, 0, 0.1)',
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
              justifyContent: 'center',
              alignItems: 'center',
              padding: 4,
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
  );
};

export default function BottomTabs({ auth }) {
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
        {(props) => <HomeScreen {...props} auth={auth} />}
      </Tab.Screen>
      <Tab.Screen
        name="Flights"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} Icon={PaperAirplaneIcon} label="Flights" />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} auth={auth} />}
      </Tab.Screen>
      <Tab.Screen
        name="Bookings"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} Icon={CalendarDaysIcon} label="Bookings" />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} auth={auth} />}
      </Tab.Screen>
      <Tab.Screen
        name="Favorites"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} Icon={HeartIcon} label="Favorites" />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} auth={auth} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} Icon={UserIcon} label="Profile" />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} auth={auth} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}