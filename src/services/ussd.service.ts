import USSDSession from "../models/ussdSession.model";
import Event from "../models/event.model";
import Category from "../models/category.model";
import Nominee from "../models/nominee.model";
import Vote from "../models/vote.model";
import { PaymentService } from "./payment.service";
import { logger } from "../utils/logger";
import { config } from "../config/app.config";

export interface USSDRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

export interface USSDResponse {
  response: string;
  continueSession: boolean;
}

export class USSDService {

  static async handleUSSDRequest(request: USSDRequest): Promise<USSDResponse> {
    try {
      const { sessionId, phoneNumber, text } = request;
      
     
      let session = await USSDSession.findOne({ sessionId, status: 'ACTIVE' });
      
      if (!session) {
        session = await this.createNewSession(sessionId, phoneNumber);
      }

     
      const userInput = text.split('*').pop() || '';
      const inputHistory = text.split('*');

     
      const response = await this.routeRequest(session, userInput, inputHistory);
      
      return response;
    } catch (error:any) {
      logger.error('USSD request handling failed:', error);
      return {
        response: "Sorry, something went wrong. Please try again later.",
        continueSession: false,
      };
    }
  }

 
  private static async createNewSession(sessionId: string, phoneNumber: string): Promise<any> {
    const expiresAt = new Date(Date.now() + config.USSD_SESSION_TIMEOUT * 1000);
    
    return await USSDSession.create({
      sessionId,
      phoneNumber,
      currentStep: 'MAIN_MENU',
      sessionData: {},
      status: 'ACTIVE',
      expiresAt,
    });
  }


  private static async routeRequest(session: any, userInput: string, inputHistory: string[]): Promise<USSDResponse> {
    switch (session.currentStep) {
      case 'MAIN_MENU':
        return await this.handleMainMenu(session, userInput);
      
      case 'SELECT_EVENT':
        return await this.handleEventSelection(session, userInput);
      
      case 'SELECT_CATEGORY':
        return await this.handleCategorySelection(session, userInput);
      
      case 'SELECT_NOMINEE':
        return await this.handleNomineeSelection(session, userInput);
      
      case 'CONFIRM_VOTE':
        return await this.handleVoteConfirmation(session, userInput);
      
      case 'PROCESS_PAYMENT':
        return await this.handlePaymentProcess(session, userInput);
      
      default:
        return await this.handleMainMenu(session, userInput);
    }
  }

  
  private static async handleMainMenu(session: any, userInput: string): Promise<USSDResponse> {
    if (!userInput) {
     
      return {
        response: "Welcome to VoteMaster!\n1. Vote for a nominee\n2. Check vote results\n3. Help",
        continueSession: true,
      };
    }

    switch (userInput) {
      case '1':
        session.currentStep = 'SELECT_EVENT';
        await session.save();
        return await this.showActiveEvents(session);
      
      case '2':
        return await this.showVoteResults(session);
      
      case '3':
        return {
          response: "VoteMaster USSD Help:\n- Dial *123*456# to vote\n- Standard SMS rates apply\n- For support: contact@votemaster.com",
          continueSession: false,
        };
      
      default:
        return {
          response: "Invalid option. Please try again.\n1. Vote for a nominee\n2. Check vote results\n3. Help",
          continueSession: true,
        };
    }
  }

 
  private static async showActiveEvents(session: any): Promise<USSDResponse> {
    const currentDate = new Date();
    const events = await Event.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).limit(10);

    if (events.length === 0) {
      return {
        response: "No active voting events at the moment. Please check back later.",
        continueSession: false,
      };
    }

    let response = "Select an event to vote:\n";
    events.forEach((event, index) => {
      response += `${index + 1}. ${event.name}\n`;
    });
    response += "0. Back to main menu";

   
    session.sessionData.availableEvents = events.map(event => ({
      id: event._id,
      name: event.name,
      pricePerVote: event.pricePerVote,
    }));
    await session.save();

