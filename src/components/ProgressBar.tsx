interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
      <div
        className="h-full rounded-full bg-rose-400 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
