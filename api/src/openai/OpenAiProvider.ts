
import OpenAI from "openai";


export const OpenAiProvider = {

   makeAiCall: async (prompt: string) => {

      const openai = new OpenAI({
         apiKey: process.env.OPEN_AI_VERY_SECRET_KEY,
      });

      const completion = await openai.chat.completions.create({
         messages: [
            { role: "user", content: prompt },
         ],
         model: "gpt-3.5-turbo",
      });

      return completion.choices[0].message.content;
   }

}
