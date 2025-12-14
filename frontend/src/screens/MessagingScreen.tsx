import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Dummy conversations
const DUMMY_CONVERSATIONS = [
    {
        id: '1',
        user: {
            name: 'Sarah Johnson',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        lastMessage: 'Sure, I will send you the details!',
        time: '10:30 AM',
        unread: 2,
    },
    {
        id: '2',
        user: {
            name: 'Alex Chen',
            avatar: 'https://i.pravatar.cc/150?u=alex',
        },
        lastMessage: 'Did you check the new PR?',
        time: 'Yesterday',
        unread: 0,
    },
    {
        id: '3',
        user: {
            name: 'Team Project',
            avatar: 'https://ui-avatars.com/api/?name=Team+Project&background=random',
        },
        lastMessage: 'Emily: We can meet at 5 PM.',
        time: 'Yesterday',
        unread: 0,
    },
];

export default function MessagingScreen() {
    const renderItem = ({ item }: { item: typeof DUMMY_CONVERSATIONS[0] }) => (
        <TouchableOpacity style={styles.chatItem}>
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.userName}>{item.user.name}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>
            {item.unread > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unread}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="create-outline" size={24} color="#6366f1" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={DUMMY_CONVERSATIONS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    iconButton: {
        padding: 4,
    },
    listContent: {
        paddingHorizontal: 0,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f9fafb',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    chatInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    time: {
        fontSize: 12,
        color: '#9ca3af',
    },
    lastMessage: {
        fontSize: 14,
        color: '#6b7280',
    },
    badge: {
        backgroundColor: '#6366f1',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
