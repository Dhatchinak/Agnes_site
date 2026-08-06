import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { Cake, ChevronDown, Heart, Mic, Music2, Pause, Play, Sparkles, Volume2, VolumeX, X, ArrowRight, Crown, Rocket, LockKeyhole, Delete, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { memories, reasons, finalePhotos } from './data/memories';
import FinaleSequence from './components/FinaleSequence';

const BIRTHDAY = new Date('2026-08-05T00:00:00+05:30');
const BIRTH_DATE = new Date('2004-08-05T00:00:00+05:30');
const age = BIRTHDAY.getFullYear() - BIRTH_DATE.getFullYear();



const FINALE_NODES = [
  { x: 8, y: 28 }, { x: 16, y: 12 }, { x: 29, y: 6 }, { x: 42, y: 13 },
  { x: 50, y: 25 }, { x: 58, y: 13 }, { x: 71, y: 6 }, { x: 84, y: 12 },
  { x: 92, y: 28 }, { x: 85, y: 58 }, { x: 69, y: 82 }, { x: 50, y: 94 }
];

const FINALE_WISHES = [
  'May this new year protect the smile that makes my whole world feel lighter.',
  'May every quiet dream in your heart find the courage and chance to become real.',
  'May you always remember how precious you are, especially on the days you forget.',
  'May life bring you gentle mornings, honest laughter, and people who choose you sincerely.',
  'May your confidence grow stronger than every fear that has ever tried to hold you back.',
  'May your kindness return to you as peace, respect, and happiness in every season.',
  'May you keep becoming the beautiful, brave, and unforgettable person I already see in you.',
  'May no difficult day ever make you doubt the light you carry within yourself.',
  'May your heart stay soft, your boundaries stay strong, and your future stay bright.',
  'May every place you go recognise the grace, strength, and warmth that make you special.',
  'May this birthday begin a chapter filled with proud moments, answered prayers, and beautiful surprises.',
  'And through every tomorrow, may you always know that you are my favourite person, my princess, and deeply precious to me.'
];

const FINALE_DURATIONS = [8300, 8400, 8200, 8400, 8500, 8100, 8600, 8300, 8400, 8500, 8600, 11000];


function timeUntil(target) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60), complete: diff <= 0 };
}

function useOptionalSound(path, volume = .18) {
  const ref = useRef(null);
  useEffect(() => { ref.current = new Audio(path); ref.current.volume = volume; }, [path, volume]);
  return () => { try { ref.current.currentTime = 0; ref.current.play(); } catch { /* optional file */ } };
}


function LetterWrite({ text, className, start = 0, step = 0.085 }) {
  return <span className={className} aria-label={text}>{Array.from(text).map((ch, i) =>
    <motion.span key={`${ch}-${i}`} aria-hidden="true" initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: start + i * step, duration: .28, ease: [.16, 1, .3, 1] }}>{ch === ' ' ? '\u00A0' : ch}</motion.span>
  )}</span>;
}


function HandwrittenAgnes({ start = 4.15 }) {
  return <motion.svg className="signature-name-svg signature-name-connected" viewBox="0 0 560 180" role="img" aria-label="Agnes" initial="hidden" animate="show">
    <defs>
      <linearGradient id="agnesInk" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#963f61"/>
        <stop offset=".58" stopColor="#c3577d"/>
        <stop offset="1" stopColor="#c39a52"/>
      </linearGradient>
      <filter id="softInk" x="-30%" y="-30%" width="160%" height="180%">
        <feGaussianBlur in="SourceAlpha" stdDeviation=".35" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <motion.text x="280" y="126" textAnchor="middle" className="agnes-word-stroke"
      stroke="url(#agnesInk)" fill="url(#agnesInk)" filter="url(#softInk)"
      initial={{ strokeDashoffset: 1800, fillOpacity: 0, opacity: 0 }}
      animate={{ strokeDashoffset: 0, fillOpacity: [0,0,.96], opacity: 1 }}
      transition={{ strokeDashoffset: { delay: start, duration: 2.45, ease: [.55,0,.25,1] }, fillOpacity: { delay: start + 1.65, duration: .72 }, opacity: { delay: start, duration: .1 } }}
    >Agnes</motion.text>
    <motion.path className="agnes-flourish" d="M118 150 C205 174 355 173 452 146" fill="none" stroke="url(#agnesInk)" strokeWidth="2.3" strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: .92 }} transition={{ delay: start + 2.12, duration: .82, ease: [.16,1,.3,1] }}/>
  </motion.svg>;
}

function SmartImage({ src, alt, index = 0, className = '', eager = false }) {
  const candidates = useMemo(() => {
    const match = src.match(/^(.*)\.(jpg|jpeg|png|webp)$/i);
    if (!match) return [src];
    const base = match[1];
    return Array.from(new Set([src, `${base}.jpg`, `${base}.jpeg`, `${base}.png`, `${base}.webp`]));
  }, [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex(value => value + 1);
    } else {
      setFailed(true);
    }
  };

  return failed
    ? <div className={`photo-placeholder ${className}`}>
        <span>{String(index + 1).padStart(2, '0')}</span>
        <small>Add<br/>{src.split('/').pop()}</small>
      </div>
    : <img
        className={className}
        src={candidates[candidateIndex]}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={handleError}
      />;
}

function Fireflies() {
  const lights = useMemo(() => Array.from({ length: 38 }, (_, i) => ({ id: i, x: `${(i * 37) % 100}%`, y: `${(i * 61) % 100}%`, delay: `${(i % 12) * .55}s`, duration: `${7 + (i % 8)}s` })), []);
  return <div className="fireflies" aria-hidden="true">{lights.map(l => <i key={l.id} style={{ left: l.x, top: l.y, animationDelay: l.delay, animationDuration: l.duration }}/>)}</div>;
}

function CinematicLoader({ onDone }) {
  const [step, setStep] = useState(0);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const times = [900, 1800, 2850, 3900, 5050];
    const ids = times.map((time, index) => setTimeout(() => {
      if (index === times.length - 1) onDoneRef.current();
      else setStep(index + 1);
    }, time));

    return () => ids.forEach(clearTimeout);
  }, []);
  const lines = ['Loading memories…', 'Finding beautiful moments…', 'Collecting smiles…', 'Almost ready…'];
  return <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
    <div className="loader-stars"/>
    <motion.div className="loader-ghosts" animate={{ opacity: [.05,.18,.05] }} transition={{ duration: 4, repeat: Infinity }}>
      {[1,2,3].map((n,i)=><SmartImage key={n} src={`/photos/photo-0${n}.jpg`} alt="Memory preview" index={i}/>) }
    </motion.div>
    <div className="loader-copy"><span>For Agnes Roselin</span><h1>{lines[step]}</h1><div className="loader-track"><motion.b animate={{ width: `${25 + step * 25}%` }} transition={{ duration: .75 }}/></div><small>{String(25 + step * 25).padStart(3,'0')}%</small></div>
  </motion.div>;
}

function StoryIntro({ onComplete }) {
  const onCompleteRef = useRef(onComplete);
  const [ready, setReady] = useState(false);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => {
    const readyTimer = setTimeout(() => setReady(true), 8200);
    const doneTimer = setTimeout(() => onCompleteRef.current(), 10100);
    return () => { clearTimeout(readyTimer); clearTimeout(doneTimer); };
  }, []);

  return <motion.div
    className="love-splash love-splash-signature"
    exit={{ opacity: 0, scale: 1.025, filter: 'blur(12px)' }}
    transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}>
    <div className="signature-bg"/>
    <div className="signature-bloom bloom-a"/>
    <div className="signature-bloom bloom-b"/>
    <div className="signature-grain"/>
    <motion.div className="floral-curtain floral-curtain-left" initial={{y:'-105%',opacity:0}} animate={{y:0,opacity:1}} transition={{duration:2.1,delay:.05,ease:[.16,1,.3,1]}}>
      <span className="vine"/><i className="flower f1"/><i className="flower f2"/><i className="flower f3"/><i className="leaf l1"/><i className="leaf l2"/><i className="leaf l3"/>
    </motion.div>
    <motion.div className="floral-curtain floral-curtain-right" initial={{y:'-105%',opacity:0}} animate={{y:0,opacity:1}} transition={{duration:2.1,delay:.18,ease:[.16,1,.3,1]}}>
      <span className="vine"/><i className="flower f1"/><i className="flower f2"/><i className="flower f3"/><i className="leaf l1"/><i className="leaf l2"/><i className="leaf l3"/>
    </motion.div>

    <div className="signature-petals" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => <i key={i} style={{
        '--i': i,
        '--x': `${(i * 43 + 11) % 100}%`,
        '--delay': `${-(i % 11) * .74}s`,
        '--scale': `${.55 + (i % 6) * .13}`
      }}/>) }
    </div>

    <motion.main className="signature-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8 }}>
      <motion.p className="signature-kicker" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.15,duration:.8}}>
        A little wish, written only for you
      </motion.p>

      <div className="signature-heart-wrap">
        <div className="signature-halo"/>
        <svg className="signature-heart" viewBox="0 0 760 650" aria-hidden="true">
          <defs>
            <linearGradient id="signatureStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f3b8ce"/>
              <stop offset=".42" stopColor="#c8507a"/>
              <stop offset=".72" stopColor="#e297b4"/>
              <stop offset="1" stopColor="#d9ad61"/>
            </linearGradient>
            <radialGradient id="signatureFill" cx="50%" cy="40%" r="68%">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".98"/>
              <stop offset=".57" stopColor="#f9dce7" stopOpacity=".36"/>
              <stop offset="1" stopColor="#f0b7cd" stopOpacity=".08"/>
            </radialGradient>
            <filter id="signatureGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <motion.path className="signature-heart-fill"
            d="M380 590C316 530 96 403 96 218C96 105 176 48 258 48C318 48 359 84 380 133C401 84 442 48 502 48C584 48 664 105 664 218C664 403 444 530 380 590Z"
            fill="url(#signatureFill)" initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}}
            transition={{delay:2.65,duration:1.15,ease:[.16,1,.3,1]}}/>

          <motion.path className="signature-heart-shadow"
            d="M380 590C316 530 96 403 96 218C96 105 176 48 258 48C318 48 359 84 380 133C401 84 442 48 502 48C584 48 664 105 664 218C664 403 444 530 380 590Z"
            fill="none" stroke="rgba(182,69,109,.16)" strokeWidth="20" strokeLinecap="round"
            initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}}
            transition={{duration:2.75,delay:.55,ease:[.65,0,.35,1]}}/>

          <motion.path className="signature-heart-line"
            d="M380 590C316 530 96 403 96 218C96 105 176 48 258 48C318 48 359 84 380 133C401 84 442 48 502 48C584 48 664 105 664 218C664 403 444 530 380 590Z"
            fill="none" stroke="url(#signatureStroke)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
            filter="url(#signatureGlow)" initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}}
            transition={{duration:2.75,delay:.55,ease:[.65,0,.35,1]}}/>

          <motion.path className="signature-inner-line"
            d="M380 548C322 496 132 382 132 224C132 132 193 84 263 84C316 84 356 118 380 164C404 118 444 84 497 84C567 84 628 132 628 224C628 382 438 496 380 548Z"
            fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="1.8" strokeLinecap="round"
            initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:.85}}
            transition={{duration:1.35,delay:2.85,ease:[.16,1,.3,1]}}/>
        </svg>

        <div className="signature-copy">
          <LetterWrite className="signature-small" text="Happy Birthday" start={3.1} step={0.075}/>
          <HandwrittenAgnes start={4.18}/>
          <motion.span className="signature-date" initial={{opacity:0,y:7}} animate={{opacity:1,y:0}} transition={{delay:5.25,duration:.55}}>05 · 08 · 2026</motion.span>
          <motion.div className="signature-stroke" initial={{scaleX:0,opacity:0}} animate={{scaleX:1,opacity:1}} transition={{delay:5.15,duration:.75,ease:[.16,1,.3,1]}}/>
          <motion.b className="signature-mini-heart" initial={{scale:0,opacity:0}} animate={{scale:[0,1.22,.94,1],opacity:1}} transition={{delay:5.85,duration:.8}}>♥</motion.b>
        </div>

        <div className="signature-sparkles" aria-hidden="true">{Array.from({length:10},(_,i)=><i key={i} style={{'--n':i}}/>)}</div>
      </div>

      <motion.p className="signature-note" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:6.45,duration:.85}}>
        Every beautiful memory leads back to you.
      </motion.p>
      <motion.div className="signature-opening" initial={{opacity:0}} animate={{opacity:ready?1:0}} transition={{duration:.6}}>
        <span>opening our story</span><i/><i/><i/>
      </motion.div>
    </motion.main>
  </motion.div>;
}

