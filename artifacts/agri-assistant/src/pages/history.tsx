import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useListConversations,
  useDeleteConversation,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HistoryPage() {
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
    if (!confirm("Delete this conversation?")) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        },
      }
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Chat History</h1>
        <Link href="/chat">
          <Button size="sm">New Chat</Button>
        </Link>
      </div>

      <Input
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            {search ? "No conversations match your search." : "No conversations yet."}
          </p>
          <Link href="/chat">
            <Button variant="outline" className="mt-4">Start chatting</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => (
            <Link key={conv.id} href={`/chat/${conv.id}`}>
              <div className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/10 transition-colors cursor-pointer">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm text-foreground">{conv.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {conv.messageCount} messages
                    {conv.lastMessageAt ? ` · ${timeAgo(conv.lastMessageAt)}` : ""}
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
