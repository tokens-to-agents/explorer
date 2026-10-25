"use client";

import { useId } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type FilterChipProps = {
  label: string;
  color?: string;
  pressed: boolean;
  count?: number;
  disabled?: boolean;
  /** Shown on hover and focus: what the filter covers. */
  hint?: React.ReactNode;
  onPressedChange: (pressed: boolean) => void;
};

/** A toggle used by every filter in the Explorer (tags, layers, openness). */
export function FilterChip({ label, color, pressed, count, disabled, hint, onPressedChange }: FilterChipProps) {
  const hintId = useId();
  return (
    <span className="group/tip relative inline-flex">
      <button
        type="button"
        aria-pressed={pressed}
        aria-describedby={hint ? hintId : undefined}
        disabled={disabled}
        onClick={() => onPressedChange(!pressed)}
        className={cn(
          "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
          pressed
            ? "border-border-strong bg-glass-strong text-foreground"
            : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
          disabled && "cursor-not-allowed opacity-45 hover:border-border hover:text-muted-foreground",
        )}
      >
        {color && (
          <span
            aria-hidden
            className="size-2 rounded-full transition-opacity"
            style={{ backgroundColor: color, opacity: pressed ? 1 : 0.45 }}
          />
        )}
        {label}
        {count !== undefined && <span className="text-faint-foreground tabular-nums">{count}</span>}
      </button>
      {hint && <Tooltip id={hintId} content={hint} />}
    </span>
  );
}