function CursorGlow() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 220, damping: 28 }), sy = useSpring(y, { stiffness: 220, damping: 28 });
  useEffect(() => { const move = e => { x.set(e.clientX - 16); y.set(e.clientY - 16); }; window.addEventListener('pointermove', move); return () => window.removeEventListener('pointermove', move); }, [x,y]);
  return <><motion.div className="cursor-orb" style={{ x:sx, y:sy }}/><motion.div className="cursor-aura" style={{ x:useSpring(x,{stiffness:80,damping:24}), y:useSpring(y,{stiffness:80,damping:24}) }}/></>;
}

function MusicControl({ dimmed }) {
  const audio = useRef(null); const [playing,setPlaying]=useState(false); const [muted,setMuted]=useState(false);
  useEffect(()=>{ audio.current=new Audio('/audio/favourite-song.mp3'); audio.current.loop=true; audio.current.volume=.24; return()=>audio.current?.pause(); },[]);
  useEffect(()=>{ if(audio.current) audio.current.volume=dimmed ? .12 : .24; },[dimmed]);
  useEffect(()=>{
    const start=async()=>{ if(!audio.current||playing)return; try{ await audio.current.play(); setPlaying(true); }catch{} };
    window.addEventListener('start-her-song',start);
    return()=>window.removeEventListener('start-her-song',start);
  },[playing]);
  const toggle=async()=>{ if(!audio.current)return; if(playing) audio.current.pause(); else { try{await audio.current.play();}catch{return;} } setPlaying(!playing); };
  const mute=()=>{audio.current.muted=!muted;setMuted(!muted)};
  return <div className="music-control glass"><button onClick={toggle}>{playing?<Pause/>:<Play/>}</button><button onClick={mute}>{muted?<VolumeX/>:<Volume2/>}</button><span>{playing?'Soft piano playing':'Play her song'}</span></div>;
}

function TiltCard({ children, className='' }) {
  const rx=useMotionValue(0), ry=useMotionValue(0), gx=useMotionValue(50), gy=useMotionValue(50);
  const move=e=>{const r=e.currentTarget.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height; ry.set((px-.5)*8);rx.set((.5-py)*8);gx.set(px*100);gy.set(py*100)};
  return <motion.div className={`tilt-card glass ${className}`} onPointerMove={move} onPointerLeave={()=>{rx.set(0);ry.set(0)}} style={{rotateX:rx,rotateY:ry,'--gx':useTransform(gx,v=>`${v}%`),'--gy':useTransform(gy,v=>`${v}%`)}}>{children}</motion.div>;
}

function TypeCaption({ text }) { const [shown,setShown]=useState(''); useEffect(()=>{setShown('');let i=0;const id=setInterval(()=>{i++;setShown(text.slice(0,i));if(i>=text.length)clearInterval(id)},28);return()=>clearInterval(id)},[text]); return <p>{shown}<span className="caret">|</span></p>; }


