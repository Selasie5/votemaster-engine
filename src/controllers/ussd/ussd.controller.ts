import { USSDService } from "../../services/ussd.service";
import { logger } from "../../utils/logger";

export const ussdController = {
  // Handle USSD requests
  handleUSSDRequest: async (_: any, args: any, context: any) => {
    try {
      const { sessionId, serviceCode, phoneNumber, text } = args.ussdRequest;

      logger.info(`USSD request from ${phoneNumber}: ${text}`);

      const response = await USSDService.handleUSSDRequest({
        sessionId,
        serviceCode,
        phoneNumber,
        text
      });

      return {
        code: 200,
        success: true,
        data: {
          response: response.response,
          continueSession: response.continueSession
        }
      };

    } catch (error) {
      logger.error('Error handling USSD request:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error',
        data: {
          response: "Service temporarily unavailable. Please try again later.",
          continueSession: false
        }
      };
    }
  },

  // Get USSD session status (for debugging/admin purposes)
  getUSSDSession: async (_: any, args: any, context: any) => {
    try {
      if (!context?.user?.id) {
        return {
          code: 401,
          success: false,
          message: 'Authentication required'
        };
      }

      const { sessionId } = args;
      
      const USSDSession = (await import("../../models/ussdSession.model")).default;
      const session = await USSDSession.findOne({ sessionId });

      if (!session) {
        return {
          code: 404,
          success: false,
          message: 'USSD session not found'
        };
      }

      return {
        code: 200,
        success: true,
        data: session
      };

    } catch (error) {
      logger.error('Error getting USSD session:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },

  // Clean up expired USSD sessions (for maintenance)
  cleanupExpiredSessions: async (_: any, args: any, context: any) => {
    try {
      if (!context?.user?.id) {
        return {
          code: 401,
          success: false,
          message: 'Authentication required'
        };
      }

      await USSDService.cleanupExpiredSessions();

      return {
        code: 200,
        success: true,
        message: 'Expired sessions cleaned up successfully'
      };

    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  }
};
