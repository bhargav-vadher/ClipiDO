export function buildPrompt({ transcript, niche, language, minLength, maxLength }) {
  return `You are an expert short-form video editor.
Find the 5 best moments in this transcript to turn into YouTube Shorts.

Rules:
- Each clip must be ${minLength}-${maxLength} seconds long.
- Use ONLY timestamps that appear in the transcript.
- Clips must not overlap.
- Prefer a strong hook in the first 3 seconds, emotion, surprise, humor or a clear payoff.
- Titles and hooks must be in ${language}.
${niche ? `- The content is about: ${niche}.` : ''}

Return ONLY JSON in exactly this format:
{"clips":[{"start":"mm:ss","end":"mm:ss","hook":"","title":"","hashtags":["#a","#b","#c"],"reason":"","score":0}]}
score is 1-10.

TRANSCRIPT:
${transcript}`;
}