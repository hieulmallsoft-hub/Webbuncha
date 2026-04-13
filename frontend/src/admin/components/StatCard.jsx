export default function StatCard({ label, value, change, tone = "neutral" }) {
  return (
    <div className={`admin-stat ${tone}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-ink/50">{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-semibold">{value}</span>
        {change && <span className="text-xs text-emerald-600">{change}</span>}
      </div>
    </div>
  );
}
