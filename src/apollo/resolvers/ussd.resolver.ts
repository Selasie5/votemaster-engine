import { ussdController } from "../../controllers/ussd/ussd.controller";

export const ussdResolver = {
  Query: {
    getUSSDSession: ussdController.getUSSDSession
  },
  
  Mutation: {
    handleUSSDRequest: ussdController.handleUSSDRequest,
    cleanupExpiredSessions: ussdController.cleanupExpiredSessions
  }
};
