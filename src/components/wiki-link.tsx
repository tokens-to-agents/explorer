import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { wikiHref, wikiPages, type WikiPageKey } from "@/config/wiki";

type WikiLinkProps = {
  page: WikiPageKey;
  size?: "sm" | "default";
  /** Overrides the generated label. */
  label?: string;
  /** Short label without the page title, for narrow places such as the timeline's era column. */
  compact?: boolean;
};

/** "Read in the wiki" button. Before the page is live, it opens the wiki home and says so. */
export function WikiLink({ page, size = "sm", label, compact = false }: WikiLinkProps) {
  const target = wikiPages[page];
  const generated = compact
    ? target.live
      ? "Read in the wiki"
      : "Wiki page coming"
    : target.live
      ? `Read “${target.title}” in the wiki`
      : `“${target.title}” — wiki page coming`;

  return (
    <Button asChild variant="glass" size={size}>
      <a href={wikiHref(page)} target="_blank" rel="noreferrer" title={target.title}>
        <BookOpen />
        {label ?? generated}
      </a>
    </Button>
  );
}

export function SourceLink({ href, label = "Source" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-muted-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground"
    >
      {label}
    </a>
  );
}
