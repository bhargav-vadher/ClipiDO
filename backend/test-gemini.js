import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.time('gemini');
const res = await ai.models.generateContent({
  model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  contents: 'Say hi in one word',
});
console.timeEnd('gemini');
console.log(res.text);