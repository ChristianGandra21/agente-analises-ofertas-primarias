import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  subtitle: string;
  borderColor?: string;
}

const TREND_ICON = {
  up: TrendUp,
  down: TrendDown,
  neutral: Minus,
};

const TREND_COLOR = {
  up: "#0D7A4E",
  down: "#C0392B",
  neutral: "#6B6E7A",
};

export function MetricCard({
  label,
  value,
  delta,
  trend = "neutral",
  subtitle,
  borderColor = "#003087",
}: MetricCardProps) {
  const Icon = TREND_ICON[trend];
  const color = TREND_COLOR[trend];

  return (
    <div
      className="bg-white border border-mono-200 rounded-lg p-6"
      style={{ borderTop: `3px solid ${borderColor}` }}
    >
      <p className="font-dm-mono text-[10px] uppercase tracking-widest text-mono-600">
        {label}
      </p>
      <p className="font-dm-mono text-[32px] font-medium text-mono-900 leading-tight mt-1">
        {value}
      </p>
      {delta && (
        <div className="flex items-center gap-1 mt-0.5">
          <Icon size={12} weight="bold" color={color} />
          <span className="font-sora text-xs" style={{ color }}>
            {delta}
          </span>
        </div>
      )}
      <p className="font-sora text-[11px] text-mono-300 mt-1">{subtitle}</p>
    </div>
  );
}
