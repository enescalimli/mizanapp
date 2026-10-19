import React from "react";
import { formatCompactNumber } from "@/lib/decimal/decimal";
import { RatioDetail } from "@/types/katilim";
import { Check, AlertCircle } from "lucide-react";

interface RatioProgressBarProps {
  label: string;
  subLabel?: string;
  detail: RatioDetail;
  maxScalePercent?: number;
  isDebtOrCash?: boolean;
}

export const RatioProgressBar: React.FC<RatioProgressBarProps> = ({
  label,
  subLabel,
  detail,
  maxScalePercent = 45,
  isDebtOrCash = true,
}) => {
  const currentVal = parseFloat(detail.ratioDecimal) * 100;
  const thresholdVal = parseFloat(detail.thresholdPercentage.replace("%", ""));
  const toleranceCeilingVal = parseFloat(
    detail.toleranceCeilingPercentage.replace("%", "")
  );

  // Position percentage on the progress bar track
  const progressPercent = Math.min(
    Math.max((currentVal / maxScalePercent) * 100, 0),
    100
  );
  const thresholdMarkPercent = Math.min(
    (thresholdVal / maxScalePercent) * 100,
    100
  );
  const toleranceMarkPercent = Math.min(
    (toleranceCeilingVal / maxScalePercent) * 100,
    100
  );

  const isCompliant = detail.isCompliant;
  const isInTolerance = detail.isInToleranceBand;

  // Color scheme
  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-400";
  let statusBadge = (
    <span className="badge-apple-emerald text-[10px]">
      <Check size={11} /> {detail.marginToLimitPercentage}
    </span>
  );

  if (isInTolerance) {
    barColor = "bg-amber-400";
    textColor = "text-amber-300";
    statusBadge = (
      <span className="badge-apple-amber text-[10px]">
        <AlertCircle size={11} /> Hoşgörü Sınırında
      </span>
    );
  } else if (!isCompliant) {
    barColor = "bg-rose-500";
    textColor = "text-rose-400";
    statusBadge = (
      <span className="badge-apple-rose text-[10px]">
        <AlertCircle size={11} /> {detail.marginToLimitPercentage}
      </span>
    );
  }

  return (
    <div className="apple-card p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">{label}</h4>
          {subLabel && <p className="text-xs text-slate-400 font-normal">{subLabel}</p>}
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${textColor}`}>
            {detail.ratioPercentage}
          </div>
          <div className="text-[11px] text-slate-400 font-mono tabular-nums">
            {formatCompactNumber(detail.numeratorTRY)} / {formatCompactNumber(detail.denominatorTRY)} TL
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-2 bg-white/[0.06] rounded-full overflow-hidden my-3">
        {/* Shaded Tolerance Zone */}
        {isDebtOrCash && (
          <div
            className="absolute top-0 bottom-0 bg-amber-500/15"
            style={{
              left: `${thresholdMarkPercent}%`,
              width: `${Math.max(toleranceMarkPercent - thresholdMarkPercent, 0)}%`,
            }}
          />
        )}

        {/* Current Ratio Bar */}
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${progressPercent}%` }}
        />

        {/* Threshold Mark Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
          style={{ left: `${thresholdMarkPercent}%` }}
        />
      </div>

      {/* Footer labels */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
        <span className="text-[11px]">0%</span>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span>Eşik: {detail.thresholdPercentage}</span>
        </div>
        <div>{statusBadge}</div>
      </div>
    </div>
  );
};
