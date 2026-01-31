import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '@/api/api';

// Dummy data for posts
const DUMMY_POSTS = [
    {
        id: '1',
        user: {
            name: 'Sarah Johnson',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        content: 'Just finished my new hiking trip! The views were absolutely breathtaking. 🏔️ #nature #hiking',
        image: 'https://picsum.photos/seed/hike/600/400',
        likes: 124,
        comments: 18,
        time: '2h ago',
    },
    {
        id: '2',
        user: {
            name: 'Alex Chen',
            avatar: 'https://i.pravatar.cc/150?u=alex',
        },
        content: 'Working on a new React Native project. The developer experience is just getting better and better! 💻',
        likes: 89,
        comments: 12,
        time: '4h ago',
    },
    {
        id: '3',
        user: {
            name: 'Emily Davis',
            avatar: 'https://i.pravatar.cc/150?u=emily',
        },
        content: 'Coffee and coding, the perfect Saturday morning combination. ☕',
        image: 'https://picsum.photos/seed/coffee/600/400',
        likes: 256,
        comments: 42,
        time: '6h ago',
    },
];


export default function FeedScreen() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate fetch
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    useEffect(() => {
        const url = window.location.href;
        const params = new URLSearchParams(url.split("?")[1]);
        const code = params.get("code");
        console.log(code)
        if (code) {
            const response = authAPI.handleCallback(code);
            console.log(response);
        }
    }, [])

    const renderPost = ({ item }: { item: typeof DUMMY_POSTS[0] }) => (
        <View style={styles.postContainer}>
            <View style={styles.postHeader}>
                <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user.name}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <Text style={styles.content}>{item.content}</Text>

            {item.image && (
                <Image source={{ uri: item.image }} style={styles.postImage} />
            )}

            <View style={styles.postFooter}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={24} color="#4b5563" />
                    <Text style={styles.actionText}>{item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={24} color="#4b5563" />
                    <Text style={styles.actionText}>{item.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-social-outline" size={24} color="#4b5563" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Feed</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="notifications-outline" size={24} color="#1f2937" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={DUMMY_POSTS}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    iconButton: {
        padding: 8,
    },
    listContent: {
        padding: 16,
    },
    postContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    time: {
        fontSize: 12,
        color: '#6b7280',
    },
    content: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 12,
        lineHeight: 20,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
    },
    postFooter: {
        flexDirection: 'row',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    actionText: {
        marginLeft: 6,
        color: '#4b5563',
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
});
