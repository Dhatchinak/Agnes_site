import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Coffee, Feather, Heart, Handshake, Home, MoonStar, RotateCcw, ShieldCheck, Sparkles, Sunrise, Volume2, VolumeX, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../secret-heart-experience.css';
import { SECRET_HEART_PHOTOS } from '../data/secretHeartPhotos';

const STORAGE_KEY = 'agnes_unwritten_chapter_v1';
const MUSIC_SRC = '/audio/secret-heart-piano.mp3';
const SECRET_HEART_KEY = 'Myprincess';

const MEMORY_PHOTOS = SECRET_HEART_PHOTOS.memories;

const MEMORY_CAPTIONS = [
  'that smile',
  'a little moment I kept',
  'my favourite face',
  'one ordinary day',
  'a memory that stayed',
  'the girl behind all these words'
];

const IDENTITY_WORDS = [
  'my angel',
  'my princess',
  'my little cute one',
  'my girl',
  'my comfort',
  'my peace',
  'my happiness',
  'my home'
];

const FUTURE_FRAMES = [
  ['A sleepy morning with you.', 'morning'],
  ['One completely ordinary day that becomes special because you are there.', 'ordinary'],
  ['Our little home.', 'home'],
  ['Growing together.', 'grow'],
  ['Growing old together.', 'old']
];

const PROMISES = [
  ['I promise to respect you.', 'Your feelings, your dreams, your peace, and your choices will always matter to me.'],
  ['I promise to care for your heart.', 'With gentleness, patience, honesty, and the kind of love that never tries to make you smaller.'],
  ['I promise to stand beside you.', 'Through the beautiful days and the difficult ones, I will keep showing up with care.'],
  ['I promise to keep choosing you with honesty and love.', 'I may never be perfect, but I will always try to love you truthfully.']
];

function AmbientMusic({ muted, enabled }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0.24;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [enabled]);

  return null;
}

function Photo({ sources, alt, className = '' }) {
  const variants = Array.isArray(sources) ? sources : [sources];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [Array.isArray(sources) ? sources.join('|') : sources]);

  if (index >= variants.length) {
    return (
      <div className={`uw-photo-fallback ${className}`}>
        <Heart fill="currentColor" />
        <span>Add new Secret Heart photo</span>
      </div>
    );
  }

  return <img className={className} src={variants[index]} alt={alt} onError={() => setIndex((value) => value + 1)} />;
}

function SoftParticles() {
  const particles = useMemo(
    () => Array.from({ length: 30 }, (_, index) => ({
      id: index,
      x: `${(index * 31 + 7) % 100}%`,
      y: `${(index * 47 + 11) % 100}%`,
      delay: `${-(index % 10) * .8}s`,
      duration: `${9 + (index % 6)}s`
    })),
    []
  );

  return (
    <div className="uw-particles" aria-hidden="true">
      {particles.map((particle) => (
        <i
          key={particle.id}
          style={{
            '--x': particle.x,
            '--y': particle.y,
            '--delay': particle.delay,
            '--duration': particle.duration
          }}
        />
      ))}
    </div>
  );
}

function ContinueButton({ children, onClick, secondary = false, back = false }) {
  return (
    <button type="button" className={`uw-button ${secondary ? 'is-secondary' : ''}`} onClick={onClick}>
      {back && <ArrowLeft />}
      <span>{children}</span>
      {!back && <ArrowRight />}
    </button>
  );
}

