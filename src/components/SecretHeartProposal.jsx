import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart, Pause, Play, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const MEMORY_SLIDES = [
  { src: '/photos/special.jpg', no: '01', tag: 'THE FIRST LITTLE THING', line: 'Somewhere between ordinary moments, you became the one I noticed differently.' },
  { src: '/photos/photo-04.jpg', no: '02', tag: 'THE SMILE I KEPT', line: 'Your smile became one of those things my day quietly started waiting for.' },
  { src: '/photos/childhood-smile.jpg', no: '03', tag: 'THE SOFTEST TRUTH', line: 'Your happiness began to matter to me in a way I could no longer call simple.' },
  { src: '/photos/hero.jpg', no: '04', tag: 'THE ANSWER', line: 'And then I understood it — my heart had already chosen you.' }
];

const LETTER_LINES = [
  'I did not plan to feel this much.',
  'You just became part of my thoughts, my smiles, and all the little tomorrows I started imagining.',
  'I do not want a perfect story. I want a real one — with laughter, silly fights, quiet days, hard days, and us still choosing each other.',
  'So I kept one question hidden inside this heart, only for you.'
];

const sparkleSeeds = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  x: `${(i * 41 + 9) % 97}%`,
  y: `${(i * 67 + 11) % 93}%`,
  delay: `${(i % 12) * -.42}s`,
  size: `${1 + (i % 3) * .75}px`
}));

function Atmosphere({ warm = false }) {
  return <div className={`shx-atmosphere ${warm ? 'is-warm' : ''}`} aria-hidden="true">
    <div className="shx-glow shx-glow-a"/><div className="shx-glow shx-glow-b"/>
    <div className="shx-stars">{sparkleSeeds.map(s => <i key={s.id} style={{ left: s.x, top: s.y, animationDelay: s.delay, width: s.size, height: s.size }}/>)}</div>
    <div className="shx-noise"/>
  </div>;
}

function HeartMark({ progress = 100, small = false }) {
  return <div className={`shx-heart-mark ${small ? 'is-small' : ''}`}>
    <svg viewBox="0 0 220 205" aria-hidden="true">
      <defs>
        <linearGradient id="shxHeartStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7d7df"/>
          <stop offset=".52" stopColor="#d26b8a"/>
          <stop offset="1" stopColor="#e9bd8d"/>
        </linearGradient>
      </defs>
      <motion.path d="M110 188C82 161 24 122 24 72C24 37 48 18 75 18C95 18 106 29 110 43C114 29 125 18 145 18C172 18 196 37 196 72C196 122 138 161 110 188Z" fill="none" stroke="url(#shxHeartStroke)" strokeWidth="2.8" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: progress / 100 }} transition={{ duration: .18, ease: 'linear' }}/>
    </svg>
  </div>;
}

