import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme";
import { useLang } from "@/contexts/language";
import { t, type Lang } from "@/i18n";
import { useLogoutUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
  { code: "te", label: "TE" },
];

export default function Header() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { lang, setLang } = useLang();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const logout = useLogoutUser();

  const NAV_LINKS = [
    { href: "/chat", label: t(lang, "navChat") },
    { href: "/market", label: t(lang, "navMarket") },
    { href: "/faq", label: t(lang, "navFaq") },
  ];

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        navigate("/");
      },
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary-foreground" stroke="currentColor" strokeWidth="2">
              <path d="M12 22V12M12 12C12 7 8 3 3 3c0 5 4 9 9 9zM12 12c0-5 4-9 9-9-1 5-5 9-9 9z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-primary hidden sm:inline">{t(lang, "appName")}</span>
          <span className="font-bold text-primary sm:hidden">{t(lang, "appShort")}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                location.startsWith(link.href)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Language Selector */}
          <div className="flex rounded-md border border-border overflow-hidden mr-1">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                title={code === "en" ? "English" : code === "hi" ? "हिंदी" : "తెలుగు"}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  lang === code
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-1.5">
              <Link href="/history" className="hidden md:block">
                <Button variant="ghost" size="sm" className="text-xs">{t(lang, "navHistory")}</Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="text-xs">{user.name.split(" ")[0]}</Button>
              </Link>
              <Button variant="outline" size="sm" className="text-xs" onClick={handleLogout}>
                {t(lang, "navSignOut")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">{t(lang, "navSignIn")}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-xs">{t(lang, "navRegister")}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
