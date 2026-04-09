import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync().catch(() => { });

export default function SplashScreen() {
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Pulse glowing loop - infinitely breathing red glow
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Hide native splash screen and trigger logo entrance
        setTimeout(async () => {
            await ExpoSplashScreen.hideAsync().catch(() => { });

            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    tension: 50,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 100);
    }, []);

    const pulseScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.4] // Expands up to 40% larger
    });

    const pulseOpacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.15, 0.45] // Breathes opacity
    });

    return (
        <LinearGradient colors={['#100000', '#2D0505']} style={styles.container}>
            {/* Animated Deep Background Glow - Breathes */}
            <Animated.View style={[styles.radialGlow, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
            {/* Core Static Glow around the Box */}
            <View style={styles.radialGlowCore} />

            <Animated.View style={[styles.contentContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.logoRedContainer}>
                    <FontAwesome5 name="graduation-cap" size={48} color="#FFF" />
                </View>
                <Text style={styles.titleWhite}>Belek Topluluk</Text>
                <Text style={styles.subtitleGray}>KAMPÜS HAYATINA BAĞLAN</Text>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radialGlow: {
        position: 'absolute',
        width: 350,
        height: 350,
        borderRadius: 175,
        backgroundColor: '#FF3B30',
    },
    radialGlowCore: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#E02020',
        opacity: 0.3,
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 50,
        elevation: 20,
    },
    contentContainer: {
        alignItems: 'center',
        zIndex: 10,
    },
    logoRedContainer: {
        width: 110,
        height: 110,
        backgroundColor: '#E02020',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 26,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 40,
        elevation: 30, // Extremely bright shadow!
    },
    titleWhite: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    subtitleGray: {
        fontSize: 13,
        color: '#9E8B8B',
        marginTop: 8,
        fontWeight: '700',
        letterSpacing: 2,
    },
});
