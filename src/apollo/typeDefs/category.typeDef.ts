export const categoryTypeDef = `
  type Category {
    id: ID!
    name: String!
    description: String!
    event: Event!
    createdAt: String!
    updatedAt: String!
  }

  type Event {
    id: ID!
    name: String!
    slug: String!
    description: String
    eventImage: String
    startDate: String!
    endDate: String!
    createdAt: String!
    updatedAt: String!
  }

  input CreateCategoryInput {
    name: String!
    description: String!
    eventId: ID!
  }

  input UpdateCategoryInput {
    id: ID!
    name: String
    description: String
    eventId: ID
  }

  type CategoryResponse{
  code:Int!
  message:String!
  data:Category!
  }

  extend type Query {
    categories: [Category!]!
    category(id: ID!): Category
    categoriesByEvent(eventId: ID!): [Category!]!
  }

  extend type Mutation {
    createCategory(input: CreateCategoryInput!): CategoryResponse!
    updateCategory(input: UpdateCategoryInput!): CategoryResponse!
    deleteCategory(id: ID!): Boolean!
  }
`;
