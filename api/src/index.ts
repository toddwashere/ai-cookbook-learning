import express from 'express';
import * as dotenv from "dotenv";
import { OpenAiProvider } from './openai/OpenAiProvider';
import { LlamaRoutes } from './llamaSelfHost/LlamaRoutes';

dotenv.config()

var cors = require('cors')

const app = express();
const port = 4320;

const corsConfig = {
   origin: [/.*/], // This is allowing all origins. If you ever deploy this, you should only allow specific domains.
   methods: "GET,POST,HEAD,OPTIONS",
   credentials: true,
};
app.use(cors(corsConfig))
app.use(express.json());

LlamaRoutes(app);

app.get('/', (req, res) => {
   res.send('The API is working!');
});


app.post('/chatWithARealPerson', async (req, res) => {
   const myBody = req.body;
   if (!myBody) {
      res.status(400).send('No body provided');
      return;
   }
   const results = await OpenAiProvider.makeAiCall(req.body.prompt);
   res.send(results);
});



app.listen(port, () => {
   console.log(`Server running on http://localhost:${port}`);
});
