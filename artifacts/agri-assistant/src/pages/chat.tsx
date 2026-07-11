import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListConversations,
  useCreateConversation,
  useGetConversation,
  useDeleteConversation,
  useSendMessage,
  useSendGuestMessage,
  useToggleFavoriteMessage,
  getListConversationsQueryKey,
  getGetConversationQueryKey,
  getListFavoriteMessagesQueryKey,
  type Message,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";

interface GuestMessage {
  role: "user" | "assistant";
  content: string;
  id?: number;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C7 2 3 7 3 12s4 10 9 10 9-4.5 9-10S17 2 12 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-card border border-border px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onToggleFav }: {
  msg: Message | GuestMessage;
  onToggleFav?: () => void;
}) {
  const isUser = msg.role === "user";
  const isFav = "isFavorited" in msg && msg.isFavorited;

  return (
    <div className={`flex items-end gap-2 px-4 py-1 group ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C7 2 3 7 3 12s4 10 9 10 9-4.5 9-10S17 2 12 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className={`max-w-[80%] md:max-w-[65%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-card border border-border text-foreground"
          }`}
        >
          {msg.content}
        </div>
        {!isUser && onToggleFav && "id" in msg && (
          <button
            onClick={onToggleFav}
            className={`ml-1 opacity-0 group-hover:opacity-100 transition-opacity ${
              isFav ? "text-amber-500" : "text-muted-foreground/50 hover:text-amber-500"
            }`}
            aria-label={isFav ? "Remove from favorites" : "Save response"}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function ConversationSidebar({
  currentId,
  onNew,
  onClose,
}: {
  currentId: number | null;
  onNew: () => void;
  onClose?: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: convos = [] } = useListConversations({
    query: { queryKey: getListConversationsQueryKey() },
  });
  const deleteMutation = useDeleteConversation();
  const [, navigate] = useLocation();

  function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate(
      { id },
      {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          if (currentId === id) navigate("/chat");
        },
      }
    );
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <Link href="/" className="font-bold text-sidebar-primary text-sm">KrishiAI</Link>
        <div className="flex gap-1">
          <Button size="sm" onClick={onNew} className="h-7 text-xs">New chat</Button>
          {onClose && (
            <button onClick={onClose} className="ml-1 p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {convos.length === 0 ? (
          <p className="px-4 py-6 text-xs text-sidebar-foreground/50 text-center">No conversations yet</p>
        ) : (
          convos.map((c) => (
            <Link key={c.id} href={`/chat/${c.id}`}>
              <div
                className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-sidebar-accent/50 transition-colors ${
                  currentId === c.id ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground"
                }`}
              >
                <p className="truncate text-xs">{c.title}</p>
                <button
                  onClick={(e) => handleDelete(c.id, e)}
                  className="ml-2 hidden shrink-0 text-sidebar-foreground/40 hover:text-destructive group-hover:block"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="border-t border-sidebar-border px-4 py-3">
        <Link href="/history">
          <span className="text-xs text-sidebar-foreground/50 hover:text-sidebar-primary transition-colors">View all history</span>
        </Link>
      </div>
    </div>
  );
}

