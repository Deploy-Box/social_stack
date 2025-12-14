import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';

import FeedScreen from '../screens/FeedScreen';
import MessagingScreen from '../screens/MessagingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }: { route: RouteProp<any, any> }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#6366f1',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                    height: 60,
                    paddingTop: 8,
                },
                tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Feed') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Messages') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'help'; // Default
                    }

                    return <Ionicons name={iconName} size={28} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Feed" component={FeedScreen} />
            <Tab.Screen name="Messages" component={MessagingScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
