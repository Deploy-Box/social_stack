import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authenticateUser } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /profiles/:userId
 * Get user profile
 */
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT u.id, u.email, u.name, u.created_at,
                    p.display_name, p.bio, p.profile_image_url, p.cover_image_url, 
                    p.location, p.website,
                    (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as follower_count,
                    (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as following_count,
                    (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE u.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ profile: result.rows[0] });
    } catch (error) {
        logger.error('Get profile failed:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * PUT /profiles/:userId
 * Update user profile (only own profile)
 */
router.put('/:userId', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { display_name, bio, location, website } = req.body;

        // Verify user is updating their own profile
        if (req.user?.id !== userId) {
            return res.status(403).json({ error: 'Cannot update another user\'s profile' });
        }

        const result = await pool.query(
            `UPDATE profiles 
             SET display_name = COALESCE($1, display_name),
                 bio = COALESCE($2, bio),
                 location = COALESCE($3, location),
                 website = COALESCE($4, website),
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $5
             RETURNING *`,
            [display_name, bio, location, website, userId]
        );

        res.json({ profile: result.rows[0] });
    } catch (error) {
        logger.error('Update profile failed:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * GET /profiles/:userId/followers
 * Get user's followers
 */
router.get('/:userId/followers', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { limit = '50', offset = '0' } = req.query;

        const result = await pool.query(
            `SELECT u.id, u.name, u.email, p.display_name, p.profile_image_url
             FROM followers f
             JOIN users u ON f.follower_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE f.following_id = $1
             ORDER BY f.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json({ followers: result.rows });
    } catch (error) {
        logger.error('Get followers failed:', error);
        res.status(500).json({ error: 'Failed to fetch followers' });
    }
});

/**
 * GET /profiles/:userId/following
 * Get users that this user follows
 */
router.get('/:userId/following', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { limit = '50', offset = '0' } = req.query;

        const result = await pool.query(
            `SELECT u.id, u.name, u.email, p.display_name, p.profile_image_url
             FROM followers f
             JOIN users u ON f.following_id = u.id
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE f.follower_id = $1
             ORDER BY f.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json({ following: result.rows });
    } catch (error) {
        logger.error('Get following failed:', error);
        res.status(500).json({ error: 'Failed to fetch following' });
    }
});

/**
 * POST /profiles/:userId/follow
 * Follow a user
 */
router.post('/:userId/follow', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;

        if (currentUserId === userId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        await pool.query(
            `INSERT INTO followers (follower_id, following_id) 
             VALUES ($1, $2) 
             ON CONFLICT DO NOTHING`,
            [currentUserId, userId]
        );

        res.json({ message: 'Successfully followed user' });
    } catch (error) {
        logger.error('Follow user failed:', error);
        res.status(500).json({ error: 'Failed to follow user' });
    }
});

/**
 * DELETE /profiles/:userId/follow
 * Unfollow a user
 */
router.delete('/:userId/follow', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;

        await pool.query(
            'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
            [currentUserId, userId]
        );

        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        logger.error('Unfollow user failed:', error);
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
});

export default router;
