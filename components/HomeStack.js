import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CustomTopBar from '../components/CustomTopBar';
import VisaRequestScreen from '../screens/VisaRequestScreen';

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
<HomeStackNav.Screen
  name="VisaRequest"
  component={VisaRequestScreen}
  options={{
    header: () => (
      <CustomTopBar
        title="Visa Request"
        showBackButton={true}
      />
    ),
  }}
/>
        </HomeStackNav.Screen>
      </HomeStackNav.Navigator>
    );
  }
  
