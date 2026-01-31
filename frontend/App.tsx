import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer, LinkingOptions, useRoute } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { RootStackParamList } from './src/types/navigation';
import { View, StyleSheet, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { authAPI } from './src/api/api';

// Create a client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});



const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [Linking.createURL('/')],
    config: {
        screens: {
            LoginScreen: 'login',
            Main: {
                screens: {
                    Messages: 'messages',
                    Feed: 'feed',
                    Profile: 'profile',
                },
            },
            ChatScreen: 'chat/:conversationId',
        },
    },
};

function useQueryParam(name: string) {
    const url = Linking.useURL();

    return useMemo(() => {
        if (!url) return null;
        const { queryParams } = Linking.parse(url);
        const v = queryParams?.[name];
        return typeof v === "string" ? v : (Array.isArray(v) ? v[0] : null);
    }, [url, name]);
}

export default function App() {

    const code = useQueryParam("code");

    useEffect(() => {
        if (!code) return;

        console.log("code", code);
        authAPI.handleCallback(code);
    }, [code])

    return (
        <QueryClientProvider client={queryClient}>
            <View style={styles.container}>
                <View style={[styles.appContainer, Platform.OS === 'web' && styles.webAppContainer]}>
                    <NavigationContainer linking={linking}>
                        <RootNavigator />
                    </NavigationContainer>
                    <StatusBar style="auto" />
                </View>
            </View>
        </QueryClientProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Platform.OS === 'web' ? '#f3f4f6' : '#fff', // Light grey background for web
        alignItems: 'center',
        justifyContent: 'center',
    },
    appContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
    },
    webAppContainer: {
        maxWidth: 480, // Restrict width on web
        height: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
});


// Styles removed as they were part of the old HomeScreen

