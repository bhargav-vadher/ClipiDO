import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { findMoments } from '../services/ai.js';

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'rate_limit', message: 'Too many requests. Please try again later.' },
});

router.post('/', limiter, async (req, res) => {
  const { transcript, niche = '', language = 'English', minLength = 30, maxLength = 60 } = req.body;

  if (!transcript || transcript.trim().length < 100) {
    return res.status(400).json({ error: 'too_short', message: 'Transcript is too short.' });
  }
  if (!/\d{1,2}:\d{2}/.test(transcript)) {
    return res.status(400).json({ error: 'no_timestamps', message: 'Transcript needs timestamps like 12:40.' });
  }

  try {
    const data = await findMoments({ transcript, niche, language, minLength, maxLength });
    if (!Array.isArray(data.clips) || data.clips.length === 0) throw new Error('bad_output');
    res.json({ clips: data.clips.slice(0, 5) });
  }  catch (err) {
    console.error('Analyze error:', err); // <-- Add this line
    const busy = err.status === 503 || err.status === 429;
    return res.status(busy ? 503 : 502).json({
      error: busy ? 'ai_busy' : 'ai_failed',
      message: busy ? 'The AI is busy right now. Please try again in a minute.' : 'The AI service failed. Please try again.',
    });
  }
});

export default router;