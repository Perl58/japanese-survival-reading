import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Illustrated avatar (v2) — replaces the old 3D "sv-presenter" engine with
// the daughter's layered artwork (base + swappable eyes/mouth/arm PNGs, see
// public/avatars/teacher/). speak() now tries real VOICEVOX audio first
// (POST /api/tts, see samples/express/server.mjs — requires VOICEVOX running
// locally) and falls back to the old estimated-duration mouth-flap timer if
// that fails for any reason (engine not running, network hiccup, autoplay
// blocked). Callers (QuestionCard, HomeScreen, StageComplete) don't need to
// know which mode is active — speak()'s signature/behavior is the same
// either way.

export type EyeState = "open" | "happy" | "closed";
export type MouthState = "closed" | "mid" | "open";
export type ArmState = "ver1" | "ver2";

export interface AvatarPose {
  eyes: EyeState;
  mouth: MouthState;
  arm: ArmState;
}

const IDLE_POSE: AvatarPose = { eyes: "open", mouth: "closed", arm: "ver1" };
const CELEBRATE_POSE: AvatarPose = { eyes: "happy", mouth: "open", arm: "ver2" };

interface PresentOptions {
  emotion?: "joy" | "neutral";
  intensity?: "low" | "high";
}

interface PresenterContextValue {
  ready: boolean;
  talking: boolean;
  caption: string;
  error: string | null;
  /** Which eyes/mouth/arm frame to render — read by AvatarStage. */
  pose: AvatarPose;
  /** True while a bigCelebrate() is playing — AvatarStage uses this to add
   * a little bounce animation on top of the pose change. */
  bouncing: boolean;
  /** Interrupts anything currently "playing", then speaks `text`. */
  speak: (text: string, options?: PresentOptions) => Promise<void>;
  /** A quick celebration pose for a normal correct answer. */
  celebrate: () => void;
  /** A bigger, longer celebration for milestones (every 5/10 correct). */
  bigCelebrate: () => void;
  /** Resolves once the current speak()/celebrate() finishes. */
  waitUntilIdle: () => Promise<void>;
  /** Plays a near-silent clip inside the calling user gesture so the browser
   * allows later, non-gesture-triggered speak() calls (e.g. milestone praise
   * mid-quiz) to autoplay real audio. Call from a click handler, before the
   * first speak(). No-op after the first successful call. */
  unlockAudio: () => void;
}

const PresenterContext = createContext<PresenterContextValue | null>(null);

// Fake mouth-flap rhythm while "talking". Used for real audio too (VOICEVOX
// doesn't give us viseme/phoneme timing over this simple endpoint) — it just
// runs until the real <audio> fires "ended" instead of a fixed timer.
const MOUTH_CYCLE: MouthState[] = ["open", "mid", "closed", "mid"];
const MOUTH_FRAME_MS = 170;

// Fallback-only estimate of how long TTS would take to say `text`, used when
// real VOICEVOX audio isn't available (engine not running, request failed,
// autoplay blocked). ~150ms/char lands in a plausible range for spoken
// Japanese; clamped so very short/long lines still feel right.
function estimateSpeakingMs(text: string): number {
  return Math.min(7000, Math.max(900, text.length * 150));
}

// 46-byte silent WAV (1 sample, mono, 8kHz) used purely to "unlock" audio
// playback on this page from within a real user gesture — see unlockAudio().
const SILENT_WAV_DATA_URL =
  "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQIAAAAAAA==";

