export const authTypeDef = `
  type Auth{
  code:Int!
  message:String!
  success:Boolean!
  data:Organization!
  token:String!
  }

  type Organization{
  id:ID!
  contactEmail:String!
  name:String!
  description:String!
  phoneNumber:String
  }

  input createOrganizationInput{
  name:String!
  description:String!
  contactEmail:String!
  phoneNumber:String!
  password:String!
  }

  input loginInput{
  contactEmail:String!
  password:String!
  }
  extend type Query {
    # Auth queries can be added here in the future
    _authEmpty: String
  }
  extend type Mutation{
  createOrganization(createOrgInput:createOrganizationInput!):Auth!
  login(loginInput:loginInput!):Auth!
  }
  `;
