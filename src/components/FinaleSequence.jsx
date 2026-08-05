import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Play } from 'lucide-react';
import '../finale-v10.css';

const HEART_SLOTS = [
  { x: 24, y: 22, w: 10.5, h: 18.5, r: -9 },
  { x: 35, y: 17, w: 11.5, h: 22, r: -4 },
  { x: 46, y: 21, w: 9.5, h: 18.5, r: 1 },
  { x: 64, y: 20, w: 10, h: 19, r: 3 },
  { x: 75, y: 17, w: 11, h: 21, r: 6 },
  { x: 86, y: 23, w: 10, h: 18, r: 10 },

  { x: 22, y: 40, w: 10.5, h: 13.5, r: -7 },
  { x: 35, y: 39, w: 11, h: 20, r: -2 },
  { x: 66, y: 39, w: 11, h: 20, r: 2 },
  { x: 79, y: 40, w: 10.5, h: 13.5, r: 7 },

  { x: 23, y: 58, w: 10.5, h: 17, r: -6 },
  { x: 35, y: 58, w: 11, h: 14, r: -2 },
  { x: 66, y: 58, w: 11, h: 14, r: 2 },
  { x: 78, y: 58, w: 10.5, h: 17, r: 6 },

  { x: 34, y: 74, w: 12.5, h: 14.5, r: -5 },
  { x: 66, y: 74, w: 12.5, h: 14.5, r: 5 },
  { x: 43, y: 84, w: 11, h: 16.5, r: -2 },
  { x: 57, y: 84, w: 11, h: 16.5, r: 2 },
  { x: 50, y: 94, w: 10.5, h: 12.5, r: 0 }
];

function buildCandidates(src) {
  const match = src.match(/^(.*)\.(jpg|jpeg|png|webp)$/i);
  if (!match) return [src];
  const base = match[1];
  const list = [src, `${base}.jpg`, `${base}.jpeg`, `${base}.png`, `${base}.webp`];

  const photoMatch = src.match(/\/photos\/photo-(\d{2})\.(jpg|jpeg|png|webp)$/i);
  const finaleMatch = src.match(/\/finale-photos\/finale-(\d{2})\.(jpg|jpeg|png|webp)$/i);
  if (photoMatch) {
    const n = photoMatch[1];
    list.push(`/finale-photos/finale-${n}.jpg`, `/finale-photos/finale-${n}.jpeg`, `/finale-photos/finale-${n}.png`, `/finale-photos/finale-${n}.webp`);
  }
  if (finaleMatch) {
    const n = finaleMatch[1];
    list.push(`/photos/photo-${n}.jpg`, `/photos/photo-${n}.jpeg`, `/photos/photo-${n}.png`, `/photos/photo-${n}.webp`);
  }

  list.push('/photos/special.jpg', '/photos/hero.jpg', '/photos/childhood-smile.jpg');
  return Array.from(new Set(list));
}

function SmartImage({ src, alt, index = 0, className = '', eager = false }) {
  const candidates = useMemo(() => buildCandidates(src), [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) setCandidateIndex((value) => value + 1);
    else setFailed(true);
  };

  if (failed) {
    return (
      <div className={`photo-placeholder ${className}`}>
        <span>{String(index + 1).padStart(2, '0')}</span>
        <small>Add<br />{src.split('/').pop()}</small>
      </div>
    );
  }

  return <img className={className} src={candidates[candidateIndex]} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={handleError} />;
}

