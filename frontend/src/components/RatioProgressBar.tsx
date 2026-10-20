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

  // Payno color scheme
  let barColor = "bg-[#0D9F6E]";
  let textColor = "text-[#0D9F6E]";
  let statusBadge = (
    <span className="badge-apple-emerald text-[10px]">
      <Check size={11} /> {detail.marginToLimitPercentage}
    </span>
  );

  if (isInTolerance) {
    barColor = "bg-[#F59E0B]";
    textColor = "text-[#B45309]";
    statusBadge = (
      <span className="badge-apple-amber text-[10px]">
        <AlertCircle size={11} /> Hoşgörü Sınırında
      </span>
    );
  } else if (!isCompliant) {
    barColor = "bg-[#E11D48]";
    textColor = "text-[#BE123C]";
    statusBadge = (
      <span className="badge-apple-rose text-[10px]">
        <AlertCircle size={11} /> {detail.marginToLimitPercentage}
      </span>
    );
  }

  return (
    <div className="payno-card p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h4 className="text-sm font-extrabold text-[#182542] tracking-tight">{label}</h4>
          {subLabel && <p className="text-xs text-[#6E81A0] font-medium mt-0.5">{subLabel}</p>}
        </div>
        <div className="text-right">
          <div className={`text-2xl font-extrabold font-mono tabular-nums tracking-tight ${textColor}`}>
            {detail.ratioPercentage}
          </div>
          <div className="text-[11px] text-[#7B8FA8] font-mono tabular-nums font-medium">
            {formatCompactNumber(detail.numeratorTRY)} / {formatCompactNumber(detail.denominatorTRY)} TL
          </div>
        </div>
      </div>

      {/* Payno Diagonal Hatch Progress Track */}
      <div className="relative w-full h-3.5 payno-hatch-track overflow-hidden my-3.5">
        {/* Shaded Tolerance Zone */}
        {isDebtOrCash && (
          <div
            className="absolute top-0 bottom-0 bg-amber-500/20"
            style={{
              left: `${thresholdMarkPercent}%`,
              width: `${Math.max(toleranceMarkPercent - thresholdMarkPercent, 0)}%`,
            }}
          />
        )}

        {/* Current Ratio Bar */}
        <div
          className={`payno-hatch-fill ${barColor}`}
          style={{ width: `${progressPercent}%` }}
        />

        {/* Threshold Mark Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#E11D48] z-10"
          style={{ left: `${thresholdMarkPercent}%` }}
        />
      </div>

      {/* Footer labels */}
      <div className="flex items-center justify-between text-xs text-[#7B8FA8] font-mono tabular-nums">
        <span className="text-[11px] font-semibold">0%</span>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#182542]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
          <span>Eşik: {detail.thresholdPercentage}</span>
        </div>
        <div>{statusBadge}</div>
      </div>
    </div>
  );
};
