import Vote from "../../models/vote.model";
import Event from "../../models/event.model";
import Category from "../../models/category.model";
import Nominee from "../../models/nominee.model";
import { PaymentService } from "../../services/payment.service";
import { logger } from "../../utils/logger";

export const voteController = {
  
  castVote: async (_: any, args: any, context: any) => {
    try {
      const { eventId, categoryId, nomineeId, voterInfo } = args.voteInput;
      const ipAddress = context.req?.ip || context.req?.connection?.remoteAddress || 'unknown';
      const userAgent = context.req?.headers['user-agent'] || 'unknown';

     
      const event = await Event.findById(eventId);
      if (!event) {
        return {
          code: 404,
          success: false,
          message: 'Event not found'
        };
      }

      const now = new Date();
      if (now < event.startDate || now > event.endDate) {
        return {
          code: 400,
          success: false,
          message: 'Voting is not currently active for this event'
        };
      }

      
      const category = await Category.findById(categoryId);
      const nominee = await Nominee.findById(nomineeId);

      if (!category || !nominee) {
        return {
          code: 404,
          success: false,
          message: 'Category or nominee not found'
        };
      }

      if (!nominee.isActive) {
        return {
          code: 400,
          success: false,
          message: 'This nominee is no longer active'
        };
      }

      // Check for duplicate votes (based on email or phone)
      const duplicateQuery: any = { event: eventId, nominee: nomineeId };
      if (voterInfo.email) {
        duplicateQuery['voter.email'] = voterInfo.email;
      } else if (voterInfo.phoneNumber) {
        duplicateQuery['voter.phoneNumber'] = voterInfo.phoneNumber;
      }

      const existingVote = await Vote.findOne({
        ...duplicateQuery,
        paymentStatus: { $in: ['COMPLETED', 'PENDING'] }
      });

      if (existingVote) {
        return {
          code: 409,
          success: false,
          message: 'You have already voted for this nominee'
        };
      }

      // Calculate fees
      const fees = PaymentService.calculateFees(event.pricePerVote);
      const transactionId = `VOTE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Initiate payment
      const paymentRequest = {
        amount: fees.totalAmount,
        phoneNumber: voterInfo.phoneNumber || '',
        transactionId,
        description: `Vote for ${nominee.fullName} in ${event.name}`,
        metadata: {
          eventId,
          categoryId,
          nomineeId,
          voterInfo
        }
      };

      let paymentResponse;
      let paymentMethod = 'MOBILE_MONEY';

      if (voterInfo.paymentMethod === 'CARD') {
        // For card payments, you would integrate with a payment processor like Stripe, Paystack, etc.
        paymentMethod = 'CARD';
        // Mock card payment initiation
        paymentResponse = {
          success: true,
          transactionId,
          paymentReference: `CARD_${transactionId}`,
          message: "Card payment initiated"
        };
      } else {
        // Mobile money payment
        paymentResponse = await PaymentService.initiateMobileMoneyPayment(paymentRequest);
      }

      if (!paymentResponse.success) {
        return {
          code: 400,
          success: false,
          message: paymentResponse.message
        };
      }

    
      const vote = await Vote.create({
        event: eventId,
        category: categoryId,
        nominee: nomineeId,
        voter: {
          phoneNumber: voterInfo.phoneNumber,
          email: voterInfo.email,
          ipAddress,
          userAgent
        },
        voteChannel: context.req?.headers['x-client-type'] === 'mobile' ? 'MOBILE_APP' : 'WEB',
        transactionId,
        paymentStatus: 'PENDING',
        paymentMethod,
        amountPaid: fees.totalAmount,
        voteMasterFee: fees.voteMasterFee,
        organizationAmount: fees.organizationAmount,
        metadata: {
          location: voterInfo.location || {}
        }
      });

      logger.info(`Vote initiated: ${transactionId} for nominee ${nomineeId}`);

      return {
        code: 201,
        success: true,
        message: 'Vote initiated. Please complete payment to confirm your vote.',
        data: {
          voteId: vote._id,
          transactionId,
          paymentReference: paymentResponse.paymentReference,
          amount: fees.totalAmount,
          paymentInstructions: paymentResponse.message
        }
      };

    } catch (error) {
      logger.error('Error casting vote:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },

  // Process payment webhook/callback
  processPaymentCallback: async (_: any, args: any, context: any) => {
    try {
      const { transactionId, status, paymentReference, metadata } = args.paymentData;

      const vote = await Vote.findOne({ transactionId });
      if (!vote) {
        logger.warn(`Payment callback for unknown transaction: ${transactionId}`);
        return {
          code: 404,
          success: false,
          message: 'Transaction not found'
        };
      }

      const oldStatus = vote.paymentStatus;
      vote.paymentStatus = status;
      vote.metadata = { ...vote.metadata, paymentReference, ...metadata };

      if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
        // Update nominee vote count
        await Nominee.findByIdAndUpdate(vote.nominee, {
          $inc: { voteCount: 1 }
        });

        logger.info(`Vote completed: ${transactionId} for nominee ${vote.nominee}`);
      } else if (status === 'FAILED' || status === 'CANCELLED') {
        logger.info(`Vote payment failed/cancelled: ${transactionId}`);
      }

      await vote.save();

      return {
        code: 200,
        success: true,
        message: `Payment status updated to ${status}`,
        data: { transactionId, status }
      };

    } catch (error) {
      logger.error('Error processing payment callback:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },

  // Get vote results for an event
  getVoteResults: async (_: any, args: any, context: any) => {
    try {
      const { eventId, categoryId, page = 1, limit = 20 } = args;

      const matchQuery: any = {
        event: eventId,
        paymentStatus: 'COMPLETED'
      };

      if (categoryId) {
        matchQuery.category = categoryId;
      }

      // Aggregate vote results
      const results = await Vote.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              nominee: '$nominee',
              category: '$category'
            },
            voteCount: { $sum: 1 },
            totalAmount: { $sum: '$amountPaid' },
            voteMasterFees: { $sum: '$voteMasterFee' },
            organizationAmount: { $sum: '$organizationAmount' }
          }
        },
        {
          $lookup: {
            from: 'nominees',
            localField: '_id.nominee',
            foreignField: '_id',
            as: 'nominee'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id.category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$nominee'
        },
        {
          $unwind: '$category'
        },
        {
          $sort: { voteCount: -1, 'nominee.fullName': 1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        },
        {
          $project: {
            nominee: {
              _id: '$nominee._id',
              fullName: '$nominee.fullName',
              imageURL: '$nominee.imageURL',
              description: '$nominee.description'
            },
            category: {
              _id: '$category._id',
              name: '$category.name'
            },
            voteCount: 1,
            totalAmount: 1,
            voteMasterFees: 1,
            organizationAmount: 1
          }
        }
      ]);

      // Get total count for pagination
      const totalCount = await Vote.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              nominee: '$nominee',
              category: '$category'
            }
          }
        },
        { $count: 'total' }
      ]);

      const total = totalCount[0]?.total || 0;

      return {
        code: 200,
        success: true,
        data: {
          results,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      logger.error('Error getting vote results:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },

  // Get vote analytics for an event
  getVoteAnalytics: async (_: any, args: any, context: any) => {
    try {
      if (!context?.user?.id) {
        return {
          code: 401,
          success: false,
          message: 'Authentication required'
        };
      }

      const { eventId } = args;

      // Verify user has access to this event
      const event = await Event.findById(eventId);
      if (!event) {
        return {
          code: 404,
          success: false,
          message: 'Event not found'
        };
      }

      const analytics = await Vote.aggregate([
        { $match: { event: eventId } },
        {
          $facet: {
            // Vote status breakdown
            statusBreakdown: [
              {
                $group: {
                  _id: '$paymentStatus',
                  count: { $sum: 1 },
                  totalAmount: { $sum: '$amountPaid' }
                }
              }
            ],
            // Votes by channel
            channelBreakdown: [
              {
                $group: {
                  _id: '$voteChannel',
                  count: { $sum: 1 }
                }
              }
            ],
            // Votes by payment method
            paymentMethodBreakdown: [
              {
                $group: {
                  _id: '$paymentMethod',
                  count: { $sum: 1 },
                  totalAmount: { $sum: '$amountPaid' }
                }
              }
            ],
            // Revenue breakdown
            revenueStats: [
              {
                $match: { paymentStatus: 'COMPLETED' }
              },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$amountPaid' },
                  totalVoteMasterFees: { $sum: '$voteMasterFee' },
                  totalOrganizationAmount: { $sum: '$organizationAmount' },
                  completedVotes: { $sum: 1 }
                }
              }
            ],
            // Votes over time (daily)
            votesOverTime: [
              {
                $match: { paymentStatus: 'COMPLETED' }
              },
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$createdAt"
                    }
                  },
                  count: { $sum: 1 },
                  revenue: { $sum: '$amountPaid' }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        }
      ]);

      return {
        code: 200,
        success: true,
        data: analytics[0]
      };

    } catch (error) {
      logger.error('Error getting vote analytics:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },

  // Check vote status
  checkVoteStatus: async (_: any, args: any, context: any) => {
    try {
      const { transactionId } = args;

      const vote = await Vote.findOne({ transactionId })
        .populate('event nominee category');

      if (!vote) {
        return {
          code: 404,
          success: false,
          message: 'Vote not found'
        };
      }

      // Check payment status from payment provider if still pending
      if (vote.paymentStatus === 'PENDING') {
        const paymentStatus = await PaymentService.checkPaymentStatus(transactionId);
        
        if (paymentStatus.status !== vote.paymentStatus) {
          vote.paymentStatus = paymentStatus.status;
          
          if (paymentStatus.status === 'COMPLETED') {
            // Update nominee vote count
            await Nominee.findByIdAndUpdate(vote.nominee, {
              $inc: { voteCount: 1 }
            });
          }
          
          await vote.save();
        }
      }

      return {
        code: 200,
        success: true,
        data: {
          transactionId: vote.transactionId,
          paymentStatus: vote.paymentStatus,
          amount: vote.amountPaid,
          nominee: vote.nominee,
          event: vote.event,
          category: vote.category,
          createdAt: vote.createdAt
        }
      };

    } catch (error) {
      logger.error('Error checking vote status:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  }
};
