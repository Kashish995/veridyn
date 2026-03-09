import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const runAIAnalysis = async (prompt) => {

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "You analyze productivity behavior and give structured insights."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response.choices[0].message.content;
};