function GuestChat() {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<"en" | "te">("en");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendGuestMessage = useSendGuestMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend() {
    const content = input.trim();
    if (!content || isTyping) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setIsTyping(true);

    sendGuestMessage.mutate(
      { data: { content, language: lang, history } },
      {
        onSuccess(data) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
          setIsTyping(false);
        },
        onError() {
          setMessages((prev) => [...prev, {
            role: "assistant",
            content: "Sorry, I couldn't process your request. Please check your connection and try again.",
          }]);
          setIsTyping(false);
        },
      }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div>
          <span className="text-sm font-semibold text-foreground">KrishiAI</span>
          <span className="ml-2 text-xs text-muted-foreground">Guest mode</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            {(["en", "te"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "en" ? "EN" : "TE"}
              </button>
            ))}
          </div>
          <Link href="/register">
            <Button size="sm" className="h-7 text-xs">Sign up to save</Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-primary" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C7 2 3 7 3 12s4 10 9 10 9-4.5 9-10S17 2 12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Hello! I am KrishiAI</p>
              <p className="mt-1 text-sm text-muted-foreground">Ask me anything about farming, crops, diseases, or government schemes.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["How to control bollworm in cotton?", "Best fertilizer for rice?", "PM-KISAN scheme details", "When to sow wheat in AP?"].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:border-primary/40 hover:bg-accent/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <textarea
            className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[44px] max-h-32"
            placeholder={lang === "te" ? "మీ ప్రశ్న అడగండి..." : "Ask about farming, crops, diseases..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="h-11 w-11 rounded-xl p-0 shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

function AuthenticatedChat({ conversationId }: { conversationId: number | null }) {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<"en" | "te">("en");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const createConv = useCreateConversation();
  const sendMessage = useSendMessage();
  const toggleFav = useToggleFavoriteMessage();

  const { data: conversation, isLoading: convLoading } = useGetConversation(
    conversationId!,
    { query: { enabled: !!conversationId, queryKey: getGetConversationQueryKey(conversationId!) } }
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, isTyping]);

  async function handleNewConversation() {
    const title = "New conversation";
    createConv.mutate(
      { data: { title, language: lang } },
      {
        onSuccess(data) {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          navigate(`/chat/${data.id}`);
        },
      }
    );
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || isTyping) return;

    let targetId = conversationId;
    if (!targetId) {
      const conv = await new Promise<number>((resolve, reject) => {
        createConv.mutate(
          { data: { title: content.slice(0, 50), language: lang } },
          {
            onSuccess(data) {
              queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
              navigate(`/chat/${data.id}`);
              resolve(data.id);
            },
            onError: reject,
          }
        );
      });
      targetId = conv;
    }

    setInput("");
    setIsTyping(true);

    sendMessage.mutate(
      { data: { content, language: lang }, id: targetId },
      {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(targetId!) });
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          setIsTyping(false);
        },
        onError() {
          setIsTyping(false);
        },
      }
    );
  }

  function handleToggleFav(msgId: number) {
    toggleFav.mutate(
      { id: msgId },
      {
        onSuccess() {
          if (conversationId) {
            queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(conversationId) });
          }
          queryClient.invalidateQueries({ queryKey: getListFavoriteMessagesQueryKey() });
        },
      }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const messages: Message[] = conversation?.messages ?? [];

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className={`hidden md:block w-60 shrink-0 border-r border-border`}>
        <ConversationSidebar currentId={conversationId} onNew={handleNewConversation} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-50">
            <ConversationSidebar currentId={conversationId} onNew={handleNewConversation} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1 text-muted-foreground hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-foreground truncate">
              {convLoading ? "Loading..." : conversation?.title ?? "New conversation"}
            </span>
          </div>
          <div className="flex rounded-md border border-border overflow-hidden">
            {(["en", "te"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "en" ? "EN" : "TE"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {!conversationId && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-primary" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C7 2 3 7 3 12s4 10 9 10 9-4.5 9-10S17 2 12 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Start a conversation</p>
                <p className="mt-1 text-sm text-muted-foreground">Ask about crops, diseases, market prices, or government schemes.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {["How to control bollworm in cotton?", "Best fertilizer for rice?", "PM-KISAN scheme details", "Tomato disease symptoms and treatment"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:border-primary/40 hover:bg-accent/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onToggleFav={msg.role === "assistant" ? () => handleToggleFav(msg.id) : undefined}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <textarea
              className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[44px] max-h-32"
              placeholder={lang === "te" ? "మీ ప్రశ్న అడగండి..." : "Ask about farming, crops, diseases..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="h-11 w-11 rounded-xl p-0 shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ params }: { params?: { id?: string } }) {
  const { user, isLoading } = useAuth();
  const conversationId = params?.id ? parseInt(params.id, 10) : null;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <GuestChat />;
  }

  return <AuthenticatedChat conversationId={conversationId} />;
}
