const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const code = fs.readFileSync('src/App.tsx', 'utf8');

async function fix() {
  console.log("Starting generation...");
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `This TypeScript React file is missing ALL of its lowercase 'e' characters due to a bug. Please restore all missing 'e's and return the fully corrected code. ONLY output the raw corrected code, no markdown blocks, no explanations.\n\n${code}`,
      config: {
        temperature: 0,
      }
    });
    let text = response.text;
    if (text.startsWith('```tsx\n')) text = text.slice(7);
    if (text.startsWith('```typescript\n')) text = text.slice(14);
    if (text.startsWith('```\n')) text = text.slice(4);
    if (text.endsWith('```')) text = text.slice(0, -3);
    
    fs.writeFileSync('src/App.tsx', text);
    console.log("Done.");
  } catch (e) {
    console.error(e);
  }
}

fix();
