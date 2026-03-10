import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const runAIAnalysis = async (prompt) => {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "You analyze productivity behavior."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response.choices[0].message.content;
};
console.log("API KEY:", process.env.OPENAI_API_KEY);