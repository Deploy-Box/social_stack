import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authenticateUser } from '../middleware/auth';
import { publishMessage } from '../services/messagingService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /conversations
 * Get user's conversations
 */
router.get('/', authenticateUser, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const result = await pool.query(
            `SELECT c.id, c.created_at, c.updated_at,
                    (SELECT json_agg(json_build_object(
                        'id', u.id,
                        'name', u.name,
                        'email', u.email,
                        'profile_image_url', p.profile_image_url
                    ))
                    FROM conversation_participants cp
                    JOIN users u ON cp.user_id = u.id
                    LEFT JOIN profiles p ON u.id = p.user_id
                    WHERE cp.conversation_id = c.id AND u.id != $1
                    ) as participants,
                    (SELECT json_build_object(
                        'content', m.content,
                        'created_at', m.created_at,
                        'sender_id', m.sender_id
                    )
                    FROM messages m
                    WHERE m.conversation_id = c.id
                    ORDER BY m.created_at DESC
                    LIMIT 1
                    ) as last_message
             FROM conversations c
             JOIN conversation_participants cp ON c.id = cp.conversation_id
             WHERE cp.user_id = $1
             ORDER BY c.updated_at DESC`,
            [userId]
        );

        res.json({ conversations: result.rows });
    } catch (error) {
        logger.error('Get conversations failed:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

/**
 * POST /conversations
 * Create a new conversation
 */
router.post('/', authenticateUser, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { participant_ids } = req.body;

        if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
            return res.status(400).json({ error: 'At least one participant is required' });
        }

        // Include current user in participants
        const allParticipants = [...new Set([userId, ...participant_ids])];

        // Create conversation
        const conversation = await pool.query(
            'INSERT INTO conversations DEFAULT VALUES RETURNING *'
        );

        const conversationId = conversation.rows[0].id;

        // Add participants
        for (const participantId of allParticipants) {
            await pool.query(
                'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2)',
                [conversationId, participantId]
            );
        }

        res.status(201).json({ conversation: conversation.rows[0] });
    } catch (error) {
        logger.error('Create conversation failed:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

/**
 * GET /conversations/:conversationId/messages
 * Get messages in a conversation
 */
router.get('/:conversationId/messages', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?.id;
        const { limit = '50', offset = '0' } = req.query;

        // Verify user is participant
        const participant = await pool.query(
            'SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
            [conversationId, userId]
        );

        if (participant.rows.length === 0) {
            return res.status(403).json({ error: 'Not a participant of this conversation' });
        }

        const result = await pool.query(
            `SELECT m.*, u.name as sender_name, p.profile_image_url as sender_avatar
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE m.conversation_id = $1
             ORDER BY m.created_at ASC
             LIMIT $2 OFFSET $3`,
            [conversationId, limit, offset]
        );

        res.json({ messages: result.rows });
    } catch (error) {
        logger.error('Get messages failed:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

/**
 * POST /conversations/:conversationId/messages
 * Send a message in a conversation
 */
router.post('/:conversationId/messages', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?.id;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Verify user is participant
        const participant = await pool.query(
            'SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
            [conversationId, userId]
        );

        if (participant.rows.length === 0) {
            return res.status(403).json({ error: 'Not a participant of this conversation' });
        }

        // Insert message
        const result = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [conversationId, userId, content]
        );

        // Update conversation timestamp
        await pool.query(
            'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [conversationId]
        );

        const newMessage = result.rows[0];

        // Publish to Redis for real-time updates
        await publishMessage({
            id: newMessage.id,
            conversationId: newMessage.conversation_id,
            senderId: newMessage.sender_id,
            content: newMessage.content,
            timestamp: newMessage.created_at
        });

        res.status(201).json({ message: newMessage });
    } catch (error) {
        logger.error('Send message failed:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;
