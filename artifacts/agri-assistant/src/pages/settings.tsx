import { useState } from "react";
import { useLocation } from "wouter";
import {
  useUpdateUserLanguage,
  useLogoutUser,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme";
import { useLang } from "@/contexts/language";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";
import type { Lang } from "@/i18n";

export default function SettingsPage() {
  const { lang, setLang } = useLang();
  const { theme, toggle } = useTheme();
  const { user, isLoading: authLoading, invalidate } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const updateLang = useUpdateUserLanguage();
  const logout = useLogoutUser();
  const [language, setLanguage] = useState(user?.language ?? lang);
  const [saved, setSaved] = useState(false);

  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }
  if (!user) return null;

  function handleSaveLanguage() {
    updateLang.mutate(
      { data: { language } },
      {
        onSuccess() {
          invalidate();
          setLang(language as Lang);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  }

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        navigate("/");
      },
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t(lang as Lang, "settingsTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t(lang as Lang, "settingsSubtitle")}</p>
      </div>

      <div className="space-y-4">
        {/* Account info */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t(lang as Lang, "settingsAccount")}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t(lang as Lang, "settingsName")}</span>
              <span className="font-medium text-foreground">{user.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t(lang as Lang, "settingsEmail")}</span>
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t(lang as Lang, "settingsLang")}</h2>
          <div className="space-y-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
            <Button
              onClick={handleSaveLanguage}
              disabled={updateLang.isPending}
              variant={saved ? "outline" : "default"}
              className="w-full"
            >
              {saved
                ? t(lang as Lang, "settingsSaved")
                : updateLang.isPending
                ? t(lang as Lang, "settingsSaving")
                : t(lang as Lang, "settingsSave")}
            </Button>
          </div>
        </div>

        {/* Theme */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t(lang as Lang, "settingsTheme")}</h2>
          <div className="flex gap-3">
            <button
              onClick={() => theme === "dark" && toggle()}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                theme === "light"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              ☀️ {t(lang as Lang, "settingsThemeLight")}
            </button>
            <button
              onClick={() => theme === "light" && toggle()}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              🌙 {t(lang as Lang, "settingsThemeDark")}
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <Button variant="destructive" onClick={handleLogout} className="w-full">
            {t(lang as Lang, "settingsLogout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
