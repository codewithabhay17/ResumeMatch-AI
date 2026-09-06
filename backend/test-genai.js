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

async function main() {
  await test("gemini-1.5-flash");
  await test("gemini-2.0-flash");
  await test("gemini-2.5-flash");
}

main();
