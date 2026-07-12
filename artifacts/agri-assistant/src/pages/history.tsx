import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useListConversations,
  useDeleteConversation,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useLang } from "@/contexts/language";
import { t } from "@/i18n";
import type { Lang } from "@/i18n";

function timeAgo(iso: string, lang: Lang) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) {
    return lang === "hi" ? `${mins} मिनट पहले` : lang === "te" ? `${mins} నిమిషాల క్రితం` : `${mins}m ago`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    return lang === "hi" ? `${hrs} घंटे पहले` : lang === "te" ? `${hrs} గంటల క్రితం` : `${hrs}h ago`;
  }
  const days = Math.floor(hrs / 24);
  return lang === "hi" ? `${days} दिन पहले` : lang === "te" ? `${days} రోజుల క్రితం` : `${days}d ago`;
}

export default function HistoryPage() {
  const { lang } = useLang();
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data: conversations = [], isLoading } = useListConversations({
    query: { enabled: !!user, queryKey: getListConversationsQueryKey() },
  });
  const deleteMutation = useDeleteConversation();

  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault();
    deleteMutation.mutate({ id }, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t(lang as Lang, "historyTitle")}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t(lang as Lang, "historySubtitle")}</p>
        </div>
        <Link href="/chat">
          <Button size="sm">{t(lang as Lang, "chatNewChat")}</Button>
        </Link>
      </div>

      <input
        type="search"
        placeholder={lang === "hi" ? "बातचीत खोजें..." : lang === "te" ? "సంభాషణలు వెతకండి..." : "Search conversations..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">{t(lang as Lang, "historyEmpty")}</p>
          <Link href="/chat">
            <Button variant="outline" className="mt-4">{t(lang as Lang, "chatNewChat")}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => (
            <Link key={conv.id} href={`/chat/${conv.id}`}>
              <div className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm text-foreground">{conv.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {conv.messageCount} {lang === "hi" ? "संदेश" : lang === "te" ? "సందేశాలు" : "messages"}
                    {conv.lastMessageAt ? ` · ${timeAgo(conv.lastMessageAt, lang as Lang)}` : ""}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(conv.id, e)}
                  className="ml-3 hidden text-muted-foreground hover:text-destructive group-hover:block transition-colors"
                  aria-label="Delete conversation"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
