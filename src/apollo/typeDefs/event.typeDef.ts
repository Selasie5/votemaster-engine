export const eventTypeDef = `

  type Event{
    organization:Organization!
    name:String!
    description:String
    slug:String!
    eventImage:String
    pricePerVote:Float
    startDate:String
    endDate:String
    createdAt:String
    updatedAt:String
  }


  input EventInput{
  name:String!
  description:String!
  eventImage:String!
  pricePerVote:Float!
  startDate:String!
  endDate:String!
  }

  type EventResponse{
  code:Int!
  success:Boolean!
  message:String!
  data:Event
  }

  type MultipleEventResponse{
  code:Int!
  success:Boolean
  message:String!
  data: [Event]
  }

  extend type Query{
  getEvents: MultipleEventResponse!
  getEventById(id:ID!):Event!
  }

  extend type Mutation{
  createEvent(event:EventInput!):EventResponse!
  updateEvent(id:ID!,event:EventInput!):Event!
  deleteEvent(id:ID!):Event!
  }
  `;
