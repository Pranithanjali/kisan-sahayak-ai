import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme";
import { useLogoutUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/chat", label: "Chat" },
  { href: "/market", label: "Market" },
  { href: "/faq", label: "FAQ" },
];

export default function Header() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const logout = useLogoutUser();

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
              <path d="M12 2C7 2 3 7 3 12s4 10 9 10 9-4.5 9-10S17 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <span className="font-bold text-primary">KrishiAI</span>
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

        <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
              <Link href="/history">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">History</Button>
              </Link>
              <Link href="/favorites">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">Favorites</Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm">{user.name.split(" ")[0]}</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
