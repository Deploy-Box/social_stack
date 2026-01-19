import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';

// Create a client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});

import { View, StyleSheet, Platform } from 'react-native';

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <View style={styles.container}>
                <View style={[styles.appContainer, Platform.OS === 'web' && styles.webAppContainer]}>
                    <NavigationContainer>
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

