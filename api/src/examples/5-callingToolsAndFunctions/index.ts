import { Express } from 'express';
import ollama, { Message, Tool, ToolCall } from 'ollama';
import bodyParser from 'body-parser';
import { scrapeUrl } from '../3-scrapingUrl';
import { redactPiiFromText } from '../2-redactPii';


const redactPii: Tool = {
   type: "function",
   function: {
      name: "redactPii",
      description: "Call this when you want to redact personally identifiable information.",
      parameters: {
         type: "object",
         required: ["textToReview"],
         properties: {
            textToReview: {
               type: "string",
               description: "The text you want to review for PII."
            }
         }
      }
   },
}

const getCompanyUrlFromDb: Tool = {
   type: "function",
   function: {
      name: "getCompanyUrlFromDb",
      description: "Call this when you want to get the companyUrl from the database.",
      parameters: {
         type: "object",
         required: ["companyName"],
         properties: {
            companyName: {
               type: "string",
               description: "The name of the company you want to look up."
            }
         }
      }
   },
}

const scrapeCompanyInfo: Tool = {
   type: "function",
   function: {
      name: "scrapeCompanyInfo",
      description: "Call this when you have a url, and want to scrape the website for company information.",
      parameters: {
         type: "object",
         required: ["companyUrl"],
         properties: {
            companyUrl: {
               type: "string",
               description: "A valid url that points to the marketing website of the company you want to look up."
            }
         }
      }
   },
}

/** If using OpenAI you would not need this. 
 */
const noFunctionCallNeeded: Tool = {
   type: "function",
   function: {
      name: "noFunctionCallNeeded",
      description: "Call this when there is no function call needed.",
      parameters: {
         type: "object",
         required: [],
         properties: {}
      }
   },
}


const availableFunctions: Tool[] = [
   getCompanyUrlFromDb,
   redactPii,
   scrapeCompanyInfo,
   noFunctionCallNeeded,
]


export function ToolCallingRoutes(app: Express) {


   app.post('/llamaTools', bodyParser.text({ type: 'text/plain' }), async (req, res) => {

      const response = await ollama.chat({
         model: 'llama3.1:8b',
         messages: [{
            role: 'user',
            content: req.body
         }],
         tools: availableFunctions,
      });

      const functionsToCall = response.message.tool_calls;
      const toReturn = {
         reply: response.message.content,
         functionsToCall: functionsToCall,
      }

      console.log("the tools response = ", JSON.stringify(response));
      res.json(toReturn);
   });




   app.post('/llamaToolsChaining', bodyParser.text({ type: 'text/plain' }), async (req, res) => {

      const runningListOfMessages = [{
         role: 'user',
         content: req.body
      },]

      // Prevent the AI from calling tools forever
      let numberOfCalls = 0;
      const maxNumberOfCalls = 3;

      while (numberOfCalls < maxNumberOfCalls) {
         numberOfCalls++;

         console.log("Making AI Call " + numberOfCalls);
         const responseForTools = await ollama.chat({
            model: 'llama3.1:8b',
            messages: runningListOfMessages,
            tools: availableFunctions,
         });

         const functionsToCall = responseForTools.message.tool_calls;
         if (functionsToCall) {
            const toolCallResults = await mapAiResponseToFunction(functionsToCall[0]);
            if (toolCallResults) {
               // Add to beginning, so that user's request is last
               runningListOfMessages.unshift(toolCallResults);
               continue; // Will now make another AI call with the new message
            }
         }
         break;
      }

      console.log("Making final call")
      // Now that tools are done, make the call
      const responseForTools = await ollama.chat({
         model: 'llama3.1:8b',
         messages: runningListOfMessages,
         // Make sure tools are not included here (for Ollama)
      });

      console.log("Done!")
      const toReturn = {
         reply: responseForTools.message.content,
         messagesSent: runningListOfMessages,
      }

      res.json(toReturn);
   });

   // TODO: Example of chaining calls together


}


async function mapAiResponseToFunction(tool: ToolCall): Promise<Message | undefined> {
   console.log("AI chose this tool: ", tool.function.name);
   switch (tool.function.name) {

      case "getCompanyUrlFromDb":
         const companyUrl = await getCompanyUrl(tool.function.arguments.companyName);
         return { role: "system", content: `the companyUrl is: ${companyUrl}` }

      case "redactPii":
         // Call the function
         const textToReview = tool.function.arguments.textToReview;
         const redacted = await redactPiiFromText(textToReview)
         return { role: "system", content: `the redacted text is: ${redacted}` }

      case "scrapeCompanyInfo":
         const companyInfoScraped = await scrapeUrl(tool.function.arguments.companyUrl);
         return { role: "system", content: `the company info is as follows: ${companyInfoScraped}` }

      // Put other functions here
   }

   return undefined;
}



export function getCompanyUrl(_nameOfCompany: string) {

   // Pretend to call a database to get the company url.
   return Promise.resolve("https://en.wikipedia.org/wiki/Skynet_(Terminator)")
}
