import 'dotenv/config';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const list = await client.models.list();
for await (const m of list) console.log(m.id);