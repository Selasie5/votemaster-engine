import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { authTypeDef } from "./typeDefs/auth.typeDef";
import { AuthResolver } from "./resolvers/auth.resolver";
import { categoryTypeDef } from "./typeDefs/category.typeDef";
import { categoryResolver } from "./resolvers/category.resolver";
import { baseTypeDef } from "./typeDefs/base.typeDef";
import { baseResolver } from "./resolvers/base.resolver";

export const typeDefs = mergeTypeDefs([
  baseTypeDef,
  authTypeDef,
  categoryTypeDef,
]);
export const resolvers = mergeResolvers([
  baseResolver,
  AuthResolver,
  categoryResolver,
]);
