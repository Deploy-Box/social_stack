import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  FlatList,
  Image,
} from 'react-native';
import { PostType } from '../types/types';

export type CommentType = {
  id: string;
  postId: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
};

interface CommentsModalProps {
  visible: boolean;
  post: PostType | null;
  comments: CommentType[];
  onClose: () => void;
}

export default function CommentModal({ visible, post, comments, onClose }: CommentsModalProps) {
  const sortedComments = useMemo(() => {
    // Keep newest-ish at bottom if your dummy data is ordered; otherwise sort here.
    return comments ?? [];
  }, [comments]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Dark overlay */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Modal content */}
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Comments</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        {post ? (
          <>
            <Text style={styles.subtitle}>
              {sortedComments.length} comment{sortedComments.length === 1 ? '' : 's'}
            </Text>

            <FlatList
              data={sortedComments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No comments yet — be the first.</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                  <View style={styles.commentBody}>
                    <View style={styles.commentMetaRow}>
                      <Text style={styles.name}>{item.user.name}</Text>
                      <Text style={styles.time}>{item.createdAt}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                </View>
              )}
            />

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.emptyText}>No post selected</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '90%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 12,
    color: '#666',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
  commentRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentBody: {
    flex: 1,
  },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: '700',
    marginRight: 8,
    flexShrink: 1,
  },
  time: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
  },
  commentText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 18,
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: 'black',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});
