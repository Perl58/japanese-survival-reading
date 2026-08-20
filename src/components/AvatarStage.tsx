import { useState } from "react";
import { usePresenter } from "../context/PresenterContext";

// v5: switched from the 3D "sv-presenter" engine to the daughter's layered
// illustration (base + swappable eyes/mouth/arm PNGs). The old offset tuning
// (-14, etc.) was calibrated for the 3D model's framing and doesn't apply to
// this artwork, so this resets to 0 and the key is bumped so old stored
// values don't carry over and misposition the new art.
const OFFSET_KEY = "avatarVerticalOffset_v5";
const DEFAULT_OFFSET = 0;

// import.meta.env.BASE_URL mirrors vite.config.ts's `base` ("/survival-reading/"
// in this app) — a plain "/avatars/teacher" string literal isn't rewritten by
// Vite the way a static import would be, so it must be built from BASE_URL
// manually or the images 404 under the app's actual mount path.
const AVATAR_BASE = `${import.meta.env.BASE_URL}avatars/teacher`;

function loadOffset(): number {
  const stored = Number(localStorage.getItem(OFFSET_KEY));
  return Number.isFinite(stored) && localStorage.getItem(OFFSET_KEY) !== null
    ? stored
    : DEFAULT_OFFSET;
}

// Shared by every layer image so they all scale/crop identically and stay
// pixel-aligned (they're exported from the same PSD canvas).
const LAYER_CLASS = "pointer-events-none absolute inset-0 h-full w-full object-cover object-top";

export default function AvatarStage() {
  const { talking, caption, pose, bouncing } = usePresenter();
  const [verticalOffset, setVerticalOffset] = useState(loadOffset);
  const [showTuner, setShowTuner] = useState(false);

  function updateOffset(value: number) {
    setVerticalOffset(value);
    localStorage.setItem(OFFSET_KEY, String(value));
  }

  return (
    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-950 sm:rounded-t-[2rem]">
      {/* Positioning wrapper: only the manual tuner offset lives here. */}
      <div className="absolute inset-0" style={{ transform: `translateY(${verticalOffset}%)` }}>
        {/* Celebration wrapper: a separate element so the big-celebrate
            pulse's own transform doesn't fight with the tuner offset above.
            Scale/rotate only (no translate) — the character already fills
            the box via object-cover, so any translate here would expose
            empty edges instead of just cropping a little tighter. */}
        <div className={bouncing ? "celebrate-pulse absolute inset-0" : "absolute inset-0"}>
          <img src={`${AVATAR_BASE}/base.png`} alt="" className={LAYER_CLASS} />
          <img src={`${AVATAR_BASE}/arm-${pose.arm}.png`} alt="" className={LAYER_CLASS} />
          <img src={`${AVATAR_BASE}/eyes-${pose.eyes}.png`} alt="" className={LAYER_CLASS} />
          <img
            src={`${AVATAR_BASE}/mouth-${pose.mouth}.png`}
            alt="先生"
            className={LAYER_CLASS}
          />
        </div>
      </div>

      {talking && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-rose-500 shadow">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
          speaking
        </div>
      )}

      {caption && (
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-medium text-white backdrop-blur">
          {caption}
        </div>
      )}

      <button
        onClick={() => setShowTuner((v) => !v)}
        className="absolute left-2 top-2 rounded-full bg-black/40 px-2 py-1 text-xs text-white/80"
        aria-label="Adjust avatar vertical position"
      >
        ⚙️
      </button>

      {showTuner && (
        <div className="absolute left-2 top-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur">
          <span className="text-[10px] text-white/70">↕</span>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={verticalOffset}
            onChange={(e) => updateOffset(Number(e.target.value))}
            className="w-28 accent-rose-400"
          />
        </div>
      )}
    </div>
  );
}
