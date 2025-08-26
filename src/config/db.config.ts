import mongoose from "mongoose"
import { logger } from "../utils/logger"
export const connectToDB = (MONGODB_URI)=>
{
  try
  {
    mongoose.connect(MONGODB_URI);
    logger.info("Connection to DB successfully")
  }
  catch{
    logger.error("Connection TO DB failed")
  }
}