    return {
      response,
      continueSession: true,
    };
  }

 
  private static async handleEventSelection(session: any, userInput: string): Promise<USSDResponse> {
    const eventIndex = parseInt(userInput) - 1;
    const availableEvents = session.sessionData.availableEvents || [];

    if (userInput === '0') {
      session.currentStep = 'MAIN_MENU';
      await session.save();
      return await this.handleMainMenu(session, '');
    }

    if (eventIndex < 0 || eventIndex >= availableEvents.length) {
      return {
        response: "Invalid selection. Please choose a valid event number or 0 to go back.",
        continueSession: true,
      };
    }

    const selectedEvent = availableEvents[eventIndex];
    session.sessionData.selectedEvent = selectedEvent.id;
    session.currentStep = 'SELECT_CATEGORY';
    await session.save();

    return await this.showEventCategories(session, selectedEvent.id);
  }

  
  private static async showEventCategories(session: any, eventId: string): Promise<USSDResponse> {
    const categories = await Category.find({ event: eventId }).limit(10);

    if (categories.length === 0) {
      return {
        response: "No categories available for this event.",
        continueSession: false,
      };
    }

    let response = "Select a category:\n";
    categories.forEach((category, index) => {
      response += `${index + 1}. ${category.name}\n`;
    });
    response += "0. Back to events";

    session.sessionData.availableCategories = categories.map(cat => ({
      id: cat._id,
      name: cat.name,
    }));
    await session.save();

    return {
      response,
      continueSession: true,
    };
  }

 
  private static async handleCategorySelection(session: any, userInput: string): Promise<USSDResponse> {
    const categoryIndex = parseInt(userInput) - 1;
    const availableCategories = session.sessionData.availableCategories || [];

    if (userInput === '0') {
      session.currentStep = 'SELECT_EVENT';
      await session.save();
      return await this.showActiveEvents(session);
    }

    if (categoryIndex < 0 || categoryIndex >= availableCategories.length) {
      return {
        response: "Invalid selection. Please choose a valid category number or 0 to go back.",
        continueSession: true,
      };
    }

    const selectedCategory = availableCategories[categoryIndex];
    session.sessionData.selectedCategory = selectedCategory.id;
    session.currentStep = 'SELECT_NOMINEE';
    await session.save();

    return await this.showCategoryNominees(session, selectedCategory.id);
  }

 
  private static async showCategoryNominees(session: any, categoryId: string): Promise<USSDResponse> {
    const nominees = await Nominee.find({ 
      category: categoryId,
      isActive: true 
    }).limit(10);

    if (nominees.length === 0) {
      return {
        response: "No nominees available for this category.",
        continueSession: false,
      };
    }

    let response = "Select a nominee to vote for:\n";
    nominees.forEach((nominee, index) => {
      response += `${index + 1}. ${nominee.fullName}\n`;
    });
    response += "0. Back to categories";

    session.sessionData.availableNominees = nominees.map(nominee => ({
      id: nominee._id,
      fullName: nominee.fullName,
    }));
    await session.save();

    return {
      response,
      continueSession: true,
    };
  }

 
  private static async handleNomineeSelection(session: any, userInput: string): Promise<USSDResponse> {
    const nomineeIndex = parseInt(userInput) - 1;
    const availableNominees = session.sessionData.availableNominees || [];

    if (userInput === '0') {
      session.currentStep = 'SELECT_CATEGORY';
      await session.save();
      return await this.showEventCategories(session, session.sessionData.selectedEvent);
    }

    if (nomineeIndex < 0 || nomineeIndex >= availableNominees.length) {
      return {
        response: "Invalid selection. Please choose a valid nominee number or 0 to go back.",
        continueSession: true,
      };
    }

    const selectedNominee = availableNominees[nomineeIndex];
    session.sessionData.selectedNominee = selectedNominee.id;
    session.currentStep = 'CONFIRM_VOTE';
    await session.save();

   
    const event = await Event.findById(session.sessionData.selectedEvent);
    const fees = PaymentService.calculateFees(event?.pricePerVote as unknown as  number);

    return {
      response: `Confirm your vote:\nNominee: ${selectedNominee.fullName}\nCost: $${fees.totalAmount}\n\n1. Confirm & Pay\n0. Cancel`,
      continueSession: true,
    };
  }


  private static async handleVoteConfirmation(session: any, userInput: string): Promise<USSDResponse> {
    if (userInput === '0') {
      session.currentStep = 'SELECT_NOMINEE';
      await session.save();
      return await this.showCategoryNominees(session, session.sessionData.selectedCategory);
    }

    if (userInput === '1') {
      session.currentStep = 'PROCESS_PAYMENT';
      await session.save();
      return await this.initiatePayment(session);
    }

    return {
      response: "Invalid option.\n1. Confirm & Pay\n0. Cancel",
      continueSession: true,
    };
  }

 
  private static async initiatePayment(session: any): Promise<USSDResponse> {
    try {
      const event = await Event.findById(session.sessionData.selectedEvent);
      const fees = PaymentService.calculateFees(event?.pricePerVote as unknown as number);
      
      const transactionId = `VOTE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentRequest = {
        amount: fees.totalAmount,
        phoneNumber: session.phoneNumber,
        transactionId,
        description: `Vote payment for ${event?.name}`,
        metadata: {
          sessionId: session.sessionId,
          eventId: session.sessionData.selectedEvent,
          categoryId: session.sessionData.selectedCategory,
          nomineeId: session.sessionData.selectedNominee,
        },
      };

      const paymentResponse = await PaymentService.initiateMobileMoneyPayment(paymentRequest);

      if (paymentResponse.success) {
        session.sessionData.transactionId = transactionId;
        await session.save();

    
        await Vote.create({
          event: session.sessionData.selectedEvent,
          category: session.sessionData.selectedCategory,
          nominee: session.sessionData.selectedNominee,
          voter: {
            phoneNumber: session.phoneNumber,
            ipAddress: 'USSD',
          },
          voteChannel: 'USSD',
          transactionId,
          paymentStatus: 'PENDING',
          paymentMethod: 'MOBILE_MONEY',
          amountPaid: fees.totalAmount,
          voteMasterFee: fees.voteMasterFee,
          organizationAmount: fees.organizationAmount,
          metadata: {
            ussdSessionId: session.sessionId,
          },
        });

        return {
          response: `Payment initiated! Please check your phone for payment confirmation. Transaction ID: ${transactionId}`,
          continueSession: false,
        };
      } else {
        return {
          response: "Payment initiation failed. Please try again later.",
          continueSession: false,
        };
      }
    } catch (error:any) {
      logger.error('Payment initiation error:', error);
      return {
        response: "Payment processing error. Please try again later.",
        continueSession: false,
      };
    }
  }

  private static async handlePaymentProcess(session: any, userInput: string): Promise<USSDResponse> {
    return {
      response: "Processing your payment. Please wait...",
      continueSession: false,
    };
  }

  private static async showVoteResults(session: any): Promise<USSDResponse> {
    
    return {
      response: "Vote results feature coming soon!",
      continueSession: false,
    };
  }

 
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      const result = await USSDSession.deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { status: { $in: ['COMPLETED', 'CANCELLED'] } }
        ]
      });
      
      logger.info(`Cleaned up ${result.deletedCount} expired USSD sessions`);
    } catch (error:any) {
      logger.error('Session cleanup error:', error);
    }
  }
}
