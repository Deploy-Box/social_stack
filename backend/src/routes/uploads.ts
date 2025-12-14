import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authenticateUser } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadImage } from '../services/imageService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /uploads/profile-image
 * Upload profile image
 */
router.post('/profile-image', authenticateUser, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user?.id;
        const result = await uploadImage(req.file.buffer, req.file.originalname, 'profiles');

        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        // Update user profile with new image URL
        await pool.query(
            'UPDATE profiles SET profile_image_url = $1 WHERE user_id = $2',
            [result.url, userId]
        );

        res.json({ url: result.url });
    } catch (error) {
        logger.error('Profile image upload failed:', error);
        res.status(500).json({ error: 'Failed to upload profile image' });
    }
});

/**
 * POST /uploads/cover-image
 * Upload cover image
 */
router.post('/cover-image', authenticateUser, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user?.id;
        const result = await uploadImage(req.file.buffer, req.file.originalname, 'covers');

        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        // Update user profile with new cover image URL
        await pool.query(
            'UPDATE profiles SET cover_image_url = $1 WHERE user_id = $2',
            [result.url, userId]
        );

        res.json({ url: result.url });
    } catch (error) {
        logger.error('Cover image upload failed:', error);
        res.status(500).json({ error: 'Failed to upload cover image' });
    }
});

/**
 * POST /uploads/post-image
 * Upload post image (returns URL, doesn't create post)
 */
router.post('/post-image', authenticateUser, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await uploadImage(req.file.buffer, req.file.originalname, 'posts');

        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        res.json({ url: result.url });
    } catch (error) {
        logger.error('Post image upload failed:', error);
        res.status(500).json({ error: 'Failed to upload post image' });
    }
});

export default router;
