import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Heart, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import '../secret-heart-journey.css';

const INTRO_LINES = [
  'Agnes…',
  'I like you so, so much.',
  'You are my princess.',
  'You are my angel.',
  'You are my little cute one.',
  'You are my girl.',
  'You are my comfort.',
  'You are my peace.',
  'You are my happiness.',
  'You are my home.',
  'My dream…',
  'My desire…',
  'My heart’s deepest wish…',
  '…is you.',
  'I dream of a life with you.',
  'I dream of walking beside you through everything.',
  'I dream of laughing with you…',
  'Growing with you…',
  'Living with you…',
  'And building a beautiful little world together.',
  'I even dream of our little cute baby…',
  'A tiny piece of you and me…',
  'A life filled with love, warmth, and togetherness.',
  'I dream of waking up next to you…',
  'Holding your hand…',
  'Staying with you in every joy and every pain.',
  'I want to live with you, grow old with you, and love you with all my heart.',
  'And when my last breath comes…',
  'I want your hand to be holding mine.',
  'That is my dream.',
  'Sorry, Agnes…',
  'This is only my dream…',
  'A beautiful dream that lives quietly in my heart.',
  'And now… I want to ask you something.'
];

const YES_LINES = [
  'Thank you…',
  'You have just made my heart the happiest it has ever been.',
  'I promise…',
  'I will never give up on you.',
  'I will protect your heart.',
  'I will stand by your side.',
  'I will respect you.',
  'I will care for you.',
  'I will always try to make you smile.',
  'I will always try to make you happy.',
  'I will love you with honesty, loyalty, and all my heart.',
  'Through every smile…',
  'Through every tear…',
  'Through every hard day…',
  'Through every beautiful day…',
  'I will stay.',
  'I may not be perfect…',
  'But my love for you will always be true.',
  'You are my dream.',
  'You are my wish.',
  'You are my favorite part of life.',
  'And from this moment…',
  'I promise to love you for the rest of my life.'
];

const STORAGE_KEY = 'agnes_secret_heart_response_v3';
const AUDIO_SRC = '/audio/secret-heart-piano.mp3';
const PORTRAIT_CANDIDATES = ['/photos/day-two-agnes.jpg', '/photos/hero.jpg', '/photos/special.jpg'];

function getDuration(text) {
  return Math.max(2100, Math.min(4600, 1800 + text.length * 33));
}

function useAudio(enabled) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.28;
    audioRef.current = audio;

    const attempt = () => {
      audio.play().catch(() => {});
    };

    attempt();

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, [enabled]);

  return audioRef;
}

function usePortraitFallback() {
  const [index, setIndex] = useState(0);
  return {
    src: PORTRAIT_CANDIDATES[index],
    onError: () => setIndex(value => Math.min(value + 1, PORTRAIT_CANDIDATES.length - 1))
  };
}

