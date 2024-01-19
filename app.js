import "dotenv/config";
import app from './appConnect.js';
import cors from "cors"
const PORT = process.env.PORT;

app.use(cors())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/', (req, res) => {
  res.send('transfuse!');
});

app.listen(PORT, () => {
  return console.log(`App is listening at Port ${PORT}`);
});
