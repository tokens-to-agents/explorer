import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "glass h-9 w-full min-w-0 rounded-full px-4 text-sm text-foreground placeholder:text-faint-foreground outline-none transition-colors focus-visible:border-ring",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