function SceneLine({ text, label }) {
  return (
    <motion.div
      className="shf-line-shell"
      initial={{ opacity: 0, y: 28, filter: 'blur(18px)', scale: 0.985 }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
      exit={{ opacity: 0, y: -24, filter: 'blur(14px)', scale: 1.015 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="shf-line-label">{label}</span>
      <div className="shf-center-heart" aria-hidden="true">
        <Heart fill="currentColor" />
      </div>
      <h2>{text}</h2>
    </motion.div>
  );
}

export default function SecretHeartJourney({ onClose }) {
  const [mode, setMode] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return saved?.answer === 'yes' ? 'keepsake' : 'intro';
    } catch {
      return 'intro';
    }
  });
  const [introIndex, setIntroIndex] = useState(0);
  const [yesIndex, setYesIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [savedMoment, setSavedMoment] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  });

  const portrait = usePortraitFallback();
  const audioRef = useAudio(true);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
  }, [muted, audioRef]);

  useEffect(() => {
    if (mode !== 'intro') return undefined;
    if (introIndex >= INTRO_LINES.length) {
      setMode('question');
      return undefined;
    }
    const timer = window.setTimeout(() => setIntroIndex(value => value + 1), getDuration(INTRO_LINES[introIndex]));
    return () => window.clearTimeout(timer);
  }, [mode, introIndex]);

  useEffect(() => {
    if (mode !== 'yes') return undefined;
    if (yesIndex >= YES_LINES.length) {
      const saved = {
        answer: 'yes',
        acceptedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setSavedMoment(saved);
      setMode('keepsake');
      return undefined;
    }
    const timer = window.setTimeout(() => setYesIndex(value => value + 1), getDuration(YES_LINES[yesIndex]));
    return () => window.clearTimeout(timer);
  }, [mode, yesIndex]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
      if ((event.key === 'ArrowRight' || event.key === ' ') && (mode === 'intro' || mode === 'yes')) {
        event.preventDefault();
        if (mode === 'intro') {
          setIntroIndex(value => Math.min(value + 1, INTRO_LINES.length));
        } else {
          setYesIndex(value => Math.min(value + 1, YES_LINES.length));
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, onClose]);

  const handleAdvance = () => {
    if (mode === 'intro') {
      setIntroIndex(value => Math.min(value + 1, INTRO_LINES.length));
    }
    if (mode === 'yes') {
      setYesIndex(value => Math.min(value + 1, YES_LINES.length));
    }
  };

  const restartJourney = () => {
    setIntroIndex(0);
    setYesIndex(0);
    setMode('intro');
  };

  const resetToQuestion = () => {
    setYesIndex(0);
    setMode('question');
  };

  const chooseYes = () => {
    setYesIndex(0);
    setMode('yes');
  };

  const chooseNo = () => {
    setMode('no');
  };

  const acceptedDate = useMemo(() => {
    if (!savedMoment?.acceptedAt) return null;
    return new Date(savedMoment.acceptedAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [savedMoment]);

  return (
    <motion.div
      className={`shf-shell ${mode === 'yes' || mode === 'keepsake' ? 'is-warm' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9 }}
    >
      <div className="shf-stars" aria-hidden="true">
        {Array.from({ length: 44 }, (_, index) => (
          <i
            key={index}
            style={{
              '--x': `${(index * 23) % 100}%`,
              '--y': `${(index * 41) % 100}%`,
              '--delay': `${(index % 8) * 0.6}s`,
              '--duration': `${5 + (index % 7)}s`
            }}
          />
        ))}
      </div>
      <div className="shf-vignette" aria-hidden="true" />
      <div className="shf-glow shf-glow-one" aria-hidden="true" />
      <div className="shf-glow shf-glow-two" aria-hidden="true" />

      <div className="shf-topbar">
        <button type="button" className="shf-icon-button" onClick={() => setMuted(value => !value)}>
          {muted ? <VolumeX /> : <Volume2 />}
          <span>{muted ? 'Unmute' : 'Music'}</span>
        </button>
        <div className="shf-brand">
          <Heart fill="currentColor" />
          <span>Secret Heart</span>
        </div>
        <button type="button" className="shf-icon-button" onClick={onClose}>
          <span>Close</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'intro' && introIndex < INTRO_LINES.length && (
          <motion.div
            key={`intro-${introIndex}`}
            role="button"
            tabIndex={0}
            className="shf-stage"
            onClick={handleAdvance}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SceneLine text={INTRO_LINES[introIndex]} label={`Screen ${String(introIndex + 1).padStart(2, '0')}`} />
            <div className="shf-progress">
              <b style={{ width: `${((introIndex + 1) / INTRO_LINES.length) * 100}%` }} />
            </div>
            <span className="shf-hint">Tap, press Space, or → to continue</span>
          </motion.div>
        )}

        {mode === 'question' && (
          <motion.section
            key="question"
            className="shf-question"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="shf-question-photo-wrap">
              <div className="shf-question-heart" aria-hidden="true"><Sparkles /></div>
              <div className="shf-question-photo-frame">
                <img src={portrait.src} onError={portrait.onError} alt="Agnes" />
              </div>
            </div>
            <div className="shf-question-copy">
              <span className="shf-line-label">Final Question</span>
              <h2>Would you like to be the beautiful future I dream of?</h2>
              <p>Would you accept this dream of mine — a life of love, warmth, togetherness, and a little world built with you?</p>
              <div className="shf-question-actions">
                <button type="button" className="shf-primary" onClick={chooseYes}>Yes ❤️</button>
                <button type="button" className="shf-secondary" onClick={chooseNo}>No 🤍</button>
              </div>
            </div>
          </motion.section>
        )}

        {mode === 'no' && (
          <motion.section
            key="no"
            className="shf-message-card"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="shf-line-label">From My Heart</span>
            <h2>It’s okay, Agnes.</h2>
            <p>I will always respect your feelings.</p>
            <p>My dream is mine, and your happiness matters more to me than anything.</p>
            <p>Thank you for listening to my heart.</p>
            <p>No matter what, you will always be special to me.</p>
            <div className="shf-message-actions">
              <button type="button" className="shf-primary" onClick={restartJourney}>Return to Memories</button>
              <button type="button" className="shf-secondary" onClick={resetToQuestion}>Back to the Question</button>
            </div>
          </motion.section>
        )}

        {mode === 'yes' && yesIndex < YES_LINES.length && (
          <motion.div
            key={`yes-${yesIndex}`}
            role="button"
            tabIndex={0}
            className="shf-stage is-yes"
            onClick={handleAdvance}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SceneLine text={YES_LINES[yesIndex]} label={`Promise ${String(yesIndex + 1).padStart(2, '0')}`} />
            <div className="shf-progress is-warm">
              <b style={{ width: `${((yesIndex + 1) / YES_LINES.length) * 100}%` }} />
            </div>
            <span className="shf-hint">Stay with this moment… or tap to continue</span>
          </motion.div>
        )}

        {mode === 'keepsake' && (
          <motion.section
            key="keepsake"
            className="shf-keepsake"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="shf-keepsake-photo">
              <img src={portrait.src} onError={portrait.onError} alt="Agnes" />
            </div>
            <div className="shf-keepsake-copy">
              <span className="shf-line-label">A Promise From This Moment</span>
              <h2>I promise to love you for the rest of my life.</h2>
              <p>You, me, our little world… forever. ❤️</p>
              <strong>Agnes ♡ Dhatchina</strong>
              {acceptedDate && <small>Accepted on {acceptedDate}</small>}
              <div className="shf-message-actions">
                <button type="button" className="shf-primary" onClick={restartJourney}><RotateCcw /> Replay the Journey</button>
                <button type="button" className="shf-secondary" onClick={onClose}><ArrowRight /> Keep This Memory</button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
