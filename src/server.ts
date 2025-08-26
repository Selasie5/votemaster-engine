import express from "express";
import * as dotenv from "dotenv";
import { logger } from "./utils/logger";
import { ApolloServer } from "@apollo/server";
import {expressMiddleware} from "@as-integrations/express5"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import cors, { CorsRequest } from "cors";
import { connectToDB } from "./config/db.config";
import { resolvers, typeDefs } from "./apollo";

dotenv.config();

const PORT = process.env.PORT || 4001;
const app = express();

// Create http server
const httpServer = http.createServer(app);

interface Context {
  user?: {
    id: string;
    email: string;
  } | null;
}

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function startServer() {
  await server.start();

  // Apply middleware in correct order
  app.use(
    '/graphql',
    cors<CorsRequest>({
      origin: [
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://localhost:5000/graphql',
        '*',
      ],
      methods: ['GET', 'POST','PATCH','PUT','DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
   express.json(),
  expressMiddleware(server),
  );

  // Basic route
  app.get("/", (req, res) => {
    res.send("Hello World, Nestify");
  });

  await new Promise<void>((resolve) => 
    httpServer.listen({ port: PORT }, () => resolve())
  );
  
  logger.info(`✅ Server is running on port ${PORT}`);
  logger.info(`✅ GraphQL is running on http://localhost:${PORT}/graphql`);
  
  // Connect to DB
  await connectToDB(process.env.MONGODB_URI as string);
  logger.info(`✅ MongoDB is connected`);
}

startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
