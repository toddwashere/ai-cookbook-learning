
import { Express } from 'express';

export function ScrapeUrlRoutes(app: Express) {

   app.post('/ScrapeUrl', async (req, res) => {
      const url = req.body.url;
      const results = await scrapeUrl(url);
      res.send(results);
   });

}



export async function scrapeUrl(url: string) {

   // Pretend to call a web scraper to get raw html.
   console.log("Scraping raw text from url");
   const rawHTML = await pretendToScrapeUrl(url);

   // use cheerio to parse the html
   console.log("Parsing HTML");
   const parsedText = parseTextFromHtml(rawHTML);

   // Send raw text to the AI
   console.log("Sending text to AI");
   const results = await askAiToExtractCompanyInfo(parsedText.join(" "));
   console.log("Done");
   return results;
}




async function pretendToScrapeUrl(url: string) {

   /** Could use a 3rd party service for this, like ScrapingBee */
   const path = require("path");
   const readFile = require("fs/promises").readFile;
   const rawHtml = await readFile(path.resolve(__dirname, "scrape_result.skynet.txt"), "utf-8")

   return rawHtml;
}




import * as cheerio from 'cheerio'

function parseTextFromHtml(rawHtml: string) {

   const scrapedDataArray: string[] = []
   const $ = cheerio.load(rawHtml)
   const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'];

   $("meta").each((index, element) => {
      const name = $(element).attr('name')
      if (name?.toLowerCase() === 'description') {
         const content = $(element).attr('content')
         if (content) {
            scrapedDataArray.push(content)
         }
      }
   })

   tags.forEach(tag => {

      $(tag).each((index, element) => {
         // ignore these elements
         $('style, script, nav', element).remove()

         // Get the text content of the remaining elements
         const text = $(element).text().trim()

         // Add the text content to the scraped data array if it's not empty
         if (text !== '') {
            scrapedDataArray.push(text)
         }
      })
   })

   const uniqueValues = [...new Set(scrapedDataArray)]
   return uniqueValues
}



import OpenAI from 'openai';

async function askAiToExtractCompanyInfo(text: string) {

   const openAi = new OpenAI(); // uses process.env.OPENAI_API_KEY by default

   const prompt = `Take your time, Craft a company profile leveraging the following text:
### Begin TEXT PROVIDED ###
${text}
### End TEXT PROVIDED ###

Extract / intuit as much of the following fields as there is data for:
Name: The name of the company
Industry: The industry the company operates in
Mission: The company's purpose, goals, and values
Target Market: Description of who the company sells their product / service to (as specific as possible)
Value Proposition: The value they provide to their customers
Vision: Where the company sees itself becoming / going in the future

If you can't find relevant information in the TEXT PROVIDED for a field, exclude the field entirely from the results.
Extract any additional, relevant fields that help describe the company, but only if you have data to fill it.

Examples:
Business Model: How the business operates to make money
Type of Business: B2B, B2C, On-Demand, or Subscription-Based
Products: Which specific products they provide
Services: Which services they offer
Product Segments: The categories of products the company sells
etc.

    
Return results in the following format:
fieldName: field value
anotherFieldName: another field value

It is very important that the field names in the results contain no spaces and are formatted in camelcase.

Use these examples for field name conversion:
Before:
Name
Mission
Target Market
Value Proposition
Size of Company

After:
name
mission
targetMarket
valueProposition
sizeOfCompany

Use this as an example:
name: Apple Inc.
mission: designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.
targetMarket: people looking for a sleek, connected experience between all of their smart devices
valueProposition: Provide a seamless experience between their devices and software.
      `

   const results = await openAi.chat.completions.create({
      messages: [
         { role: "user", content: prompt },
      ],
      model: "gpt-4o-mini",
   });

   return results.choices[0].message.content;
}

