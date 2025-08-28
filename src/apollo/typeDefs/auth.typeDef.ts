export const authTypeDef = `
  type Auth{
  user:User!
  token:String!
  }

  type User{
  id:ID!
  contactEmail:String!
  name:String!
  description:String!
  phoneNumber:String!
  }

  input createOrganizationInput{
  name:String!
  description:String!
  contactEmail:String!
  phoneNumber:String!
  password:String!
  }

  input loginInput{
  email:String!
  password:String!
  }
  extend type Query {
    # Auth queries can be added here in the future
    _authEmpty: String
  }
  extend type Mutation{
  createOrganization(args:createOrganizationInput!):Auth!
  login(args:loginInput!):Auth!
  }
  `;
