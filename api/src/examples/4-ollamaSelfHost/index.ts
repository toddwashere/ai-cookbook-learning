import { Express } from 'express';
import ollama from 'ollama';

type LlamaChatRequestBody = {
   prompt: string;
}

export function OllamaRoutes(app: Express) {

   app.post('/llamaChat', async (req, res) => {
      const options = req.body as LlamaChatRequestBody;
      console.log("the prompt = ", options.prompt)
      const response = await ollama.chat({
         model: 'llama3.1:8b',
         messages: [{
            role: 'user',
            content: options.prompt
         }],
      });
      res.json({ reply: response.message.content });
   });




   app.post('/llamaChatStreaming', async (req, res) => {

      try {
         const { prompt } = req.body as LlamaChatRequestBody;
         console.log("PROMPT: ", prompt)
         const response = await ollama.chat({
            model: 'llama3.1:8b',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
            options: {
               num_batch: 5,
            }
         });

         for await (const part of response) {
            res.write(part.message.content)
         }
         res.end()

      } catch (error) {
         console.error("ERROR: ", error);
         res.status(500).send({ error: 'Error interacting with the model' });
      }

   });

}
