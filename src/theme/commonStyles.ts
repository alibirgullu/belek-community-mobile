import { StyleSheet, Platform } from 'react-native';
import Colors from './colors';

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    lg: {
        shadowColor: Colors.secondary, // Navy gölgelerle premium hissiyat
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
        elevation: 8,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 6,
    }),
};

export const Radii = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,       // Apple card style radius
    xxl: 32,      // Hero items
    round: 9999,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const Typography = StyleSheet.create({
    h1: {
        fontSize: 40,
        fontWeight: '900', // Apple Heavy style
        color: Colors.text,
        letterSpacing: -1,
    },
    h2: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -0.5,
    },
    h3: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text,
    },
    // Added back for backwards compatibility with untouched Auth Screens
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 8,
    },
    body: {
        fontSize: 17, // iOS default body size
        color: Colors.text,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.textLight,
    },
});

export const CommonStyles = StyleSheet.create({
    // Added back for backwards compatibility with untouched Auth Screens
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radii.xl, // Daha yuvarlak butonlar
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.glow(Colors.primaryDisabled), // Butonlarda tatlı bir parlama
    },
    buttonSecondary: {
        backgroundColor: Colors.secondary, // İkincil butonlar lacivert
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radii.xl,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.md,
    },
    buttonDisabled: {
        backgroundColor: Colors.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Radii.xl,
        padding: Spacing.lg,
        ...Shadows.md,
    },
    input: {
        height: 56, // Daha büyük dokunma alanı
        backgroundColor: Colors.inputBackground,
        borderWidth: 1,
        borderColor: 'transparent', // Odaklanmadığında temiz görünüm
        borderRadius: Radii.lg,
        paddingHorizontal: Spacing.md,
        fontSize: 17,
        color: Colors.text,
    },
    inputFocus: {
        borderColor: Colors.primary,
        backgroundColor: Colors.surface,
    }
});
