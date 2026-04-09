import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  themeType: ThemeType;
  isDark: boolean;
  colors: ThemeColors;
  setThemeType: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  themeType: 'system',
  isDark: false,
  colors: lightColors,
  setThemeType: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeType, setThemeTypeState] = useState<ThemeType>('system');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@app_theme');
        if (savedTheme) {
          setThemeTypeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    loadTheme();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const setThemeType = async (type: ThemeType) => {
    setThemeTypeState(type);
    try {
      await AsyncStorage.setItem('@app_theme', type);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const isDark = themeType === 'dark' || (themeType === 'system' && systemTheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ themeType, isDark, colors, setThemeType }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
