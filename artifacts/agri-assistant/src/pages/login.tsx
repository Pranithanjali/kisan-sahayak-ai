import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLoginUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/language";
import { t } from "@/i18n";
import type { Lang } from "@/i18n";

export default function LoginPage() {
  const { lang } = useLang();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const loginMutation = useLoginUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
          navigate("/chat");
        },
        onError(err: unknown) {
          const msg = (err as { data?: { error?: string } })?.data?.error;
          setError(msg ?? t(lang as Lang, "chatErrNetwork"));
        },
      }
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-primary-foreground" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22V12M12 12C12 7 8 3 3 3c0 5 4 9 9 9zM12 12c0-5 4-9 9-9-1 5-5 9-9 9z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">{t(lang as Lang, "loginTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(lang as Lang, "loginTagline")}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {t(lang as Lang, "loginEmail")}
              </label>
              <input
                type="email"
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {t(lang as Lang, "loginPassword")}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base rounded-xl" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? t(lang as Lang, "loginLoading") : t(lang as Lang, "loginSubmit")}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {t(lang as Lang, "loginNoAccount")}{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            {t(lang as Lang, "loginCreateAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}
