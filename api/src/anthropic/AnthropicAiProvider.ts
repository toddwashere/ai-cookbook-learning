import Anthropic from "@anthropic-ai/sdk";

export const AnthropicAiProvider = {

   makeAiCall: async (prompt: string) => {

      console.log("making anthropic AI call")

      const anthropic = new Anthropic({
         apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const msg = await anthropic.messages.create({
         model: "claude-3-5-sonnet-20240620", /* NOTE: The free plan only allows Sonnet models. */
         max_tokens: 1000,
         temperature: 0,
         system: "Respond only with short poems.",
         messages: [
            {
               "role": "user",
               "content": [
                  {
                     "type": "text",
                     "text": prompt
                  }
               ]
            }
         ]
      });
      console.log(msg);

   }
}
