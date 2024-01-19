import "dotenv/config";
import app from './appConnect.js';
import cors from "cors"
const PORT = process.env.PORT;

app.use(cors())
app.get('/', (req, res) => {
  res.send('transfuse!');
});

app.listen(PORT, () => {
  return console.log(`App is listening at Port ${PORT}`);
});
