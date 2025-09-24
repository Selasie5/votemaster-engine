# VoteMaster Engine Documentation

## Overview

VoteMaster Engine is a comprehensive voting platform that supports multiple voting channels including USSD, Web, and Mobile applications. The platform provides secure payment processing, real-time vote counting, and detailed analytics for voting events.

##  Architecture

### Core Components

1. **GraphQL API Layer**: Handles web and mobile app requests
2. **REST API Layer**: Handles USSD and webhook requests
3. **Payment Service**: Manages mobile money transactions
4. **USSD Service**: Handles telecommunications provider interactions
5. **Background Jobs**: Automated maintenance and monitoring
6. **Security Middleware**: Rate limiting, validation, and logging

### Data Flow

```
[Voter] → [USSD/Web/Mobile] → [API Layer] → [Business Logic] → [Payment Service] → [Database]
                                     ↓
[Background Jobs] ← [Payment Webhooks] ← [Payment Provider]
```

## 📱 Features & Use Cases

### 1. **USSD Voting System**

**Use Case**: Voters can cast votes using basic mobile phones without internet connectivity.

**How to Use**:
1. Dial the USSD service code (e.g., `*123*456#`)
2. Navigate through the menu system:
   - Select voting event
   - Choose category
   - Pick nominee
   - Confirm vote and payment
3. Complete mobile money payment on phone
4. Receive confirmation

**Implementation Details**:
```typescript
// USSD Request Flow
POST /api/ussd/ussd
{
  "sessionId": "unique-session-id",
  "phoneNumber": "+256700000000",
  "text": "1*2*3", // User's menu selections
  "serviceCode": "*123*456#"
}

// USSD Response Format
{
  "response": "Confirm your vote:\nNominee: John Doe\nCost: $1.50\n\n1. Confirm & Pay\n0. Cancel",
  "action": "request" // or "end"
}
```

**Features**:
- Session management with automatic expiration
- Rate limiting (5 requests/minute default)
- Multi-step navigation with back/cancel options
- Real-time fee calculation
- Payment initiation and tracking

### 2. **Web/Mobile App Voting**

**Use Case**: Voters can cast votes through web applications or mobile apps with rich user interfaces.

**How to Use**:
1. Authenticate user (optional for some events)
2. Select event and category
3. Choose nominee and enter voter information
4. Initiate payment
5. Complete payment through integrated payment gateway
6. Receive vote confirmation

**GraphQL Implementation**:
```graphql
# Cast a vote
mutation CastVote($voteInput: VoteInput!) {
  castVote(voteInput: $voteInput) {
    code
    success
    message
    data {
      voteId
      transactionId
      paymentReference
      amount
      paymentInstructions
    }
  }
}

# Check vote status
query CheckVoteStatus($transactionId: String!) {
  checkVoteStatus(transactionId: $transactionId) {
    code
    success
    data {
      transactionId
      paymentStatus
      amount
      nominee {
        id
        fullName
      }
    }
  }
}
```

### 3. **Event Management**

**Use Case**: Organizations can create and manage voting events with categories and nominees.

**How to Use**:
1. Register organization account
2. Create voting event with details
3. Add categories within the event
4. Create dynamic nominee forms (optional)
5. Add nominees to categories
6. Set event start/end dates
7. Monitor votes and analytics

**GraphQL Examples**:
```graphql
# Create event
mutation CreateEvent($event: EventInput!) {
  createEvent(event: $event) {
    code
    success
    message
    data {
      id
      name
      description
      startDate
      endDate
      pricePerVote
    }
  }
}

# Create category
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) {
    code
    success
    message
    data {
      id
      name
      description
      event {
        name
      }
    }
  }
}
```

### 4. **Dynamic Nominee Forms**

**Use Case**: Organizations can create custom forms for nominee submissions with various field types.

**How to Use**:
1. Create nominee form template for event/category
2. Define form fields with types and validation
3. Nominees fill out forms during registration
4. Data is stored as dynamic fields in nominee records

**Supported Field Types**:
- `TEXT`: Single line text input
- `TEXTAREA`: Multi-line text input
- `SELECT`: Dropdown selection
- `RADIO`: Single choice selection
- `CHECKBOX`: Multiple choice selection
- `FILE`: File upload (images, documents)
- `DATE`: Date picker
- `NUMBER`: Numeric input with validation
- `EMAIL`: Email address with validation
- `PHONE`: Phone number with validation

