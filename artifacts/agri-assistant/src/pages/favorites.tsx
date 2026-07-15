import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
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
          <p className="font-medium text-foreground mb-1">{t(lang as Lang, "favEmpty")}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {lang === "hi" ? "AI के जवाबों पर ⭐ दबाएं जो आप सहेजना चाहते हैं।" :
             lang === "te" ? "AI జవాబులపై ⭐ నొక్కి సేవ్ చేయండి." :
             "Tap ⭐ on any AI response to save it here."}
          </p>
          <Link href="/chat">
            <Button variant="outline">{t(lang as Lang, "navChat")}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div key={fav.id} className="rounded-xl border border-border bg-card p-4 hover:border-amber-200 dark:hover:border-amber-700 transition-colors">
              <div className="mb-3 flex items-start justify-between gap-2">
                <Link href={`/chat/${fav.conversationId}`}>
                  <span className="text-xs text-primary hover:underline font-medium cursor-pointer">
                    💬 {fav.conversationTitle}
                  </span>
                </Link>
                <button
                  onClick={() => handleUnfavorite(fav.id)}
                  className="shrink-0 text-amber-400 hover:text-muted-foreground transition-colors"
                  title="Remove from favorites"
                  aria-label="Remove from favorites"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-foreground leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    ul: ({ children }) => <ul className="my-1 space-y-0.5 pl-1">{children}</ul>,
                    li: ({ children }) => (
                      <li className="flex gap-1.5 text-sm">
                        <span className="text-primary shrink-0">•</span>
                        <span>{children}</span>
                      </li>
                    ),
                  }}
                >
                  {fav.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
