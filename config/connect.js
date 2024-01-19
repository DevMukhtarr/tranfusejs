import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();

const mongoUri = process.env.MONGO_URI_LOCAL ?? '';

if (!mongoUri) {
    console.error('MONGO_URI_LOCAL is not defined in the environment variables.');
    process.exit(1); // Exit the process or handle the error as appropriate
  }  

mongoose
  .connect(mongoUri)
  .then(() => console.log("DB Connected!"))
  .catch((err) => {
    console.log("not able to connect to database"+ err);
  });

export default app;