**Implementation**:
```graphql
# Create nominee form
mutation CreateNomineeForm($input: CreateNomineeFormInput!) {
  createNomineeForm(input: $input) {
    code
    success
    data {
      id
      formFields {
        fieldId
        fieldType
        label
        required
        validation {
          min
          max
          pattern
          errorMessage
        }
      }
    }
  }
}
```

### 5. **Payment Processing**

**Use Case**: Secure and reliable payment processing for vote transactions.

**Supported Payment Methods**:
- Mobile Money (MTN MoMo, Airtel Money)
- Credit/Debit Cards (planned)
- Bank Transfers (planned)

**Payment Flow**:
1. Vote initiation creates pending vote record
2. Payment request sent to payment provider
3. User completes payment on their device
4. Payment webhook confirms transaction
5. Vote status updated to completed
6. Nominee vote count incremented

**Webhook Integration**:
```typescript
// Payment webhook endpoint
POST /api/payments/webhook/payment
{
  "transactionId": "VOTE_1234567890_abc123",
  "status": "COMPLETED",
  "paymentReference": "REF_987654321",
  "amount": 1.50,
  "metadata": {
    "provider": "mtn_momo",
    "phoneNumber": "+256700000000"
  }
}
```

### 6. **Analytics & Reporting**

**Use Case**: Organizations can monitor voting progress and generate reports.

**Available Analytics**:
- Real-time vote counts by nominee
- Revenue breakdown (organization vs VoteMaster fees)
- Vote distribution by channel (USSD, Web, Mobile)
- Payment method analytics
- Time-series voting trends
- Geographic distribution (if available)

**GraphQL Queries**:
```graphql
# Get vote results
query GetVoteResults($eventId: ID!, $categoryId: ID, $page: Int, $limit: Int) {
  getVoteResults(eventId: $eventId, categoryId: $categoryId, page: $page, limit: $limit) {
    code
    success
    data {
      results {
        nominee {
          fullName
          imageURL
        }
        voteCount
        totalAmount
      }
      pagination {
        total
        pages
      }
    }
  }
}

# Get analytics (admin only)
query GetVoteAnalytics($eventId: ID!) {
  getVoteAnalytics(eventId: $eventId) {
    code
    success
    data {
      statusBreakdown {
        status
        count
        totalAmount
      }
      channelBreakdown {
        channel
        count
      }
      revenueStats {
        totalRevenue
        totalVoteMasterFees
        completedVotes
      }
    }
  }
}
```

##  Configuration

### Environment Setup

1. **Database Configuration**:
```typescript
// MongoDB connection
MONGODB_URI=mongodb://localhost:27017/votemaster
```

2. **Authentication Setup**:
```typescript
// JWT configuration
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

3. **Payment Provider Setup**:
```typescript
// MTN MoMo
MTN_MOMO_API_KEY=your-api-key
MTN_MOMO_USER_ID=your-user-id
MTN_MOMO_SUBSCRIPTION_KEY=your-subscription-key

// Airtel Money
AIRTEL_MONEY_CLIENT_ID=your-client-id
AIRTEL_MONEY_CLIENT_SECRET=your-client-secret
```

4. **USSD Configuration**:
```typescript
// USSD service settings
USSD_SERVICE_CODE=*123*456#
USSD_SESSION_TIMEOUT=300 // 5 minutes
```

5. **Fee Structure**:
```typescript
// VoteMaster fee configuration
VOTEMASTER_FEE_PERCENTAGE=0.05 // 5%
MIN_VOTEMASTER_FEE=0.50 // $0.50 minimum
MAX_VOTEMASTER_FEE=5.00 // $5.00 maximum
```

### Application Configuration

The application uses a centralized configuration system:

```typescript
// src/config/app.config.ts
export const config = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  USSD_SESSION_TIMEOUT: parseInt(process.env.USSD_SESSION_TIMEOUT || '300'),
  // ... other configurations
};
```

##  Getting Started

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/VoteMaster/votemaster-engine.git
cd votemaster-engine
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.sample .env
# Edit .env with your configuration
```

4. **Start the application**:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### API Endpoints

**GraphQL Endpoint**: `http://localhost:4000/graphql`
- Interactive GraphQL Playground available in development mode
- Handles all web and mobile app requests

