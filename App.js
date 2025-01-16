import React, { useState, useMemo } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import "./global.css"
import BottomTabs from './navigation/BottomTabs';
import SignInScreen from './screens/SignInScreen';
import PaymentScreen from './screens/PaymentScreen';

const Stack = createNativeStackNavigator();

function App() {
  // For simplicity, store auth state in local component state
  // In production, you'd use Redux or React Context, etc.
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Provide a simple signIn & signOut
  const authContextValue = useMemo(() => ({
    isSignedIn,
    signIn: () => setIsSignedIn(true),
    signOut: () => setIsSignedIn(false),
  }), [isSignedIn]);

  return (
    <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="BottomTabs">
            {/* Main bottom tab screens */}
            <Stack.Screen
              name="BottomTabs"
              options={{ headerShown: false }}
            >
              {() => <BottomTabs auth={authContextValue} />}
            </Stack.Screen>

            {/* Sign-In screen */}
            <Stack.Screen
              name="SignIn"
              options={{ title: 'Sign In' }}
            >
              {(props) => (
                <SignInScreen
                  {...props}
                  auth={authContextValue}
                />
              )}
            </Stack.Screen>

            {/* Payment screen (protected) */}
            <Stack.Screen
              name="Payment"
              options={{ title: 'Payment' }}
            >
              {(props) => (
                <PaymentScreen
                  {...props}
                  auth={authContextValue}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
