import { redisPublisher, redisSubscriber } from '../config/redis';
import { logger } from '../utils/logger';

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: string;
}

interface TypingIndicator {
    conversationId: string;
    userId: string;
    isTyping: boolean;
}

/**
 * Publish a message to a conversation channel
 */
export const publishMessage = async (message: Message): Promise<boolean> => {
    if (!redisPublisher) {
        logger.warn('Redis not configured, message not published');
        return false;
    }

    try {
        const channel = `conversation:${message.conversationId}`;
        await redisPublisher.publish(channel, JSON.stringify(message));
        logger.info(`Message published to channel: ${channel}`);
        return true;
    } catch (error) {
        logger.error('Failed to publish message:', error);
        return false;
    }
};

/**
 * Subscribe to a conversation channel
 */
export const subscribeToConversation = async (
    conversationId: string,
    callback: (message: Message) => void
): Promise<void> => {
    if (!redisSubscriber) {
        logger.warn('Redis not configured, cannot subscribe');
        return;
    }

    try {
        const channel = `conversation:${conversationId}`;

        await redisSubscriber.subscribe(channel, (message) => {
            try {
                const parsedMessage: Message = JSON.parse(message);
                callback(parsedMessage);
            } catch (error) {
                logger.error('Failed to parse message:', error);
            }
        });

        logger.info(`Subscribed to channel: ${channel}`);
    } catch (error) {
        logger.error('Failed to subscribe to conversation:', error);
    }
};

/**
 * Unsubscribe from a conversation channel
 */
export const unsubscribeFromConversation = async (conversationId: string): Promise<void> => {
    if (!redisSubscriber) {
        return;
    }

    try {
        const channel = `conversation:${conversationId}`;
        await redisSubscriber.unsubscribe(channel);
        logger.info(`Unsubscribed from channel: ${channel}`);
    } catch (error) {
        logger.error('Failed to unsubscribe from conversation:', error);
    }
};

/**
 * Publish typing indicator
 */
export const publishTypingIndicator = async (indicator: TypingIndicator): Promise<void> => {
    if (!redisPublisher) {
        return;
    }

    try {
        const channel = `typing:${indicator.conversationId}`;
        await redisPublisher.publish(channel, JSON.stringify(indicator));
    } catch (error) {
        logger.error('Failed to publish typing indicator:', error);
    }
};

/**
 * Subscribe to typing indicators for a conversation
 */
export const subscribeToTypingIndicators = async (
    conversationId: string,
    callback: (indicator: TypingIndicator) => void
): Promise<void> => {
    if (!redisSubscriber) {
        return;
    }

    try {
        const channel = `typing:${conversationId}`;

        await redisSubscriber.subscribe(channel, (message) => {
            try {
                const indicator: TypingIndicator = JSON.parse(message);
                callback(indicator);
            } catch (error) {
                logger.error('Failed to parse typing indicator:', error);
            }
        });
    } catch (error) {
        logger.error('Failed to subscribe to typing indicators:', error);
    }
};
