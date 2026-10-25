import type { ReactNode } from "react";

export function PageIntro({ eyebrow, title, children, actions }: { eyebrow: string; title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
        <p className="text-base leading-relaxed text-muted-foreground text-pretty">{children}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
