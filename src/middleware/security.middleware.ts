import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Simple in-memory rate limiter for USSD requests
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const ussdRateLimit = (maxRequests: number = 5, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.body.phoneNumber || req.ip;
    const now = Date.now();
    
    // Clean up expired entries
    const expired = now - windowMs;
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < expired) {
        rateLimitStore.delete(k);
      }
    }
    
    // Check rate limit
    const current = rateLimitStore.get(key);
    if (current) {
      if (current.resetTime > now) {
        if (current.count >= maxRequests) {
          logger.warn(`Rate limit exceeded for ${key}`);
          return res.status(429).json({
            response: "Too many requests. Please wait before trying again.",
            action: "end"
          });
        }
        current.count++;
      } else {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      }
    } else {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    }
    
    next();
  };
};

// Webhook signature verification middleware
export const verifyWebhookSignature = (secretKey: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-signature'] || req.headers['x-webhook-signature'];
      
      if (!signature) {
        logger.warn('Webhook signature missing');
        return res.status(401).json({ error: 'Signature required' });
      }

      // Verify signature logic here (depends on payment provider)
      // This is a simplified example
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        logger.warn('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      next();
    } catch (error) {
      logger.error('Signature verification error:', error);
      res.status(500).json({ error: 'Signature verification failed' });
    }
  };
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  });
  
  next();
};
