import { Router } from 'express';
import { USSDService } from '../services/ussd.service';
import { logger } from '../utils/logger';

const router = Router();

// USSD endpoint - This would be called by telecom providers
router.post('/ussd', async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    // Log the incoming USSD request
    logger.info('USSD Request:', { sessionId, phoneNumber, text });

    // Validate required fields
    if (!sessionId || !phoneNumber) {
      return res.status(400).json({
        error: 'Missing required fields: sessionId, phoneNumber'
      });
    }

    // Handle the USSD request
    const response = await USSDService.handleUSSDRequest({
      sessionId,
      serviceCode: serviceCode || '*123*456#',
      phoneNumber,
      text: text || ''
    });

    // Format response for telecom provider
    // Different providers may expect different response formats
    const formattedResponse = {
      response: response.response,
      action: response.continueSession ? 'request' : 'end'
    };

    logger.info('USSD Response:', formattedResponse);

    res.json(formattedResponse);

  } catch (error) {
    logger.error('USSD endpoint error:', error);
    res.status(500).json({
      response: "Service temporarily unavailable. Please try again later.",
      action: "end"
    });
  }
});

// USSD callback endpoint (for some providers that use GET)
router.get('/ussd', async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.query;

    const response = await USSDService.handleUSSDRequest({
      sessionId: sessionId as string,
      serviceCode: serviceCode as string || '*123*456#',
      phoneNumber: phoneNumber as string,
      text: text as string || ''
    });

    const formattedResponse = {
      response: response.response,
      action: response.continueSession ? 'request' : 'end'
    };

    res.json(formattedResponse);

  } catch (error) {
    logger.error('USSD GET endpoint error:', error);
    res.status(500).json({
      response: "Service temporarily unavailable. Please try again later.",
      action: "end"
    });
  }
});

export default router;
