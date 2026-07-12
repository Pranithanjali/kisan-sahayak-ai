import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegisterUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/language";
import { t } from "@/i18n";
import type { Lang } from "@/i18n";

export default function RegisterPage() {
  const { lang } = useLang();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const registerMutation = useRegisterUser();
  const [form, setForm] = useState({ name: "", email: "", password: "", language: lang });
  const [error, setError] = useState("");

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    registerMutation.mutate(
      { data: form },
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
          <h1 className="text-xl font-bold text-foreground">{t(lang as Lang, "registerTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(lang as Lang, "registerTagline")}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{t(lang as Lang, "registerName")}</label>
              <input
                type="text"
                placeholder="Ravi Kumar"
                value={form.name}
                onChange={set("name")}
                required
                autoComplete="name"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{t(lang as Lang, "registerEmail")}</label>
              <input
                type="email"
                placeholder="farmer@example.com"
                value={form.email}
                onChange={set("email")}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{t(lang as Lang, "registerPassword")}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                minLength={6}
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{t(lang as Lang, "registerLang")}</label>
              <select
                value={form.language}
                onChange={set("language")}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
            <Button type="submit" className="w-full h-11 text-base rounded-xl" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? t(lang as Lang, "registerLoading") : t(lang as Lang, "registerSubmit")}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {t(lang as Lang, "registerHaveAccount")}{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            {t(lang as Lang, "registerSignIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
