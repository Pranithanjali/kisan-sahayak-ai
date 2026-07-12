import { Link } from "wouter";
import { useLang } from "@/contexts/language";
import { t } from "@/i18n";
import type { Lang } from "@/i18n";

export default function NotFound() {
  const { lang } = useLang();
  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-muted-foreground" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-muted-foreground">{t(lang as Lang, "notFound")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t(lang as Lang, "notFoundDesc")}</p>
        <Link href="/">
          <button className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            {t(lang as Lang, "goHome")}
          </button>
        </Link>
      </div>
    </div>
  );
}
