import { voteController } from "../../controllers/vote/vote.controller";

export const voteResolver = {
  Query: {
    getVoteResults: voteController.getVoteResults,
    getVoteAnalytics: voteController.getVoteAnalytics,
    checkVoteStatus: voteController.checkVoteStatus
  },
  
  Mutation: {
    castVote: voteController.castVote,
    processPaymentCallback: voteController.processPaymentCallback
  }
};
