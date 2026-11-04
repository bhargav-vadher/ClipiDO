import { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
   FileText,
  Clock,
  Flame,
   AlertCircle,
  ExternalLink
  
} from 'lucide-react';

// web application/stitch/projects/405657653535120749/screens/0246d0f46064429d88d00e58c8c6e39a
import logo from '../public/logo2.jpg'; // adjust the path to where this file lives


interface Moment {
  id: number;
  rank: number;
  title: string;
  timeRange: string;
  duration: string;
  score: string;
  hookQuote: string;
  whyItWorks: string;
  hashtags: string[];
  isTopPick?: boolean;
}

const SAMPLE_TRANSCRIPT = `00:00 - Welcome back everyone...
01:24 - "If you don't build leverage today, the algorithm will replace your output by next Tuesday."
03:42 - That's when 90% of creators fall into the vanity metric trap. They chase 100k views that generate zero pipeline.
08:15 - "The exact moment we tore down our original transformer pipeline was terrifying, but necessary."
14:02 - Here is the exact 3-step prompt blueprint that drove $40k in client retainer value without spending a dime on ad spend.
21:10 - I was literally down to my last $300 in Tokyo when an automated script notified me the server scaled.`;

interface ApiClip {
  start: string; end: string; hookQuote: string; title: string;
  hashtags: string[]; reason: string; score: number | string;
}

const ERROR_TITLES: Record<string, string> = {
  rate_limit: 'Too many requests',
  too_short: 'Transcript too short',
  no_timestamps: 'Timestamps missing',
  ai_busy: 'AI is busy',
  ai_failed: 'AI service failed',
};

const toSeconds = (t: string) =>
  String(t).split(':').reduce((acc, p) => acc * 60 + (parseInt(p, 10) || 0), 0);

function mapClips(clips: ApiClip[]): Moment[] {
  return [...clips]
    .sort((a, b) => Number(b.score) - Number(a.score))
    .map((c, i) => ({
      id: i + 1,
      rank: i + 1,
      title: c.title,
      timeRange: `${c.start} - ${c.end}`,
      duration: `${Math.max(0, toSeconds(c.end) - toSeconds(c.start))}s`,
      score: `${c.score} / 10`,
      hookQuote: c.hookQuote,
      whyItWorks: c.reason,
      hashtags: c.hashtags ?? [],
      isTopPick: i === 0,
    }));
}

const HOW_STEPS = [
  { icon: ExternalLink, title: 'Open a video', text: 'Go to YouTube and open any video.' },
  { icon: Sparkles, title: 'Click "Ask"', text: 'Click the Ask button under the video (the Gemini-style icon).' },
  { icon: FileText, title: 'Get the transcript', text: 'Ask for the transcript in English, with timestamps.' },
  { icon: Copy, title: 'Paste it here', text: 'Copy the transcript and paste it in the box above.' },
  { icon: Flame, title: 'Find moments', text: 'Click "Find 5 Best Moments".' },
];

const TRANSCRIPT_PROMPT =
  'Give me the full transcript of this video in English. Put a timestamp (mm:ss) at the start of every line.';

