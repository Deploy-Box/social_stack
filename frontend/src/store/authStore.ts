// import { create } from 'zustand';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { User } from '../types/types';
// // import { setAuthToken } from '../api/api';
// import { initializeSocket, disconnectSocket } from '../api/socket';
// import Storage from '../utils/storage'

// interface AuthState {
//     user: User | null;
//     token: string | null;
//     isAuthenticated: boolean;
//     isLoading: boolean;
//     setUser: (user: User | null, token: string | null) => Promise<void>;
//     logout: () => Promise<void>;
//     // loadStoredAuth: () => Promise<void>;
//     // getStoredUser: () => Promise<User | null>;
// }

// const TOKEN_KEY = 'auth_token';
// const USER_KEY = 'user_data';

// export const useAuthStore = create<AuthState>((set) => ({
//     user: null,
//     token: null,
//     isAuthenticated: false,
//     isLoading: true,

//     setUser: async (user, token) => {
//         try {
//             console.log('authStore.setUser called with:', {
//                 user: user?.email,
//                 token: token ? `${token.substring(0, 20)}...` : null
//             });

//             if (user && token) {
//                 await Storage.setKey(TOKEN_KEY, token);
//                 await Storage.setKey(USER_KEY, JSON.stringify(user));
//                 console.log('✅ Token and user saved to AsyncStorage');

//                 // setAuthToken(token);
//                 initializeSocket(token);
//                 set({ user, token, isAuthenticated: true, isLoading: false });
//                 console.log('✅ Auth state updated - user is authenticated');
//             } else {
//                 await Storage.removeKey(TOKEN_KEY);
//                 await Storage.removeKey(USER_KEY);
//                 console.log('🗑️ Token and user removed from AsyncStorage');

//                 // setAuthToken(null);
//                 disconnectSocket();
//                 set({ user: null, token: null, isAuthenticated: false, isLoading: false });
//                 console.log('❌ Auth state cleared - user logged out');
//             }
//         } catch (error) {
//             console.error('❌ Error saving auth state:', error);
//             set({ isLoading: false });
//         }
//     },

//     logout: async () => {
//         try {
//             await Storage.removeKey(TOKEN_KEY);
//             await Storage.removeKey(USER_KEY);
//             // setAuthToken(null);
//             disconnectSocket();
//             set({ user: null, token: null, isAuthenticated: false });
//         } catch (error) {
//             console.error('Error logging out:', error);
//         }
//     },

// loadStoredAuth: async () => {
//     try {
//         const token = await Storage.getKey(TOKEN_KEY);
//         const userJson = await Storage.getKey(USER_KEY);

//         if (token && userJson) {
//             const user = JSON.parse(userJson);
//             setAuthToken(token);
//             initializeSocket(token);
//             set({ user, token, isAuthenticated: true, isLoading: false });
//         } else {
//             set({ isLoading: false });
//         }
//     } catch (error) {
//         console.error('Error loading stored auth:', error);
//         set({ isLoading: false });
//     }
// },

// getStoredUser: async () => {
//     try {
//         const userJson = await Storage.getKey(USER_KEY);
//         if (userJson) {
//             // const user = JSON.parse(userJson);
//             return user;
//         }
//         return null;
//     } catch (error) {
//         console.error('Error getting stored user:', error);
//         return null;
//     }
// }
// }));