function PasswordEntrance({ onUnlocked }) {
  const PASSWORD = '5824';
  const [digits, setDigits] = useState(['','','','']);
  const [status, setStatus] = useState('idle');
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const completedCode = digits.join('');
  const isComplete = digits.every(Boolean);

  const clearCode = () => {
    setDigits(['','','','']);
    requestAnimationFrame(() => inputRefs.current[0]?.focus());
  };

  const unlock = event => {
    event?.preventDefault?.();
    if (!isComplete || status !== 'idle') return;

    if (completedCode === PASSWORD) {
      setStatus('success');
      timerRef.current = window.setTimeout(() => onUnlocked(), 2550);
      return;
    }

    setStatus('error');
    timerRef.current = window.setTimeout(() => {
      clearCode();
      setStatus('idle');
    }, 760);
  };

  const updateDigit = (index, rawValue) => {
    if (status !== 'idle') return;
    const value = rawValue.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < 3) {
      requestAnimationFrame(() => inputRefs.current[index + 1]?.focus());
    }
  };

  const handleKeyDown = (event, index) => {
    if (status !== 'idle') return;

    if (event.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        requestAnimationFrame(() => inputRefs.current[index - 1]?.focus());
      }
      return;
    }

    if (event.key === 'ArrowLeft') inputRefs.current[Math.max(0, index - 1)]?.focus();
    if (event.key === 'ArrowRight') inputRefs.current[Math.min(3, index + 1)]?.focus();
    if (event.key === 'Enter') unlock(event);
  };

  const handlePaste = event => {
    event.preventDefault();
    if (status !== 'idle') return;
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4).split('');
    if (!pasted.length) return;
    const next = Array.from({length:4}, (_, index) => pasted[index] || '');
    setDigits(next);
    requestAnimationFrame(() => inputRefs.current[Math.min(pasted.length, 4) - 1]?.focus());
  };

  return <motion.section
    className={`password-entrance pe-v11 ${status}`}
    initial={{opacity:0}}
    animate={{opacity:1}}
    exit={{opacity:0,scale:1.045,filter:'blur(18px)'}}
    transition={{duration:.85,ease:[.16,1,.3,1]}}
  >
    <div className="pe-v11-wash pe-v11-wash-left" aria-hidden="true"/>
    <div className="pe-v11-wash pe-v11-wash-right" aria-hidden="true"/>
    <div className="pe-v11-flower pe-v11-flower-a" aria-hidden="true">✿</div>
    <div className="pe-v11-flower pe-v11-flower-b" aria-hidden="true">✿</div>
    <div className="pe-v11-sparkles" aria-hidden="true">
      {Array.from({length:28},(_,i)=><i key={i} style={{'--x':`${(i*41+7)%96}%`,'--y':`${(i*67+11)%92}%`,'--delay':`${(i%8)*.3}s`}}/>)}
    </div>

    <AnimatePresence mode="wait">
      {status !== 'success' ? (
        <motion.article
          key="password-card"
          className="pe-v11-card"
          initial={{opacity:0,y:30,scale:.96}}
          animate={{opacity:1,y:0,scale:1,x:status==='error'?[0,-12,10,-8,6,0]:0}}
          exit={{opacity:0,y:-24,scale:.92,filter:'blur(10px)'}}
          transition={{duration:.72,ease:[.16,1,.3,1]}}
        >
          <div className="pe-v11-card-line" aria-hidden="true"/>
          <motion.div
            className="pe-v11-seal"
            animate={{y:[0,-6,0],rotate:[-2,2,-2]}}
            transition={{duration:4.4,repeat:Infinity,ease:'easeInOut'}}
          >
            <Heart fill="currentColor"/>
            <Crown/>
          </motion.div>

          <div className="pe-v12-heading">
            <span className="pe-v11-kicker">PRIVATE ENTRANCE · FOR AGNES</span>
            <h1><span>One little code,</span><em>then the magic is yours.</em></h1>
            <div className="pe-v12-divider"><i/><Heart fill="currentColor"/><i/></div>
            <p>Four numbers stand between you and a birthday surprise created only for my princess.</p>
          </div>

          <form className="pe-v11-form" onSubmit={unlock}>
            <div className="pe-v11-digits" onPaste={handlePaste}>
              {digits.map((digit,index)=><input
                key={index}
                ref={node=>inputRefs.current[index]=node}
                value={digit}
                onChange={event=>updateDigit(index,event.target.value)}
                onKeyDown={event=>handleKeyDown(event,index)}
                onFocus={event=>event.currentTarget.select()}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                aria-label={`Password digit ${index+1}`}
                className={digit?'filled':''}
              />)}
            </div>

            <div className="pe-v11-status" aria-live="polite">
              <span>{status==='error'?'That is not our little code. Try once more.':'Enter the four-number key'}</span>
              <b>{digits.filter(Boolean).length}/4</b>
            </div>

            <motion.button
              type="submit"
              className="pe-v11-open"
              disabled={!isComplete || status!=='idle'}
              whileHover={isComplete?{y:-3,scale:1.015}:{}}
              whileTap={isComplete?{scale:.985}:{}}
            >
              <span>Open my little world</span>
              <Heart fill="currentColor"/>
            </motion.button>
          </form>

          <div className="pe-v11-hint"><i/> Hint: a date-shaped little secret chosen for this page. <i/></div>
          <div className="pe-v11-signature">for my princess ♡</div>
        </motion.article>
      ) : (
        <motion.div
          key="password-success"
          className="pe-v11-success"
          initial={{opacity:0,scale:.72,filter:'blur(12px)'}}
          animate={{opacity:1,scale:1,filter:'blur(0px)'}}
          transition={{duration:1.05,ease:[.16,1,.3,1]}}
        >
          <div className="pe-v11-success-petals" aria-hidden="true">
            {Array.from({length:20},(_,i)=><i key={i} style={{'--angle':`${i*18}deg`,'--distance':`${88+(i%5)*24}px`}}/>)}
          </div>
          <motion.div
            className="pe-v11-open-heart"
            initial={{scale:.2,rotate:-18}}
            animate={{scale:[.2,1.16,1],rotate:[-18,6,0]}}
            transition={{duration:1.15,ease:[.16,1,.3,1]}}
          >
            <Heart fill="currentColor"/>
            <Check/>
          </motion.div>
          <motion.span initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.45}}>THE LITTLE DOOR IS OPEN</motion.span>
          <motion.h2 initial={{opacity:0,y:18,filter:'blur(10px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{delay:.65,duration:.75}}>Welcome, my princess.</motion.h2>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.95}}>Your birthday world is opening softly…</motion.p>
          <motion.div className="pe-v11-loading" initial={{scaleX:0}} animate={{scaleX:1}} transition={{delay:.75,duration:1.5,ease:'easeInOut'}}/>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.section>;
}

function CinematicCountdown({ onComplete }) {
  const [step, setStep] = useState(0);
  const sequence = ['3','2','1'];
  const captions = ['Take a slow breath', 'Keep your wish close', 'The magic is ready'];
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStep(1), 1600),
      window.setTimeout(() => setStep(2), 3200),
      window.setTimeout(() => setStep(3), 4800),
      window.setTimeout(() => onCompleteRef.current?.(), 7300)
    ];
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, []);

  return <motion.section
    className="cinematic-countdown cc-v11"
    initial={{opacity:0}}
    animate={{opacity:1}}
    exit={{opacity:0,filter:'blur(18px)',scale:1.08}}
    transition={{duration:.9,ease:[.16,1,.3,1]}}
  >
    <div className="cc-night"/>
    <div className="cc-gold-aura"/>
    <div className="cc-grain"/>
    <div className="cc-stars" aria-hidden="true">
      {Array.from({length:38},(_,i)=><i key={i} style={{'--x':`${(i*47+9)%97}%`,'--y':`${(i*71+11)%93}%`,'--d':`${(i%9)*.21}s`}}/>)}
    </div>
    <div className="cc-v11-orbits" aria-hidden="true"><i/><i/><i/></div>

    <AnimatePresence mode="wait">
      {step < 3 ? (
        <motion.div
          key={sequence[step]}
          className="cc-number-wrap"
          initial={{opacity:0,scale:.28,filter:'blur(22px)',rotate:-4}}
          animate={{opacity:1,scale:1,filter:'blur(0px)',rotate:0}}
          exit={{opacity:0,scale:1.75,filter:'blur(16px)',rotate:4}}
          transition={{duration:.95,ease:[.16,1,.3,1]}}
        >
          <motion.span
            className="cc-number"
            animate={{textShadow:['0 0 18px rgba(233,190,103,.28)','0 0 62px rgba(240,198,108,.9)','0 0 18px rgba(233,190,103,.28)']}}
            transition={{duration:1.25}}
          >{sequence[step]}</motion.span>
          <motion.div className="cc-ring" initial={{scale:.18,opacity:0}} animate={{scale:1.35,opacity:[0,.85,0]}} transition={{duration:1.3}}/>
          <motion.small initial={{opacity:0,y:8}} animate={{opacity:.82,y:0}} transition={{delay:.38,duration:.55}}>{captions[step]}</motion.small>
        </motion.div>
      ) : (
        <motion.div
          key="open"
          className="cc-open-copy"
          initial={{opacity:0,y:24,filter:'blur(14px)',scale:.96}}
          animate={{opacity:1,y:0,filter:'blur(0px)',scale:1}}
          transition={{duration:.82,ease:[.16,1,.3,1]}}
        >
          <span>JUST FOR YOU</span>
          <h2>Open your eyes, Agnes.</h2>
          <i/>
          <p>Your birthday world begins now.</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.section>;
}


const THREE_DAY_SURPRISES = [
  {
    day: '05',
    month: 'AUGUST',
    target: new Date('2026-08-05T00:00:00+05:30'),
    title: 'The birthday world opened',
    note: 'Your first surprise is already here — made from memories, smiles, and a whole lot of heart.'
  },
  {
    day: '06',
    month: 'AUGUST',
    target: new Date('2026-08-06T00:00:00+05:30'),
    title: 'A little more is waiting',
    note: 'The next part stays wrapped until tomorrow. Let the countdown keep this little secret safe.'
  },
  {
    day: '07',
    month: 'AUGUST',
    target: new Date('2026-08-07T00:00:00+05:30'),
    title: 'The final surprise',
    note: 'One last moment is waiting at the end of this three-day celebration, only for my princess.'
  }
];

function milestoneCountdown(target, now) {
  const difference = Math.max(0, target.getTime() - now);
  return {
    complete: difference <= 0,
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
}

function DayTwoLetter({ onBack, onClose }) {
  const [letterOpen, setLetterOpen] = useState(false);

  return <motion.section
    className="day-two-world"
    initial={{ opacity: 0, y: 26, scale: .985 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 18, scale: .99 }}
    transition={{ duration: .72, ease: [.16, 1, .3, 1] }}
  >
    <div className="day-two-ambient" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => <motion.i
        key={index}
        style={{
          '--d2x': `${4 + (index * 31) % 92}%`,
          '--d2y': `${5 + (index * 47) % 86}%`,
          '--d2r': `${-34 + (index * 19) % 68}deg`
        }}
        animate={{ y: [0, -12 - (index % 4) * 5, 0], x: [0, (index % 2 ? 1 : -1) * (5 + index % 5), 0], opacity: [.08, .5, .08], rotate: [0, index % 2 ? 12 : -12, 0] }}
        transition={{ duration: 5.2 + (index % 5) * .48, repeat: Infinity, delay: index * .17, ease: 'easeInOut' }}
      />)}
    </div>

    <div className="day-two-toolbar">
      <button type="button" onClick={onBack} className="day-two-back"><span>←</span> Three little days</button>
      <button type="button" onClick={onClose} className="day-two-close" aria-label="Close the letter"><X/></button>
    </div>

    <div className={`day-two-layout ${letterOpen ? 'is-open' : ''}`}>
      <motion.div
        className="day-two-photo-column"
        initial={{ opacity: 0, x: -45, filter: 'blur(12px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ delay: .18, duration: .9, ease: [.16, 1, .3, 1] }}
      >
        <div className="day-two-photo-halo" aria-hidden="true"/>
        <motion.figure
          className="day-two-photo-frame"
          initial={{ opacity: 0, y: 34, rotate: -4.5, scale: .95 }}
          animate={{ opacity: 1, y: 0, rotate: -1.5, scale: 1 }}
          whileHover={{ y: -6, rotate: -.4, scale: 1.012 }}
          transition={{ duration: .9, delay: .3, ease: [.16, 1, .3, 1] }}
        >
          <div className="day-two-photo-window">
            <img src="/photos/day-two-agnes.jpg" alt="Agnes in a soft green dress"/>
            <div className="day-two-photo-light" aria-hidden="true"/>
          </div>
          <figcaption>
            <small>06 · AUGUST · DAY TWO</small>
            <strong>My Agnes</strong>
            <span>my princess · my angel · my precious person</span>
          </figcaption>
        </motion.figure>
        <motion.div className="day-two-photo-note" initial={{ opacity: 0, y: 18, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -3 }} transition={{ delay: .72, duration: .7 }}>
          <Heart fill="currentColor"/>
          <span>Your smile will always be one of the most precious things in my little world.</span>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!letterOpen ? <motion.div
          key="sealed"
          className="day-two-sealed-letter"
          initial={{ opacity: 0, x: 48, rotateY: -8 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          exit={{ opacity: 0, y: -16, scale: .97, filter: 'blur(7px)' }}
          transition={{ delay: .26, duration: .82, ease: [.16, 1, .3, 1] }}
        >
          <div className="day-two-letter-topline"><i/><Heart fill="currentColor"/><i/></div>
          <span className="day-two-kicker">A LETTER FOR MY AGNES</span>
          <h2>Yesterday celebrated your birthday.<br/><em>Today celebrates you.</em></h2>
          <p>I kept a few words here for the joyful, strong and precious girl who means more to me than she may ever realise.</p>
          <motion.button className="day-two-seal-button" type="button" onClick={() => setLetterOpen(true)} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: .98 }}>
            <span className="day-two-seal"><Heart fill="currentColor"/></span>
            <span><small>TO MY CHELLOM</small><strong>Open my letter</strong></span>
            <ArrowRight/>
          </motion.button>
          <small className="day-two-tap-note">Touch the rose seal and let the letter unfold.</small>
        </motion.div> : <motion.article
          key="opened"
          className="day-two-letter-paper"
          initial={{ opacity: 0, rotateX: -82, scaleY: .24, y: 72, filter: 'blur(12px)' }}
          animate={{ opacity: 1, rotateX: 0, scaleY: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: .98 }}
          transition={{ duration: 1, ease: [.16, 1, .3, 1] }}
          style={{ transformOrigin: '50% 0%' }}
        >
          <motion.div
            className="day-two-letter-bloom"
            aria-hidden="true"
            initial={{ opacity: 0, scale: .65 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: .38, duration: .8, ease: [.16, 1, .3, 1] }}
          >
            {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ '--bloom-i': index }}/>) }
          </motion.div>
          <motion.div
            className="day-two-unfold-flap"
            aria-hidden="true"
            initial={{ rotateX: -95, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ delay: .2, duration: .9, ease: [.16, 1, .3, 1] }}
          />
          <div className="day-two-paper-ribbon" aria-hidden="true"><i/><Heart fill="currentColor"/><i/></div>
          <div className="day-two-letter-scroll">
            <motion.span className="day-two-letter-date" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .48 }}>06 AUGUST · A LETTER ONLY FOR YOU</motion.span>
            <motion.h2 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .56, duration: .7 }}>My dearest Agnes,</motion.h2>

            {[
              'Agnes, I always want to see you happy, joyful, and smiling in every moment of your life. More than anything, I want your days to be filled with peace, laughter, and a heart that feels light.',
              'Your smile means so much to me. It is not just a smile to me — it is something precious, something I want to protect with all my heart. Whenever you smile, I feel happy too. Whenever you are peaceful, my heart feels peaceful. That is how important you are to me.',
              'So please, never let yourself stay in sadness for too long. You are a strong girl, Agnes — stronger than you know, more beautiful than you realise, and more precious than words can ever explain.',
              'As long as I am with you, I will always try to keep you smiling. I will stand by you, care for you, and do everything I can to protect your peace, your joy, and that beautiful smile of yours.',
              'I truly cannot explain how much you mean to me. Even if I try, words are never enough. The place you have in my heart is far bigger than you imagine. You are not just important to me — you are the most important person to me.'
            ].map((paragraph, index) => <motion.p key={paragraph} initial={{ opacity: 0, y: 13 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .68 + index * .12, duration: .62 }}>{paragraph}</motion.p>)}

            <motion.div className="day-two-names" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.35, duration: .7 }}>
              <span>You are my <strong>Chellom.</strong></span>
              <span>You are my <strong>Princess.</strong></span>
              <span>You are my <strong>Angel.</strong></span>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 13 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: .62 }}>And more than all these beautiful names, you are my heart’s most precious person. I want to protect your peace, your happiness, your softness, your dreams, and the smile that makes everything around me feel brighter.</motion.p>

            <motion.blockquote initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.65, duration: .72 }}>
              <Heart fill="currentColor"/>
              <span>I will always care for you.<br/>I will always protect your peace.<br/>I will always value your happiness.<br/>And I will always treasure your smile.</span>
            </motion.blockquote>

            <motion.p initial={{ opacity: 0, y: 13 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.82, duration: .62 }}>Because to me, your smile is not small. Your peace is not small. You are not small. You are someone deeply important to me — someone I could never take lightly.</motion.p>

            <motion.div className="day-two-final-words" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.98, duration: .72 }}>
              <small>ONE THING I ALWAYS WANT YOU TO REMEMBER</small>
              <strong>Stay happy, my Agnes. Stay strong, my beautiful girl. And whenever life feels heavy, remember that there is someone who truly wants to bring your smile back.</strong>
            </motion.div>

            <motion.div className="day-two-signature" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.18, duration: .8 }}>
              <span>You are very, very important to me — more than I can ever fully say.</span>
              <strong>with all my care ♡</strong>
            </motion.div>

            <motion.div className="day-two-complete" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.35, duration: .72 }}>
              <Check/>
              <span><small>DAY TWO COMPLETE</small><strong>One final little surprise waits on 07 August.</strong></span>
            </motion.div>
          </div>
        </motion.article>}
      </AnimatePresence>
    </div>
  </motion.section>;
}

