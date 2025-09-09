import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { authTypeDef } from "./typeDefs/auth.typeDef";
import { AuthResolver } from "./resolvers/auth.resolver";
import { categoryTypeDef } from "./typeDefs/category.typeDef";
import { categoryResolver } from "./resolvers/category.resolver";
import { baseTypeDef } from "./typeDefs/base.typeDef";
import { baseResolver } from "./resolvers/base.resolver";
import { eventTypeDef } from "./typeDefs/event.typeDef";
import { EventResolver } from "./resolvers/event.resolver";
import { nomineeTypeDef } from "./typeDefs/nominee.typeDef";
import { nomineeResolver } from "./resolvers/nominee.resolver";
import { voteTypeDef } from "./typeDefs/vote.typeDef";
import { voteResolver } from "./resolvers/vote.resolver";
import { ussdTypeDef } from "./typeDefs/ussd.typeDef";
import { ussdResolver } from "./resolvers/ussd.resolver";
import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

// Custom scalar types
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      default:
        return null;
    }
  },
});

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

export const typeDefs = mergeTypeDefs([
  baseTypeDef,
  authTypeDef,
  categoryTypeDef,
  eventTypeDef,
  nomineeTypeDef,
  voteTypeDef,
  ussdTypeDef,
]);

export const resolvers = mergeResolvers([
  {
    JSON: JSONScalar,
    DateTime: DateTimeScalar,
  },
  baseResolver,
  AuthResolver,
  categoryResolver,
  EventResolver,
  nomineeResolver,
  voteResolver,
  ussdResolver,
]);