export default function SecretHeartProposal({ onClose }) {
  const [phase, setPhase] = useState('entrance');
  const [holdProgress, setHoldProgress] = useState(0);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const holdRef = useRef(null);
  const audioRef = useRef(null);

  const savedYes = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('secretHeartProposalYesV2') || 'null'); }
    catch { return null; }
  }, []);

  useEffect(() => { if (savedYes?.accepted) setPhase('keepsake'); }, [savedYes]);

  useEffect(() => {
    if (phase !== 'story') return undefined;
    const timer = window.setTimeout(() => {
      if (memoryIndex < MEMORY_SLIDES.length - 1) setMemoryIndex(v => v + 1);
    }, 4800);
    return () => window.clearTimeout(timer);
  }, [phase, memoryIndex]);

  useEffect(() => {
    if (phase !== 'letter') return undefined;
    const audio = new Audio('/audio/secret-heart-voice.mp3');
    audio.preload = 'metadata'; audio.volume = .82;
    const onReady = () => setVoiceReady(true);
    const onEnd = () => setVoicePlaying(false);
    const onError = () => setVoiceReady(false);
    audio.addEventListener('canplay', onReady, { once: true });
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onError);
    audioRef.current = audio;
    return () => { audio.pause(); audioRef.current = null; };
  }, [phase]);

  useEffect(() => () => { if (holdRef.current) window.clearInterval(holdRef.current); }, []);

  const beginHold = () => {
    if (holdRef.current) window.clearInterval(holdRef.current);
    holdRef.current = window.setInterval(() => {
      setHoldProgress(value => {
        const next = Math.min(100, value + 2.4);
        if (next >= 100) {
          window.clearInterval(holdRef.current); holdRef.current = null;
          window.setTimeout(() => setPhase('story'), 520);
        }
        return next;
      });
    }, 45);
  };

  const endHold = () => {
    if (holdRef.current) window.clearInterval(holdRef.current);
    holdRef.current = null;
    setHoldProgress(v => v >= 100 ? 100 : 0);
  };

  const toggleVoice = async () => {
    if (!audioRef.current || !voiceReady) return;
    try {
      if (audioRef.current.paused) { await audioRef.current.play(); setVoicePlaying(true); }
      else { audioRef.current.pause(); setVoicePlaying(false); }
    } catch { setVoicePlaying(false); }
  };

  const celebrate = () => {
    const end = Date.now() + 2800;
    const frame = () => {
      confetti({ particleCount: 4, spread: 72, startVelocity: 26, ticks: 120, gravity: .65, scalar: .78, origin: { x: .16, y: .72 } });
      confetti({ particleCount: 4, spread: 72, startVelocity: 26, ticks: 120, gravity: .65, scalar: .78, origin: { x: .84, y: .72 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const acceptProposal = () => {
    const stamp = new Date();
    const data = {
      accepted: true,
      iso: stamp.toISOString(),
      display: stamp.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    };
    try { localStorage.setItem('secretHeartProposalYesV2', JSON.stringify(data)); } catch { /* private mode */ }
    setPhase('yes');
    window.setTimeout(celebrate, 220);
  };

  const replay = () => { setMemoryIndex(0); setHoldProgress(0); setPhase('entrance'); };
  const current = MEMORY_SLIDES[memoryIndex];

  return <motion.div className={`shp-world shx-world shx-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .65 }}>
    <Atmosphere warm={phase === 'yes' || phase === 'keepsake'} />
    <div className="shx-brand" aria-hidden="true"><Heart fill="currentColor"/><span>SECRET HEART</span></div>

    <AnimatePresence mode="wait">
      {phase === 'entrance' && <motion.section key="entrance" className="shx-scene shx-entrance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.035, filter: 'blur(14px)' }} transition={{ duration: .85 }}>
        <div className="shx-entrance-copy">
          <motion.span className="shx-overline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>AGNES, YOU FOUND IT</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28, duration: .9, ease: [.16,1,.3,1] }}>There is one thing<br/>I never wanted to say <em>casually.</em></motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .7 }}>So I hid it here — behind one last heartbeat.</motion.p>
        </div>
        <motion.button className="shx-hold" type="button" onPointerDown={beginHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold} initial={{ opacity: 0, scale: .88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .75, duration: .8 }} aria-label="Press and hold the heart">
          <span className="shx-hold-aura"/>
          <HeartMark progress={holdProgress}/>
          <span className="shx-hold-core"><Heart fill="currentColor"/></span>
          <b>{holdProgress ? `${Math.round(holdProgress)}%` : 'PRESS & HOLD'}</b>
        </motion.button>
        <motion.small initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>hold until my heart opens ♡</motion.small>
      </motion.section>}

      {phase === 'story' && <motion.section key="story" className="shx-scene shx-story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(12px)' }} transition={{ duration: .8 }}>
        <div className="shx-story-layout">
          <div className="shx-story-photo-wrap">
            <AnimatePresence mode="wait">
              <motion.div className="shx-story-photo" key={current.src} initial={{ opacity: 0, scale: 1.06, x: -18 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: .985, x: 12 }} transition={{ duration: 1.05, ease: [.16,1,.3,1] }}>
                <img src={current.src} alt="A memory of Agnes"/>
                <span className="shx-photo-shade"/>
              </motion.div>
            </AnimatePresence>
            <div className="shx-photo-index"><span>{current.no}</span><i/><small>04</small></div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div className="shx-story-copy" key={`${current.no}-copy`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: .8, delay: .18 }}>
              <span className="shx-overline">{current.tag}</span>
              <h2>{current.line}</h2>
              {memoryIndex === MEMORY_SLIDES.length - 1 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .6 }}>Not because you are perfect. Because somehow, being close to you feels like where my heart wants to stay.</motion.p>}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="shx-story-nav">
          <button type="button" className="shx-nav-arrow" onClick={() => setMemoryIndex(v => Math.max(0, v - 1))} disabled={memoryIndex === 0}><ArrowLeft/></button>
          <div className="shx-dots">{MEMORY_SLIDES.map((_,i) => <button key={i} className={i === memoryIndex ? 'is-active' : ''} type="button" onClick={() => setMemoryIndex(i)} aria-label={`Memory ${i + 1}`}/>)}</div>
          {memoryIndex < MEMORY_SLIDES.length - 1
            ? <button type="button" className="shx-nav-arrow" onClick={() => setMemoryIndex(v => Math.min(MEMORY_SLIDES.length - 1, v + 1))}><ArrowRight/></button>
            : <button type="button" className="shx-continue" onClick={() => setPhase('letter')}>One last page <ArrowRight/></button>}
        </div>
      </motion.section>}

      {phase === 'letter' && <motion.section key="letter" className="shx-scene shx-letter-scene" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18, filter: 'blur(10px)' }} transition={{ duration: .85 }}>
        <div className="shx-letter-photo"><img src="/photos/special.jpg" alt="Agnes"/><span/></div>
        <div className="shx-letter-copy">
          <span className="shx-overline">NOT A BIRTHDAY WISH. SOMETHING MORE.</span>
          <h2>Agnes, <em>this is the part I mean.</em></h2>
          <div className="shx-letter-lines">{LETTER_LINES.map((line, i) => <motion.p key={line} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 + i * .42, duration: .7 }}>{line}</motion.p>)}</div>

          <div className="shx-letter-actions">
            <button type="button" className={`shx-voice ${voicePlaying ? 'is-playing' : ''}`} onClick={toggleVoice} disabled={!voiceReady}>
              <span>{voicePlaying ? <Pause/> : <Play/>}</span>
              <div><strong>{voiceReady ? 'Hear me before the question' : 'Your voice can live here'}</strong><small>{voiceReady ? (voicePlaying ? 'playing…' : 'private voice note') : 'optional: add secret-heart-voice.mp3'}</small></div>
              <Volume2/>
            </button>
            <button type="button" className="shx-open-question" onClick={() => setPhase('proposal')}>Open my question <Heart fill="currentColor"/></button>
          </div>
        </div>
      </motion.section>}

      {phase === 'proposal' && <motion.section key="proposal" className="shx-scene shx-proposal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .95 }}>
        <div className="shx-proposal-visual">
          <motion.div className="shx-portrait-frame" initial={{ opacity: 0, scale: .88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [.16,1,.3,1] }}>
            <img src="/photos/special.jpg" alt="Agnes Roselin"/>
            <span className="shx-portrait-light"/>
          </motion.div>
          <motion.div className="shx-proposal-heartline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .4 }}><HeartMark/></motion.div>
          <motion.span className="shx-portrait-caption" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25 }}>my favourite person ♡</motion.span>
        </div>

        <div className="shx-proposal-copy">
          <motion.span className="shx-overline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .9 }}>AGNES ROSELIN</motion.span>
          <motion.p className="shx-preline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25 }}>I do not want to just call you my princess.</motion.p>
          <motion.p className="shx-preline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }}>I want to be the person who gets to choose you — and be chosen by you.</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 2.2, duration: 1.1, ease: [.16,1,.3,1] }}>Will you be mine,<br/><em>and let me be yours?</em></motion.h1>
          <motion.div className="shx-answer-row" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.1, duration: .8 }}>
            <button type="button" className="shx-yes" onClick={acceptProposal}>Yes. I choose us. <Heart fill="currentColor"/></button>
            <button type="button" className="shx-time-button" onClick={() => setPhase('time')}>I need a little time <span>☾</span></button>
          </motion.div>
          <motion.small className="shx-no-pressure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.55 }}>No pressure. I want your real answer, always.</motion.small>
        </div>
      </motion.section>}

      {phase === 'time' && <motion.section key="time" className="shx-scene shx-time" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="shx-moon">☾</div>
        <span className="shx-overline">YOUR HEART GETS TO CHOOSE TOO</span>
        <h2>Take all the time<br/><em>you need.</em></h2>
        <p>What I feel is real, so I do not need to rush your answer. This question will still be here whenever you want to come back to it.</p>
        <button type="button" className="shx-return" onClick={() => setPhase('proposal')}><ArrowLeft/> Back to the question</button>
      </motion.section>}

      {phase === 'yes' && <motion.section key="yes" className="shx-scene shx-yes-scene" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [.16,1,.3,1] }}>
        <motion.div className="shx-yes-symbol" initial={{ scale: 0, rotate: -12 }} animate={{ scale: [0,1.18,.96,1], rotate: 0 }} transition={{ duration: 1.25 }}><Heart fill="currentColor"/></motion.div>
        <motion.span className="shx-overline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .65 }}>THE SECRET IS OURS NOW</motion.span>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .85 }}>You chose <em>us.</em></motion.h1>
        <motion.div className="shx-couple-name" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.25 }}>Agnes <Heart fill="currentColor"/> Dhatchina</motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>From this moment, no hidden page. No secret heart. Just a story I hope we keep writing together.</motion.p>
        <motion.div className="shx-date" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>{new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}</motion.div>
        <motion.div className="shx-final-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
          <button type="button" onClick={replay}><RotateCcw/> Replay our moment</button>
          <button type="button" className="is-soft" onClick={onClose}>Keep this memory <Heart fill="currentColor"/></button>
        </motion.div>
      </motion.section>}

      {phase === 'keepsake' && <motion.section key="keepsake" className="shx-scene shx-keepsake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .9 }}>
        <motion.div className="shx-keepsake-photo" animate={{ y: [0,-6,0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}><img src="/photos/special.jpg" alt="Agnes"/><span><Heart fill="currentColor"/></span></motion.div>
        <span className="shx-overline">OUR PRIVATE KEEPSAKE</span>
        <h1>This heart is<br/><em>already unlocked.</em></h1>
        <p>You chose us{savedYes?.display ? ` on ${savedYes.display}` : ''}. I kept the moment here so this little Secret Heart remembers it too.</p>
        <div className="shx-couple-name">Agnes <Heart fill="currentColor"/> Dhatchina</div>
        <div className="shx-final-actions">
          <button type="button" onClick={replay}><RotateCcw/> Replay from the beginning</button>
          <button type="button" className="is-soft" onClick={onClose}>Close gently <Heart fill="currentColor"/></button>
        </div>
      </motion.section>}
    </AnimatePresence>
  </motion.div>;
}
