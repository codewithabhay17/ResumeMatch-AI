require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function test(modelName) {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Hello",
    });
    console.log(`Success for ${modelName}:`, response.text);
  } catch (err) {
    console.log(`Error for ${modelName}:`, err.message);
  }
}

test("gemini-3.6-flash");
