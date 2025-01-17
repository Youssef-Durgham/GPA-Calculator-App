import React, { useContext, useState } from 'react';
import { View, Pressable, I18nManager, Alert } from 'react-native';
import { Text } from 'react-native';
import { AuthContext } from '../components/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { MMKV } from 'react-native-mmkv';
import { useDirection } from '../LanguageDirectionContext';

const storage = new MMKV();

export default function SettingsScreen() {
  const auth = useContext(AuthContext);
  const { isSignedIn, signOut } = auth;
  const { t } = useTranslation();
  const { direction, setDirection } = useDirection();
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const getCurrentLanguage = () => i18n.language?.split('-')[0] || 'en';

  const showLanguageChangeAlert = (newLang) => {
    // Bilingual message based on current and new language
    const messages = {
      en: {
        title: 'Change Language / تغيير اللغة',
        message: 'Please close and reopen the app to complete the language change.\n\nالرجاء إغلاق التطبيق وإعادة فتحه لإكمال تغيير اللغة.',
        ok: 'OK / موافق',
      },
      ar: {
        title: 'تغيير اللغة / Change Language',
        message: 'الرجاء إغلاق التطبيق وإعادة فتحه لإكمال تغيير اللغة.\n\nPlease close and reopen the app to complete the language change.',
        ok: 'موافق / OK',
      }
    };

    // Use current language for message format
    const currentLang = getCurrentLanguage();
    const messageSet = messages[currentLang];

    Alert.alert(
      messageSet.title,
      messageSet.message,
      [
        {
          text: messageSet.ok,
          onPress: () => switchLanguage(newLang)
        }
      ],
      { cancelable: true }
    );
  };

  const switchLanguage = async (lang) => {
    if (isChangingLanguage) return;
    if (getCurrentLanguage() === lang) return;

    try {
      setIsChangingLanguage(true);

      // 1. Change the language via i18n
      await i18n.changeLanguage(lang);
      
      // 2. Persist the chosen language
      storage.set('appLanguage', lang);
      
      // 3. Set direction in context
      if (lang === 'ar') {
        setDirection('rtl');
        I18nManager.forceRTL(true);
      } else {
        setDirection('ltr');
        I18nManager.forceRTL(false);
      }

      setIsChangingLanguage(false);
    } catch (error) {
      console.error('Error switching language:', error);
      setIsChangingLanguage(false);
    }
  };

  const currentLang = getCurrentLanguage();

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-4">
        {t('settingsScreen')}
      </Text>

      {isSignedIn ? (
        <Pressable
          className="bg-red-500 px-4 py-2 rounded-full mb-4"
          onPress={signOut}
        >
          <Text className="text-white font-semibold">{t('signOut')}</Text>
        </Pressable>
      ) : (
        <Text className="text-gray-500 mb-4">{t('youAreNotSignedIn')}</Text>
      )}

      {/* Language switcher buttons */}
      <View className="space-y-2">
        <Pressable
          className={`px-4 py-2 rounded-full ${
            currentLang === 'en' 
              ? 'bg-gray-300' 
              : 'bg-blue-500'
          }`}
          onPress={() => showLanguageChangeAlert('en')}
          disabled={currentLang === 'en' || isChangingLanguage}
        >
          <Text className="text-white font-semibold">
            {currentLang === 'ar' ? 'Switch to English / تغيير إلى الإنجليزية' : t('switchToEnglish')}
          </Text>
        </Pressable>

        <Pressable
          className={`px-4 py-2 rounded-full ${
            currentLang === 'ar' 
              ? 'bg-gray-300' 
              : 'bg-blue-500'
          }`}
          onPress={() => showLanguageChangeAlert('ar')}
          disabled={currentLang === 'ar' || isChangingLanguage}
        >
          <Text className="text-white font-semibold">
            {currentLang === 'en' ? 'Switch to Arabic / التغيير إلى العربية' : t('switchToArabic')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}