import { css } from "@emotion/css";
import { useState } from "react";


/** Simple Example of hitting the OpenAI Chat Completions Api */
export const OpenAiChatterBox = () => {

   const [textValue, setTextValue] = useState<string>("Tell me a joke about star wars");
   const [aiResponseText, setAiResponseText] = useState<string>("");

   const runChat = async () => {

      const body = JSON.stringify({ prompt: textValue });
      const response = await fetch(`${process.env.REACT_APP_API_HOST}/chatWithARealPerson`, {
         method: "post",
         headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
         },
         body,
      });
      setAiResponseText(await response.text())
   }


   return (
      <div className={css`
         display: flex;
         flex-direction: column;
         align-items: start;
         justify-content: center;
         padding: 20px;
         border:1px solid #99999966;
         border-radius: 10px;
         max-width: 400px;
         width: 100%;
      `}>
         <h2>
            The Chatter box
         </h2>

         <label>
            Prompt
         </label>
         <div>
            <textarea value={textValue}
               onChange={(e) => setTextValue(e.target.value)}
            />
            <button onClick={runChat}>Send</button>
         </div>

         <label>
            Response
         </label>
         <div>
            {aiResponseText}
         </div>
      </div>
   )
}
