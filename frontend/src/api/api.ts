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
import apiClient from './client'

// Auth API
export const authAPI = {
    initiateLogin: async (): Promise<LoginInitResponse> => {
        const response = await apiClient.get<LoginInitResponse>('/auth/login');
        console.log("response", response)
        return response;
    },

    handleCallback: async (code: string): Promise<AuthResponse> => {
        const response = await apiClient.get<AuthResponse>(`/auth/exchange`, { params: { code } });
        return response;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/auth/me');
        return response
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },
};

// Profile API
export const profileAPI = {
    getProfile: async (userId: string): Promise<Profile> => {
        const response = await apiClient.get<Profile>(`/profiles/${userId}`);
        return response;
    },

    updateProfile: async (userId: string, data: UpdateProfileRequest): Promise<Profile> => {
        const response = await apiClient.put<Profile>(`/profiles/${userId}`, data);
        return response;
    },

    getFollowers: async (userId: string): Promise<User[]> => {
        const response = await apiClient.get<User[]>(`/profiles/${userId}/followers`);
        return response;
    },

    getFollowing: async (userId: string): Promise<User[]> => {
        const response = await apiClient.get<User[]>(`/profiles/${userId}/following`);
        return response;
    },

    followUser: async (userId: string): Promise<void> => {
        await apiClient.post(`/profiles/${userId}/follow`);
    },

    unfollowUser: async (userId: string): Promise<void> => {
        await apiClient.delete(`/profiles/${userId}/follow`);
    },
};

// Post API
export const postAPI = {
    createPost: async (data: CreatePostRequest): Promise<Post> => {
        const response = await apiClient.post<Post>('/posts', data);
        return response;
    },

    getPost: async (postId: string): Promise<Post> => {
        const response = await apiClient.get<Post>(`/posts/${postId}`);
        return response;
    },

    deletePost: async (postId: string): Promise<void> => {
        await apiClient.delete(`/posts/${postId}`);
    },

    getFeed: async (limit?: number, offset?: number): Promise<Post[]> => {
        const response = await apiClient.get<Post[]>('/posts/feed/timeline', {
            params: { limit, offset },
        });
        return response;
    },

    getUserPosts: async (userId: string, limit?: number, offset?: number): Promise<Post[]> => {
        const response = await apiClient.get<Post[]>(`/posts/user/${userId}`, {
            params: { limit, offset },
        });
        return response;
    },

    likePost: async (postId: string): Promise<void> => {
        await apiClient.post(`/posts/${postId}/like`);
    },

    unlikePost: async (postId: string): Promise<void> => {
        await apiClient.delete(`/posts/${postId}/like`);
    },
};

// Message API
export const messageAPI = {
    getConversations: async (): Promise<Conversation[]> => {
        const response = await apiClient.get<Conversation[]>('/messages');
        return response;
    },

    createConversation: async (data: CreateConversationRequest): Promise<Conversation> => {
        const response = await apiClient.post<Conversation>('/messages', data);
        return response;
    },

    getMessages: async (conversationId: string, limit?: number, offset?: number): Promise<Message[]> => {
        const response = await apiClient.get<Message[]>(`/messages/${conversationId}/messages`, {
            params: { limit, offset },
        });
        return response;
    },

    sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<Message> => {
        const response = await apiClient.post<Message>(`/messages/${conversationId}/messages`, data);
        return response;
    },
};

// Upload API
// export const uploadAPI = {
//     uploadProfileImage: async (imageUri: string): Promise<{ url: string }> => {
//         const formData = new FormData();

//         // Extract filename from URI
//         const filename = imageUri.split('/').pop() || 'image.jpg';

//         formData.append('image', {
//             uri: imageUri,
//             type: 'image/jpeg',
//             name: filename,
//         } as any);

//         const response = await APIClient.post('/uploads/profile-image', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         });
//         return response;
//     },

//     uploadCoverImage: async (imageUri: string): Promise<{ url: string }> => {
//         const formData = new FormData();
//         const filename = imageUri.split('/').pop() || 'image.jpg';

//         formData.append('image', {
//             uri: imageUri,
//             type: 'image/jpeg',
//             name: filename,
//         } as any);

//         const response = await APIClient.post('/uploads/cover-image', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         });
//         return response;
//     },

//     uploadPostImage: async (imageUri: string): Promise<{ url: string }> => {
//         const formData = new FormData();
//         const filename = imageUri.split('/').pop() || 'image.jpg';

//         formData.append('image', {
//             uri: imageUri,
//             type: 'image/jpeg',
//             name: filename,
//         } as any);

//         const response = await APIClient.post('/uploads/post-image', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         });
//         return response;
//     },
// };

// export default api;