function ThreeDaySurprise({ onClose }) {
  const [now, setNow] = useState(Date.now());
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return <motion.div
    className="three-day-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Three day birthday surprise"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: .45 }}
  >
    <AnimatePresence mode="wait">
      {activeDay === '06' ? <DayTwoLetter key="day-two" onBack={() => setActiveDay(null)} onClose={onClose}/> : <motion.div key="three-days" className="three-day-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: .5 }}>
        <div className="three-day-glow three-day-glow-left" aria-hidden="true"/>
        <div className="three-day-glow three-day-glow-right" aria-hidden="true"/>
        <div className="three-day-petals" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => <motion.i
            key={index}
            style={{
              '--td-x': `${4 + (index * 29) % 92}%`,
              '--td-y': `${3 + (index * 43) % 88}%`,
              '--td-r': `${-28 + (index * 17) % 56}deg`
            }}
            animate={{ y: [0, -11 - (index % 4) * 5, 0], x: [0, (index % 2 ? 1 : -1) * (4 + index % 6), 0], opacity: [.12, .6, .12] }}
            transition={{ duration: 4.8 + (index % 5) * .55, repeat: Infinity, delay: index * .16, ease: 'easeInOut' }}
          />)}
        </div>

        <button className="three-day-close" type="button" onClick={onClose} aria-label="Close three day surprise"><X/></button>

        <motion.section
          className="three-day-panel"
          initial={{ opacity: 0, y: 34, scale: .97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: .98 }}
          transition={{ delay: .08, duration: .72, ease: [.16, 1, .3, 1] }}
        >
          <motion.div className="three-day-seal" initial={{ scale: .5, rotate: -14 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: .3, type: 'spring', stiffness: 170, damping: 16 }}>
            <Sparkles/>
          </motion.div>
          <span className="three-day-kicker">THREE LITTLE DAYS · ONE BEAUTIFUL CELEBRATION</span>
          <h2>This surprise does not end<br/><em>in just one day.</em></h2>
          <p className="three-day-intro">Three dates are waiting for you. Each one opens a different little piece made only for my princess.</p>

          <div className="three-day-line" aria-hidden="true"><i/><Heart fill="currentColor"/><i/></div>

          <div className="three-day-cards">
            {THREE_DAY_SURPRISES.map((item, index) => {
              const status = milestoneCountdown(item.target, now);
              const isDayTwo = item.day === '06';
              return <motion.article
                key={item.day}
                className={`three-day-card ${status.complete ? 'is-complete' : 'is-locked'} ${isDayTwo && status.complete ? 'is-openable' : ''}`}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .42 + index * .16, duration: .65, ease: [.16, 1, .3, 1] }}
                onClick={isDayTwo && status.complete ? () => setActiveDay('06') : undefined}
                role={isDayTwo && status.complete ? 'button' : undefined}
                tabIndex={isDayTwo && status.complete ? 0 : undefined}
                onKeyDown={isDayTwo && status.complete ? event => { if (event.key === 'Enter' || event.key === ' ') setActiveDay('06'); } : undefined}
              >
                <div className="three-day-date">
                  <small>{item.month}</small>
                  <strong>{item.day}</strong>
                </div>
                <div className="three-day-status-icon">
                  {status.complete ? <Check/> : <LockKeyhole/>}
                </div>
                <span className="three-day-status-label">{status.complete ? (isDayTwo ? 'OPEN NOW' : 'COMPLETED') : 'COUNTDOWN'}</span>
                <h3>{isDayTwo && status.complete ? 'A letter for my Agnes' : item.title}</h3>
                <p>{isDayTwo && status.complete ? 'A few words about your smile, your happiness, your strength, and how precious you are to me.' : item.note}</p>

                {status.complete ? (
                  isDayTwo ? <button type="button" className="three-day-open-letter" onClick={event => { event.stopPropagation(); setActiveDay('06'); }}><Heart fill="currentColor"/><span>Open today’s letter</span><ArrowRight/></button> : <div className="three-day-complete-mark"><Check/><span>This day is complete</span></div>
                ) : (
                  <div className="three-day-timer" aria-label={`Countdown to ${item.day} August`}>
                    {[['DAYS', status.days], ['HRS', status.hours], ['MIN', status.minutes], ['SEC', status.seconds]].map(([label, value]) => <div key={label}>
                      <strong>{String(value).padStart(2, '0')}</strong>
                      <small>{label}</small>
                    </div>)}
                  </div>
                )}
              </motion.article>;
            })}
          </div>

          <motion.div className="three-day-footer-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05, duration: .7 }}>
            <Heart fill="currentColor"/>
            <span>Because one day was never enough to celebrate my princess.</span>
          </motion.div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  </motion.div>;
}

