export const voteTypeDef = `
  # Vote channel types
  enum VoteChannel {
    USSD
    WEB
    MOBILE_APP
  }

  # Payment status
  enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
  }

  # Payment method
  enum PaymentMethod {
    MOBILE_MONEY
    CARD
    USSD
  }

  # Voter information
  type Voter {
    phoneNumber: String
    email: String
    ipAddress: String!
    userAgent: String
  }

  # Vote metadata
  type VoteMetadata {
    ussdSessionId: String
    deviceInfo: JSON
    location: VoteLocation
    paymentReference: String
  }

  type VoteLocation {
    latitude: Float
    longitude: Float
    country: String
    region: String
  }

  # Vote type
  type Vote {
    id: ID!
    event: Event!
    category: Category!
    nominee: Nominee!
    voter: Voter!
    voteChannel: VoteChannel!
    transactionId: String!
    paymentStatus: PaymentStatus!
    paymentMethod: PaymentMethod!
    amountPaid: Float!
    voteMasterFee: Float!
    organizationAmount: Float!
    metadata: VoteMetadata
    createdAt: String!
    updatedAt: String!
  }

  # Vote result for analytics
  type VoteResult {
    nominee: NomineeVoteInfo!
    category: CategoryInfo!
    voteCount: Int!
    totalAmount: Float!
    voteMasterFees: Float!
    organizationAmount: Float!
  }

  type NomineeVoteInfo {
    id: ID!
    fullName: String!
    imageURL: String
    description: String
  }

  type CategoryInfo {
    id: ID!
    name: String!
  }

  # Vote analytics
  type VoteStatusBreakdown {
    status: PaymentStatus!
    count: Int!
    totalAmount: Float!
  }

  type VoteChannelBreakdown {
    channel: VoteChannel!
    count: Int!
  }

  type PaymentMethodBreakdown {
    method: PaymentMethod!
    count: Int!
    totalAmount: Float!
  }

  type RevenueStats {
    totalRevenue: Float!
    totalVoteMasterFees: Float!
    totalOrganizationAmount: Float!
    completedVotes: Int!
  }

  type VoteTimeData {
    date: String!
    count: Int!
    revenue: Float!
  }

  type VoteAnalytics {
    statusBreakdown: [VoteStatusBreakdown!]!
    channelBreakdown: [VoteChannelBreakdown!]!
    paymentMethodBreakdown: [PaymentMethodBreakdown!]!
    revenueStats: [RevenueStats!]!
    votesOverTime: [VoteTimeData!]!
  }

  # Pagination for vote results
  type VoteResultsPagination {
    page: Int!
    limit: Int!
    total: Int!
    pages: Int!
  }

  type VoteResultsData {
    results: [VoteResult!]!
    pagination: VoteResultsPagination!
  }

  # Input types
  input VoterInfoInput {
    phoneNumber: String
    email: String
    paymentMethod: PaymentMethod = MOBILE_MONEY
    location: VoteLocationInput
  }

  input VoteLocationInput {
    latitude: Float
    longitude: Float
    country: String
    region: String
  }

  input VoteInput {
    eventId: ID!
    categoryId: ID!
    nomineeId: ID!
    voterInfo: VoterInfoInput!
  }

  input PaymentCallbackInput {
    transactionId: String!
    status: PaymentStatus!
    paymentReference: String
    metadata: JSON
  }

  # Response types
  type VoteInitiationData {
    voteId: ID!
    transactionId: String!
    paymentReference: String
    amount: Float!
    paymentInstructions: String!
  }

  type VoteResponse {
    code: Int!
    success: Boolean!
    message: String!
    data: VoteInitiationData
  }

  type VoteStatusData {
    transactionId: String!
    paymentStatus: PaymentStatus!
    amount: Float!
    nominee: Nominee!
    event: Event!
    category: Category!
    createdAt: String!
  }

  type VoteStatusResponse {
    code: Int!
    success: Boolean!
    message: String
    data: VoteStatusData
  }

  type VoteResultsResponse {
    code: Int!
    success: Boolean!
    message: String
    data: VoteResultsData
  }

  type VoteAnalyticsResponse {
    code: Int!
    success: Boolean!
    message: String
    data: VoteAnalytics
  }

  type PaymentCallbackResponse {
    code: Int!
    success: Boolean!
    message: String!
    data: JSON
  }

  extend type Query {
    # Get vote results for an event
    getVoteResults(
      eventId: ID!
      categoryId: ID
      page: Int = 1
      limit: Int = 20
    ): VoteResultsResponse!
    
    # Get vote analytics (admin only)
    getVoteAnalytics(eventId: ID!): VoteAnalyticsResponse!
    
    # Check vote status by transaction ID
    checkVoteStatus(transactionId: String!): VoteStatusResponse!
  }

  extend type Mutation {
    # Cast a vote
    castVote(voteInput: VoteInput!): VoteResponse!
    
    # Process payment callback from payment providers
    processPaymentCallback(paymentData: PaymentCallbackInput!): PaymentCallbackResponse!
  }
`;
