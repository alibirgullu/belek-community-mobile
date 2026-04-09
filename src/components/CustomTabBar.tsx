import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

type TabIconProps = {
    isFocused: boolean;
    routeName: string;
    colors: any;
    isDark: boolean;
};

const TabIcon = ({ isFocused, routeName, colors, isDark }: TabIconProps) => {
    const scale = useRef(new Animated.Value(isFocused ? 1.15 : 1)).current;
    const activeColor = colors.primary;
    const inactiveColor = isDark ? '#6E6E73' : '#8B95A5';

    useEffect(() => {
        Animated.spring(scale, {
            toValue: isFocused ? 1.15 : 1,
            useNativeDriver: true,
            friction: 4,
            tension: 120,
        }).start();
    }, [isFocused]);

    let iconName: any = 'help-circle';
    if (routeName === 'Ana Sayfa') iconName = isFocused ? 'home' : 'home-outline';
    else if (routeName === 'Topluluk') iconName = isFocused ? 'compass' : 'compass-outline';
    else if (routeName === 'Profil') iconName = isFocused ? 'person' : 'person-outline';

    const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    return (
        <Animated.View style={[styles.iconContainer, { transform: [{ scale }] }]}>
            <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? activeColor : inactiveColor}
            />
            {isFocused && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
        </Animated.View>
    );
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    const focusedOptions = descriptors[state.routes[state.index].key].options;
    if (focusedOptions.tabBarStyle && (focusedOptions.tabBarStyle as any).display === 'none') {
        return null;
    }

    return (
        <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.tabBarContent}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({ type: 'tabLongPress', target: route.key });
                    };

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={(options as any).tabBarTestID ?? (options as any).tabBarButtonTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabButton}
                            activeOpacity={0.7}
                        >
                            <TabIcon isFocused={isFocused} routeName={route.name} colors={colors} isDark={isDark} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    tabBarContent: {
        flexDirection: 'row',
        backgroundColor: isDark ? '#1C1C1E' : '#FCFCFD',
        marginHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeDot: {
        position: 'absolute',
        bottom: -8,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
});
