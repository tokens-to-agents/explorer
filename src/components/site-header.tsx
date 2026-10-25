"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { nav, site } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const live = nav.filter((item) => item.status === "live");

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="glass-bar mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-full pr-2 pl-4 sm:gap-4 sm:pl-5">
        <Link href="/" className="flex items-baseline gap-2 text-sm font-semibold tracking-tight whitespace-nowrap sm:text-base">
          {site.name}
          <span className="hidden text-sm font-normal text-muted-foreground sm:inline">{site.product}</span>
        </Link>
        <nav aria-label="Views" className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {live.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-sm transition-colors sm:px-3",
                  active ? "bg-glass-strong text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={site.wikiUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-1 hidden items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Wiki
            <ArrowUpRight className="size-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
