// Type definitions for social media application

export interface User {
    id: string;
    workosUserId: string;
    avatar: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}


export interface Profile {
    userId: string;
    displayName?: string;
    bio?: string;
    profileImageUrl?: string;
    coverImageUrl?: string;
    location?: string;
    website?: string;
    followerCount?: number;
    followingCount?: number;
    postCount?: number;
}

export interface PostType {
    id: string;
    user: User;
    content: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
    authorName?: string;
    authorEmail?: string;
    authorDisplayName?: string;
    comments: number; //todo: need to figure out the best way to do this
    likes: number; //todo: need to remove and add a likes table
    isLiked: boolean; //todo: need to remove and add a likes table
}

export interface Conversation {
    id: string;
    participants: ConversationParticipant[];
    lastMessage?: LastMessage;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationParticipant {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
}

export interface LastMessage {
    content: string;
    createdAt: string;
    senderId: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    readAt?: string;
    createdAt: string;
    senderName?: string;
    senderAvatar?: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export interface LoginInitResponse {
    authorizationUrl: string;
}

// API Request types
export interface CreatePostRequest {
    content: string;
    imageUrl?: string;
}

export interface UpdateProfileRequest {
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
}

export interface CreateConversationRequest {
    participantIds: string[];
}

export interface SendMessageRequest {
    content: string;
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}
