import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/types';
import { setAuthToken } from '../api/api';
import { initializeSocket, disconnectSocket } from '../api/socket';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null, token: string | null) => Promise<void>;
    logout: () => Promise<void>;
    loadStoredAuth: () => Promise<void>;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: async (user, token) => {
        try {
            if (user && token) {
                await AsyncStorage.setItem(TOKEN_KEY, token);
                await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
                setAuthToken(token);
                initializeSocket(token);
                set({ user, token, isAuthenticated: true, isLoading: false });
            } else {
                await AsyncStorage.removeItem(TOKEN_KEY);
                await AsyncStorage.removeItem(USER_KEY);
                setAuthToken(null);
                disconnectSocket();
                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            console.error('Error saving auth state:', error);
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_KEY);
            setAuthToken(null);
            disconnectSocket();
            set({ user: null, token: null, isAuthenticated: false });
        } catch (error) {
            console.error('Error logging out:', error);
        }
    },

    loadStoredAuth: async () => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            const userJson = await AsyncStorage.getItem(USER_KEY);

            if (token && userJson) {
                const user = JSON.parse(userJson);
                setAuthToken(token);
                initializeSocket(token);
                set({ user, token, isAuthenticated: true, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
            set({ isLoading: false });
        }
    },
}));