**REST Endpoints**:
- `POST /api/ussd/ussd` - USSD request handler
- `POST /api/payments/webhook/payment` - Payment webhook
- `GET /health` - Health check endpoint

### Database Setup

The application automatically connects to MongoDB using the provided URI. Ensure MongoDB is running and accessible.

**Required Collections**:
- `organizations` - Organization accounts
- `events` - Voting events
- `categories` - Event categories
- `nominees` - Nominee records
- `nomineeforms` - Dynamic form templates
- `votes` - Vote records
- `ussdsessions` - USSD session data

##  Security Features

### Rate Limiting
```typescript
// USSD rate limiting (5 requests per minute per phone number)
app.use('/api/ussd', ussdRateLimit(5, 60000));
```

### Webhook Signature Verification
```typescript
// Verify payment webhook signatures
app.use('/api/payments/webhook', verifyWebhookSignature(secretKey));
```

### Request Logging
```typescript
// Log all requests with performance metrics
app.use(requestLogger);
```

### Input Validation
- GraphQL schema validation
- Dynamic form field validation
- Database model validation
- Custom business logic validation

##  Background Jobs

The application runs several background jobs for maintenance:

1. **Payment Status Monitoring**: Checks pending payments every 30 seconds
2. **Session Cleanup**: Removes expired USSD sessions every 5 minutes
3. **Vote Count Updates**: Synchronizes vote counts every 2 minutes
4. **Failed Payment Cleanup**: Removes old failed payments daily

```typescript
// Background job health check
GET /health
{
  "status": "healthy",
  "timestamp": "2025-09-24T10:30:00.000Z",
  "backgroundJobs": {
    "isRunning": true,
    "timestamp": "2025-09-24T10:30:00.000Z"
  }
}
```

##  Monitoring & Logging

### Logging System
The application uses a structured logging system:

```typescript
// Logger usage
logger.info('Vote completed successfully', { 
  transactionId: 'VOTE_123',
  nomineeId: 'nominee_456',
  amount: 1.50 
});

logger.error('Payment processing failed', error);
logger.warn('Rate limit exceeded', { phoneNumber: '+256700000000' });
```

### Health Monitoring
- Application health endpoint
- Background job monitoring
- Database connection status
- Payment provider connectivity

### Performance Metrics
- Request/response times
- Database query performance
- Payment processing times
- USSD session statistics

## 🛠️ Development & Testing

### Running Tests
```bash
npm test
```

### Code Structure
```
src/
├── apollo/
│   ├── resolvers/     # GraphQL resolvers
│   └── typeDefs/      # GraphQL type definitions
├── config/            # Application configuration
├── controllers/       # Business logic controllers
├── middleware/        # Express middleware
├── models/           # Database models
├── routes/           # REST API routes
├── services/         # Business services
└── utils/            # Utility functions
```

### Adding New Features

1. **GraphQL Features**:
   - Add type definitions in `apollo/typeDefs/`
   - Implement resolvers in `apollo/resolvers/`
   - Create controllers in `controllers/`

2. **REST Features**:
   - Add routes in `routes/`
   - Implement middleware in `middleware/`
   - Create services in `services/`

3. **Database Models**:
   - Create models in `models/`
   - Add proper indexing
   - Implement validation

##  Deployment

### Production Deployment

1. **Environment Configuration**:
```bash
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb://your-production-db
```

2. **Build & Start**:
```bash
npm run build
npm start
```

3. **Process Management**:
Use PM2 or similar process manager for production:
```bash
pm2 start src/server.ts --name votemaster-engine
```

### CI/CD Pipeline

The project includes GitHub Actions workflow:
- Automated testing
- Dependency installation
- Production deployment trigger

##  Support & Documentation

### API Documentation
- GraphQL Schema: Available at `/graphql` endpoint
- Interactive documentation via GraphQL Playground
- REST API documentation in this file

### Common Issues
1. **USSD Session Timeout**: Check `USSD_SESSION_TIMEOUT` configuration
2. **Payment Webhook Failures**: Verify webhook signature setup
3. **Database Connection**: Ensure MongoDB URI is correct
4. **Rate Limiting**: Adjust rate limiting parameters if needed

### Contact
- Business Inquiries: contact@votemaster.com
- Documentation: Refer to this README and code comments

---

*Last Updated: September 24, 2025*
