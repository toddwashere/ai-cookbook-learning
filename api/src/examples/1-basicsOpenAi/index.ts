import OpenAI from 'openai';

async function makeAiCall(prompt: string) {

   const openAi = new OpenAI(); // uses process.env.OPENAI_API_KEY by default

   const results = await openAi.chat.completions.create({
      messages: [
         { role: "user", content: prompt },
      ],
      model: "gpt-4o-mini",
   });

   return results.choices[0].message.content;
}




import { Express } from 'express';
import bodyParser from 'body-parser';


export function BasicOpenAiRoutes(app: Express) {

   app.post('/basicOpenAiSetup', bodyParser.text({ type: 'text/plain' }), async (req, res) => {
      const prompt = req.body;
      if (!prompt) {
         res.status(400).send('What do you want now?');
         return;
      }
      const results = await makeAiCall(prompt);
      res.send(results);
   });

}
