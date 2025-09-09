import Vote from "../models/vote.model";
import Nominee from "../models/nominee.model";
import { PaymentService } from "./payment.service";
import { USSDService } from "./ussd.service";
import { logger } from "../utils/logger";

export class BackgroundJobService {
  private static isRunning = false;

 
  static start() {
    if (this.isRunning) {
      logger.warn('Background jobs already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting background jobs...');

  
    setInterval(() => {
      this.checkPendingPayments().catch(error => {
        logger.error('Pending payment check error:', error);
      });
    }, 30000);

    
    setInterval(() => {
      USSDService.cleanupExpiredSessions().catch(error => {
        logger.error('Session cleanup error:', error);
      });
    }, 300000);

   
    setInterval(() => {
      this.updateVoteCounts().catch(error => {
        logger.error('Vote count update error:', error);
      });
    }, 120000);

    
    setInterval(() => {
      this.cleanupFailedPayments().catch(error => {
        logger.error('Failed payment cleanup error:', error);
      });
    }, 3600000);
  }

  
  static stop() {
    this.isRunning = false;
    logger.info('Background jobs stopped');
  }

  
  private static async checkPendingPayments() {
    try {
      // Get pending votes older than 1 minute
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const pendingVotes = await Vote.find({
        paymentStatus: 'PENDING',
        createdAt: { $lt: oneMinuteAgo }
      }).limit(50);

      logger.info(`Checking ${pendingVotes.length} pending payments`);

      for (const vote of pendingVotes) {
        try {
          const paymentStatus = await PaymentService.checkPaymentStatus(vote.transactionId);
          
          if (paymentStatus.status !== vote.paymentStatus) {
           
            const statusMapping: { [key: string]: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' } = {
              'PENDING': 'PENDING',
              'COMPLETED': 'COMPLETED',
              'FAILED': 'FAILED',
              'CANCELLED': 'FAILED'
            };
            vote.paymentStatus = statusMapping[paymentStatus.status] || 'FAILED';
            
            if (paymentStatus.status === 'COMPLETED') {
              
              await Nominee.findByIdAndUpdate(vote.nominee, {
                $inc: { voteCount: 1 }
              });
              
              logger.info(`Payment completed: ${vote.transactionId}`);
            } else if (paymentStatus.status === 'FAILED') {
              logger.info(`Payment failed: ${vote.transactionId}`);
            }
            
            await vote.save();
          }
        } catch (error) {
          logger.error(`Error checking payment ${vote.transactionId}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in checkPendingPayments:', error);
    }
  }


  private static async updateVoteCounts() {
    try {
      const voteCountsUpdate = await Vote.aggregate([
        {
          $match: { paymentStatus: 'COMPLETED' }
        },
        {
          $group: {
            _id: '$nominee',
            count: { $sum: 1 }
          }
        }
      ]);

      for (const update of voteCountsUpdate) {
        await Nominee.findByIdAndUpdate(
          update._id,
          { voteCount: update.count },
          { upsert: false }
        );
      }

      logger.info(`Updated vote counts for ${voteCountsUpdate.length} nominees`);
    } catch (error) {
      logger.error('Error updating vote counts:', error);
    }
  }

  
  private static async cleanupFailedPayments() {
    try {
      const oneDayAgo = new Date(Date.now() - 86400000);
      
      const result = await Vote.deleteMany({
        paymentStatus: 'FAILED',
        createdAt: { $lt: oneDayAgo }
      });

      logger.info(`Cleaned up ${result.deletedCount} old failed payments`);
    } catch (error) {
      logger.error('Error cleaning up failed payments:', error);
    }
  }

 
  static async generateDailyReport() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dailyStats = await Vote.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            paymentStatus: 'COMPLETED'
          }
        },
        {
          $group: {
            _id: null,
            totalVotes: { $sum: 1 },
            totalRevenue: { $sum: '$amountPaid' },
            voteMasterFees: { $sum: '$voteMasterFee' },
            organizationRevenue: { $sum: '$organizationAmount' },
            channels: {
              $push: '$voteChannel'
            }
          }
        }
      ]);

      if (dailyStats.length > 0) {
        const stats = dailyStats[0];
        const channelBreakdown = stats.channels.reduce((acc: any, channel: string) => {
          acc[channel] = (acc[channel] || 0) + 1;
          return acc;
        }, {});

        logger.info('Daily Report Generated:', {
          date: today.toISOString().split('T')[0],
          totalVotes: stats.totalVotes,
          totalRevenue: stats.totalRevenue,
          voteMasterFees: stats.voteMasterFees,
          organizationRevenue: stats.organizationRevenue,
          channelBreakdown
        });
      }
    } catch (error) {
      logger.error('Error generating daily report:', error);
    }
  }

  static getHealthStatus() {
    return {
      isRunning: this.isRunning,
      timestamp: new Date().toISOString()
    };
  }
}
