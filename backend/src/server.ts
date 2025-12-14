import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import './config/loadEnv'; // Load environment variables first
import { Pool } from 'pg';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { connectRedis, redisPublisher, redisSubscriber } from './config/redis';
import apiRoutes from './routes';

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize database pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        credentials: true,
    }
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
    try {
        // Check database connection
        await pool.query('SELECT 1');

        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed'
        });
    }
});

// API routes
app.use('/api/v1', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.IO event handlers
io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        logger.info(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        logger.info(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (data: { conversationId: string; message: any }) => {
        try {
            // Broadcast to room
            io.to(`conversation:${data.conversationId}`).emit('new_message', data.message);

            // Publish to Redis for distributed systems
            if (redisPublisher) {
                await redisPublisher.publish(
                    `conversation:${data.conversationId}`,
                    JSON.stringify(data.message)
                );
            }
        } catch (error) {
            logger.error('Error sending message:', error);
        }
    });

    // Typing indicator
    socket.on('typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', data);
    });

    socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });
});

// Initialize Redis connection
connectRedis().then(async () => {
    // Subscribe to all conversation channels to broadcast messages across instances
    if (redisSubscriber) {
        await redisSubscriber.pSubscribe('conversation:*', (message, channel) => {
            try {
                // Extract conversation ID from channel
                const conversationId = channel.split(':')[1];
                const parsedMessage = JSON.parse(message);

                // Broadcast to local Socket.IO clients in the room
                io.to(`conversation:${conversationId}`).emit('new_message', parsedMessage);
            } catch (error) {
                logger.error('Error processing Redis message:', error);
            }
        });
        logger.info('🎧 Subscribed to conversation:* Redis channels');
    }
}).catch((error) => {
    logger.error('Failed to connect to Redis:', error);
});

// Start server
httpServer.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    logger.info(`🔌 Socket.IO enabled for real-time messaging`);
});

export default app;
