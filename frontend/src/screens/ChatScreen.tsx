import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Message } from '../types/types';
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';


const DUMMY_MESSAGES = [
    {
        id: '1',
        conversationId: '1',
        senderId: '1',
        content: 'Hello',
        createdAt: '2022-01-01T00:00:00.000Z',
        readAt: '2022-01-01T00:00:00.000Z',
        senderName: 'John Doe',
        senderAvatar: 'https://example.com/avatar.jpg',
    },
    {
        id: '2',
        conversationId: '1',
        senderId: '2',
        content: 'Hello',
        createdAt: '2022-01-01T00:00:00.000Z',
        readAt: '2022-01-01T00:00:00.000Z',
        senderName: 'John Doe',
        senderAvatar: 'https://example.com/avatar.jpg',
    },

];


type Props = NativeStackScreenProps<RootStackParamList, 'ChatScreen'>;

export default function ChatScreen({ route }: Props) {
    const { conversationId } = route.params;
    const [isLoading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);


    const fetchMessages = async () => {
        try {
            const response = await fetch(process.env.API_URL + `/${conversationId}/messages`);
            const data = await response.json();
            setMessages(data);
        }
        catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const navigation = useNavigation();
    const [newMessage, setNewMessage] = useState('');
    const CURRENT_USER_ID = '1'; // Assuming '1' is the current user for styling purposes

    const renderMessage = ({ item }: { item: Message }) => {
        const isMyMessage = item.senderId === CURRENT_USER_ID;
        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
            ]}>
                {!isMyMessage && (
                    <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
                )}
                <View style={[
                    styles.messageBubble,
                    isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMyMessage ? styles.myMessageText : styles.theirMessageText
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isMyMessage ? styles.myMessageTime : styles.theirMessageTime
                    ]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?u=sarah' }} // detailed user info would typically come from route params or a fetch
                        style={styles.headerAvatar}
                    />
                    <Text style={styles.headerTitle}>Sarah Johnson</Text>
                </View>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#1f2937" />
                </TouchableOpacity>
            </View>

            {/* Message List */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                style={styles.keyboardAvoidingView}
            >
                <FlatList
                    data={DUMMY_MESSAGES}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messageList}
                    inverted={false} // Typically chat is inverted if data is sorted new->old, but dummy data looks old->new
                />

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="add" size={24} color="#6366f1" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                        disabled={!newMessage.trim()}
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        backgroundColor: '#fff',
        zIndex: 10,
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    headerButton: {
        padding: 4,
    },
    messageList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    theirMessageContainer: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
        marginBottom: 4,
    },
    messageBubble: {
        maxWidth: '75%',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    myMessageBubble: {
        backgroundColor: '#6366f1',
        borderBottomRightRadius: 4,
    },
    theirMessageBubble: {
        backgroundColor: '#f3f4f6',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: '#1f2937',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    theirMessageTime: {
        color: '#9ca3af',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        backgroundColor: '#fff',
    },
    attachButton: {
        padding: 8,
        marginRight: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1f2937',
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    sendButtonDisabled: {
        backgroundColor: '#c7c9fc',
    },
});