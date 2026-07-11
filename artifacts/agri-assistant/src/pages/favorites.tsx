import { Link, useLocation } from "wouter";
import {
  useListFavoriteMessages,
  useToggleFavoriteMessage,
  getListFavoriteMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
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
    toggleFav.mutate(
      { id },
      {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: getListFavoriteMessagesQueryKey() });
        },
      }
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Saved Answers</h1>
        <span className="text-sm text-muted-foreground">{favorites.length} saved</span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No saved answers yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Star any AI response to save it here.</p>
          <Link href="/chat">
            <Button variant="outline" className="mt-4">Go to chat</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div key={fav.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <Link href={`/chat/${fav.conversationId}`}>
                  <span className="text-xs text-primary hover:underline font-medium">
                    {fav.conversationTitle}
                  </span>
                </Link>
                <button
                  onClick={() => handleUnfavorite(fav.id)}
                  className="shrink-0 text-amber-500 hover:text-muted-foreground transition-colors"
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
