import { Request, Response, NextFunction } from 'express';
import { workos } from '../config/workos';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                workosUserId: string;
                email: string;
                name: string;
            };
        }
    }
}

/**
 * Middleware to verify WorkOS session and attach user info to request
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get session token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No authentication token provided'
            });
        }

        const sessionId = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Verify session with WorkOS
            const session = await workos.userManagement.getUser(sessionId);

            // Get internal user ID from database
            const userResult = await pool.query(
                'SELECT id FROM users WHERE workos_user_id = $1',
                [session.id]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User account not found'
                });
            }

            // Attach user information to request
            req.user = {
                id: userResult.rows[0].id, // Internal PostgreSQL UUID
                workosUserId: session.id,
                email: session.email,
                name: session.firstName + ' ' + session.lastName
            };

            next();
        } catch (error) {
            logger.error('WorkOS session verification failed:', error);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired session'
            });
        }
    } catch (error) {
        logger.error('Authentication middleware error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Authentication failed'
        });
    }
};

/**
 * Optional authentication - doesn't fail if no token, just doesn't attach user
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    try {
        await authenticateUser(req, res, next);
    } catch (error) {
        // Continue without authentication
        next();
    }
};
