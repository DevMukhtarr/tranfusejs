import express from 'express';
import database from "./config/connect.js"
const app = express();

import authroute from './routes/authroute.js';
import mainroute from './routes/mainroute.js';
import profileroute from './routes/profileroute.js';


app.use(
    express.urlencoded({
      extended: false,
    })
  );
  
app.use(express.json());
app.use(database)
app.use(authroute)
app.use(mainroute)
app.use(profileroute)

export default app