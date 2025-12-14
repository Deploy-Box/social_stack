import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profiles';
import postRoutes from './posts';
import messageRoutes from './messages';
import uploadRoutes from './uploads';

const router = Router();

// Example route
router.get('/status', (req, res) => {
    res.json({
        message: 'Social Media API is running',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
    });
});

// Register feature routes
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/posts', postRoutes);
router.use('/messages', messageRoutes);
router.use('/uploads', uploadRoutes);

export default router;
