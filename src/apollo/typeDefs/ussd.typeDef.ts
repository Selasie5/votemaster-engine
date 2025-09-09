export const ussdTypeDef = `
  # USSD session status
  enum USSDSessionStatus {
    ACTIVE
    COMPLETED
    EXPIRED
    CANCELLED
  }

  # USSD session data
  type USSDSessionData {
    selectedEvent: ID
    selectedCategory: ID
    selectedNominee: ID
    amount: Float
    transactionId: String
    userInputs: [JSON!]
  }

  # USSD session
  type USSDSession {
    id: ID!
    sessionId: String!
    phoneNumber: String!
    currentStep: String!
    sessionData: USSDSessionData!
    status: USSDSessionStatus!
    expiresAt: String!
    createdAt: String!
    updatedAt: String!
  }

  # USSD response
  type USSDResponseData {
    response: String!
    continueSession: Boolean!
  }

  # Input types
  input USSDRequestInput {
    sessionId: String!
    serviceCode: String!
    phoneNumber: String!
    text: String!
  }

  # Response types
  type USSDResponse {
    code: Int!
    success: Boolean!
    message: String
    data: USSDResponseData
  }

  type USSDSessionResponse {
    code: Int!
    success: Boolean!
    message: String
    data: USSDSession
  }

  extend type Query {
    # Get USSD session (admin only)
    getUSSDSession(sessionId: String!): USSDSessionResponse!
  }

  extend type Mutation {
    # Handle USSD request
    handleUSSDRequest(ussdRequest: USSDRequestInput!): USSDResponse!
    
    # Clean up expired USSD sessions (admin only)
    cleanupExpiredSessions: GenericResponse!
  }
`;
