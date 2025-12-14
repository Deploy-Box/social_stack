import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
    if (socket) {
        socket.disconnect();
    }

    socket = io(SOCKET_URL, {
        auth: {
            token,
        },
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Conversation events
export const joinConversation = (conversationId: string) => {
    socket?.emit('join_conversation', conversationId);
};

export const leaveConversation = (conversationId: string) => {
    socket?.emit('leave_conversation', conversationId);
};

export const sendSocketMessage = (conversationId: string, message: any) => {
    socket?.emit('send_message', { conversationId, message });
};

export const sendTypingIndicator = (conversationId: string, userId: string, isTyping: boolean) => {
    socket?.emit('typing', { conversationId, userId, isTyping });
};

// Event listeners
export const onNewMessage = (callback: (message: any) => void) => {
    socket?.on('new_message', callback);
};

export const onUserTyping = (callback: (data: any) => void) => {
    socket?.on('user_typing', callback);
};

export const removeMessageListener = () => {
    socket?.off('new_message');
};

export const removeTypingListener = () => {
    socket?.off('user_typing');
};
