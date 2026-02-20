import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '@/api/api';
import * as Linking from "expo-linking";
import CommentModal from '@/modals/commentsModal';
import "../types/types"
import { PostType } from '../types/types';


// Dummy data for posts
const DUMMY_POSTS = [
    {
        id: '1',
        user: {
            name: 'Sarah Johnson',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        },
        content: 'Just finished my new hiking trip! The views were absolutely breathtaking. 🏔️ #nature #hiking',
        imageUrl: 'https://picsum.photos/seed/hike/600/400',
        isLiked: false,
        likes: 124,
        comments: 18,
        createdAt: '2h ago',
    },
    {
        id: '2',
        user: {
            name: 'Alex Chen',
            avatar: 'https://i.pravatar.cc/150?u=alex',
        },
        content: 'Working on a new React Native project. The developer experience is just getting better and better! 💻',
        isLiked: false,
        likes: 89,
        comments: 12,
        createdAt: '4h ago',
    },
    {
        id: '3',
        user: {
            name: 'Emily Davis',
            avatar: 'https://i.pravatar.cc/150?u=emily',
        },
        content: 'Coffee and coding, the perfect Saturday morning combination. ☕',
        imageUrl: 'https://picsum.photos/seed/coffee/600/400',
        isLiked: false,
        likes: 256,
        comments: 42,
        createdAt: '6h ago',
    },
];


export default function FeedScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [posts, setPosts] = useState(DUMMY_POSTS.map(p => ({...p, isLiked: p.isLiked ?? false})));
    const [isCommentsVisible, setIsCommentsVisible] = useState(false); //used to display the comment section modal
    const [selectedPost, setSelectedPost] = useState<typeof DUMMY_POSTS[0] | null>(null); //used to store a selected post for comments section rendering


    const toggleLike = (postId: string) => {
        setPosts((prev) => {
            return prev.map((post) => {
                if (post.id !== postId) return post;

                const isCurrentlyLiked = post.isLiked;

                return {
                    ...post,
                    isLiked: !isCurrentlyLiked,
                    likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
                };

            });
        });
    };


    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate fetch
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    useEffect(() => {
        const handleUrl = (url: string) => {
            const { queryParams } = Linking.parse(url);
            const code = typeof queryParams?.code === "string" ? queryParams.code : null;

            console.log("code:", code);

            if (code) {
            // handleCallback is probably async; await it in an IIFE
            (async () => {
                try {
                const response = await authAPI.handleCallback(code);
                console.log("callback response:", response);
                } catch (e) {
                console.error("handleCallback failed:", e);
                }
            })();
            }
        };

        // 1) handle the initial launch URL (cold start)
        (async () => {
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) handleUrl(initialUrl);
        })();

        // 2) handle URLs while the app is already open
        const sub = Linking.addEventListener("url", ({ url }) => handleUrl(url));

        return () => sub.remove();
        }, []);

    const renderPost = ({ item }: { item: PostType }) => (
        <View style={styles.postContainer}>
            <View style={styles.postHeader}>
                <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user.name}</Text>
                    <Text style={styles.time}>{item.createdAt}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <Text style={styles.content}>{item.content}</Text>

            {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            )}

            <View style={styles.postFooter}>
                <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id)}>
                    <Ionicons name={item.isLiked ? "heart": "heart-outline"} size={24} color={item.isLiked ? "red": "#4b5563"} />
                    <Text style={styles.actionText}>{item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => {setSelectedPost(item); setIsCommentsVisible(true)}}>
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
                data={posts}
                renderItem={renderPost}
                keyExtractor={(post) => post.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
            <CommentModal visible={isCommentsVisible} post={selectedPost} onClose={() => setIsCommentsVisible(false)}/>
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
