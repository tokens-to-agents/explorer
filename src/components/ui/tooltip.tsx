import { cn } from "@/lib/utils";

/**
 * A small tooltip shown on hover and on keyboard focus, without JavaScript.
 * The trigger must reference `id` with aria-describedby so screen readers read the text too.
 */
export function Tooltip({ id, content, className }: { id: string; content: React.ReactNode; className?: string }) {
  return (
    <span
      id={id}
      role="tooltip"
      className={cn(
        "glass-bar pointer-events-none invisible absolute whitespace-normal normal-case tracking-normal top-full left-1/2 z-50 mt-2 w-60 -translate-x-1/2 rounded-lg px-3 py-2 text-left text-xs leading-relaxed font-normal text-muted-foreground opacity-0 transition-opacity duration-150",
        "group-hover/tip:visible group-hover/tip:opacity-100 group-focus-within/tip:visible group-focus-within/tip:opacity-100",
        className,
      )}
    >
      {content}
    </span>
  );
}
