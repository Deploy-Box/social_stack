import axios from 'axios';
import {
    AuthResponse,
    LoginInitResponse,
    User,
    Profile,
    Post,
    Conversation,
    Message,
    CreatePostRequest,
    UpdateProfileRequest,
    CreateConversationRequest,
    SendMessageRequest,
} from '../types/types';

// Configure base URL - adjust for your backend
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Auth API
export const authAPI = {
    initiateLogin: async (): Promise<LoginInitResponse> => {
        const response = await api.get('/auth/login');
        return response.data;
    },

    handleCallback: async (code: string): Promise<AuthResponse> => {
        const response = await api.get(`/auth/callback?code=${code}`);
        return response.data;
    },

    getCurrentUser: async (): Promise<{ user: User }> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },
};

// Profile API
export const profileAPI = {
    getProfile: async (userId: string): Promise<{ profile: Profile }> => {
        const response = await api.get(`/profiles/${userId}`);
        return response.data;
    },

    updateProfile: async (userId: string, data: UpdateProfileRequest): Promise<{ profile: Profile }> => {
        const response = await api.put(`/profiles/${userId}`, data);
        return response.data;
    },

    getFollowers: async (userId: string): Promise<{ followers: User[] }> => {
        const response = await api.get(`/profiles/${userId}/followers`);
        return response.data;
    },

    getFollowing: async (userId: string): Promise<{ following: User[] }> => {
        const response = await api.get(`/profiles/${userId}/following`);
        return response.data;
    },

    followUser: async (userId: string): Promise<void> => {
        await api.post(`/profiles/${userId}/follow`);
    },

    unfollowUser: async (userId: string): Promise<void> => {
        await api.delete(`/profiles/${userId}/follow`);
    },
};

// Post API
export const postAPI = {
    createPost: async (data: CreatePostRequest): Promise<{ post: Post }> => {
        const response = await api.post('/posts', data);
        return response.data;
    },

    getPost: async (postId: string): Promise<{ post: Post }> => {
        const response = await api.get(`/posts/${postId}`);
        return response.data;
    },

    deletePost: async (postId: string): Promise<void> => {
        await api.delete(`/posts/${postId}`);
    },

    getFeed: async (limit?: number, offset?: number): Promise<{ posts: Post[] }> => {
        const response = await api.get('/posts/feed/timeline', {
            params: { limit, offset },
        });
        return response.data;
    },

    getUserPosts: async (userId: string, limit?: number, offset?: number): Promise<{ posts: Post[] }> => {
        const response = await api.get(`/posts/user/${userId}`, {
            params: { limit, offset },
        });
        return response.data;
    },

    likePost: async (postId: string): Promise<void> => {
        await api.post(`/posts/${postId}/like`);
    },

    unlikePost: async (postId: string): Promise<void> => {
        await api.delete(`/posts/${postId}/like`);
    },
};

// Message API
export const messageAPI = {
    getConversations: async (): Promise<{ conversations: Conversation[] }> => {
        const response = await api.get('/messages');
        return response.data;
    },

    createConversation: async (data: CreateConversationRequest): Promise<{ conversation: Conversation }> => {
        const response = await api.post('/messages', data);
        return response.data;
    },

    getMessages: async (conversationId: string, limit?: number, offset?: number): Promise<{ messages: Message[] }> => {
        const response = await api.get(`/messages/${conversationId}/messages`, {
            params: { limit, offset },
        });
        return response.data;
    },

    sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<{ message: Message }> => {
        const response = await api.post(`/messages/${conversationId}/messages`, data);
        return response.data;
    },
};

// Upload API
export const uploadAPI = {
    uploadProfileImage: async (imageUri: string): Promise<{ url: string }> => {
        const formData = new FormData();

        // Extract filename from URI
        const filename = imageUri.split('/').pop() || 'image.jpg';

        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: filename,
        } as any);

        const response = await api.post('/uploads/profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    uploadCoverImage: async (imageUri: string): Promise<{ url: string }> => {
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'image.jpg';

        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: filename,
        } as any);

        const response = await api.post('/uploads/cover-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    uploadPostImage: async (imageUri: string): Promise<{ url: string }> => {
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'image.jpg';

        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: filename,
        } as any);

        const response = await api.post('/uploads/post-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export default api;
