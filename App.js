// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MMKV } from 'react-native-mmkv';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import './global.css';

import BottomTabs from './navigation/BottomTabs';
import CustomHeader from './components/CustomHeader';
import { LanguageDirectionProvider } from './LanguageDirectionContext';
import { VisaFormProvider } from './contexts/VisaFormContext';

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

  return (
    <SafeAreaProvider>
      <LanguageDirectionProvider>
        <VisaFormProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="BottomTabs" // Always start with BottomTabs (Home Screen)
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
            </Stack.Navigator>
          </NavigationContainer>
        </VisaFormProvider>
      </LanguageDirectionProvider>
    </SafeAreaProvider>
  );
}

export default App;
