import express from 'express';
import * as dotenv from "dotenv";
import { BasicOpenAiRoutes } from './examples/1-basicsOpenAi';
import { RedactPiiRoutes } from './examples/2-redactPii';
import { ScrapeUrlRoutes } from './examples/3-scrapingUrl';
import { OllamaRoutes } from './examples/4-ollamaSelfHost';
import { ToolCallingRoutes } from './examples/5-callingToolsAndFunctions';


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

BasicOpenAiRoutes(app);
RedactPiiRoutes(app);
ScrapeUrlRoutes(app);
OllamaRoutes(app);
ToolCallingRoutes(app);


app.get('/', (req, res) => {
   res.send('The API is working!');
});

app.listen(port, () => {
   console.log(`Server running on http://localhost:${port}`);
});
