
import { Express } from 'express';
import bodyParser from 'body-parser';

export function RedactPiiRoutes(app: Express) {

   app.post('/RedactThis', bodyParser.text({ type: 'text/plain' }), async (req, res) => {
      const results = await redactPiiFromText(req.body);
      res.send(results);
   });

}




import OpenAI from "openai";

export async function redactPiiFromText(textToReview: string) {
   const openAi = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
   });

   const prompt = `Replace any personally identifiable information (PII) 
      such as names, addresses, phone numbers, email addresses, 
      social security numbers, dates of birth, credit card numbers, 
      and any other sensitive data in the following text 
      with the placeholder '[REDACTED]':
      ${textToReview}
      `

   const results = await openAi.chat.completions.create({
      messages: [
         {
            role: "system",
            content: "I am a messaging system that really values privacy"
         },
         {
            role: "user",
            content: prompt
         },
      ],
      model: "gpt-4o-mini",
   });

   return results.choices[0].message.content;
}
