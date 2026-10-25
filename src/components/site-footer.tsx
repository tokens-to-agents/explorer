import { site } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pt-16 pb-10 text-xs leading-relaxed text-faint-foreground">
      <p>
        {site.name} {site.product} is the interactive companion of the{" "}
        <a href={site.wikiUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">
          {site.name} wiki
        </a>
        . Every row links to its source; rows marked “not verified” are drafts. Independent, not affiliated with any AI company.
      </p>
    </footer>
  );
}
