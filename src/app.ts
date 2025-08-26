import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

export const app = express();


app.get("/", (req, res) => {
  res.send("Hello World, VoteMate");
});

