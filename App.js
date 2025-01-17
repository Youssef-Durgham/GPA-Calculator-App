// App.js
import React, { useState, useMemo, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MMKV } from 'react-native-mmkv';
import {
  Text,
  View,
  TouchableOpacity,
  I18nManager,
  StyleSheet
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import RNRestart from 'react-native-restart'; // if still needed
import './global.css';

import BottomTabs from './navigation/BottomTabs';
import SignInScreen from './screens/SignInScreen';
import PaymentScreen from './screens/PaymentScreen';
import CustomHeader from './components/CustomHeader';
import { AuthContext } from './components/AuthContext';

// NEW IMPORTS
import {
  LanguageDirectionProvider
} from './LanguageDirectionContext'; // <-- Your new file

const storage = new MMKV();
const Stack = createNativeStackNavigator();

function App() {
  const [language, setLanguage] = useState('en');
  const { t } = useTranslation();

  useEffect(() => {
    const initializeLanguage = async () => {
      const persistedLang = storage.getString('appLanguage') || 'en';
      await i18n.changeLanguage(persistedLang);
      setLanguage(persistedLang);

      // If you still want to forcibly set system direction upon load:
      // (Be aware: this can cause a need to restart the app)
      if (persistedLang === 'ar') {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
      } else {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
      }
    };
    initializeLanguage();
  }, []);

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  const authContextValue = useMemo(() => ({
    isSignedIn,
    signIn: () => {
      setIsSignedIn(true);
      storage.set('signedIn', 'true');
    },
    signOut: () => {
      setIsSignedIn(false);
      storage.delete('signedIn');
    },
    skip: () => {
      storage.set('skipped', 'true');
    },
  }), [isSignedIn]);

  useEffect(() => {
    const checkFlags = () => {
      try {
        const signedInFlag = storage.getString('signedIn');
        const skippedFlag = storage.getString('skipped');

        if (signedInFlag === 'true' || skippedFlag === 'true') {
          setInitialRoute('BottomTabs');
        } else {
          setInitialRoute('SignIn');
        }
      } catch (e) {
        console.error(e);
        setInitialRoute('SignIn');
      } finally {
        setLoading(false);
      }
    };
    checkFlags();
  }, []);

  if (loading || !initialRoute) {
    return null; // or a loading spinner
  }

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={authContextValue}>
        {/* Wrap everything in the direction provider */}
        <LanguageDirectionProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{
                header: ({ route, options, navigation }) => {
                  const defaultConfig = {
                    showBack: navigation.canGoBack(),
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    titleColor: '#000000',
                    iconColor: '#007AFF',
                  };

                  const headerConfig = {
                    ...defaultConfig,
                    ...options.headerProps,
                    title: options.title || route.name,
                    leftIcon: options.headerLeft?.icon || (navigation.canGoBack() ? 'chevron-back' : undefined),
                  };

                  return <CustomHeader {...headerConfig} />;
                },
              }}
            >
              <Stack.Screen
                name="BottomTabs"
                component={BottomTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SignIn"
                component={SignInScreen}
                options={{
                  title: 'Sign In',
                  headerProps: {
                    backgroundColor: '#f8f9fa',
                    titleColor: '#2c3e50',
                    iconColor: '#34495e',
                    hideTitle: false,
                    leftIcon: 'chevron-back',
                    // onLeftPress: () => navigation.goBack(), // Put this in SignInScreen if needed
                    rightIcon: 'information-circle-outline',
                    onRightPress: () => console.log('Info pressed'),
                    showBack: true,
                  },
                }}
              />
              <Stack.Screen
                name="Payment"
                component={PaymentScreen}
                options={({ navigation }) => ({
                  title: 'Payment',
                  headerProps: {
                    backgroundColor: '#f8f9fa',
                    titleColor: '#2c3e50',
                    iconColor: '#34495e',
                    hideTitle: false,
                    leftIcon: 'chevron-back',
                    onLeftPress: () => navigation.goBack(),
                    rightIcon: 'information-circle-outline',
                    onRightPress: () => console.log('Info pressed'),
                    showBack: true,
                  },
                })}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </LanguageDirectionProvider>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

export default App;
