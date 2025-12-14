import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';

// Create a client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <NavigationContainer>
                <BottomTabNavigator />
            </NavigationContainer>
            <StatusBar style="auto" />
        </QueryClientProvider>
    );
}


// Styles removed as they were part of the old HomeScreen

