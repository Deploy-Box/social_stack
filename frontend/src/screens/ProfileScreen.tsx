import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?u=me' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>Jacob Developer</Text>
                    <Text style={styles.handle}>@jacob_dev</Text>
                    <Text style={styles.bio}>
                        Building cool things with React Native & Node.js. 🚀
                        Always learning, always coding.
                    </Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>245</Text>
                            <Text style={styles.statLabel}>Posts</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>12.4k</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>892</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={[styles.button, styles.primaryButton]}>
                            <Text style={styles.primaryButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
                            <Text style={styles.secondaryButtonText}>Share Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                        <Ionicons name="grid-outline" size={24} color="#6366f1" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab}>
                        <Ionicons name="heart-outline" size={24} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

                {/* Grid Content Placeholder */}
                <View style={styles.gridContainer}>
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <View key={item} style={styles.gridItem}>
                            <Image
                                source={{ uri: `https://picsum.photos/seed/${item}/300/300` }}
                                style={styles.gridImage}
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    header: {
        alignItems: 'center',
        padding: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    handle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 12,
    },
    bio: {
        textAlign: 'center',
        color: '#4b5563',
        marginBottom: 24,
        paddingHorizontal: 16,
        lineHeight: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 8,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
        marginHorizontal: 6,
    },
    primaryButton: {
        backgroundColor: '#6366f1',
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#f3f4f6',
    },
    secondaryButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f3f4f6',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#6366f1',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: '33.33%',
        aspectRatio: 1,
        padding: 1,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
});
