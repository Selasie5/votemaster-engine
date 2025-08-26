

import {helloTypeDef} from './typeDefs/helloTypeDef';
import helloResolver from './resolvers/helloResolver';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

export const typeDefs = mergeTypeDefs([helloTypeDef]);
export const resolvers = mergeResolvers([helloResolver]);
