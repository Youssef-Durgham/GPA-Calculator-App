// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar }
    },
    lng: 'en',           // default language
    fallbackLng: 'en',   // if no translation is found, use English
    interpolation: {
      escapeValue: false // react-i18next already safeguards from XSS
    }
  });

export default i18n;
