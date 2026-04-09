import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from './tr.json';
import en from './en.json';

const resources = {
    tr,
    en,
};

const LANGUAGE_KEY = 'app_language';

const languageDetector = {
    type: 'languageDetector' as const,
    async: true,
    detect: async (callback: (lang: string) => void) => {
        try {
            const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (savedLanguage) {
                callback(savedLanguage);
                return;
            }

            const deviceLang = Localization.getLocales()[0]?.languageCode;

            // We only support 'tr' and 'en' for now
            if (deviceLang && (deviceLang === 'tr' || deviceLang === 'en')) {
                callback(deviceLang);
            } else {
                // Fallback to 'tr'
                callback('tr');
            }
        } catch (error) {
            console.log('Error reading language from storage', error);
            callback('tr');
        }
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    },
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        resources,
        compatibilityJSON: 'v3',
        fallbackLng: 'tr',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
