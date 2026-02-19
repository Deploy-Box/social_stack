import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Pressable } from 'react-native';


interface CommentsModalProps {
  visible: boolean;
  post: any | null; //todo, add a postType type to the types page
  onClose: () => void;
}

export default function CommentModal({visible, post, onClose}: CommentsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Dark overlay */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Modal content */}
      <View style={styles.container}>
        <Text style={styles.title}>Comments</Text>

        {post ? (
          <Text>{post.comments} comments here</Text>
        ) : (
          <Text>No post selected</Text>
        )}

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={{ color: 'white' }}>Close</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
});
