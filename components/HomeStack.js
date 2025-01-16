import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CustomTopBar from '../components/CustomTopBar';

const HomeStackNav = createNativeStackNavigator();

export default function HomeStack({ auth }) {
    return (
      <HomeStackNav.Navigator>
        <HomeStackNav.Screen
          name="HomeMain"
          options={({ navigation }) => ({
            header: () => (
              <CustomTopBar
                navigation={navigation}
                title="Welcome Home"
                showBackButton={false}
              />
            ),
          })}
        >
          {() => <HomeScreen auth={auth} />} {/* Pass auth to HomeScreen */}
        </HomeStackNav.Screen>
      </HomeStackNav.Navigator>
    );
  }
  
