import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-border bg-glass text-foreground",
        outline: "border-border-strong text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** A colored dot + label: color is never the only cue. */
function SwatchBadge({ color, label, className }: { color: string; label: string; className?: string }) {
  return (
    <Badge className={className}>
      <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </Badge>
  );
}

export { Badge, SwatchBadge, badgeVariants };