function App(){
  const [secretHeartOpen, setSecretHeartOpen] = useState(false);
  const [threeDayOpen, setThreeDayOpen] = useState(false);
  const [secretHeartKey, setSecretHeartKey] = useState('');
  const [secretHeartUnlocked, setSecretHeartUnlocked] = useState(false);
  const [secretHeartError, setSecretHeartError] = useState(false);

  const unlockSecretHeart = (event) => {
    event?.preventDefault?.();
    if (secretHeartKey.trim() === 'Myprincess') {
      setSecretHeartError(false);
      setSecretHeartUnlocked(true);
    } else {
      setSecretHeartError(true);
    }
  };

  const closeSecretHeart = () => {
    setSecretHeartOpen(false);
    setSecretHeartKey('');
    setSecretHeartUnlocked(false);
    setSecretHeartError(false);
  };

  const walkthroughRef = useRef(null)
  const [walkthroughProgress, setWalkthroughProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const updateWalkthrough = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const section = walkthroughRef.current
        if (!section) return

        const rect = section.getBoundingClientRect()
        const scrollDistance = Math.max(1, rect.height - window.innerHeight)
        const nextProgress = Math.min(1, Math.max(0, -rect.top / scrollDistance))

        setWalkthroughProgress(previous =>
          Math.abs(previous - nextProgress) > 0.0005 ? nextProgress : previous
        )
      })
    }

    updateWalkthrough()
    window.addEventListener('scroll', updateWalkthrough, { passive: true })
    window.addEventListener('resize', updateWalkthrough)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateWalkthrough)
      window.removeEventListener('resize', updateWalkthrough)
    }
  }, [])

  const [phase,setPhase]=useState('password'); const [countdown,setCountdown]=useState(timeUntil(BIRTHDAY)); const [selected,setSelected]=useState(null); const [letterOpen,setLetterOpen]=useState(false); const [letterLaunching,setLetterLaunching]=useState(false); const [reason,setReason]=useState(0); const [celebrated,setCelebrated]=useState(false); const [ending,setEnding]=useState(false); const [finaleStarted,setFinaleStarted]=useState(false); const [finaleIndex,setFinaleIndex]=useState(0); const [finaleComplete,setFinaleComplete]=useState(false); const [finalePaused,setFinalePaused]=useState(false); const [voice,setVoice]=useState(null);
  const finaleMemories = useMemo(() => ([
    ...memories.slice(0, 9),
    ...finalePhotos.slice(0, 9),
    memories[9],
    memories[11]
  ].filter(Boolean)), []);
  const activeFinaleNode=FINALE_NODES[finaleIndex%FINALE_NODES.length];
  const shutter=useOptionalSound('/audio/shutter.mp3'); const page=useOptionalSound('/audio/page-turn.mp3'); const chime=useOptionalSound('/audio/chime.mp3');
  const {scrollYProgress}=useScroll(); const progress=useSpring(scrollYProgress,{stiffness:90,damping:28});
  const mx=useMotionValue(0), my=useMotionValue(0); const bgx=useSpring(mx,{stiffness:35,damping:25}), bgy=useSpring(my,{stiffness:35,damping:25});
  const heroPhotoX=useTransform(bgx,v=>v*-.65);
  const heroPhotoY=useTransform(bgy,v=>v*-.45);
  useEffect(()=>{const id=setInterval(()=>setCountdown(timeUntil(BIRTHDAY)),1000); const move=e=>{mx.set((e.clientX/window.innerWidth-.5)*18);my.set((e.clientY/window.innerHeight-.5)*18)};window.addEventListener('pointermove',move);return()=>{clearInterval(id);window.removeEventListener('pointermove',move)}},[mx,my]);
  const openMemory=i=>{shutter();setSelected(i)};
  const openLetter=()=>{
    if(letterOpen||letterLaunching)return;
    page();
    setLetterLaunching(true);
    setTimeout(()=>{setLetterOpen(true);setLetterLaunching(false)},900);
  };
  const playVoice=i=>{ const a=new Audio(`/audio/voice-${String(i+1).padStart(2,'0')}.mp3`); a.volume=.85; a.onended=()=>setVoice(null); setVoice(i); a.play().catch(()=>setVoice(null)); };
  const celebrate=()=>{
    if(celebrated)return;
    setCelebrated(true);
    setFinaleStarted(true);
    setFinaleIndex(0);
    setFinaleComplete(false);
    setFinalePaused(true);
    chime();
    window.dispatchEvent(new Event('start-her-song'));
    confetti({particleCount:90,spread:75,origin:{y:.66},scalar:.8,colors:['#f3c66f','#f7dca2','#d76f93','#ffffff']});
    setTimeout(()=>confetti({particleCount:55,spread:120,startVelocity:24,origin:{y:.58},scalar:.7,colors:['#f4d48c','#c75d80','#fff2c5']}),380);
    setTimeout(()=>setEnding(true),1850);
  };
  const closeFinale=()=>{setEnding(false);setCelebrated(false);setFinaleStarted(false);setFinaleIndex(0);setFinaleComplete(false);setFinalePaused(false)};
  const replayFinale=()=>{setFinaleStarted(true);setFinaleIndex(0);setFinaleComplete(false);setFinalePaused(false)};


  useEffect(()=>{
    finaleMemories.forEach(memory=>{
      ['jpg','jpeg','png','webp'].forEach(extension=>{
        const image=new Image();
        image.src=memory.src.replace(/\.(jpg|jpeg|png|webp)$/i,`.${extension}`);
      });
    });
  },[finaleMemories]);


  useEffect(()=>{
    if(!ending)return;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previousOverflow};
  },[ending]);

  return <div className="site-shell">
    {phase==='site'&&<><CursorGlow/><motion.div className="scroll-progress" style={{scaleX:progress}}/><MusicControl dimmed={selected!==null}/></>}
    <AnimatePresence>{phase==='password'&&<PasswordEntrance onUnlocked={()=>setPhase('intro')}/>}</AnimatePresence>
    <AnimatePresence>{phase==='loading'&&<CinematicLoader onDone={()=>setPhase('intro')}/>}</AnimatePresence>
    <AnimatePresence>{phase==='intro'&&<StoryIntro onComplete={()=>setPhase('countdown')}/>}</AnimatePresence>
    <AnimatePresence>{phase==='countdown'&&<CinematicCountdown onComplete={()=>setPhase('site')}/>}</AnimatePresence>
    {phase==='site'&&<><Fireflies/><motion.div className="ambient-layer" style={{x:bgx,y:bgy}}/>
    <main>
      <section className="hero exact-reference-hero">
        <div className="exact-reference-image" role="img" aria-label="Happy Birthday Agnes Roselin"/>
        <div className="exact-reference-light"/>
        <div className="exact-reference-petals" aria-hidden="true">
          {Array.from({length:18},(_,i)=><i key={i} style={{
            '--x':`${(i*47+7)%100}%`,
            '--delay':`${-(i%9)*1.8}s`,
            '--dur':`${13+(i%6)*2.2}s`,
            '--size':`${10+(i%5)*6}px`,
            '--drift':`${-70+(i%7)*23}px`
          }}/>)}
        </div>
        <div className="exact-reference-sparkles" aria-hidden="true">
          {Array.from({length:24},(_,i)=><i key={i} style={{
            '--x':`${(i*37+11)%100}%`,
            '--y':`${(i*61+9)%100}%`,
            '--delay':`${(i%8)*.4}s`
          }}/>)}
        </div>

        <motion.a
          href="#memories"
          className="exact-reference-cta"
          initial={{opacity:0,y:18}}
          animate={{opacity:1,y:0}}
          transition={{delay:1.05,duration:.75}}
          whileHover={{y:-4,scale:1.03}}
          whileTap={{scale:.98}}
          aria-label="Begin our story"
        />

        <motion.div
          className="exact-reference-intro"
          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{duration:1.2}}
        />

        <motion.div className="exact-reference-scroll"
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8,duration:.8}}>
          scroll gently <ChevronDown/>
        </motion.div>
      </section>

      <section className="countdown section"><TiltCard className="countdown-card"><span className="eyebrow">A beautiful day is coming</span><h2>{countdown.complete?'Today belongs to you, Agnes':'Counting every heartbeat'}</h2><div className="countdown-grid">{Object.entries(countdown).filter(([k])=>k!=='complete').map(([k,v])=><div key={k}><strong>{String(v).padStart(2,'0')}</strong><span>{k}</span></div>)}</div><p>Born 05 August 2004 · Celebrating {age} beautiful years</p></TiltCard></section>

      <section className="section story-cards-section"><header className="section-heading"><span className="eyebrow">Our little universe</span><h2>Moments that became a story</h2></header><div className="story-cards">{['A quiet beginning','A thousand little moments','My favourite chapter'].map((t,i)=><motion.div key={t} initial={{opacity:0,y:80,filter:'blur(14px)'}} whileInView={{opacity:1,y:0,filter:'blur(0px)'}} viewport={{once:true,amount:.35}} transition={{duration:1,delay:i*.12}}><TiltCard><b>0{i+1}</b><h3>{t}</h3><p>{['Some beginnings arrive softly, then become impossible to forget.','Your smile, your words, your presence—ordinary things that became precious.','Of every page life has given me, you remain the one I return to.'][i]}</p></TiltCard></motion.div>)}</div></section>

      <section id="memories" className="floating-gallery section"><header className="section-heading"><span className="eyebrow">A gallery without walls</span><h2>Every version of you</h2><p>Move gently. The photographs are alive here.</p></header><div className="floating-canvas">{memories.map((m,i)=><motion.button key={m.src} className={`floating-photo fp-${i+1}`} onClick={()=>openMemory(i)} initial={{opacity:0,scale:.72,y:90}} whileInView={{opacity:1,scale:1,y:0}} viewport={{once:true,margin:'-80px'}} whileHover={{scale:1.07,zIndex:20,rotate:0}} transition={{duration:1,delay:(i%4)*.08}}><SmartImage src={m.src} alt={m.title} index={i}/><span>{m.title}</span>{i<4&&<button className="voice-dot" onClick={e=>{e.stopPropagation();playVoice(i)}} aria-label="Play voice memory"><Mic/>{voice===i&&<i/>}</button>}</motion.button>)}</div></section>

      <section className="timeline section moments-journey">
        <header className="section-heading">
          <span className="eyebrow">Five little pieces of my heart</span>
          <h2>The names my heart has for you</h2>
        </header>
        <div className="glowing-road moments-road no-support-copy">
          <motion.div className="road-light" initial={{scaleY:0}} whileInView={{scaleY:1}} viewport={{once:true}} transition={{duration:2.2,ease:[.16,1,.3,1]}}/>
          {[
            {title:'The moment you became unforgettable', note:'', src:'/photos/moment-01.jpg'},
            {title:'You are my Princess', note:'', src:'/photos/moment-02.jpg'},
            {title:'The day I wished I could keep forever', note:'', src:'/photos/moment-03.jpg'},
            {title:'You are my Favourite Person', note:'', src:'/photos/moment-04.jpg'},
            {title:'You are my Angel', note:'', src:'/photos/moment-05.jpg'}
          ].map((m,i)=><motion.article key={m.title} className={`road-stop moment-stop ${i%2?'right':'left'}`} initial={{opacity:0,y:55,filter:'blur(10px)'}} whileInView={{opacity:1,y:0,filter:'blur(0px)'}} viewport={{once:true,amount:.35}} transition={{duration:.9,delay:.12+i*.13,ease:[.16,1,.3,1]}}>
            <i/>
            <motion.div className="moment-photo" whileHover={{y:-6,rotate:i%2?1:-1,scale:1.025}} transition={{type:'spring',stiffness:180,damping:18}}>
              <SmartImage src={m.src} alt={m.title} index={i}/>
              <span>{String(i+1).padStart(2,'0')}</span>
            </motion.div>
            <div className="moment-copy"><small>CHAPTER {String(i+1).padStart(2,'0')}</small><strong>{m.title}</strong></div>
          </motion.article>)}
        </div>
      </section>

      <section
        className="tunnel-section princess-memory-tunnel"
        ref={walkthroughRef}
        style={{height:`${Math.max(980, Math.min(20, memories.length) * 92)}vh`}}
      >
        {(()=>{
          const tunnelMemories = memories.slice(0,20)
          const total = Math.max(1,tunnelMemories.length)

          const introHold = .11
          const introExit = .05
          const journeyStart = introHold + introExit
          const introFade = walkthroughProgress <= introHold
            ? 1
            : Math.max(0,1-(walkthroughProgress-introHold)/introExit)
          const stackDive = Math.max(0,Math.min(1,(walkthroughProgress-introHold)/introExit))

          const raw = Math.max(0,Math.min(1,(walkthroughProgress-journeyStart)/(1-journeyStart)))
          const eased = raw*raw*(3-2*raw)
          const exact = Math.min(total-.0001,eased*total)
          const active = Math.min(total-1,Math.floor(exact))
          const local = exact-active

          return <>
            <header
              className="section-heading pmt-title"
              style={{
                opacity:introFade,
                transform:`translate(-50%,${-stackDive*28}px) scale(${1+stackDive*.025})`
              }}
            >
              <span className="eyebrow">The memory tunnel</span>
              <h2>Walk through our little world</h2>
              <p>A little universe made from every beautiful moment of you.</p>
            </header>

            <div className="pmt-sticky">
              <div className="pmt-stage">
                <div className="pmt-stars" aria-hidden="true">
                  {Array.from({length:54},(_,i)=><i key={i} style={{
                    '--x':`${(i*47+7)%100}%`,
                    '--y':`${(i*71+11)%100}%`,
                    '--delay':`${(i%13)*.27}s`,
                    '--size':`${1+(i%3)}px`
                  }}/>)}
                </div>
                <div className="pmt-nebula n1"/><div className="pmt-nebula n2"/>

                <div
                  className="pmt-opening-stack"
                  style={{
                    opacity:introFade,
                    transform:`translate(-50%,-50%) scale(${1+stackDive*3.1})`,
                    filter:`blur(${stackDive*3}px)`
                  }}
                >
                  {tunnelMemories.slice(0,Math.min(10,total)).map((m,i)=>{
                    const r=[-9,6,-4,9,-6,4,-8,7,-3,5][i]||0
                    const x=[-56,-20,22,56,-37,7,42,-12,62,-61][i]||0
                    const y=[23,-10,6,24,42,45,-25,-34,-9,47][i]||0
                    return <div key={`opening-${m.src}`} className="pmt-opening-card" style={{
                      transform:`translate(-50%,-50%) translate(${x}px,${y}px) rotate(${r}deg)`,
                      zIndex:20+i
                    }}><SmartImage src={m.src} alt="" index={i}/></div>
                  })}
                  <span className="pmt-opening-heart">♥</span>
                </div>

                <div className="pmt-camera" style={{opacity:raw>0?1:0}}>
                  {tunnelMemories.map((m,i)=>{
                    const phase = exact-i
                    const clamp=v=>Math.max(0,Math.min(1,v))
                    const smooth=v=>{const t=clamp(v);return t*t*(3-2*t)}
                    const side=i%2?1:-1

                    let x=0,y=0,z=-1500,scale=.3,opacity=0,blur=10,rotateY=0,rotateZ=0,zIndex=1

                    if(phase>=-1 && phase<0){
                      const t=smooth(phase+1)
                      z=-1250+t*1050
                      scale=.38+t*.48
                      opacity=.06+t*.7
                      blur=(1-t)*9
                      x=side*(1-t)*120
                      y=(1-t)*35
                      rotateY=side*(1-t)*13
                      rotateZ=side*(1-t)*1.4
                      zIndex=3000+i
                    }

                    if(phase>=0 && phase<.68){
                      const arrive=smooth(Math.min(1,phase/.16))
                      const breathe=Math.sin((phase/.68)*Math.PI*2+i)*2
                      z=-180+arrive*180
                      scale=.88+arrive*.12
                      opacity=1
                      blur=(1-arrive)*2
                      x=(1-arrive)*side*30+breathe
                      y=(1-arrive)*18+Math.cos((phase/.68)*Math.PI*2+i)*1.5
                      rotateY=(1-arrive)*side*5
                      rotateZ=(1-arrive)*side*.45
                      zIndex=5200+i
                    }

                    if(phase>=.68 && phase<1){
                      const t=smooth((phase-.68)/.32)
                      z=t*950
                      scale=1+t*1.9
                      opacity=1-smooth(Math.max(0,(t-.18)/.82))
                      blur=t*4
                      x=side*t*70
                      y=-t*22
                      rotateY=side*t*6
                      rotateZ=side*t*.7
                      zIndex=7000+i
                    }

                    return <motion.button
                      key={m.src}
                      className={`pmt-photo ${i===active?'is-active':''}`}
                      onClick={()=>openMemory(i)}
                      style={{
                        transform:`translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                        opacity,
                        filter:`blur(${blur}px)`,
                        zIndex
                      }}
                      whileHover={{scale:i===active?1.018:1}}
                    >
                      <SmartImage src={m.src} alt={m.title} index={i}/>
                      <span className="pmt-frame"/>
                      <span className="pmt-caption">{String(i+1).padStart(2,'0')} · {m.title}</span>
                    </motion.button>
                  })}
                </div>

                <div className="pmt-current" style={{opacity:raw>0 ? .96 : 0}}>
                  <span>{String(active+1).padStart(2,'0')}</span>
                  <i/>
                  <strong>{tunnelMemories[active]?.title}</strong>
                </div>

                <motion.div className="pmt-ending" style={{
                  opacity:Math.max(0,Math.min(1,(eased-.955)/.04)),
                  transform:`translate(-50%,-50%) scale(${.88+Math.max(0,eased-.955)*2.3})`
                }}>
                  <span className="pmt-crown">♕</span>
                  <small>TO MY PRINCESS, MY ANGEL</small>
                  <h3>Happy Birthday to you</h3>
                  <strong>Kutty Chella Vaathu</strong>
                  <p>Of all the beautiful memories in this little world, my favourite will always be you.</p>
                  <Heart fill="currentColor"/>
                </motion.div>

                <div className="pmt-vignette"/>
                <div className="pmt-progress" style={{opacity:raw>0?1:0}}><i style={{transform:`scaleX(${eased})`}}/></div>
              </div>
            </div>
          </>
        })()}
      </section>

      <section className="reasons section princess-smile-section">
        <div className="ps-watercolour ps-watercolour-one" aria-hidden="true"/>
        <div className="ps-watercolour ps-watercolour-two" aria-hidden="true"/>
        <div className="ps-heart-doodle ps-heart-one" aria-hidden="true">♡</div>
        <div className="ps-heart-doodle ps-heart-two" aria-hidden="true">♡</div>

        <motion.div
          className="ps-photo-area"
          initial={{opacity:0,x:-55,rotate:-2}}
          whileInView={{opacity:1,x:0,rotate:0}}
          viewport={{once:true,amount:.3}}
          transition={{duration:1,ease:[.16,1,.3,1]}}
        >
          <div className="ps-paper-layer layer-back"/>
          <div className="ps-paper-layer layer-mid"/>

          <div className="ps-polaroid">
            <div className="ps-tape"><Heart fill="currentColor"/></div>
            <div className="ps-photo-window">
              <SmartImage
                src="/photos/childhood-smile.jpg"
                alt="Agnes smiling in childhood"
                index={11}
              />
            </div>
            <div className="ps-polaroid-caption">
              <span>little Agnes</span>
              <strong>the smile I wish I could have seen back then ♡</strong>
            </div>
          </div>

          <motion.div
            className="ps-smile-tag"
            animate={{y:[0,-6,0],rotate:[-5,-3,-5]}}
            transition={{duration:4.6,repeat:Infinity,ease:'easeInOut'}}
          >
            this smile <Heart fill="currentColor"/>
          </motion.div>

          <div className="ps-princess-seal">
            <Crown/>
            <span>my princess</span>
            <small>always & forever</small>
          </div>

          <div className="ps-hand-note">
            <p>This little smile had no idea it would become my favourite thing in the world.</p>
            <Heart fill="currentColor"/>
          </div>
        </motion.div>

        <motion.div
          className="ps-content"
          initial={{opacity:0,x:55}}
          whileInView={{opacity:1,x:0}}
          viewport={{once:true,amount:.3}}
          transition={{duration:1,ease:[.16,1,.3,1]}}
        >
          <div className="ps-kicker">
            <Crown/>
            <span>A LITTLE VERSION OF MY FAVOURITE PERSON</span>
            <small>{String((reason%6)+1).padStart(2,'0')} / 06</small>
          </div>

          <h2>
            My princess,
            <em>I adore your smile.</em>
          </h2>

          <div className="ps-divider"><i/><Heart fill="currentColor"/><i/></div>

          <div className="ps-quote-card">
            <span className="ps-quote-mark">“</span>
            <AnimatePresence mode="wait">
              <motion.p
                key={reason}
                initial={{opacity:0,y:18}}
                animate={{opacity:1,y:0}}
                exit={{opacity:0,y:-16}}
                transition={{duration:.5,ease:[.16,1,.3,1]}}
              >
                {[
                  'Your smile is my favourite view. Whenever you smile, my heart feels lighter and everything around me becomes more beautiful.',
                  'My princess, I could look at your smile a thousand times and still feel the same happiness every single time.',
                  'You are my favourite person, and your smile is one of the biggest reasons my ordinary days feel so special.',
                  'When you smile, I forget everything else for a moment. It is just you, your happiness, and my heart quietly choosing you as its favourite person.',
                  'Every version of you is precious to me, my princess. But the smiling you will always be my favourite, because when you smile, everything in my little world somehow feels exactly right.',
                  'Please never stop smiling, my princess. Your smile is precious to me, and seeing you happy is one of my favourite feelings.'
                ][reason%6]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="ps-promise">
            <Heart fill="currentColor"/>
            <div>
              <small>MY LITTLE PROMISE TO YOU</small>
              <strong>I will always protect that smile, celebrate your happiness, and remind you how precious you are to me.</strong>
            </div>
          </div>

          <div className="ps-actions">
            <button className="ps-next ripple" onClick={()=>setReason((reason+1)%6)}>
              <Heart fill="currentColor"/>
              <span>Tell me more about you</span>
              <ArrowRight/>
            </button>

            <div className="ps-dots">
              {Array.from({length:6},(_,i)=>
                <button
                  key={i}
                  className={i===reason%6?'active':''}
                  onClick={()=>setReason(i)}
                  aria-label={`Show message ${i+1}`}
                />
              )}
            </div>
          </div>

          <div className="ps-final-line">
            <i/>
            <span>You will always be my today and all of my tomorrows.</span>
            <i/>
          </div>
        </motion.div>
      </section>

      <section className={`letter-section section luminous-flight-section ${letterOpen?'is-open':''}`}>
        <header className="section-heading luminous-flight-heading">
          <span className="eyebrow">A wish written by hand</span>
          <h2>Something only for you</h2>
          <p>
            {letterOpen
              ? 'The little note has reached you — every word is yours.'
              : 'A little birthday note is waiting to fly to you.'}
          </p>
        </header>

        <div className="luminous-flight-stage">
          <div className="lf-ambient lf-ambient-left" aria-hidden="true"/>
          <div className="lf-ambient lf-ambient-right" aria-hidden="true"/>

          <div className="lf-petals" aria-hidden="true">
            {Array.from({length:14},(_,i)=>(
              <motion.i
                key={i}
                style={{
                  '--lf-petal-x':`${2+(i*19)%96}%`,
                  '--lf-petal-y':`${3+(i*29)%90}%`,
                  '--lf-petal-r':`${-28+(i*17)%56}deg`,
                  '--lf-petal-s':`${.65+(i%4)*.12}`
                }}
                animate={{
                  opacity:[.08,.52,.08],
                  y:[0,-10-(i%4)*5,0],
                  x:[0,(i%2?1:-1)*(5+i%5),0],
                  rotate:[0,(i%2?1:-1)*9,0]
                }}
                transition={{
                  duration:4.6+(i%5)*.55,
                  repeat:Infinity,
                  delay:i*.21,
                  ease:'easeInOut'
                }}
              />
            ))}
          </div>

          <div className="lf-glints" aria-hidden="true">
            {Array.from({length:12},(_,i)=>(
              <motion.span
                key={i}
                style={{
                  '--lf-glint-x':`${5+(i*31)%90}%`,
                  '--lf-glint-y':`${7+(i*37)%84}%`
                }}
                animate={{opacity:[0,.9,0],scale:[.45,1.25,.45],rotate:[0,45,90]}}
                transition={{duration:2.8+(i%4)*.45,repeat:Infinity,delay:i*.27,ease:'easeInOut'}}
              >✦</motion.span>
            ))}
          </div>

          <AnimatePresence mode="sync" initial={false}>
            {!letterOpen ? (
              <motion.div
                key="luminous-flight-closed"
                className="lf-closed-scene"
                initial={{opacity:0,y:34}}
                animate={{opacity:1,y:0}}
                exit={{opacity:0,scale:1.03}}
                transition={{duration:.78,ease:[.16,1,.3,1]}}
              >
                <svg className="lf-swoosh" viewBox="0 0 1400 650" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="lfRoseGold" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#efa0bc" stopOpacity=".18"/>
                      <stop offset="34%" stopColor="#da678b"/>
                      <stop offset="68%" stopColor="#e6aa55"/>
                      <stop offset="100%" stopColor="#f29ab7"/>
                    </linearGradient>
                    <linearGradient id="lfSoftLight" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0"/>
                      <stop offset="42%" stopColor="#fffdf8" stopOpacity=".96"/>
                      <stop offset="72%" stopColor="#ffdce8" stopOpacity=".78"/>
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                    </linearGradient>
                    <filter id="lfBlurWide" x="-20%" y="-80%" width="150%" height="260%">
                      <feGaussianBlur stdDeviation="22"/>
                    </filter>
                    <filter id="lfBlurSoft" x="-20%" y="-80%" width="150%" height="260%">
                      <feGaussianBlur stdDeviation="8"/>
                    </filter>
                    <filter id="lfPlaneGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="10" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>

                  <motion.path
                    d="M-20 475 C145 365 240 545 405 460 C485 419 465 280 355 292 C245 306 270 444 386 450 C650 464 790 430 1015 305 C1130 241 1238 196 1418 153"
                    fill="none"
                    stroke="#f3a8c1"
                    strokeWidth="66"
                    strokeLinecap="round"
                    opacity=".16"
                    filter="url(#lfBlurWide)"
                    initial={{pathLength:0}}
                    animate={{pathLength:1}}
                    transition={{duration:2.2,ease:[.16,1,.3,1]}}
                  />
                  <motion.path
                    d="M-20 475 C145 365 240 545 405 460 C485 419 465 280 355 292 C245 306 270 444 386 450 C650 464 790 430 1015 305 C1130 241 1238 196 1418 153"
                    fill="none"
                    stroke="url(#lfSoftLight)"
                    strokeWidth="23"
                    strokeLinecap="round"
                    opacity=".82"
                    filter="url(#lfBlurSoft)"
                    initial={{pathLength:0}}
                    animate={{pathLength:1}}
                    transition={{duration:2.05,delay:.08,ease:[.16,1,.3,1]}}
                  />
                  <motion.path
                    d="M-20 475 C145 365 240 545 405 460 C485 419 465 280 355 292 C245 306 270 444 386 450 C650 464 790 430 1015 305 C1130 241 1238 196 1418 153"
                    fill="none"
                    stroke="url(#lfRoseGold)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{pathLength:0,opacity:0}}
                    animate={{pathLength:1,opacity:.95}}
                    transition={{duration:1.8,delay:.18,ease:[.16,1,.3,1]}}
                  />
                  <motion.path
                    d="M356 292 C320 236 231 262 234 331 C238 402 356 450 356 450 C356 450 474 402 478 331 C481 262 392 236 356 292Z"
                    fill="none"
                    stroke="url(#lfRoseGold)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{pathLength:0,opacity:0}}
                    animate={{pathLength:1,opacity:.72}}
                    transition={{duration:1.25,delay:1.05,ease:'easeInOut'}}
                  />
                </svg>

                <div className="lf-mini-hearts" aria-hidden="true">
                  <motion.span animate={{y:[0,-8,0],rotate:[-8,-2,-8]}} transition={{duration:3.2,repeat:Infinity}}>♡</motion.span>
                  <motion.span animate={{y:[0,-11,0],rotate:[7,1,7]}} transition={{duration:3.8,repeat:Infinity,delay:.55}}>♡</motion.span>
                  <motion.span animate={{y:[0,-7,0],scale:[.8,1.08,.8]}} transition={{duration:3.4,repeat:Infinity,delay:1.1}}>♥</motion.span>
                </div>

                <motion.button
                  className={`lf-plane-button ${letterLaunching?'is-launching':''}`}
                  type="button"
                  onClick={openLetter}
                  initial={{x:-190,y:96,opacity:0,rotate:-18,scale:.72}}
                  animate={letterLaunching?{x:'36vw',y:-220,opacity:0,rotate:16,scale:.62,filter:'blur(4px)'}:{x:0,y:0,opacity:1,rotate:-5,scale:1,filter:'blur(0px)'}}
                  exit={{opacity:0,scale:1.03}}
                  transition={{duration:1.08,delay:.4,ease:[.16,1,.3,1]}}
                  whileHover={!letterLaunching?{y:-10,rotate:-3,scale:1.025}:{}}
                  whileTap={!letterLaunching?{scale:.985}:{}}
                  aria-label="Open the birthday note for Agnes"
                >
                  <motion.div
                    className="lf-plane-float"
                    animate={{y:[0,-8,0],rotate:[0,1.5,0]}}
                    transition={{duration:4.1,repeat:Infinity,ease:'easeInOut'}}
                  >
                    <svg className="lf-plane-svg" viewBox="0 0 430 310" aria-hidden="true">
                      <defs>
                        <linearGradient id="lfPlanePaper" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#fffefb"/>
                          <stop offset="58%" stopColor="#fff4f6"/>
                          <stop offset="100%" stopColor="#f2c7d4"/>
                        </linearGradient>
                        <linearGradient id="lfPlanePink" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f5b6c9"/>
                          <stop offset="100%" stopColor="#d96d91"/>
                        </linearGradient>
                        <linearGradient id="lfPlaneGold" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#d88d43"/>
                          <stop offset="50%" stopColor="#f0c470"/>
                          <stop offset="100%" stopColor="#cb7940"/>
                        </linearGradient>
                        <filter id="lfPlaneShadow" x="-30%" y="-30%" width="180%" height="190%">
                          <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#8f3c59" floodOpacity=".18"/>
                        </filter>
                      </defs>
                      <g filter="url(#lfPlaneShadow)">
                        <path d="M25 132 L397 25 L295 278 L205 183 Z" fill="url(#lfPlanePaper)" stroke="url(#lfPlaneGold)" strokeWidth="2.4"/>
                        <path d="M25 132 L205 183 L397 25" fill="none" stroke="#d7839f" strokeOpacity=".45" strokeWidth="2"/>
                        <path d="M205 183 L295 278 L248 168" fill="url(#lfPlanePink)" fillOpacity=".45"/>
                        <path d="M205 183 L248 168 L397 25" fill="#ffffff" fillOpacity=".5"/>
                        <path d="M25 132 L179 135 L397 25" fill="#f7d5df" fillOpacity=".28"/>
                      </g>
                    </svg>

                    <span className="lf-plane-name">For Agnes</span>
                    <span className="lf-plane-small-heart">♥</span>
                    <motion.span
                      className="lf-heart-gem"
                      animate={{scale:[1,1.08,1],boxShadow:['0 12px 34px rgba(193,61,105,.28)','0 19px 48px rgba(218,85,130,.45)','0 12px 34px rgba(193,61,105,.28)']}}
                      transition={{duration:2.35,repeat:Infinity,ease:'easeInOut'}}
                    >
                      <Heart fill="currentColor"/>
                    </motion.span>
                  </motion.div>
                </motion.button>

                <motion.div
                  className="lf-closed-copy"
                  initial={{opacity:0,y:18}}
                  animate={letterLaunching?{opacity:0,y:22,scale:.96}:{opacity:1,y:0,scale:1}}
                  transition={{duration:.8,delay:1.15,ease:[.16,1,.3,1]}}
                >
                  <small>A LITTLE NOTE FOR MY FAVOURITE PERSON</small>
                  <div className="lf-crown">♕</div>
                  <strong>My princess</strong>
                  <span><i/> Tap the heart and let it fly to you <i/></span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.article
                key="luminous-arrived-letter"
                className="lf-arrived-letter"
                initial={{opacity:0,y:84,scale:.76,rotateX:12,clipPath:'inset(44% 31% 44% 31% round 44px)'}}
                animate={{opacity:1,y:0,scale:1,rotateX:0,clipPath:'inset(0% 0% 0% 0% round 30px)'}}
                exit={{opacity:0,y:46,scale:.88}}
                transition={{duration:1.05,delay:.22,ease:[.16,1,.3,1]}}
              >
                <div className="lf-letter-grain" aria-hidden="true"/>
                <div className="lf-letter-glow-line" aria-hidden="true">
                  <svg viewBox="0 0 1000 230">
                    <motion.path
                      d="M-10 172 C155 44 282 225 452 151 C563 103 618 60 782 68 C856 72 919 48 1014 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="18"
                      strokeLinecap="round"
                      opacity=".09"
                      initial={{pathLength:0}}
                      animate={{pathLength:1}}
                      transition={{duration:1.6,delay:.35,ease:[.16,1,.3,1]}}
                    />
                    <motion.path
                      d="M-10 172 C155 44 282 225 452 151 C563 103 618 60 782 68 C856 72 919 48 1014 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{pathLength:0,opacity:0}}
                      animate={{pathLength:1,opacity:.4}}
                      transition={{duration:1.5,delay:.42,ease:[.16,1,.3,1]}}
                    />
                  </svg>
                </div>

                <motion.div
                  className="lf-delivered-badge"
                  initial={{opacity:0,scale:.72,rotate:8}}
                  animate={{opacity:1,scale:1,rotate:3}}
                  transition={{delay:.56,duration:.6,type:'spring'}}
                >
                  <Heart fill="currentColor"/>
                  <span>delivered to Agnes</span>
                </motion.div>

                <motion.span
                  className="lf-salutation"
                  initial={{opacity:0,x:-24}}
                  animate={{opacity:1,x:0}}
                  transition={{delay:.62,duration:.66}}
                >
                  My dearest Agnes,
                </motion.span>

                <motion.p initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:.8,duration:.64}}>
                  Happy Birthday to my favourite person, my princess, and the one whose smile can make even an ordinary day feel special. Your happiness matters to me more than I can fully explain, and seeing you smile will always be one of my favourite feelings.
                </motion.p>

                <motion.p initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:.96,duration:.64}}>
                  On your birthday, I hope you remember how precious you are. You deserve peaceful days, genuine laughter, brave new beginnings, and beautiful moments that stay with you for a lifetime.
                </motion.p>

                <motion.p initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:1.12,duration:.64}}>
                  Every version of you is special to me, but the person you are today is someone I admire deeply. No matter how many memories life gives us, you will always remain my favourite person and one of the most beautiful parts of my world.
                </motion.p>

                <motion.div className="lf-final-wish" initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} transition={{delay:1.3,duration:.62}}>
                  <b>Happy Birthday, my princess.</b>
                  <em>Always cheering for you, with all my heart ♥</em>
                </motion.div>

                <motion.i className="lf-signature-line" initial={{scaleX:0}} animate={{scaleX:1}} transition={{delay:1.46,duration:.78,ease:[.16,1,.3,1]}}/>

                <button className="lf-letter-close" type="button" onClick={()=>{page();setLetterOpen(false);setLetterLaunching(false)}}>
                  <span>♡</span>
                  Send this little note back
                </button>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className={`cake-section section cwv2-section ${celebrated?'is-blown':''}`}>
        <div className="cwv2-aurora cwv2-aurora-left" aria-hidden="true"/>
        <div className="cwv2-aurora cwv2-aurora-right" aria-hidden="true"/>
        <div className="cwv2-floral-line cwv2-floral-left" aria-hidden="true">❀</div>
        <div className="cwv2-floral-line cwv2-floral-right" aria-hidden="true">❀</div>

        <div className="cwv2-stars" aria-hidden="true">
          {Array.from({length:30},(_,i)=>
            <i key={i} style={{
              '--cwv2-x':`${(i*41+7)%96}%`,
              '--cwv2-y':`${(i*67+9)%92}%`,
              '--cwv2-delay':`${(i%10)*.26}s`
            }}/>
          )}
        </div>

        <motion.div
          className="cwv2-content"
          initial={{opacity:0,y:30}}
          whileInView={{opacity:1,y:0}}
          viewport={{once:true,amount:.3}}
          transition={{duration:.9,ease:[.16,1,.3,1]}}
        >
          <span className="eyebrow">One birthday wish</span>
          <h2>Close your eyes,<br/><em>Agnes.</em></h2>
          <p>Make a wish. Keep it close. Then let the light begin.</p>
          <div className="cwv2-heading-ornament"><i/><Sparkles/><i/></div>

          <div className="cwv2-ceremony">
            <motion.div
              className="cwv2-magic-floor"
              animate={{rotate:celebrated?24:0,scale:celebrated?1.08:1}}
              transition={{duration:1.5,ease:[.16,1,.3,1]}}
              aria-hidden="true"
            >
              <i/><i/><i/>
            </motion.div>

            <AnimatePresence>
              {celebrated&&
                <motion.div
                  className="cwv2-wish-rings"
                  initial={{opacity:0,scale:.25}}
                  animate={{opacity:[0,.85,0],scale:[.25,1.15,1.75]}}
                  transition={{duration:1.7,ease:'easeOut'}}
                  aria-hidden="true"
                >
                  <i/><i/><i/>
                </motion.div>
              }
            </AnimatePresence>

            <div className="cwv2-cake-wrap">
              <div className="cwv2-glass-dome" aria-hidden="true"/>
              <div className="cwv2-candle-wrap">
                <div className="cwv2-flame-aura" aria-hidden="true"/>
                <AnimatePresence>
                  {!celebrated&&
                    <motion.div
                      className="cwv2-flame"
                      initial={{opacity:0,scale:.35}}
                      animate={{
                        opacity:1,
                        scale:[1,.88,1.08,.96,1],
                        x:[0,1.3,-1.2,.7,0],
                        rotate:[0,2,-3,1,0]
                      }}
                      exit={{opacity:0,scale:.1,y:-18}}
                      transition={{
                        opacity:{duration:.25},
                        scale:{duration:1.15,repeat:Infinity},
                        x:{duration:1.15,repeat:Infinity},
                        rotate:{duration:1.15,repeat:Infinity}
                      }}
                    >
                      <span/>
                    </motion.div>
                  }
                </AnimatePresence>

                <AnimatePresence>
                  {celebrated&&
                    <motion.div
                      className="cwv2-smoke"
                      initial={{opacity:0,y:4,scale:.45}}
                      animate={{opacity:[0,.72,.5,0],y:-130,x:[0,9,-8,5],scale:[.45,1,1.5,1.9]}}
                      transition={{duration:1.75,ease:'easeOut'}}
                    >
                      <i/><i/><i/>
                    </motion.div>
                  }
                </AnimatePresence>

                <div className="cwv2-candle"><span/></div>
              </div>

              <div className="cwv2-top"><span/><i/><i/><i/></div>
              <div className="cwv2-body">
                <div className="cwv2-emblem"><Heart fill="currentColor"/></div>
                <strong>Agnes</strong>
                <small>05 · 08 · 2026</small>
              </div>
              <div className="cwv2-pedestal"><i/></div>
            </div>

            <AnimatePresence>
              {celebrated&&
                <motion.div
                  className="cwv2-transition-copy"
                  initial={{opacity:0,y:18,scale:.95}}
                  animate={{opacity:1,y:0,scale:1}}
                  exit={{opacity:0}}
                  transition={{delay:.35,duration:.65}}
                >
                  <Heart fill="currentColor"/>
                  <span>Your wish has been heard. Let every beautiful memory bloom…</span>
                </motion.div>
              }
            </AnimatePresence>
          </div>

          <motion.button
            className="cwv2-blow-button ripple"
            onClick={celebrate}
            disabled={celebrated}
            whileHover={!celebrated?{y:-4,scale:1.025}:{}}
            whileTap={!celebrated?{scale:.98}:{}}
          >
            <span className="cwv2-wind-mark">≋</span>
            {celebrated?'Your wish is blooming…':'Blow the candle'}
            <Cake/>
          </motion.button>
          <small className="cwv2-whisper">
            {celebrated?'A little rose-gold light is opening the final surprise.':'Close your eyes, make your wish, and tap gently.'}
          </small>
        </motion.div>

        <AnimatePresence>
          {celebrated&&
            <motion.div
              className="cwv2-dark-portal"
              initial={{opacity:0,scale:.2}}
              animate={{opacity:[0,.25,.9],scale:[.2,1.1,2.4]}}
              transition={{duration:1.8,ease:[.16,1,.3,1]}}
              aria-hidden="true"
            />
          }
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {ending && <FinaleSequence
          finaleComplete={finaleComplete}
          setFinaleComplete={setFinaleComplete}
          finaleStarted={finaleStarted}
          setFinaleStarted={setFinaleStarted}
          finalePaused={finalePaused}
          setFinalePaused={setFinalePaused}
          finaleIndex={finaleIndex}
          setFinaleIndex={setFinaleIndex}
          finaleMemories={finaleMemories}
          replayFinale={replayFinale}
          closeFinale={closeFinale}
        />}
      </AnimatePresence>
    </main>
      <footer className="rose-ending-footer">
        <span>Agnes Roselin</span>
        <p>Every little detail here was made for one reason — to make your birthday feel as special as you are to me.</p>
        <button className="secret-heart-trigger" type="button" onClick={()=>setSecretHeartOpen(true)}>
          <span className="secret-heart-icon"><Heart fill="currentColor"/></span>
          <span className="secret-heart-trigger-copy">
            <small>ONE LAST LITTLE THING</small>
            <strong>Secret Heart</strong>
            <em>Only for my princess</em>
          </span>
          <ArrowRight className="secret-heart-arrow"/>
        </button>
        <button className="three-day-trigger" type="button" onClick={()=>setThreeDayOpen(true)}>
          <span className="three-day-trigger-icon"><Sparkles/></span>
          <span className="three-day-trigger-copy">
            <small>THE SURPRISE CONTINUES</small>
            <strong>Three Little Days</strong>
            <em>5 · 6 · 7 August</em>
          </span>
          <ArrowRight className="three-day-trigger-arrow"/>
        </button>
        <small className="rose-ending-date">05 · 08 · 2026</small>
      </footer>

      <AnimatePresence>
        {threeDayOpen && <ThreeDaySurprise onClose={()=>setThreeDayOpen(false)}/>}
      </AnimatePresence>

      <AnimatePresence>
        {secretHeartOpen && (
          <motion.div className="secret-heart-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.55}}>
            <button className="secret-heart-close" type="button" onClick={closeSecretHeart} aria-label="Close secret heart"><X/></button>

            {!secretHeartUnlocked ? (
              <motion.div className="secret-lock-card" initial={{opacity:0,y:30,scale:.96}} animate={{opacity:1,y:0,scale:1}} transition={{delay:.15,duration:.75,ease:[.16,1,.3,1]}}>
                <motion.div className="secret-lock-heart" animate={{scale:[1,1.06,1]}} transition={{duration:2.2,repeat:Infinity}}>
                  <Heart fill="currentColor"/>
                </motion.div>
                <span className="secret-kicker">A PRIVATE LITTLE CORNER OF MY HEART</span>
                <h2>There is one last thing<br/><em>only you should open.</em></h2>
                <p>I kept this behind one small key, because some words are meant only for my princess.</p>
                <form onSubmit={unlockSecretHeart} className="secret-key-form">
                  <label htmlFor="secret-heart-key">Enter our secret key</label>
                  <div className={`secret-key-box ${secretHeartError?'is-error':''}`}>
                    <input id="secret-heart-key" type="password" value={secretHeartKey} onChange={e=>{setSecretHeartKey(e.target.value);setSecretHeartError(false)}} placeholder="Type the key…" autoComplete="off"/>
                    <button type="submit">Open <Heart fill="currentColor"/></button>
                  </div>
                  <AnimatePresence>
                    {secretHeartError && <motion.small className="secret-key-error" initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}}>That key did not open my heart. Try the one I chose just for you.</motion.small>}
                  </AnimatePresence>
                </form>
                <span className="secret-key-hint">Hint: the way I see you, written as one word.</span>
              </motion.div>
            ) : (
              <motion.div className="secret-open-world" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.1}}>
                <div className="secret-stars" aria-hidden="true">{Array.from({length:36},(_,i)=><i key={i} style={{'--sx':`${(i*37)%97}%`,'--sy':`${(i*61)%91}%`,'--sd':`${(i%9)*.22}s`}}/>)}</div>
                <motion.div className="secret-open-heart" initial={{scale:.2,opacity:0}} animate={{scale:[.2,1.12,1],opacity:1}} transition={{duration:1.5,ease:[.16,1,.3,1]}}>
                  <Heart fill="currentColor"/>
                </motion.div>
                <motion.span className="secret-open-kicker" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:1}}>MY SECRET HEART · FOR AGNES</motion.span>
                <motion.h2 initial={{opacity:0,y:22,filter:'blur(10px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{delay:1.45,duration:1.1}}>
                  You were never just<br/><em>a part of my little world.</em>
                </motion.h2>
                <motion.p className="secret-open-line" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.8,duration:1.2}}>
                  Somewhere between all these memories, your smile, your little moments, and every ordinary day…
                </motion.p>
                <motion.strong className="secret-open-main" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:4,duration:1.2}}>
                  you quietly became the person my heart chooses again and again.
                </motion.strong>
                <motion.div className="secret-open-divider" initial={{scaleX:0}} animate={{scaleX:1}} transition={{delay:5.1,duration:1.2}}><span>♥</span></motion.div>
                <motion.p className="secret-open-final" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:5.8,duration:1.2}}>
                  My princess. My favourite person. My sweetest wish for every tomorrow.<br/>
                  <em>If I could keep only one thing from this entire birthday page, I would keep your smile after reading it.</em>
                </motion.p>
                <motion.span className="secret-signature" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:7.2,duration:1.1}}>— always, from my heart ♡</motion.span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>}

    <AnimatePresence>{selected!==null&&<motion.div className="lightbox" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelected(null)}><motion.div className="lightbox-card glass" layoutId={`photo-${selected}`} initial={{scale:.55,y:100,filter:'blur(18px)'}} animate={{scale:1,y:0,filter:'blur(0px)'}} exit={{scale:.7,opacity:0}} transition={{duration:.7,ease:[.16,1,.3,1]}} onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}><X/></button><SmartImage src={memories[selected].src} alt={memories[selected].title} index={selected}/><div><span className="eyebrow">Memory {String(selected+1).padStart(2,'0')}</span><h3>{memories[selected].title}</h3><TypeCaption text={memories[selected].note}/>{selected<4&&<button className="voice-button" onClick={()=>playVoice(selected)}><Mic/> Hear this memory</button>}</div></motion.div></motion.div>}</AnimatePresence>
  </div>;
}
export default App;