export function PresenterProvider({ children }: { children: ReactNode }) {
  const [talking, setTalking] = useState(false);
  const [caption, setCaption] = useState("");
  const [pose, setPose] = useState<AvatarPose>(IDLE_POSE);
  const [bouncing, setBouncing] = useState(false);

  const talkingRef = useRef(false);
  useEffect(() => {
    talkingRef.current = talking;
  }, [talking]);

  // Bumped on every speak()/celebrate() call so timers from a *previous*
  // call know a newer one has taken over and skip their own cleanup —
  // mirrors the old engine's interruptPresentation() behavior.
  const generationRef = useRef(0);
  const mouthTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  const stopMouthCycle = useCallback(() => {
    if (mouthTimerRef.current) {
      clearInterval(mouthTimerRef.current);
      mouthTimerRef.current = null;
    }
  }, []);

  // Idle blinking, purely cosmetic — only touches `eyes`, so it can't fight
  // with an in-progress talking/celebrate pose in any visible way as long as
  // we only apply it when currently idle.
  useEffect(() => {
    function scheduleBlink() {
      const delay = 3000 + Math.random() * 4000;
      blinkTimerRef.current = setTimeout(() => {
        if (!talkingRef.current) {
          setPose((p) => (p === IDLE_POSE || p.eyes === "open" ? { ...p, eyes: "closed" } : p));
          setTimeout(() => {
            if (!talkingRef.current) {
              setPose((p) => (p.eyes === "closed" ? { ...p, eyes: "open" } : p));
            }
          }, 140);
        }
        scheduleBlink();
      }, delay);
    }
    scheduleBlink();
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;
    audioUnlockedRef.current = true;
    const unlock = new Audio(SILENT_WAV_DATA_URL);
    unlock.volume = 0;
    unlock.play().catch(() => {
      // Browser still refused (rare) — real speak() calls will just fall
      // back to captions + mouth-flap timing below, so nothing breaks.
      audioUnlockedRef.current = false;
    });
  }, []);

  const speak = useCallback(
    (text: string, options?: PresentOptions) => {
      const myGeneration = ++generationRef.current;
      stopMouthCycle();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCaption(text);
      setTalking(true);
      const talkEyes: EyeState = options?.emotion === "joy" ? "happy" : "open";
      setPose({ arm: "ver1", eyes: talkEyes, mouth: "mid" });

      let frame = 0;
      mouthTimerRef.current = setInterval(() => {
        frame = (frame + 1) % MOUTH_CYCLE.length;
        setPose((p) => ({ ...p, mouth: MOUTH_CYCLE[frame] }));
      }, MOUTH_FRAME_MS);

      return new Promise<void>((resolve) => {
        function finish() {
          // A newer speak()/celebrate() already took over — don't stomp it.
          if (generationRef.current !== myGeneration) {
            resolve();
            return;
          }
          stopMouthCycle();
          setTalking(false);
          setPose(IDLE_POSE);
          resolve();
        }

        // No VOICEVOX ENGINE running, request failed, or playback was
        // blocked (no prior unlockAudio() gesture) — fall back to the old
        // estimated-duration timer so the app still "talks" via captions +
        // mouth-flap alone. Same UX either way, just less accurately timed.
        function fallbackToTimer() {
          const durationMs = estimateSpeakingMs(text);
          setTimeout(finish, durationMs);
        }

        fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);
            return res.blob();
          })
          .then((blob) => {
            if (generationRef.current !== myGeneration) {
              resolve();
              return;
            }
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.addEventListener("ended", () => {
              URL.revokeObjectURL(url);
              finish();
            });
            audio.addEventListener("error", () => {
              URL.revokeObjectURL(url);
              fallbackToTimer();
            });
            audio.play().catch(() => {
              URL.revokeObjectURL(url);
              fallbackToTimer();
            });
          })
          .catch(fallbackToTimer);
      });
    },
    [stopMouthCycle],
  );

  const playCelebration = useCallback(
    (durationMs: number, big: boolean) => {
      const myGeneration = ++generationRef.current;
      stopMouthCycle();
      setPose(CELEBRATE_POSE);
      setBouncing(big);
      setTimeout(() => {
        if (generationRef.current !== myGeneration) return;
        setPose(IDLE_POSE);
        setBouncing(false);
      }, durationMs);
    },
    [stopMouthCycle],
  );

  const celebrate = useCallback(() => playCelebration(900, false), [playCelebration]);
  const bigCelebrate = useCallback(() => playCelebration(1500, true), [playCelebration]);

  const waitUntilIdle = useCallback(() => {
    if (!talkingRef.current) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (!talkingRef.current) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }, []);

  const value: PresenterContextValue = {
    ready: true,
    talking,
    caption,
    error: null,
    pose,
    bouncing,
    speak,
    celebrate,
    bigCelebrate,
    waitUntilIdle,
    unlockAudio,
  };

  return (
    <PresenterContext.Provider value={value}>
      {children}
    </PresenterContext.Provider>
  );
}

export function usePresenter() {
  const ctx = useContext(PresenterContext);
  if (!ctx) throw new Error("usePresenter must be used within PresenterProvider");
  return ctx;
}
