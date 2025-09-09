import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/votemaster',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Payment Providers
  MTN_MOMO_API_KEY: process.env.MTN_MOMO_API_KEY,
  MTN_MOMO_USER_ID: process.env.MTN_MOMO_USER_ID,
  MTN_MOMO_SUBSCRIPTION_KEY: process.env.MTN_MOMO_SUBSCRIPTION_KEY,
  MTN_MOMO_BASE_URL: process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com',
  
  AIRTEL_MONEY_CLIENT_ID: process.env.AIRTEL_MONEY_CLIENT_ID,
  AIRTEL_MONEY_CLIENT_SECRET: process.env.AIRTEL_MONEY_CLIENT_SECRET,
  AIRTEL_MONEY_BASE_URL: process.env.AIRTEL_MONEY_BASE_URL || 'https://openapiuat.airtel.africa',
  
  // USSD Configuration
  USSD_SERVICE_CODE: process.env.USSD_SERVICE_CODE || '*123*456#',
  USSD_SESSION_TIMEOUT: parseInt(process.env.USSD_SESSION_TIMEOUT || '300'), // 5 minutes
  
  // VoteMaster Fees
  VOTEMASTER_FEE_PERCENTAGE: parseFloat(process.env.VOTEMASTER_FEE_PERCENTAGE || '0.05'), // 5%
  MIN_VOTEMASTER_FEE: parseFloat(process.env.MIN_VOTEMASTER_FEE || '0.50'),
  MAX_VOTEMASTER_FEE: parseFloat(process.env.MAX_VOTEMASTER_FEE || '5.00'),
  
  // External APIs
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'VoteMaster',
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  ALLOWED_FILE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  
  // Redis (for session management)
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