function EnvelopeOpening() {
  return (
    <div className="uw-envelope-stage" aria-hidden="true">
      <motion.div
        className="uw-envelope"
        initial={{ y: 16, scale: .92, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: .8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="uw-envelope-back" />
        <motion.div
          className="uw-envelope-flap"
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -178 }}
          transition={{ delay: .9, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="uw-envelope-letter"
          initial={{ y: 26, opacity: 0 }}
          animate={{ y: -104, opacity: 1 }}
          transition={{ delay: 1.45, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <Heart fill="currentColor" />
          <span>For Agnes</span>
        </motion.div>
        <motion.div
          className="uw-wax"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: [1, 1.12, .3], opacity: [1, 1, 0] }}
          transition={{ delay: .55, duration: .72 }}
        >
          <Heart fill="currentColor" />
        </motion.div>
      </motion.div>
    </div>
  );
}


function SketchHoldingHands() {
  return (
    <div className="uw-sketch-hands-wrap uw-sketch-hands-v17" aria-label="Two hands gently clasping and holding each other">
      <motion.div
        className="uw-holding-icon-stage"
        initial={{ opacity: 0, y: 12, scale: .94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .9, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="uw-holding-left-arrive"
          initial={{ x: -42, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: .12, duration: .9, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
        <motion.div
          className="uw-holding-right-arrive"
          initial={{ x: 42, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: .12, duration: .9, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />

        <Handshake className="uw-holding-handshake uw-holding-shadow" strokeWidth={1.08} aria-hidden="true" />
        <Handshake className="uw-holding-handshake uw-holding-main" strokeWidth={1.08} aria-hidden="true" />

        <motion.span
          className="uw-holding-contact-light"
          initial={{ opacity: 0, scale: .45 }}
          animate={{ opacity: [0, 1, .86], scale: [.45, 1.15, 1] }}
          transition={{ delay: 1.35, duration: .9, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />

        <motion.span
          className="uw-holding-heart"
          initial={{ opacity: 0, y: 8, scale: .35 }}
          animate={{ opacity: 1, y: [0, -4, 0], scale: [.35, 1.15, 1] }}
          transition={{
            opacity: { delay: 1.55, duration: .5 },
            scale: { delay: 1.55, duration: .75, ease: [0.16, 1, 0.3, 1] },
            y: { delay: 2.2, duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
          }}
          aria-hidden="true"
        >
          <Heart fill="currentColor" />
        </motion.span>

        <div className="uw-holding-sparkles" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => <i key={index} />)}
        </div>
      </motion.div>

      <motion.div
        className="uw-sketch-hands-caption uw-holding-caption"
        initial={{ opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.05, duration: .65 }}
      >
        <span />
        <small>till the very end</small>
        <span />
      </motion.div>
    </div>
  );
}

function EmptyFutureFrame({ title, className = '', large = false }) {
  return (
    <div className={`uw-empty-frame ${className} ${large ? 'is-large' : ''}`}>
      <div className="uw-empty-photo">
        <span>PHOTO NOT TAKEN YET</span>
      </div>
      <p>{title}</p>
    </div>
  );
}

function CinematicLovers() {
  return (
    <div className="uw-cinematic" aria-hidden="true">
      <motion.img
        className="uw-cinematic-photo"
        src="/secret-heart/cinematic-couple-original-v2.png"
        alt=""
        initial={{ scale: 1.06, filter: 'blur(5px)', opacity: 0 }}
        animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="uw-cinematic-grade" />
      <div className="uw-cinematic-light" />
      <div className="uw-fireflies">
        {Array.from({ length: 18 }, (_, index) => (
          <i key={index} style={{ '--fx': `${7 + ((index * 29) % 87)}%`, '--fy': `${22 + ((index * 37) % 68)}%`, '--fd': `${-(index % 7) * .7}s`, '--ft': `${3.8 + (index % 5) * .55}s` }} />
        ))}
      </div>
      <motion.div className="uw-cinematic-heart" initial={{ opacity: 0, scale: .7 }} animate={{ opacity: [0, 1, .78], scale: [0.7, 1.08, 1] }} transition={{ delay: 1.45, duration: 1.4 }}>
        <svg viewBox="0 0 100 92">
          <motion.path d="M50 84 C42 76 11 56 11 31 C11 13 34 6 50 25 C66 6 89 13 89 31 C89 56 58 76 50 84Z" fill="none" stroke="currentColor" strokeWidth="1.8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.35, duration: 1.7, ease: 'easeInOut' }} />
        </svg>
      </motion.div>
    </div>
  );
}

function AgnesPortraitEditorial() {
  return (
    <motion.div
      className="uw-agnes-portrait-stage"
      initial={{ opacity: 0, x: 34, scale: .985 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="uw-agnes-photo-aura aura-one" aria-hidden="true" />
      <span className="uw-agnes-photo-aura aura-two" aria-hidden="true" />

      <div className="uw-agnes-photo-editorial">
        <Photo
          sources={SECRET_HEART_PHOTOS.portrait}
          alt="Agnes"
          className="uw-agnes-photo"
        />
        <div className="uw-agnes-photo-shade" aria-hidden="true" />
        <div className="uw-agnes-photo-caption">
          <small>MY FAVOURITE PERSON</small>
          <strong>Agnes</strong>
        </div>
      </div>

      <motion.span
        className="uw-agnes-heart-mark"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0, y: [0, -4, 0] }}
        transition={{
          scale: { delay: .55, type: 'spring', stiffness: 190 },
          rotate: { delay: .55, duration: .45 },
          y: { delay: 1.05, duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <Heart fill="currentColor" />
      </motion.span>

      <motion.span className="uw-agnes-photo-tag tag-one" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .65 }}>you, always</motion.span>
      <motion.span className="uw-agnes-photo-tag tag-two" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .82 }}>my soft place</motion.span>
    </motion.div>
  );
}

export default function SecretHeartExperience({ onClose }) {
  const [scene, setScene] = useState('password');
  const [muted, setMuted] = useState(false);
  const [promiseIndex, setPromiseIndex] = useState(0);
  const [activeMemory, setActiveMemory] = useState(0);
  const [heartKey, setHeartKey] = useState('');
  const [heartError, setHeartError] = useState(false);
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (scene !== 'cinematic-intro') return undefined;
    const timer = window.setTimeout(() => setScene('opening'), 7200);
    return () => window.clearTimeout(timer);
  }, [scene]);

  useEffect(() => {
    if (scene !== 'opening') return undefined;
    const timer = window.setTimeout(() => setScene('identity'), 3100);
    return () => window.clearTimeout(timer);
  }, [scene]);

  useEffect(() => {
    if (scene !== 'memories') return undefined;
    const timer = window.setInterval(() => {
      setActiveMemory((value) => (value + 1) % MEMORY_PHOTOS.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [scene]);

  useEffect(() => {
    if (scene !== 'yes-quiet') return undefined;

    const first = window.setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 60,
        scalar: .8,
        origin: { y: .68 },
        colors: ['#f2d9e1', '#ffffff', '#f4e2c4', '#d38da7']
      });
    }, 1800);

    const second = window.setTimeout(() => setScene('promises'), 3050);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [scene]);

  const acceptedAt = useMemo(() => {
    if (!saved?.acceptedAt) return '';
    return new Date(saved.acceptedAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [saved]);

  const unlockHeart = (event) => {
    event.preventDefault();
    if (heartKey.trim() === SECRET_HEART_KEY) {
      setHeartError(false);
      setHeartKey('');
      setScene('cinematic-intro');
    } else {
      setHeartError(true);
    }
  };

  const acceptPromise = () => {
    if (promiseIndex < PROMISES.length - 1) {
      setPromiseIndex((value) => value + 1);
      return;
    }

    const data = { answer: 'yes', acceptedAt: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // private mode
    }
    setSaved(data);
    setScene('keepsake');
  };

  const replay = () => {
    setPromiseIndex(0);
    setScene('opening');
  };

  const musicEnabled = scene !== 'password';

  return (
    <motion.div className={`uw-shell ${scene === 'cinematic-intro' ? 'is-cinematic' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .8 }}>
      <AmbientMusic muted={muted} enabled={musicEnabled} />
      <SoftParticles />
      <div className="uw-wash uw-wash-one" aria-hidden="true" />
      <div className="uw-wash uw-wash-two" aria-hidden="true" />

      <header className="uw-topbar">
        <button type="button" className="uw-top-action" onClick={() => setMuted((value) => !value)}>
          {muted ? <VolumeX /> : <Volume2 />}
          <span>{muted ? 'Muted' : 'Music'}</span>
        </button>
        <div className="uw-mark">
          <Heart fill="currentColor" />
          <span>Secret Heart</span>
        </div>
        <button type="button" className="uw-top-action" onClick={onClose}>
          <span>Close</span>
        </button>
      </header>

      <AnimatePresence mode="wait">
        {scene === 'password' && (
          <motion.section key="password" className="uw-scene uw-secret-password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }} transition={{ duration: .75 }}>
            <motion.div className="uw-gate-card" initial={{ opacity: 0, y: 26, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .8, ease: [0.16, 1, 0.3, 1] }}>
              <div className="uw-gate-envelope" aria-hidden="true">
                <div className="uw-gate-letter"><span>For Agnes</span><small>one hidden heart</small></div>
                <div className="uw-gate-flap" />
                <motion.div className="uw-gate-seal" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.2, repeat: Infinity }}><Heart fill="currentColor" /></motion.div>
              </div>
              <span className="uw-overline">SECRET HEART · PRIVATE FOR AGNES</span>
              <h2>One little word,<br /><em>then my hidden heart is yours.</em></h2>
              <p>Clicking Secret Heart should feel special. So this little page opens only with the name I keep for you inside my heart.</p>
              <form className="uw-secret-form" onSubmit={unlockHeart}>
                <label htmlFor="uw-heart-key">Secret heart key</label>
                <div className={`uw-secret-input ${heartError ? 'is-error' : ''}`}>
                  <input id="uw-heart-key" type="password" value={heartKey} onChange={(event) => { setHeartKey(event.target.value); setHeartError(false); }} placeholder="Enter the key…" autoComplete="off" />
                  <button type="submit">Open Secret Heart <Heart fill="currentColor" /></button>
                </div>
                <AnimatePresence>
                  {heartError && <motion.small className="uw-secret-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>That is not the key to this heart. Try the little name I chose only for you.</motion.small>}
                </AnimatePresence>
              </form>
              <div className="uw-secret-hint">Hint: the one-word little name I call you with love. ♡</div>
            </motion.div>
          </motion.section>
        )}

        {scene === 'cinematic-intro' && (
          <motion.section key="cinematic-intro" className="uw-scene uw-cinematic-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <CinematicLovers />
            <motion.div className="uw-cinematic-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}>
              <span className="uw-overline">IF THE WHOLE WORLD WENT QUIET</span>
              <h2>I would still<br /><em>find my way to you.</em></h2>
              <p>In every sky, in every season, in every version of tomorrow—my heart would choose the place beside you.</p>
            </motion.div>
            <motion.div className="uw-cinematic-action" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.35, duration: .7 }}>
              <ContinueButton onClick={() => setScene('opening')}>Enter our story</ContinueButton>
            </motion.div>
          </motion.section>
        )}

        {scene === 'opening' && (
          <motion.section key="opening" className="uw-scene uw-opening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.03, filter: 'blur(14px)' }} transition={{ duration: 1.1 }}>
            <EnvelopeOpening />
            <motion.span className="uw-overline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .45 }}>OUR UNWRITTEN CHAPTER</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: .75, duration: 1 }}>
              There is a beautiful future<br />I have hidden in my heart.
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35, duration: .9 }}>
              Not just another surprise. Not just another page. This is the little future my heart keeps imagining — only for you.
            </motion.p>
          </motion.section>
        )}

        {scene === 'identity' && (
          <motion.section key="identity" className="uw-scene uw-identity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .85 }}>
            <span className="uw-identity-watermark" aria-hidden="true">A</span>
            <span className="uw-identity-bloom bloom-left" aria-hidden="true" />
            <span className="uw-identity-bloom bloom-right" aria-hidden="true" />

            <div className="uw-identity-layout">
              <motion.div className="uw-identity-story" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .85, ease: [0.16, 1, 0.3, 1] }}>
                <div className="uw-identity-scene-label">
                  <b>01</b><span>YOU, ALWAYS</span><i aria-hidden="true" />
                </div>
                <span className="uw-overline">THE LANGUAGE OF MY HEART</span>
                <h2>Every name still<br />leads back to <em>you.</em></h2>
                <div className="uw-identity-rule"><Heart fill="currentColor" /></div>
                <p className="uw-identity-intro">I like you more than I know how to explain—and somehow, every ordinary moment feels softer when it has you in it.</p>

                <div className="uw-identity-truth">
                  <span className="uw-identity-truth-heart"><Heart fill="currentColor" /></span>
                  <div>
                    <small>A LITTLE TRUTH</small>
                    <strong>My heart has so many names for <em>you.</em></strong>
                  </div>
                </div>

                <div className="uw-identity-ending">
                  <p>And yet, even all these words are not enough.</p>
                  <strong>There is one more my heart keeps whispering… <em>future.</em></strong>
                </div>

                <div className="uw-identity-action">
                  <ContinueButton onClick={() => setScene('memories')}>The memories we already made</ContinueButton>
                </div>
              </motion.div>

              <motion.div className="uw-identity-visual" initial={{ opacity: 0, x: 28, scale: .97 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: .1, duration: .95, ease: [0.16, 1, 0.3, 1] }}>
                <div className="uw-identity-photo-card">
                  <Photo sources={SECRET_HEART_PHOTOS.portrait} alt="Agnes" className="uw-identity-photo" />
                  <div className="uw-identity-photo-wash" aria-hidden="true" />
                  <span className="uw-identity-signature">Agnes</span>
                  <span className="uw-identity-favourite">MY FAVOURITE PERSON</span>
                  <span className="uw-identity-heart-pin"><Heart fill="currentColor" /></span>
                </div>

                <div className="uw-identity-name-cloud" aria-label="The names my heart calls you">
                  {IDENTITY_WORDS.map((word, index) => (
                    <motion.span
                      key={word}
                      className={`uw-identity-word word-${index + 1}`}
                      initial={{ opacity: 0, y: 10, scale: .92 }}
                      animate={{ opacity: 1, y: [0, index % 2 ? -4 : 4, 0], scale: 1 }}
                      transition={{ opacity: { delay: .3 + index * .07, duration: .45 }, scale: { delay: .3 + index * .07, duration: .45 }, y: { delay: 1.2 + index * .08, duration: 4 + (index % 3) * .45, repeat: Infinity, ease: 'easeInOut' } }}
                    >
                      <i>{String(index + 1).padStart(2, '0')}</i>
                      <b>{word}</b>
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}

        {scene === 'memories' && (
          <motion.section key="memories" className="uw-scene uw-memories uw-memories-v9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .8 }}>
            <div className="uw-memories-v9-layout">
              <motion.div
                className="uw-memories-v9-copy"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: .75, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="uw-memory-v9-kicker">
                  <span>02</span>
                  <i aria-hidden="true" />
                  <b>THE MEMORIES I KEEP CLOSE</b>
                </div>

                <h2>You turned ordinary days into <em>my favourite memories.</em></h2>
                <p className="uw-memory-v9-lead">Nothing here had to be perfect. A smile, a glance, one ordinary day — if you were there, it became something my heart wanted to keep.</p>

                <div className="uw-memory-v9-message">
                  <span className="uw-memory-v9-heart"><Heart fill="currentColor" /></span>
                  <div>
                    <small>WHAT THESE PHOTOS MEAN TO ME</small>
                    <strong>You are not just part of these memories. <em>You are the reason they matter.</em></strong>
                  </div>
                </div>

                <div className="uw-memory-v9-all">
                  <span>MY PEACE</span>
                  <i>•</i>
                  <span>MY PERSON</span>
                  <i>•</i>
                  <strong>MY ALL</strong>
                </div>

                <div className="uw-memory-v9-ending">
                  <p>These are the moments we already have.</p>
                  <strong>The ones I dream about next are the ones where I still get to choose you.</strong>
                  <ContinueButton onClick={() => setScene('future')}>The future I still dream about</ContinueButton>
                </div>
              </motion.div>

              <motion.div
                className="uw-memory-v9-gallery"
                initial={{ opacity: 0, x: 26 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: .08, duration: .82, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="uw-memory-v9-gallery-head">
                  <div>
                    <small>OUR LITTLE ARCHIVE</small>
                    <strong>{String(activeMemory + 1).padStart(2, '0')} / {String(MEMORY_PHOTOS.length).padStart(2, '0')}</strong>
                  </div>
                  <span>Everyday things. Everything to me.</span>
                </div>

                <div className="uw-memory-v9-stage">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMemory}
                      className="uw-memory-v9-featured"
                      initial={{ opacity: 0, scale: 1.025 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: .99 }}
                      transition={{ duration: .65, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Photo sources={MEMORY_PHOTOS[activeMemory]} alt={MEMORY_CAPTIONS[activeMemory]} className="uw-memory-v9-featured-img" />
                      <div className="uw-memory-v9-gradient" aria-hidden="true" />
                      <div className="uw-memory-v9-caption">
                        <span>{String(activeMemory + 1).padStart(2, '0')}</span>
                        <div>
                          <strong>{MEMORY_CAPTIONS[activeMemory]}</strong>
                          <small>{['the smile I could look at forever','one little moment I never wanted to lose','a place that became special because of us','an ordinary day that became one of mine','even quiet moments stayed with me','you — behind every word and every dream'][activeMemory]}</small>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <button type="button" className="uw-memory-v9-nav is-prev" aria-label="Previous memory" onClick={() => setActiveMemory((value) => (value - 1 + MEMORY_PHOTOS.length) % MEMORY_PHOTOS.length)}>
                    <ArrowLeft />
                  </button>
                  <button type="button" className="uw-memory-v9-nav is-next" aria-label="Next memory" onClick={() => setActiveMemory((value) => (value + 1) % MEMORY_PHOTOS.length)}>
                    <ArrowRight />
                  </button>
                </div>

                <div className="uw-memory-v9-thumbs" aria-label="Choose a memory">
                  {MEMORY_PHOTOS.map((sources, index) => (
                    <motion.button
                      type="button"
                      key={index}
                      className={`uw-memory-v9-thumb ${activeMemory === index ? 'is-active' : ''}`}
                      onClick={() => setActiveMemory(index)}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: .97 }}
                      aria-label={`Show memory ${index + 1}: ${MEMORY_CAPTIONS[index]}`}
                    >
                      <Photo sources={sources} alt="" className="uw-memory-v9-thumb-img" />
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}

        {scene === 'future' && (
          <motion.section key="future" className="uw-scene uw-future uw-future-v10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .9 }}>
            <div className="uw-future-copy">
              <span className="uw-overline">THE MEMORIES WE HAVE NOT MADE YET</span>
              <h2>These frames are still empty.</h2>
              <p>Because the most beautiful memories in my heart do not exist yet.</p>
            </div>
            <div className="uw-future-frames">
              {FUTURE_FRAMES.map(([title, key], index) => (
                <motion.div key={key} initial={{ opacity: 0, y: 28, rotate: index % 2 === 0 ? -3 : 3 }} animate={{ opacity: 1, y: 0, rotate: [-3, 2, -1, 3, -2][index] }} transition={{ delay: .15 + index * .14, duration: .8 }}>
                  <EmptyFutureFrame title={title} />
                </motion.div>
              ))}
            </div>
            <ContinueButton onClick={() => setScene('little-world')}>The little world I imagine</ContinueButton>
          </motion.section>
        )}

        {scene === 'little-world' && (
          <motion.section key="little-world" className="uw-scene uw-little-world uw-little-world-v10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.018, filter: 'blur(10px)' }} transition={{ duration: .95 }}>
            <div className="uw-little-world-watermark" aria-hidden="true">HOME</div>
            <div className="uw-little-world-layout">
              <motion.div className="uw-little-world-copy" initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .9, ease: [0.16, 1, 0.3, 1] }}>
                <div className="uw-little-world-chapter"><span>CHAPTER 06</span><i /><b>OUR LITTLE WORLD</b></div>
                <span className="uw-overline">THE LIFE BETWEEN THE BIG MOMENTS</span>
                <h2>I do not dream only about <em>big moments</em> with you.</h2>
                <p className="uw-little-world-lead">I dream about a life that feels quietly, beautifully ours.</p>

                <div className="uw-everyday-promises">
                  <div><span><Sunrise /></span><p><small>SLOW MORNINGS</small>Waking up beside you and beginning the day with your sleepy smile.</p></div>
                  <div><span><Coffee /></span><p><small>ORDINARY JOY</small>Laughing in the kitchen and making simple days feel special.</p></div>
                  <div><span><Home /></span><p><small>STAYING CLOSE</small>Holding your hand in the beautiful days—and even tighter in the hard ones.</p></div>
                </div>

                <div className="uw-little-world-bottom">
                  <div className="uw-baby-note">
                    <Heart fill="currentColor" />
                    <div><span>Maybe one day…</span><p>a tiny little person with a little bit of you and a little bit of me. ♡</p></div>
                  </div>
                  <ContinueButton onClick={() => setScene('last-breath')}>The deepest wish</ContinueButton>
                </div>
              </motion.div>

              <motion.div className="uw-little-world-visual" initial={{ opacity: 0, x: 30, scale: .98 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: .18, duration: 1.05, ease: [0.16, 1, 0.3, 1] }}>
                <div className="uw-home-portrait">
                  <Photo sources="/secret-heart/little-world-drawing-v11.png" alt="A hand-drawn little home imagined for the future" className="uw-home-image" />
                  <div className="uw-home-grade" aria-hidden="true" />
                  <div className="uw-home-caption"><small>A LITTLE DREAM I KEEP</small><strong>a home drawn with you in every line.</strong></div>
                </div>
                <motion.div className="uw-home-seal" initial={{ scale: 0, rotate: -16 }} animate={{ scale: [0,1.12,1], rotate: 0 }} transition={{ delay: .82, duration: .72 }}><Heart fill="currentColor" /></motion.div>
                <motion.div className="uw-home-note" initial={{ opacity: 0, y: 18, rotate: 3 }} animate={{ opacity: 1, y: 0, rotate: 1.5 }} transition={{ delay: .72, duration: .72 }}>
                  <Sparkles />
                  <div><small>MY FAVOURITE FUTURE</small><strong>Nothing grand. Just us.</strong></div>
                </motion.div>
                <motion.div className="uw-home-address" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .95, duration: .65 }}>
                  <span>WHEREVER YOU ARE</span><b>that is home</b>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
        )}

        {scene === 'last-breath' && (
          <motion.section key="last-breath" className="uw-scene uw-last-breath uw-last-breath-v12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(12px)' }} transition={{ duration: .95 }}>
            <div className="uw-last-breath-watermark" aria-hidden="true">ALWAYS</div>
            <motion.div className="uw-last-breath-heading" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
              <span className="uw-overline">THE DEEPEST WISH</span>
              <h2>And after all those years…</h2>
              <p>when my last breath finally comes…</p>
            </motion.div>

            <motion.div className="uw-hands-realistic-stage" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12, duration: .8 }}>
              <SketchHoldingHands />
            </motion.div>

            <motion.div className="uw-last-breath-ending" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.45, duration: .8 }}>
              <strong>I want your hand to be holding mine.</strong>
              <small>That is my dream.</small>
              <ContinueButton onClick={() => setScene('choice')}>One important truth</ContinueButton>
            </motion.div>
          </motion.section>
        )}

        {scene === 'choice' && (
          <motion.section key="choice" className="uw-scene uw-choice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .9 }}>
            <div className="uw-choice-card">
              <span className="uw-overline">BUT AGNES…</span>
              <h2>These are my dreams.</h2>
              <p>They are not promises you have to accept.</p>
              <p>Your heart has its own dreams too.</p>
              <div className="uw-choice-separator"><Heart fill="currentColor" /></div>
              <h3>So there is one thing missing from every future I imagined.</h3>
              <strong>Your choice.</strong>
              <ContinueButton onClick={() => setScene('question')}>Open the question</ContinueButton>
            </div>
          </motion.section>
        )}

        {scene === 'question' && (
          <motion.section key="question" className="uw-scene uw-question uw-question-v10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.02, filter: 'blur(12px)' }} transition={{ duration: .95 }}>
            <div className="uw-proposal-watermark" aria-hidden="true">US</div>
            <div className="uw-proposal-orbit orbit-a" aria-hidden="true" />
            <div className="uw-proposal-orbit orbit-b" aria-hidden="true" />

            <div className="uw-proposal-layout">
              <motion.div className="uw-proposal-visual" initial={{ opacity: 0, x: -34, scale: .975 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}>
                <div className="uw-proposal-photo-main">
                  <Photo sources={SECRET_HEART_PHOTOS.proposalMain} alt="Agnes" className="uw-proposal-photo" />
                  <div className="uw-proposal-photo-grade" aria-hidden="true" />
                  <div className="uw-proposal-photo-copy">
                    <small>THE FACE IN EVERY TOMORROW</small>
                    <strong>my favourite person</strong>
                  </div>
                </div>

                <motion.div className="uw-proposal-photo-small" initial={{ opacity: 0, y: 24, rotate: 7 }} animate={{ opacity: 1, y: 0, rotate: 4 }} transition={{ delay: .55, duration: .8, ease: [0.16, 1, 0.3, 1] }}>
                  <Photo sources={SECRET_HEART_PHOTOS.proposalSmall} alt="A favourite memory with Agnes" />
                  <span>one of a thousand reasons ♡</span>
                </motion.div>

                <motion.div className="uw-proposal-seal" initial={{ scale: 0, rotate: -18 }} animate={{ scale: [0, 1.12, 1], rotate: 0 }} transition={{ delay: .8, duration: .75, ease: [0.16, 1, 0.3, 1] }} aria-hidden="true">
                  <Heart fill="currentColor" />
                </motion.div>

                <motion.div className="uw-proposal-note" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .95, duration: .7 }}>
                  <Feather />
                  <p><span>I am not asking for a perfect story.</span>I am asking for a real one—with you.</p>
                </motion.div>
              </motion.div>

              <motion.div className="uw-proposal-copy" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: 1, ease: [0.16, 1, 0.3, 1] }}>
                <div className="uw-proposal-chapter"><span>FINAL CHAPTER</span><i /><b>01</b></div>
                <span className="uw-overline">THE QUESTION I SAVED FOR LAST</span>
                <h1>Agnes, will you choose this little <em>forever</em> with me?</h1>
                <p className="uw-proposal-lead">Not just the beautiful days. The quiet ones, the difficult ones, the completely ordinary ones—and every version of us we grow into.</p>

                <div className="uw-proposal-promises" aria-label="What this promise means">
                  <span><ShieldCheck /> Safe</span>
                  <span><Sparkles /> Cherished</span>
                  <span><Heart /> Chosen</span>
                </div>

                <div className="uw-proposal-answer-card">
                  <button type="button" className="uw-proposal-yes" onClick={() => setScene('yes-quiet')}>
                    <span><Heart fill="currentColor" /></span>
                    <div><small>MY ANSWER IS</small><strong>Yes, I choose us.</strong></div>
                    <ArrowRight />
                  </button>
                  <button type="button" className="uw-proposal-time uw-proposal-no" onClick={() => setScene('time')} aria-label="No">
                    <X />
                    <span>No</span>
                  </button>
                </div>
                <small className="uw-proposal-respect"><Heart /> No pressure, no performance—only the answer your heart truly wants.</small>
              </motion.div>
            </div>
          </motion.section>
        )}

        {scene === 'time' && (
          <motion.section key="time" className="uw-scene uw-time uw-time-v10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .9 }}>
            <motion.div className="uw-time-card" initial={{ opacity: 0, y: 24, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .85, ease: [0.16, 1, 0.3, 1] }}>
              <div className="uw-time-moon uw-no-heart"><Heart /></div>
              <span className="uw-overline">YOUR ANSWER MATTERS</span>
              <h2>I understand.<br/><em>Truly.</em></h2>
              <p>Thank you for being honest with me. What I feel for you should never become pressure on your heart.</p>
              <div className="uw-time-promise"><Heart fill="currentColor" /><span>Your peace matters more to me than the answer I hoped for.</span></div>
              <div className="uw-question-actions">
                <ContinueButton secondary back onClick={() => setScene('question')}>Back</ContinueButton>
                <ContinueButton onClick={onClose}>Close this chapter gently</ContinueButton>
              </div>
            </motion.div>
          </motion.section>
        )}

        {scene === 'yes-quiet' && (
          <motion.section key="yes-quiet" className="uw-scene uw-yes-quiet uw-yes-v10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .8 }}>
            <div className="uw-yes-halo" aria-hidden="true" />
            <motion.div className="uw-small-heart" initial={{ scale: 0, opacity: 0, rotate: -12 }} animate={{ scale: [0, 1.22, .96, 1], opacity: 1, rotate: 0 }} transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}>
              <Heart fill="currentColor" />
            </motion.div>
            <motion.span className="uw-overline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .65 }}>THE SECRET IS OURS NOW</motion.span>
            <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .9 }}>You said yes<br/><em>to us.</em></motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
              Agnes, you just turned the softest dream in my heart into a future we can begin together.
            </motion.p>
            <motion.div className="uw-yes-signature" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.75 }}>Agnes <Heart fill="currentColor" /> Dhatchina</motion.div>
          </motion.section>
        )}

        {scene === 'promises' && (
          <motion.section key={`promise-${promiseIndex}`} className="uw-scene uw-promises" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .8 }}>
            <div className="uw-promise-number">0{promiseIndex + 1}</div>
            <div className="uw-promise-copy">
              <span className="uw-overline">MY PROMISE TO YOU</span>
              <h2>{PROMISES[promiseIndex][0]}</h2>
              <p>{PROMISES[promiseIndex][1]}</p>
              <div className="uw-promise-rail">
                {PROMISES.map((_, index) => <i key={index} className={index <= promiseIndex ? 'is-lit' : ''} />)}
              </div>
              <ContinueButton onClick={acceptPromise}>{promiseIndex === PROMISES.length - 1 ? 'Our unwritten chapter' : 'Next promise'}</ContinueButton>
            </div>
          </motion.section>
        )}

        {scene === 'keepsake' && (
          <motion.section key="keepsake" className="uw-scene uw-keepsake uw-keepsake-v10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .9 }}>
            <div className="uw-keepsake-layout">
              <motion.div className="uw-keepsake-portrait" initial={{ opacity: 0, x: -28, rotate: -3 }} animate={{ opacity: 1, x: 0, rotate: -1.5 }} transition={{ duration: .9, ease: [0.16, 1, 0.3, 1] }}>
                <Photo sources={SECRET_HEART_PHOTOS.keepsake} alt="Agnes" />
                <div className="uw-keepsake-portrait-grade" />
                <div className="uw-keepsake-portrait-caption"><small>THE DAY OUR STORY CHANGED</small><strong>she said yes ♡</strong></div>
                <span className="uw-keepsake-stamp"><Heart fill="currentColor" /></span>
              </motion.div>
              <motion.div className="uw-keepsake-copy" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .9 }}>
                <div className="uw-keepsake-number">01 <i /> FOREVER TO GO</div>
                <span className="uw-overline">OUR UNWRITTEN CHAPTER BEGINS HERE</span>
                <h2>You. Me. And all the memories <em>still waiting for us.</em></h2>
                <p>I promise to keep choosing you with honesty, respect, care, and all my heart.</p>
                <div className="uw-keepsake-next-frame"><Sparkles /><span><small>RESERVED FOR</small>our first photo after this moment</span></div>
                <div className="uw-keepsake-name">Agnes <Heart fill="currentColor" /> Dhatchina</div>
                {acceptedAt && <small className="uw-keepsake-date">Secret Heart said yes on {acceptedAt}</small>}
                <div className="uw-question-actions">
                  <ContinueButton secondary back onClick={replay}>Replay our story</ContinueButton>
                  <ContinueButton onClick={onClose}>Keep this memory</ContinueButton>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
