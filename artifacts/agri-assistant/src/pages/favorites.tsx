import { Link, useLocation } from "wouter";
import {
  useListFavoriteMessages,
  useToggleFavoriteMessage,
  getListFavoriteMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { useLang } from "@/contexts/language";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";
import type { Lang } from "@/i18n";

export default function FavoritesPage() {
  const { lang } = useLang();
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: favorites = [], isLoading } = useListFavoriteMessages({
    query: { enabled: !!user, queryKey: getListFavoriteMessagesQueryKey() },
  });
  const toggleFav = useToggleFavoriteMessage();

  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }

  function handleUnfavorite(id: number) {
    toggleFav.mutate({ id }, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: getListFavoriteMessagesQueryKey() });
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t(lang as Lang, "favTitle")}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t(lang as Lang, "favSubtitle")}</p>
        </div>
        <span className="text-sm font-medium text-muted-foreground bg-muted rounded-full px-3 py-1">
          {favorites.length}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <p className="text-muted-foreground">{t(lang as Lang, "favEmpty")}</p>
          <Link href="/chat">
            <Button variant="outline" className="mt-4">{t(lang as Lang, "navChat")}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div key={fav.id} className="rounded-xl border border-border bg-card p-4 hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
              <div className="mb-3 flex items-start justify-between gap-2">
                <Link href={`/chat/${fav.conversationId}`}>
                  <span className="text-xs text-primary hover:underline font-medium cursor-pointer">
                    💬 {fav.conversationTitle}
                  </span>
                </Link>
                <button
                  onClick={() => handleUnfavorite(fav.id)}
                  className="shrink-0 text-amber-400 hover:text-muted-foreground transition-colors"
                  aria-label="Remove from favorites"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{fav.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
