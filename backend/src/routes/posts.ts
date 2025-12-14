import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authenticateUser } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /posts
 * Create a new post
 */
router.post('/', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { content, image_url } = req.body;
        const userId = req.user?.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Post content is required' });
        }

        const result = await pool.query(
            `INSERT INTO posts (user_id, content, image_url) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [userId, content, image_url || null]
        );

        res.status(201).json({ post: result.rows[0] });
    } catch (error) {
        logger.error('Create post failed:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

/**
 * GET /posts/:postId
 * Get a specific post
 */
router.get('/:postId', async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        const result = await pool.query(
            `SELECT p.*, u.name as author_name, u.email as author_email,
                    pr.display_name as author_display_name, pr.profile_image_url as author_avatar,
                    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count
             FROM posts p
             JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             WHERE p.id = $1`,
            [postId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ post: result.rows[0] });
    } catch (error) {
        logger.error('Get post failed:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

/**
 * DELETE /posts/:postId
 * Delete a post (only owner)
 */
router.delete('/:postId', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        // Verify ownership
        const post = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);

        if (post.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'Cannot delete another user\'s post' });
        }

        await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        logger.error('Delete post failed:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

/**
 * GET /posts/feed
 * Get feed of posts from followed users
 */
router.get('/feed/timeline', authenticateUser, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { limit = '20', offset = '0' } = req.query;

        const result = await pool.query(
            `SELECT p.*, u.name as author_name, u.email as author_email,
                    pr.display_name as author_display_name, pr.profile_image_url as author_avatar,
                    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count
             FROM posts p
             JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             WHERE p.user_id IN (
                 SELECT following_id FROM followers WHERE follower_id = $1
                 UNION
                 SELECT $1
             )
             ORDER BY p.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json({ posts: result.rows });
    } catch (error) {
        logger.error('Get feed failed:', error);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

/**
 * GET /posts/user/:userId
 * Get posts by a specific user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { limit = '20', offset = '0' } = req.query;

        const result = await pool.query(
            `SELECT p.*, u.name as author_name, u.email as author_email,
                    pr.display_name as author_display_name, pr.profile_image_url as author_avatar,
                    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count
             FROM posts p
             JOIN users u ON p.user_id = u.id
             LEFT JOIN profiles pr ON u.id = pr.user_id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json({ posts: result.rows });
    } catch (error) {
        logger.error('Get user posts failed:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

/**
 * POST /posts/:postId/like
 * Like a post
 */
router.post('/:postId/like', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        await pool.query(
            `INSERT INTO post_likes (post_id, user_id) 
             VALUES ($1, $2) 
             ON CONFLICT DO NOTHING`,
            [postId, userId]
        );

        res.json({ message: 'Post liked successfully' });
    } catch (error) {
        logger.error('Like post failed:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
});

/**
 * DELETE /posts/:postId/like
 * Unlike a post
 */
router.delete('/:postId/like', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        await pool.query(
            'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
        );

        res.json({ message: 'Post unliked successfully' });
    } catch (error) {
        logger.error('Unlike post failed:', error);
        res.status(500).json({ error: 'Failed to unlike post' });
    }
});

export default router;
