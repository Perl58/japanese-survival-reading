// Falling sakura petals — shown once when the player clears every sub-stage
// in Stage 1. Positions/timings are deterministic (derived from the index,
// not Math.random) purely so the effect looks the same on every render;
// there's no functional reason it needs to vary.
const PETAL_COUNT = 22;

function petals() {
  return Array.from({ length: PETAL_COUNT }, (_, i) => ({
    left: (i * 47) % 100,
    delay: (i * 0.35) % 3.5,
    duration: 4.5 + ((i * 11) % 4),
    size: 10 + ((i * 7) % 12),
    drift: (i % 2 === 0 ? 1 : -1) * (15 + ((i * 5) % 25)),
  }));
}

export default function SakuraOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {petals().map((p, i) => (
        <span
          key={i}
          className="sakura-petal absolute -top-[10%]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // Read by the @keyframes in index.css as the horizontal drift.
            ["--sakura-drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
