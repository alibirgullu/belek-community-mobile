export const lightColors = {
    primary: '#D32F2F',       // Ana Kırmızı
    primaryDark: '#9A0007',
    primaryLight: '#FFEBEE',
    primaryDisabled: '#FFCDD2',
    secondary: '#0A2540',
    secondaryLight: '#E6E9EF',
    background: '#F7F7FA',    // Genel uygulama arka planı
    surface: '#FFFFFF',       // Kart arka planları
    inputBackground: '#F2F4F7', 
    text: '#1C1C1E',
    textSecondary: '#6E6E73',
    textTertiary: '#8E8E93',
    textLight: '#FFFFFF',
    border: '#E5E5EA',
    borderDark: '#D1D1D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    gray: {
        50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF',
        500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827',
    }
};

export const darkColors = {
    primary: '#D32F2F',       // Ana Kırmızı (koyu modda kırmızı aynı kalabilir ya da çok hafif açılabilir)
    primaryDark: '#B71C1C',
    primaryLight: '#4A1111',  // Açık kırımızı yerine koyu modda uyumlu bordomsu
    primaryDisabled: '#572727',
    secondary: '#1A2F45',     // Koyu modda lacivert biraz daha aydınlık kalabilir
    secondaryLight: '#162436',
    background: '#000000',    // Tam siyah veya #121212 arka plan
    surface: '#121212',       // Kart arka planları
    inputBackground: '#1C1C1E', // Input arka planları
    text: '#FFFFFF',          // Ana metin beyaz
    textSecondary: '#EBEBF599', // İkincil metin (#EBEBF5 %60)
    textTertiary: '#EBEBF54D',  // Üçüncül metin (#EBEBF5 %30)
    textLight: '#FFFFFF',
    border: '#38383A',        // Koyu sınırlar
    borderDark: '#4A4A4C',
    success: '#32D74B',       // iOS Dark Yeşil
    warning: '#FF9F0A',       // iOS Dark Turuncu
    error: '#FF453A',         // iOS Dark Kırmızı
    info: '#0A84FF',          // iOS Dark Mavi
    gray: { // Inverted or appropriately adjusted grays for dark theme
        50: '#111827', 100: '#1F2937', 200: '#374151', 300: '#4B5563', 400: '#6B7280',
        500: '#9CA3AF', 600: '#D1D5DB', 700: '#E5E7EB', 800: '#F3F4F6', 900: '#F9FAFB',
    }
};

// Types for intellisense
export type ThemeColors = typeof lightColors;

// Temporary fallback for incremental refactoring:
export const Colors = lightColors;
export default Colors;
