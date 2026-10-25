import { SiteFooter } from "@/components/site-footer";

/** Reading pages: centered column and footer. The full-screen views (map) live in the (fullscreen) group. */
export default function PagesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 pt-10">{children}</main>
      <SiteFooter />
    </>
  );
}
