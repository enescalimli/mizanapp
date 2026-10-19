import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { ComplianceStatus } from "@/types/katilim";

interface ComplianceBadgeProps {
  status: ComplianceStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-xs font-bold gap-2",
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  };

  if (status === "COMPLIANT") {
    return (
      <span
        className={`badge-apple-emerald ${sizeClasses[size]}`}
      >
        {showIcon && <CheckCircle2 size={iconSizes[size]} />}
        <span>Katılıma Uygun</span>
      </span>
    );
  }

  if (status === "GRACE_PERIOD_TOLERANCE") {
    return (
      <span
        className={`badge-apple-amber ${sizeClasses[size]}`}
      >
        {showIcon && <AlertTriangle size={iconSizes[size]} />}
        <span>Hoşgörüde (İzleme)</span>
      </span>
    );
  }

  if (status === "NON_COMPLIANT") {
    return (
      <span
        className={`badge-apple-rose ${sizeClasses[size]}`}
      >
        {showIcon && <XCircle size={iconSizes[size]} />}
        <span>Kapsam Dışı</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-white/[0.05] border border-white/[0.1] text-slate-400 ${sizeClasses[size]}`}
    >
      {showIcon && <HelpCircle size={iconSizes[size]} />}
      <span>İnceleniyor</span>
    </span>
  );
};
