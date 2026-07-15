import { useState, useRef, useEffect, useCallback } from "react";
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
import { useLang } from "@/contexts/language";
import { t, tArr } from "@/i18n";
import { Button } from "@/components/ui/button";

interface GuestMessage {
  role: "user" | "assistant";
  content: string;
  id?: number;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22V12M12 12C12 7 8 3 3 3c0 5 4 9 9 9zM12 12c0-5 4-9 9-9-1 5-5 9-9 9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-card border border-border px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function speakText(text: string, lang: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "hi" ? "hi-IN" : lang === "te" ? "te-IN" : "en-IN";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function MessageBubble({
  msg,
  lang,
  onToggleFav,
}: {
  msg: Message | GuestMessage;
  lang: string;
  onToggleFav?: () => void;
}) {
  const isUser = msg.role === "user";
  const isFav = "isFavorited" in msg && msg.isFavorited;

  return (
    <div className={`flex items-end gap-2 px-4 py-1 group ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22V12M12 12C12 7 8 3 3 3c0 5 4 9 9 9zM12 12c0-5 4-9 9-9-1 5-5 9-9 9z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className={`max-w-[82%] md:max-w-[68%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-card border border-border text-foreground"
          }`}
        >
          {msg.content}
        </div>
        {!isUser && (
          <div className="flex items-center gap-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => speakText(msg.content, lang)}
              title={t(lang as any, "chatSpeak")}
              className="text-muted-foreground/50 hover:text-primary transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>
            {onToggleFav && "id" in msg && (
              <button
                onClick={onToggleFav}
                className={`transition-colors ${isFav ? "text-amber-500" : "text-muted-foreground/50 hover:text-amber-500"}`}
                aria-label={isFav ? "Remove from favorites" : "Save response"}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function VoiceButton({ lang, onTranscript, disabled }: {
  lang: string;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    setError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice not supported in this browser. Try Chrome.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "hi" ? "hi-IN" : lang === "te" ? "te-IN" : "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      const text = finalTranscript || interimTranscript;
      if (text) onTranscript(text);
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      recognitionRef.current = null;
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow access in browser settings.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else if (event.error !== "aborted") {
        setError(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e: any) {
      setError("Could not start microphone. Please try again.");
      setListening(false);
    }
  }, [lang, onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        disabled={disabled}
        title={listening ? "Stop listening" : "Voice input"}
        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
          listening
            ? "border-red-400 bg-red-50 text-red-500 dark:bg-red-950 dark:border-red-600 scale-110"
            : "border-input bg-background text-muted-foreground hover:text-foreground hover:border-primary/40"
        } disabled:opacity-50`}
      >
        {listening ? (
          <span className="flex gap-0.5 items-end h-5">
            {[0,1,2].map(i => (
              <span key={i} className="w-1 rounded-full bg-red-500 animate-bounce" style={{height:`${8+i*4}px`, animationDelay:`${i*0.1}s`}} />
            ))}
          </span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
          </svg>
        )}
      </button>
      {error && (
        <div className="absolute bottom-12 left-0 w-56 rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive z-10">
          {error}
          <button onClick={() => setError(null)} className="ml-1 underline">dismiss</button>
        </div>
      )}
    </div>
  );
}

function ChatInput({
  lang,
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
}: {
  lang: string;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}) {
  return (
    <div className="border-t border-border p-3 md:p-4">
      <div className="flex gap-2">
        <VoiceButton lang={lang} onTranscript={onChange} disabled={disabled} />
        <textarea
          className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[44px] max-h-32"
          placeholder={t(lang as any, "chatPlaceholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={disabled}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="h-11 w-11 rounded-xl p-0 shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

function ConversationSidebar({ currentId, onNew, onClose }: {
  currentId: number | null;
  onNew: () => void;
  onClose?: () => void;
}) {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const { data: convos = [] } = useListConversations({ query: { queryKey: getListConversationsQueryKey() } });
  const deleteMutation = useDeleteConversation();
  const [, navigate] = useLocation();

  function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate({ id }, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        if (currentId === id) navigate("/chat");
      },
    });
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <Link href="/" className="font-bold text-sidebar-primary text-sm">{t(lang, "appShort")}</Link>
        <div className="flex gap-1">
          <Button size="sm" onClick={onNew} className="h-7 text-xs">{t(lang, "chatNewChat")}</Button>
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
          <p className="px-4 py-6 text-xs text-sidebar-foreground/50 text-center">{t(lang, "chatNoConversations")}</p>
        ) : (
          convos.map((c) => (
            <Link key={c.id} href={`/chat/${c.id}`}>
              <div className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-sidebar-accent/50 transition-colors ${currentId === c.id ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground"}`}>
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
          <span className="text-xs text-sidebar-foreground/50 hover:text-sidebar-primary transition-colors">{t(lang, "chatViewHistory")}</span>
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ lang, onSuggestion }: { lang: string; onSuggestion: (q: string) => void }) {
  const suggestions = tArr(lang as any, "chatSuggestions");
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-primary" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22V12M12 12C12 7 8 3 3 3c0 5 4 9 9 9zM12 12c0-5 4-9 9-9-1 5-5 9-9 9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-semibold text-foreground text-lg">{t(lang as any, "chatWelcome")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t(lang as any, "chatWelcomeDesc")}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-md">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onSuggestion(q)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function GuestChat() {
  const { lang } = useLang();
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [input, setInput] = useState("");
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
          setMessages((prev) => [...prev, { role: "assistant", content: t(lang, "chatErrNetwork") }]);
          setIsTyping(false);
        },
      }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div>
          <span className="text-sm font-semibold text-foreground">{t(lang, "appName")}</span>
          <span className="ml-2 text-xs text-muted-foreground">{t(lang, "chatGuestMode")}</span>
        </div>
        <Link href="/register">
          <Button size="sm" className="h-7 text-xs">{t(lang, "chatSignUpToSave")}</Button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 && (
          <EmptyState lang={lang} onSuggestion={setInput} />
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} lang={lang} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <ChatInput lang={lang} value={input} onChange={setInput} onSend={handleSend} onKeyDown={handleKeyDown} disabled={isTyping} />
    </div>
  );
}

function AuthenticatedChat({ conversationId }: { conversationId: number | null }) {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
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
    createConv.mutate(
      { data: { title: t(lang, "chatNewChat"), language: lang } },
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
    toggleFav.mutate({ id: msgId }, {
      onSuccess() {
        if (conversationId) queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(conversationId) });
        queryClient.invalidateQueries({ queryKey: getListFavoriteMessagesQueryKey() });
      },
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const messages: Message[] = conversation?.messages ?? [];

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="hidden md:block w-60 shrink-0 border-r border-border">
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
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1 text-muted-foreground hover:text-foreground">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-foreground truncate">
              {convLoading ? t(lang, "chatLoading") : conversation?.title ?? t(lang, "chatStartConversation")}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {!conversationId && <EmptyState lang={lang} onSuggestion={setInput} />}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              lang={lang}
              onToggleFav={msg.role === "assistant" ? () => handleToggleFav(msg.id) : undefined}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <ChatInput lang={lang} value={input} onChange={setInput} onSend={handleSend} onKeyDown={handleKeyDown} disabled={isTyping} />
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

  if (!user) return <GuestChat />;
  return <AuthenticatedChat conversationId={conversationId} />;
}