function buildOrigin(index, count) {
  const angle = (index / Math.max(1, count)) * Math.PI * 2 - Math.PI / 2;
  const radius = 1050 + (index % 4) * 120;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

export default function FinaleSequence({ finaleMemories, closeFinale, replayFinale }) {
  const [phase, setPhase] = useState('writing');
  const [run, setRun] = useState(0);
  const featuredIndex = Math.min(4, Math.max(0, finaleMemories.length - 1));
  const featured = finaleMemories[featuredIndex] || finaleMemories[0];
  const surrounding = finaleMemories.filter((_, index) => index !== featuredIndex).slice(0, 19);

  useEffect(() => {
    setPhase('writing');
    const heart = window.setTimeout(() => setPhase('heart'), 6900);
    const final = window.setTimeout(() => setPhase('final'), 15300);
    return () => {
      window.clearTimeout(heart);
      window.clearTimeout(final);
    };
  }, [run]);

  const restart = () => {
    replayFinale?.();
    setRun((value) => value + 1);
  };

  const showHeart = phase === 'heart' || phase === 'final';
  const showFinal = phase === 'final';

  return (
    <motion.section className={`finale-v12 ${showFinal ? 'is-final' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
      <div className="fv12-background" aria-hidden="true">
        <i className="fv12-glow fv12-glow-left" />
        <i className="fv12-glow fv12-glow-right" />
        <i className="fv12-glow fv12-glow-bottom" />
      </div>

      <div className="fv12-stars" aria-hidden="true">
        {Array.from({ length: 72 }, (_, index) => (
          <i key={index} style={{
            '--x': `${(index * 43 + 7) % 100}%`,
            '--y': `${(index * 61 + 11) % 100}%`,
            '--delay': `${(index % 12) * 0.34}s`,
            '--size': `${1 + (index % 3)}px`
          }} />
        ))}
      </div>
      <div className="fv12-grain" aria-hidden="true" />

      <AnimatePresence mode="wait">
        {phase === 'writing' && (
          <motion.div className="fv12-writing-scene" key="writing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.965, filter: 'blur(14px)' }} transition={{ duration: 0.95 }}>
            <motion.div className="fv12-writing-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
              <span>A little birthday wish, written from my heart</span>
              <i aria-hidden="true" />
            </motion.div>

            <div className="fv12-handwriting-wrap fv12-handwriting-reference">
              <motion.div className="fv12-writing-line fv12-writing-small" initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }} animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }} transition={{ delay: 0.9, duration: 1.45, ease: [0.16, 1, 0.3, 1] }}>
                Once again,
              </motion.div>

              <motion.div className="fv12-writing-line fv12-writing-main" initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }} animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }} transition={{ delay: 1.85, duration: 3.0, ease: [0.16, 1, 0.3, 1] }}>
                Happy Birthday to you, Chellom.
              </motion.div>

              <motion.span className="fv12-pen-light" initial={{ left: '2%', opacity: 0 }} animate={{ left: ['2%', '18%', '97%'], opacity: [0, 1, 0] }} transition={{ delay: 1.7, duration: 3.35, times: [0, 0.08, 1], ease: 'easeInOut' }} />

              <motion.svg className="fv12-signature-flourish fv12-reference-flourish" viewBox="0 0 1500 230" aria-hidden="true">
                <defs>
                  <filter id="writingGlow" x="-30%" y="-60%" width="160%" height="220%">
                    <feGaussianBlur stdDeviation="5.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <motion.path d="M55 108 C245 170 476 164 690 132 C910 99 1118 92 1298 123" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" filter="url(#writingGlow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 4.1, duration: 1.65, ease: 'easeInOut' }} />
                <motion.path d="M1298 123 C1322 91 1351 73 1382 74 C1420 75 1445 101 1445 132 C1445 177 1397 205 1364 221 C1330 202 1284 176 1284 132 C1284 100 1306 77 1338 76 C1361 76 1377 88 1394 108 C1410 88 1427 77 1446 77" fill="none" stroke="currentColor" strokeWidth="3.15" strokeLinecap="round" strokeLinejoin="round" filter="url(#writingGlow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 5.2, duration: 1.45, ease: 'easeInOut' }} />
                <motion.path d="M1364 221 C1398 232 1443 221 1488 188" fill="none" stroke="currentColor" strokeWidth="2.45" strokeLinecap="round" filter="url(#writingGlow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.96 }} transition={{ delay: 6.12, duration: 0.72, ease: 'easeOut' }} />
              </motion.svg>

              <div className="fv12-writing-dust" aria-hidden="true">
                {Array.from({ length: 24 }, (_, index) => (
                  <motion.i
                    key={index}
                    style={{ '--dust-x': `${5 + ((index * 61) % 90)}%`, '--dust-y': `${54 + ((index * 29) % 35)}%` }}
                    initial={{ opacity: 0, scale: 0.2, y: 12 }}
                    animate={{ opacity: [0, 0.8, 0.15, 0], scale: [0.2, 1, 0.55, 0.2], y: [12, 0, -9, -18] }}
                    transition={{ delay: 4.0 + index * 0.055, duration: 2.2, repeat: Infinity, repeatDelay: 3.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHeart && (
          <motion.div className="fv12-heart-scene" key={`heart-${run}`} initial={{ opacity: 0 }} animate={{ opacity: showFinal ? 0.22 : 1, scale: showFinal ? 0.94 : 1, filter: showFinal ? 'blur(1.8px)' : 'blur(0px)' }} transition={{ duration: 1.0 }}>
            <div className="fv12-light-ribbons" aria-hidden="true"><i /><i /></div>
            <div className="fv12-heart-aura" aria-hidden="true" />
            <div className="fv12-spark-burst" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>

            <motion.svg className="fv12-heart-outline" viewBox="0 0 1000 860" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <defs>
                <filter id="heartGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <motion.path className="fv12-heart-path-shadow" d="M500 812C432 741 145 565 145 292C145 115 334 67 500 242C666 67 855 115 855 292C855 565 568 741 500 812Z" fill="none" stroke="currentColor" strokeWidth="15" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.22 }} transition={{ duration: 2.4, ease: 'easeInOut' }} />
              <motion.path className="fv12-heart-path" d="M500 812C432 741 145 565 145 292C145 115 334 67 500 242C666 67 855 115 855 292C855 565 568 741 500 812Z" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" filter="url(#heartGlow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2.35, ease: 'easeInOut' }} />
              <motion.path className="fv12-heart-path-inner" d="M500 812C432 741 145 565 145 292C145 115 334 67 500 242C666 67 855 115 855 292C855 565 568 741 500 812Z" transform="translate(500 430) scale(.965) translate(-500 -430)" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: .72 }} transition={{ delay: .35, duration: 2.2, ease: 'easeInOut' }} />
            </motion.svg>

            <div className="fv12-decor fv12-decor-left" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="fv12-decor fv12-decor-right" aria-hidden="true"><i /><i /><i /><i /></div>
            <span className="fv12-mini-heart fv12-mini-heart-one" aria-hidden="true">♥</span>
            <span className="fv12-mini-heart fv12-mini-heart-two" aria-hidden="true">♥</span>
            <span className="fv12-mini-heart fv12-mini-heart-three" aria-hidden="true">♥</span>

            <div className="fv12-photo-heart">
              {surrounding.map((memory, index) => {
                const slot = HEART_SLOTS[index] || HEART_SLOTS[HEART_SLOTS.length - 1];
                const origin = buildOrigin(index, surrounding.length);
                return (
                  <motion.figure
                    className="fv12-memory-card"
                    key={`${memory.src}-${index}`}
                    style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.w}%`, height: `${slot.h}%`, '--rotation': `${slot.r}deg`, '--float-delay': `${index * 0.13}s` }}
                    initial={{ opacity: 0, x: origin.x, y: origin.y, scale: 0.08, rotateZ: slot.r * 2.2, filter: 'blur(18px) brightness(.45)' }}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateZ: slot.r, filter: 'blur(0px) brightness(1)' }}
                    transition={{ delay: 0.45 + index * 0.06, duration: 1.55, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <SmartImage src={memory.src} alt={memory.title} index={index} eager />
                  </motion.figure>
                );
              })}

              <motion.figure className="fv12-featured-card" initial={{ opacity: 0, y: 560, scale: 0.06, rotateZ: -7, filter: 'blur(20px) brightness(.45)' }} animate={{ opacity: 1, y: 0, scale: 1, rotateZ: 0, filter: 'blur(0px) brightness(1)' }} transition={{ delay: 1.05, duration: 1.9, ease: [0.16, 1, 0.3, 1] }}>
                <div className="fv12-featured-inner">
                  <SmartImage src={featured?.src || '/photos/photo-05.jpg'} alt={featured?.title || 'My favourite memory'} index={featuredIndex} eager />
                  <motion.span className="fv12-featured-shine" animate={{ x: ['-140%', '140%'] }} transition={{ delay: 2.1, duration: 1.9, ease: 'easeInOut' }} />
                  <motion.figcaption className="fv12-featured-caption" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.45, duration: .75 }}>
                    <span>For my princess</span>
                    <strong>My favourite person</strong>
                  </motion.figcaption>
                </div>
              </motion.figure>
            </div>


          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinal && (
          <motion.div className="fv12-final-scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.0 }}>
            <motion.div className="fv12-final-panel" initial={{ opacity: 0, y: 28, scale: 0.96, filter: 'blur(14px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} transition={{ delay: 0.5, duration: 1.0 }}>
              <span>For my princess</span>
              <strong>Once again, Happy Birthday to you, Chellom.</strong>
              <p>
                You are my favourite person, my calm, and one of the most precious parts of my little world.
                May your smile stay bright, your heart stay peaceful, and every beautiful dream gently find its way to you.
              </p>
              <em>— always, from my heart</em>
              <div className="fv12-final-actions">
                <button type="button" onClick={restart}><Play /> Replay this moment</button>
                <button type="button" onClick={closeFinale}><Heart /> Return to our little world</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
