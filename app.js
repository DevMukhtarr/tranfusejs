import "dotenv/config";
import app from './appConnect.js';
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send('transfuse!');
});

app.listen(PORT, () => {
  return console.log(`App is listening at Port ${PORT}`);
});
