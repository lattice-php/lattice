import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useLocale } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { Color, Size } from "@lattice-php/lattice/types/generated";

const barHeights: Record<Size, string> = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3",
  xl: "h-4",
  "2xl": "h-5",
  "3xl": "h-6",
  "4xl": "h-8",
};

const fillColors: Record<Color, string> = {
  default: "bg-lt-fg",
  muted: "bg-lt-muted-fg",
  primary: "bg-lt-primary",
  success: "bg-lt-success",
  info: "bg-lt-info",
  warning: "bg-lt-warning",
  danger: "bg-lt-danger",
};

const strokeColors: Record<Color, string> = {
  default: "text-lt-fg",
  muted: "text-lt-muted-fg",
  primary: "text-lt-primary",
  success: "text-lt-success",
  info: "text-lt-info",
  warning: "text-lt-warning",
  danger: "text-lt-danger",
};

const circleDiameters: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  "2xl": 80,
  "3xl": 96,
  "4xl": 128,
};

const circleReadouts: Record<Size, string> = {
  xs: "text-[0.5rem]",
  sm: "text-[0.625rem]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
  "2xl": "text-lg",
  "3xl": "text-xl",
  "4xl": "text-2xl",
};

const ProgressComponent: RendererComponent<"progress"> = ({ node }) => {
  const { value, max, variant, showValue, color, size } = node.props;
  const { locale } = useLocale();

  const clamped = max > 0 ? Math.min(Math.max(value, 0), max) : 0;
  const ratio = max > 0 ? clamped / max : 0;
  const percent = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    style: "percent",
  }).format(ratio);

  const aria = {
    "aria-valuemax": max,
    "aria-valuemin": 0,
    "aria-valuenow": clamped,
    "aria-valuetext": percent,
    role: "progressbar",
  } as const;

  if (variant === "circle") {
    const diameter = circleDiameters[size];
    const strokeWidth = Math.max(3, diameter / 10);
    const radius = (diameter - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <div {...aria} className="relative inline-flex" data-lattice-progress="circle">
        <svg className="-rotate-90" height={diameter} width={diameter}>
          <circle
            className="text-lt-muted"
            cx={diameter / 2}
            cy={diameter / 2}
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <circle
            className={strokeColors[color ?? "primary"]}
            cx={diameter / 2}
            cy={diameter / 2}
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>
        {showValue && (
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center font-medium text-lt-fg tabular-nums",
              circleReadouts[size],
            )}
          >
            {percent}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-2" data-lattice-progress="bar">
      <div
        {...aria}
        className={cn("w-full overflow-hidden rounded-full bg-lt-muted", barHeights[size])}
      >
        <div
          className={cn("h-full rounded-full", fillColors[color ?? "primary"])}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      {showValue && (
        <span className="shrink-0 text-lt-muted-fg text-sm tabular-nums">{percent}</span>
      )}
    </div>
  );
};

export default ProgressComponent;
