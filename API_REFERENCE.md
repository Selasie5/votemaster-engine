# VoteMaster Engine - API Reference

## Table of Contents
1. [GraphQL API](#graphql-api)
2. [REST API](#rest-api)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Webhooks](#webhooks)

## GraphQL API

The main API endpoint for web and mobile applications is available at `/graphql`.

### Authentication

Many operations require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Organization Management

#### Register Organization
```graphql
mutation CreateOrganization($createOrgInput: createOrganizationInput!) {
  createOrganization(createOrgInput: $createOrgInput) {
    code
    success
    message
    token
    data {
      id
      name
      contactEmail
      phoneNumber
      description
    }
  }
}
```

**Variables:**
```json
{
  "createOrgInput": {
    "name": "Amazing Events Inc",
    "description": "We organize amazing voting events",
    "contactEmail": "contact@amazingevents.com",
    "phoneNumber": "+256700000000",
    "password": "securePassword123"
  }
}
```

#### Login
```graphql
mutation Login($loginInput: loginInput!) {
  login(loginInput: $loginInput) {
    code
    success
    message
    token
    data {
      id
      name
      contactEmail
    }
  }
}
```

**Variables:**
```json
{
  "loginInput": {
    "contactEmail": "contact@amazingevents.com",
    "password": "securePassword123"
  }
}
```

### Event Management

#### Create Event
```graphql
mutation CreateEvent($event: EventInput!) {
  createEvent(event: $event) {
    code
    success
    message
    data {
      id
      name
      description
      slug
      eventImage
      pricePerVote
      startDate
      endDate
      createdAt
      updatedAt
    }
  }
}
```

**Variables:**
```json
{
  "event": {
    "name": "Best Student Awards 2025",
    "description": "Annual awards for outstanding students",
    "eventImage": "https://example.com/event-image.jpg",
    "pricePerVote": 1.50,
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": "2025-10-31T23:59:59.000Z"
  }
}
```

#### Get Events
```graphql
query GetEvents {
  getEvents {
    code
    success
    message
    data {
      id
      name
      description
      slug
      startDate
      endDate
      pricePerVote
      organization {
        name
      }
    }
  }
}
```

#### Get Event by ID
```graphql
query GetEventById($id: ID!) {
  getEventById(id: $id) {
    id
    name
    description
    startDate
    endDate
    pricePerVote
    organization {
      name
      contactEmail
    }
  }
}
```

### Category Management

#### Create Category
```graphql
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) {
    code
    message
    data {
      id
      name
      description
      event {
        name
      }
      createdAt
      updatedAt
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "name": "Best Academic Performance",
    "description": "Category for students with outstanding academic achievements",
    "eventId": "event-id-here"
  }
}
```

#### Get Categories
```graphql
query GetCategories {
  categories {
    id
    name
    description
    event {
      id
      name
    }
    createdAt
    updatedAt
  }
}
```

#### Get Categories by Event
```graphql
query GetCategoriesByEvent($eventId: ID!) {
  categoriesByEvent(eventId: $eventId) {
    id
    name
    description
    createdAt
  }
}
```

### Nominee Management

#### Create Nominee Form Template
```graphql
mutation CreateNomineeForm($input: CreateNomineeFormInput!) {
  createNomineeForm(input: $input) {
    code
    success
    message
    data {
      id
      event {
        name
      }
      category {
        name
      }
      formFields {
        fieldId
        fieldType
        label
        placeholder
        required
        options
        validation {
          min
          max
          pattern
          errorMessage
        }
        order
      }
      isActive
      createdAt
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "eventId": "event-id-here",
    "categoryId": "category-id-here",
    "formFields": [
      {
        "fieldId": "student_id",
        "fieldType": "TEXT",
        "label": "Student ID",
        "placeholder": "Enter student ID",
        "required": true,
        "validation": {
          "min": 5,
          "max": 20,
          "pattern": "^[A-Z0-9]+$",
          "errorMessage": "Student ID must contain only uppercase letters and numbers"
        },
        "order": 1
      },
      {
        "fieldId": "gpa",
        "fieldType": "NUMBER",
        "label": "GPA",
        "placeholder": "Enter GPA (0.0-4.0)",
        "required": true,
        "validation": {
          "min": 0,
          "max": 4
        },
        "order": 2
      },
      {
        "fieldId": "achievements",
        "fieldType": "TEXTAREA",
        "label": "Notable Achievements",
        "placeholder": "Describe your academic achievements",
        "required": false,
        "validation": {
          "max": 500
        },
        "order": 3
      }
    ]
  }
}
```

#### Create Nominee
```graphql
mutation CreateNominee($nominee: CreateNomineeInput!) {
  createNominee(nominee: $nominee) {
    code
    success
    message
    data {
      id
      fullName
      description
      imageURL
      dynamicFields
      voteCount
      isActive
      category {
        name
      }
      event {
        name
      }
      createdAt
    }
  }
}
```

**Variables:**
```json
{
  "nominee": {
    "fullName": "John Doe",
    "description": "Outstanding student with exceptional academic performance",
    "category": "category-id-here",
    "event": "event-id-here",
    "imageURL": "https://example.com/john-doe.jpg",
    "dynamicFields": {
      "student_id": "CS2021001",
      "gpa": 3.85,
      "achievements": "Dean's List for 3 consecutive semesters, Published research paper on AI"
    }
  }
}
```

#### Get Nominees
```graphql
query GetNominees($eventId: ID, $categoryId: ID, $page: Int, $limit: Int, $sortBy: String, $sortOrder: String) {
  getNominees(
    eventId: $eventId
    categoryId: $categoryId
    page: $page
    limit: $limit
    sortBy: $sortBy
    sortOrder: $sortOrder
  ) {
    code
    success
    data {
      nominees {
        id
        fullName
        description
        imageURL
        voteCount
        dynamicFields
        category {
          name
        }
        event {
          name
        }
      }
      pagination {
        page
        limit
        total
        pages
      }
    }
  }
}
```

### Voting

#### Cast Vote
```graphql
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
```

**Variables:**
```json
{
  "voteInput": {
    "eventId": "event-id-here",
    "categoryId": "category-id-here", 
    "nomineeId": "nominee-id-here",
    "voterInfo": {
      "phoneNumber": "+256700000000",
      "email": "voter@example.com",
      "paymentMethod": "MOBILE_MONEY",
      "location": {
        "country": "Uganda",
        "region": "Central"
      }
    }
  }
}
```

#### Check Vote Status
```graphql
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
        imageURL
      }
      event {
        name
      }
      category {
        name
      }
      createdAt
    }
  }
}
```

#### Get Vote Results
```graphql
query GetVoteResults($eventId: ID!, $categoryId: ID, $page: Int, $limit: Int) {
  getVoteResults(eventId: $eventId, categoryId: $categoryId, page: $page, limit: $limit) {
    code
    success
    data {
      results {
        nominee {
          id
          fullName
          imageURL
          description
        }
        category {
          id
          name
        }
        voteCount
        totalAmount
        voteMasterFees
        organizationAmount
      }
      pagination {
        page
        limit
        total
        pages
      }
    }
  }
}
```

#### Get Vote Analytics (Admin Only)
```graphql
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
      paymentMethodBreakdown {
        method
        count
        totalAmount
      }
      revenueStats {
        totalRevenue
        totalVoteMasterFees
        totalOrganizationAmount
        completedVotes
      }
      votesOverTime {
        date
        count
        revenue
      }
    }
  }
}
```

### USSD Operations (Admin Only)

#### Handle USSD Request
```graphql
mutation HandleUSSDRequest($ussdRequest: USSDRequestInput!) {
  handleUSSDRequest(ussdRequest: $ussdRequest) {
    code
    success
    data {
      response
      continueSession
    }
  }
}
```

#### Get USSD Session
```graphql
query GetUSSDSession($sessionId: String!) {
  getUSSDSession(sessionId: $sessionId) {
    code
    success
    data {
      id
      sessionId
      phoneNumber
      currentStep
      sessionData {
        selectedEvent
        selectedCategory
        selectedNominee
        amount
        transactionId
      }
      status
      expiresAt
    }
  }
}
```

## REST API

### USSD Endpoints

#### USSD Request Handler
```http
POST /api/ussd/ussd
Content-Type: application/json

{
  "sessionId": "ATUid_12345",
  "serviceCode": "*123*456#",
  "phoneNumber": "+256700000000",
  "text": "1*2*3"
}
```

**Response:**
```json
{
  "response": "Confirm your vote:\nNominee: John Doe\nCost: $1.50\n\n1. Confirm & Pay\n0. Cancel",
  "action": "request"
}
```

#### USSD Callback (GET)
```http
GET /api/ussd/ussd?sessionId=ATUid_12345&phoneNumber=%2B256700000000&text=1*2*3&serviceCode=*123*456#
```

### Payment Webhooks

#### Generic Payment Webhook
```http
POST /api/payments/webhook/payment
Content-Type: application/json
X-Signature: sha256=signature-hash

{
  "transactionId": "VOTE_1234567890_abc123",
  "status": "COMPLETED",
  "paymentReference": "REF_987654321",
  "metadata": {
    "provider": "mtn_momo",
    "amount": 1.50,
    "currency": "USD",
    "phoneNumber": "+256700000000"
  }
}
```

#### MTN MoMo Specific Webhook
```http
POST /api/payments/webhook/mtn-momo
Content-Type: application/json

{
  "externalId": "VOTE_1234567890_abc123",
  "status": "SUCCESSFUL",
  "financialTransactionId": "FT_123456789",
  "amount": 1.50,
  "currency": "USD",
  "payer": {
    "partyId": "+256700000000",
    "partyIdType": "MSISDN"
  },
  "reason": "Payment for vote"
}
```

#### Airtel Money Webhook
```http
POST /api/payments/webhook/airtel-money
Content-Type: application/json

{
  "transaction": {
    "id": "VOTE_1234567890_abc123",
    "status": "TS",
    "airtel_money_id": "AM_987654321",
    "amount": 1.50,
    "currency": "USD"
  },
  "subscriber": {
    "msisdn": "+256700000000"
  }
}
```

#### Payment Status Check
```http
GET /api/payments/payment/status/VOTE_1234567890_abc123
```

**Response:**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "transactionId": "VOTE_1234567890_abc123",
    "paymentStatus": "COMPLETED",
    "amount": 1.50,
    "nominee": {
      "id": "nominee-id",
      "fullName": "John Doe"
    },
    "event": {
      "name": "Best Student Awards 2025"
    }
  }
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-24T10:30:00.000Z",
  "backgroundJobs": {
    "isRunning": true,
    "timestamp": "2025-09-24T10:30:00.000Z"
  }
}
```

### Application Info
```http
GET /
```

**Response:**
```json
{
  "message": "VoteMaster API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "graphql": "/graphql",
    "ussd": "/api/ussd",
    "payments": "/api/payments"
  }
}
```

## Authentication

### JWT Token Structure
```json
{
  "id": "organization-id",
  "name": "Organization Name",
  "email": "contact@organization.com",
  "iat": 1695542400,
  "exp": 1696147200
}
```

### Protected Endpoints
The following operations require authentication:
- All organization management operations
- Event creation and management
- Category creation and management
- Nominee form creation
- Nominee creation and management
- Vote analytics (admin only)
- USSD session management (admin only)

## Error Handling

### Standard Error Response Format
```json
{
  "code": 400,
  "success": false,
  "message": "Validation failed: Full name is required",
  "data": null
}
```

### Common Error Codes
- `200`: Success
- `201`: Created successfully
- `400`: Bad request / Validation error
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `409`: Conflict (duplicate resource)
- `429`: Too many requests (rate limited)
- `500`: Internal server error

### GraphQL Error Format
```json
{
  "errors": [
    {
      "message": "Event not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["getEventById"]
    }
  ],
  "data": null
}
```

## Rate Limiting

### USSD Rate Limiting
- **Limit**: 5 requests per minute per phone number
- **Window**: 60 seconds (sliding window)
- **Response**: HTTP 429 with USSD end response

### API Rate Limiting
- **Limit**: 100 requests per minute per IP address
- **Window**: 60 seconds (sliding window)
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## Webhooks

### Webhook Security

All webhook endpoints support signature verification using HMAC-SHA256:

```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(requestBody))
  .digest('hex');
```

Include the signature in the `X-Signature` header:
```http
X-Signature: sha256=computed-signature-hash
```

### Webhook Retry Policy
- **Initial Retry**: 1 minute after failure
- **Subsequent Retries**: Exponential backoff (2, 4, 8, 16, 32 minutes)
- **Maximum Retries**: 5 attempts
- **Timeout**: 30 seconds per request

### Webhook Events
1. **Payment Completed**: When a vote payment is confirmed
2. **Payment Failed**: When a vote payment fails
3. **Vote Recorded**: When a vote is successfully recorded
4. **Event Started**: When a voting event begins
5. **Event Ended**: When a voting event ends

---

*API Reference Last Updated: September 24, 2025*
