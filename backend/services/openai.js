import OpenAI from 'openai';

let client;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return client;
}

export async function findMoments({ transcript, niche = '', language = 'English', minLength = 30, maxLength = 60 }) {
  const openai = getClient();

 const prompt = `Analyze this video transcript and extract the most engaging, viral clips.
Niche: ${niche || 'General'}
Language: ${language}
Clip duration: between ${minLength} and ${maxLength} seconds.

CRITICAL REQUIREMENTS:
- Every field in the schema is MANDATORY. Do NOT return null, empty strings, or omit any field.
- "hookQuote": MUST be the exact verbatim opening line spoken at timestamp "start" from the transcript.
- "hashtags": Array of 3-5 relevant hashtag strings.
- "score": Integer rating from 1 to 10 for viral potential.

Return ONLY a valid JSON object matching this exact schema:
{
  "clips": [
    {
      "start": "00:00",
      "end": "00:00",
      "title": "Short punchy clip title",
      "hookQuote": "The exact first spoken sentence from the start timestamp",
      "reason": "Why this moment hooks the viewer or triggers engagement",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "score": 9
    }
  ]
}

Transcript:
${transcript}`;

  const response = await openai.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'You are an expert video editor. You must output valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON structure found in AI response');
  }

  return JSON.parse(jsonMatch[0]);
}