export default function ClipiDoOneComp() {

  const [transcript, setTranscript] = useState<string>(SAMPLE_TRANSCRIPT);
// const [videoUrl, setVideoUrl] = useState<string>('');   
  const duration = '30s-60s';
  // const [aspectRatio, setAspectRatio] = useState<string>('9:16 Vertical');
  const [status, setStatus] = useState<'idle' | 'loading' | 'results' | 'error'>('idle');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
const [moments, setMoments] = useState<Moment[]>([]);
const [error, setError] = useState({ title: '', message: '' });

// console.log(moments)

const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
const handleCopyPrompt = () => {
  navigator.clipboard.writeText(TRANSCRIPT_PROMPT);
  setCopiedPrompt(true);
  setTimeout(() => setCopiedPrompt(false), 2000);
};

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
 
  const handleCopyAll = () => {
    const allText = moments
      .map(
        (m) =>
          `[#${m.rank} - ${m.score}] ${m.title}\nTime: ${m.timeRange} (${m.duration})\nHook: "${m.hookQuote}"\nWhy: ${m.whyItWorks}\nTags: ${m.hashtags.join(' ')}\n`
      )
      .join('\n---\n\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

const handleFindMoments = async () => {
  if (!transcript.trim()) {
    setError({ title: 'Nothing to analyze', message: 'Paste a transcript with timestamps first.' });
    setStatus('error');
    return;
  }
  setStatus('loading');
  const [minLength, maxLength] = duration.split('-').map((s) => parseInt(s, 10));
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, minLength, maxLength }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError({
        title: ERROR_TITLES[data.error] ?? 'Something went wrong',
        message: data.message ?? 'Please try again.',
      });
      setStatus('error');
      return;
    }
    setMoments(mapClips(data.clips));
    setStatus('results');
  } catch {
    setError({ title: 'Network error', message: 'Could not reach the server. Check that the backend is running and try again.' });
    setStatus('error');
  }
};

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#ff5e1e]/30 selection:text-white relative overflow-x-hidden">
      {/* Background radial atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#ff5e1e]/15 via-[#ff5e1e]/5 to-transparent blur-3xl opacity-70" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-[#ff5e1e]/20 blur-[130px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
         <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-[#ff5e1e]/20">
            <img src={logo} alt="ClipSpot logo" className="w-full h-full object-cover scale-125" />
        </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-white font-mono">ClipiDO</span>
        </div>
        </div>

        {/* View Switcher / Quick Tester */}
        {/* <div className="hidden md:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-lg p-1 text-xs ">
          <button
            onClick={() => setStatus('idle')}
            className={`px-3 py-1 rounded transition-colors ${status === 'idle' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
          >
            Input Form
          </button>
          <button
            onClick={() => setStatus('loading')}
            className={`px-3 py-1 rounded transition-colors ${status === 'loading' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
          >
            Processing State
          </button>
          <button
            onClick={() => setStatus('results')}
            className={`px-3 py-1 rounded transition-colors ${status === 'results' ? 'bg-[#ff5e1e]/20 text-[#ff5e1e] border border-[#ff5e1e]/30 font-medium' : 'text-zinc-400 hover:text-white'}`}
          >
            Results (5 Clips)
          </button>
          <button
            onClick={() => setStatus('error')}
            className={`px-3 py-1 rounded transition-colors ${status === 'error' ? 'bg-red-500/20 text-red-400 font-medium' : 'text-zinc-400 hover:text-white'}`}
          >
            Error State
          </button>
        </div> */}

     
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        {/* Hero Title Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#ff5e1e]" />
            <span>AI Shorts & Reel Moment Hunter</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            Extract the <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff5e1e] via-[#ff7843] to-amber-400">Viral Gold</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Paste a video transcript with timestamps and get the 5 best moments to turn into Shorts, with hooks, titles and hashtags         
          </p>
        </div>

        {/* Claude-Style Centered Input Box with Glowing Warm Light Beam Backdrop */}
        <div className="relative mb-14">
          {/* Luminous Warm Light Beam Backdrop directly behind text box */}
          <div className="absolute inset-0 -inset-x-4 sm:-inset-x-8 -top-8 -bottom-8 pointer-events-none flex items-center justify-center">
            {/* Vertical chromatic glow bands */}
            <div className="w-3/4 h-full bg-gradient-to-r from-transparent via-[#ff5e1e]/25 to-transparent blur-2xl transform -rotate-1 rounded-3xl" />
            <div className="absolute w-1/2 h-4/5 bg-gradient-to-b from-[#ff5e1e]/30 via-orange-600/15 to-transparent blur-3xl rounded-full" />
          </div>

          {/* Central Input Box */}
          <div className="relative bg-[#121215]/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 hover:border-zinc-700/80 transition-all duration-200">
            {/* Optional URL quick bar */}
            {/* <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800/70 text-xs text-zinc-400">
              <span className="font-mono text-zinc-500 font-medium">SOURCE</span>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Optional: https://youtube.com/watch?v=..."
                className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 focus:outline-none text-xs"
              />
              <span className="text-[10px] bg-zinc-800/80 text-zinc-400 px-2 py-0.5 rounded">Paste The Link Here</span>
            </div> */}

            {/* Transcript Textarea */}
            <div className="relative">
              <textarea
                rows={5}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your video transcript here (timestamps detected automatically)..."
                className="w-full bg-transparent text-zinc-200 placeholder-zinc-500 text-sm leading-relaxed resize-none focus:outline-none font-mono selection:bg-[#ff5e1e]/40"
              />
            </div>

            {/* Bottom Toolbar & Settings Row */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Duration dropdown */}
                {/* <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 transition-colors">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="15s-30s" className="bg-zinc-900">15s - 30s</option>
                    <option value="30s-60s" className="bg-zinc-900">30s - 60s (Recommended)</option>
                    <option value="60s-90s" className="bg-zinc-900">60s - 90s</option>
                  </select>
                </div> */}

                {/* Aspect Ratio Preset */}
                {/* <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 transition-colors">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="9:16 Vertical" className="bg-zinc-900">9:16 (Shorts/Reels)</option>
                    <option value="1:1 Square" className="bg-zinc-900">1:1 (Feed)</option>
                    <option value="16:9 Landscape" className="bg-zinc-900">16:9 (Landscape)</option>
                  </select>
                </div> */}

               
              </div>

              {/* Main Action Button */}
              <button
                onClick={handleFindMoments}
                disabled={status === 'loading'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#ff5e1e] to-[#e04508] hover:from-[#ff6e34] hover:to-[#eb4c0f] active:scale-[0.99] transition-all shadow-lg shadow-[#ff5e1e]/25 disabled:opacity-60 cursor-pointer"
              >
                {status === 'loading' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Hooks...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Find 5 Best Moments</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>


        {(status === 'idle' || status === 'error') && (
  <section className="mb-14">
    <div className="mb-5">
      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#ff5e1e]">
        HOW IT WORKS
      </span>
      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
        Get your transcript in 5 steps
      </h2>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {HOW_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isLast = i === HOW_STEPS.length - 1;
        return (
          <div
            key={step.title}
            className={`bg-[#121216] rounded-xl p-4 border transition-all duration-200 hover:border-zinc-700/80 ${
              isLast ? 'border-[#ff5e1e]/40' : 'border-zinc-800/90'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-6 h-6 rounded bg-zinc-800/90 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center border border-zinc-700/60">
                {i + 1}
              </span>
              <Icon className={`w-4 h-4 ${isLast ? 'text-[#ff5e1e]' : 'text-zinc-500'}`} />
            </div>
            <h4 className="text-sm font-bold text-zinc-100 mb-1">{step.title}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{step.text}</p>
          </div>
        );
      })}
    </div>

    {/* Copyable prompt for step 3 */}
    <div className="mt-4 bg-[#18181e] border-l-2 border-[#ff5e1e] rounded-r-xl p-4 flex items-start justify-between gap-3">
      <div>
        <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block mb-1">
          PROMPT FOR STEP 3
        </span>
        <p className="text-xs sm:text-sm text-zinc-200 italic">"{TRANSCRIPT_PROMPT}"</p>
      </div>
      <button
        onClick={handleCopyPrompt}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
      >
        {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
      </button>
    </div>

    <p className="mt-3 text-xs text-zinc-500">
      No Ask button on that video? Open the description, click "Show transcript", and copy the lines with timestamps.
    </p>
  </section>
)}

        {/* State 1: Loading State */}
        {status === 'loading' && (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-12 text-center shadow-xl mb-12  shadow-[#ff5e1e]/25">
            <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-[#ff5e1e] animate-spin mx-auto mb-4 " />
            <h3 className="text-lg font-bold text-white mb-1">Reading transcript & calculating retention hooks...</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Scanning speech cadence, pattern interrupts, and dopamine-spike phrases.
            </p>
          </div>
        )}

        {/* State 2: Error State */}
        {status === 'error' && (
          <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-6 mb-12 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-300 mb-1">{error.title}</h4>
              <p className="text-xs text-red-200/70 mb-3">
                {error.message}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setTranscript(SAMPLE_TRANSCRIPT); setStatus('idle'); }}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  Load sample transcript
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Results Section (Design #2 Layout: Card #1 Top Pick + 2-Column Grid for #2-#5, Zero Thumbnails) */}
        {status === 'results' && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#ff5e1e]">
                    SYNTHESIS COMPLETE
                  </span>
                  <span className="text-xs text-zinc-500">• {moments.length} clip suggestions</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Your 5 Best Moments
                </h2>
              </div>

              {/* Batch Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Copied All!' : 'Copy All'}</span>
                </button>
               
                <button
                  onClick={() => alert('Exporting CSV timecodes...')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff5e1e]/15 hover:bg-[#ff5e1e]/25 text-[#ff5e1e] border border-[#ff5e1e]/30 text-xs font-semibold transition-colors"
                >
                  <span>Top Rated Clips</span>
                </button>
              </div>
            </div>

            {/* CARD #1: Highlighted Top Retention Pick (Full Width) */}
            {moments
              .filter((m) => m.isTopPick)
              .map((card) => (
                <div
                  key={card.id}
                  className="relative rounded-2xl bg-[#131317] border border-[#ff5e1e]/40 p-5 sm:p-6 shadow-xl shadow-[#ff5e1e]/5 overflow-hidden transition-all hover:border-[#ff5e1e]/60"
                >
                  {/* Subtle top rim glow */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff5e1e] to-transparent" />

                  {/* Card Badge & Metric Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#ff5e1e]/20 text-[#ff5e1e] border border-[#ff5e1e]/30">
                        ★ TOP PICK • HIGHEST HOOK RETENTION
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-400 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 font-mono">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {card.timeRange} ({card.duration})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400">
                        {card.score} Hook Score
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">SUGGESTED VIRAL TITLE</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center justify-between group">
                      <span>{card.title}</span>
                      <button
                        onClick={() => handleCopy(card.id * 10, card.title)}
                        className="opacity-60 hover:opacity-100 p-1 transition-opacity text-zinc-400"
                        title="Copy Title"
                      >
                        {copiedId === card.id * 10 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </h3>
                  </div>

                  {/* Verbatim Hook Quote Block */}
                  <div className="bg-[#18181e] border-l-2 border-[#ff5e1e] rounded-r-xl p-4 mb-4">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block mb-1">
                      OPENING HOOK (0 - 3 SECONDS)
                    </span>
                    <p className="text-base sm:text-lg font-medium text-zinc-100 italic">
                      "{card.hookQuote}"
                    </p>
                  </div>

                  {/* Why it works / Psychology */}
                  <div className="mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                      WHY IT CONVERTS
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {card.whyItWorks}
                    </p>
                  </div>

                  {/* Hashtags & Card Actions */}
                  <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {card.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleCopy(
                            card.id,
                            `Hook: "${card.hookQuote}"\nTitle: ${card.title}\nTimecodes: ${card.timeRange}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors"
                      >
                        {copiedId === card.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === card.id ? 'Copied Card!' : 'Copy Card Spec'}</span>
                      </button>
                      {/* <button
                        onClick={() => alert(`Sent clip ${card.timeRange} to render queue!`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#ff5e1e] hover:bg-[#ff6e34] text-white text-xs font-semibold shadow-md shadow-[#ff5e1e]/20 transition-colors"
                      >
                        <span>Clip 9:16</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button> */}
                    </div>
                  </div>
                </div>
              ))}

            {/* CARDS #2 through #5: 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moments
                .filter((m) => !m.isTopPick)
                .map((card) => (
                  <div
                    key={card.id}
                    className="bg-[#121216] border border-zinc-800/90 hover:border-zinc-700/80 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-black/60"
                  >
                    <div>
                      {/* Top Rank + Time Range */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-zinc-800/90 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center border border-zinc-700/60">
                            #{card.rank}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">
                            {card.timeRange} ({card.duration})
                          </span>
                        </div>
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                          {card.score}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-zinc-100 mb-2 line-clamp-1">
                        {card.title}
                      </h4>

                      {/* Verbatim Hook Quote */}
                      <div className="bg-[#18181e] border-l-2 border-zinc-700 rounded-r-lg p-3 mb-3">
                        <span className="text-[9px] font-mono uppercase text-zinc-500 block mb-0.5">OPENING HOOK</span>
                        <p className="text-xs font-medium text-zinc-200 italic line-clamp-2">
                          "{card.hookQuote}"
                        </p>
                      </div>

                      {/* Retention Rationale */}
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                        {card.whyItWorks}
                      </p>
                    </div>

                    {/* Bottom Tags & Copy */}
                    <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between gap-2">
                      <div className="flex gap-1 overflow-hidden">
                        {card.hashtags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono truncate"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          handleCopy(
                            card.id,
                            `[#${card.rank}] ${card.title}\nTime: ${card.timeRange}\nHook: "${card.hookQuote}"`
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
                      >
                        {copiedId === card.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === card.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <p>ClipiDO</p>
      </footer>
    </div>
  );
}
