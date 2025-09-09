import { Router } from 'express';
import { voteController } from '../controllers/vote/vote.controller';
import { logger } from '../utils/logger';

const router = Router();

// Payment webhook endpoint for mobile money providers
router.post('/webhook/payment', async (req, res) => {
  try {
    const paymentData = req.body;
    
    logger.info('Payment webhook received:', paymentData);

    // Different payment providers have different webhook formats
    // You'll need to adapt this based on your providers
    
    let normalizedPaymentData;

    // Example: MTN MoMo webhook format
    if (paymentData.provider === 'mtn_momo') {
      normalizedPaymentData = {
        transactionId: paymentData.externalId,
        status: paymentData.status === 'SUCCESSFUL' ? 'COMPLETED' : 
                paymentData.status === 'FAILED' ? 'FAILED' : 'PENDING',
        paymentReference: paymentData.financialTransactionId,
        metadata: {
          provider: 'mtn_momo',
          amount: paymentData.amount,
          currency: paymentData.currency,
          phoneNumber: paymentData.payer?.partyId
        }
      };
    }
    // Example: Airtel Money webhook format
    else if (paymentData.provider === 'airtel_money') {
      normalizedPaymentData = {
        transactionId: paymentData.transaction?.id,
        status: paymentData.transaction?.status === 'TS' ? 'COMPLETED' : 
                paymentData.transaction?.status === 'TF' ? 'FAILED' : 'PENDING',
        paymentReference: paymentData.transaction?.airtel_money_id,
        metadata: {
          provider: 'airtel_money',
          amount: paymentData.transaction?.amount,
          currency: paymentData.transaction?.currency,
          phoneNumber: paymentData.subscriber?.msisdn
        }
      };
    }
    // Generic webhook format
    else {
      normalizedPaymentData = {
        transactionId: paymentData.transactionId || paymentData.transaction_id,
        status: paymentData.status,
        paymentReference: paymentData.paymentReference || paymentData.reference,
        metadata: paymentData.metadata || {}
      };
    }

    // Process the payment callback
    const result = await voteController.processPaymentCallback(
      null, 
      { paymentData: normalizedPaymentData }, 
      {}
    );

    if (result.success) {
      res.status(200).json({ message: 'Webhook processed successfully' });
    } else {
      res.status(400).json({ error: result.message });
    }

  } catch (error) {
    logger.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// MTN MoMo specific webhook endpoint
router.post('/webhook/mtn-momo', async (req, res) => {
  try {
    const webhookData = req.body;
    
    const paymentData = {
      transactionId: webhookData.externalId,
      status: webhookData.status === 'SUCCESSFUL' ? 'COMPLETED' : 
              webhookData.status === 'FAILED' ? 'FAILED' : 'PENDING',
      paymentReference: webhookData.financialTransactionId,
      metadata: {
        provider: 'mtn_momo',
        amount: webhookData.amount,
        currency: webhookData.currency,
        phoneNumber: webhookData.payer?.partyId,
        reason: webhookData.reason
      }
    };

    const result = await voteController.processPaymentCallback(null, { paymentData }, {});
    
    res.status(200).json({ message: 'MTN MoMo webhook processed' });

  } catch (error) {
    logger.error('MTN MoMo webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Airtel Money specific webhook endpoint
router.post('/webhook/airtel-money', async (req, res) => {
  try {
    const webhookData = req.body;
    
    const paymentData = {
      transactionId: webhookData.transaction?.id,
      status: webhookData.transaction?.status === 'TS' ? 'COMPLETED' : 
              webhookData.transaction?.status === 'TF' ? 'FAILED' : 'PENDING',
      paymentReference: webhookData.transaction?.airtel_money_id,
      metadata: {
        provider: 'airtel_money',
        amount: webhookData.transaction?.amount,
        currency: webhookData.transaction?.currency,
        phoneNumber: webhookData.subscriber?.msisdn
      }
    };

    const result = await voteController.processPaymentCallback(null, { paymentData }, {});
    
    res.status(200).json({ message: 'Airtel Money webhook processed' });

  } catch (error) {
    logger.error('Airtel Money webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Manual payment status check endpoint
router.get('/payment/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const result = await voteController.checkVoteStatus(null, { transactionId }, {});
    
    res.json(result);

  } catch (error) {
    logger.error('Payment status check error:', error);
    res.status(500).json({ error: 'Status check failed' });
  }
});

export default router;
