import { Express } from 'express';
import ollama from 'ollama';

export function LlamaRoutes(app: Express) {

   app.post('/llamaChat', async (req, res) => {
      const response = await ollama.chat({
         model: 'llama3.1:8b',
         messages: [{
            role: 'user',
            content: req.body
         }],
      });
      res.json({ reply: response.message.content });
   });

   app.post('/llamaChatStream', async (req, res) => {

      try {
         const response = await ollama.chat({
            model: 'llama3.1:8b',
            messages: [{ role: 'user', content: req.body }],
            stream: true,
         });

         res.json({ reply: response });
      } catch (error) {
         console.error("ERROR: ", error);
         res.status(500).send({ error: 'Error interacting with the model' });
      }

   });

   app.post('/llamaChatComplete', async (req, res) => {

      try {
         const response = await ollama.chat({
            model: 'llama3.1:8b',
            messages: [{ role: 'user', content: req.body }],
         });

         res.json({ reply: response.message.content });
      } catch (error) {
         console.error("ERROR: ", error);
         res.status(500).send({ error: 'Error interacting with the model' });
      }

   });

   app.get('/llama', (req, res) => {
      res.send('Llama API is working!');
   });


}
