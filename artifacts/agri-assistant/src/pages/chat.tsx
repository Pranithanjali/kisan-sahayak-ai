import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  imagePreview?: string;
}

interface ImageAttachment {
  dataUrl: string;
  name: string;
}

// ─── Markdown Renderer ─────────────────────────────────────────────────────────

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0 border-b border-border/40 pb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1.5 mt-2.5 first:mt-0">{children}</h3>,
        ul: ({ children }) => <ul className="mb-2 space-y-1 pl-1">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 space-y-1 pl-4 list-decimal">{children}</ol>,
        li: ({ children }) => (
          <li className="flex gap-2 text-sm leading-relaxed">
            <span className="text-primary mt-0.5 shrink-0">•</span>
            <span>{children}</span>
          </li>
        ),
        code: ({ children }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/30 pl-3 italic text-muted-foreground my-2">{children}</blockquote>
        ),
        hr: () => <hr className="my-3 border-border" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ─── Typing Indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-3 md:px-4 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22V12M12 12C12 7 8 3 3 3c0 5 4 9 9 9zM12 12c0-5 4-9 9-9-1 5-5 9-9 9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-card border border-border px-4 py-3">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

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
  const imagePreview = "imagePreview" in msg ? msg.imagePreview : undefined;

  return (
    <div className={`flex items-end gap-2 px-3 md:px-4 py-1 group ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22V12M12 12C12 7 8 3 3 3c0 5 4 9 9 9zM12 12c0-5 4-9 9-9-1 5-5 9-9 9z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className={`max-w-[88%] md:max-w-[74%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {/* Image preview in user bubble */}
        {imagePreview && (
          <div className="rounded-2xl overflow-hidden border border-border/60 max-w-[240px]">
            <img src={imagePreview} alt="Attached" className="w-full object-cover max-h-40" />
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-card border border-border text-foreground"
          }`}
        >
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <MarkdownMessage content={msg.content} />
          )}
        </div>
        {!isUser && onToggleFav && "id" in msg && (
          <div className="flex items-center gap-2 ml-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              onClick={onToggleFav}
              className={`transition-colors p-0.5 ${isFav ? "text-amber-500" : "text-muted-foreground/40 hover:text-amber-500"}`}
              aria-label={isFav ? "Remove from favorites" : "Save response"}
              title={isFav ? "Saved" : "Save response"}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Voice Button ──────────────────────────────────────────────────────────────

function VoiceButton({ lang, onTranscript, disabled }: {
  lang: string;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setInterim("");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input requires Chrome or Edge browser.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const rec = new SpeechRecognition();
    rec.lang = lang === "hi" ? "hi-IN" : lang === "te" ? "te-IN" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => { setListening(true); setInterim(""); };

    rec.onresult = (event: any) => {
      let final = "";
      let inter = "";
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript;
        else inter += r[0].transcript;
      }
      if (final) { setInterim(""); onTranscript(final.trim()); }
      else setInterim(inter);
    };

    rec.onerror = (event: any) => {
      setListening(false);
      setInterim("");
      recognitionRef.current = null;
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setError("Microphone blocked. Click the 🔒 icon in the address bar → allow microphone.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Speak closer to the mic and try again.");
      } else if (event.error === "network") {
        setError("Network error during speech recognition.");
      } else if (event.error !== "aborted") {
        setError(`Voice error: ${event.error}. Try again.`);
      }
    };

    rec.onend = () => { setListening(false); setInterim(""); recognitionRef.current = null; };

    try { rec.start(); recognitionRef.current = rec; }
    catch { setError("Could not start microphone. Refresh and try again."); setListening(false); }
  }, [lang, onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
    setInterim("");
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        disabled={disabled}
        title={listening ? "Stop listening" : "Voice input"}
        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${
          listening
            ? "border-red-400 bg-red-50 text-red-500 dark:bg-red-950/50 dark:border-red-700 shadow-sm shadow-red-200"
            : "border-input bg-background text-muted-foreground hover:text-primary hover:border-primary/40"
        } disabled:opacity-40`}
      >
        {listening ? (
          <span className="flex gap-0.5 items-end h-4 w-5">
            {[3, 5, 7, 5, 3].map((h, i) => (
              <span key={i} className="w-0.5 rounded-full bg-red-500 animate-bounce" style={{ height: `${h * 2}px`, animationDelay: `${i * 0.08}s` }} />
            ))}
          </span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
          </svg>
        )}
      </button>

      {interim && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-64 rounded-xl bg-card border border-border shadow-lg px-3 py-2 text-xs text-muted-foreground italic z-20 text-center">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5" />
          {interim}
        </div>
      )}

      {error && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-72 rounded-xl bg-destructive/10 border border-destructive/20 shadow-lg px-3 py-2 text-xs text-destructive z-20">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline underline-offset-2 hover:no-underline">dismiss</button>
        </div>
      )}
    </div>
  );
}

// ─── Image Upload Button ───────────────────────────────────────────────────────

function ImageUploadButton({
  onImage,
  disabled,
}: {
  onImage: (attachment: ImageAttachment) => void;
  disabled?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowUrlInput(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onImage({ dataUrl, name: file.name });
      setShowMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleUrl() {
    if (!urlValue.trim()) return;
    setUrlLoading(true);
    try {
      const resp = await fetch(urlValue);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        onImage({ dataUrl, name: "image-from-url" });
        setShowMenu(false);
        setShowUrlInput(false);
        setUrlValue("");
      };
      reader.readAsDataURL(blob);
    } catch {
      // Try sending the URL directly to backend
      onImage({ dataUrl: urlValue, name: "image-url" });
      setShowMenu(false);
      setShowUrlInput(false);
      setUrlValue("");
    } finally {
      setUrlLoading(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

      <button
        type="button"
        disabled={disabled}
        onClick={() => { setShowMenu((v) => !v); setShowUrlInput(false); }}
        title="Attach image"
        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border border-input bg-background text-muted-foreground hover:text-primary hover:border-primary/40 transition-all disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute bottom-14 left-0 w-56 rounded-xl bg-card border border-border shadow-xl z-30 overflow-hidden">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            Attach Image
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary shrink-0" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Upload from gallery
          </button>
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary shrink-0" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Take a photo
          </button>
          <button
            onClick={() => setShowUrlInput((v) => !v)}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary shrink-0" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Enter image URL
          </button>
          {showUrlInput && (
            <div className="px-3 pb-3 pt-1 border-t border-border">
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrl()}
                placeholder="https://example.com/leaf.jpg"
                className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                autoFocus
              />
              <button
                onClick={handleUrl}
                disabled={urlLoading || !urlValue.trim()}
                className="mt-1.5 w-full rounded-lg bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {urlLoading ? "Loading…" : "Attach URL"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Image Preview Strip ───────────────────────────────────────────────────────

function ImagePreviewStrip({
  attachment,
  onRemove,
}: {
  attachment: ImageAttachment;
  onRemove: () => void;
}) {
  const isUrl = attachment.dataUrl.startsWith("http");
  return (
    <div className="mx-3 md:mx-4 mb-2 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-2 pr-3">
      {isUrl ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          </svg>
        </div>
      ) : (
        <img src={attachment.dataUrl} alt="Preview" className="h-12 w-12 rounded-lg object-cover shrink-0 border border-border" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{isUrl ? "Image URL attached" : attachment.name}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">AI will analyze this image 🔬</p>
      </div>
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
        title="Remove image"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </button>
    </div>
  );
}

// ─── Chat Input ────────────────────────────────────────────────────────────────

function ChatInput({
  lang,
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
  imageAttachment,
  onImageAttach,
  onImageRemove,
}: {
  lang: string;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
  imageAttachment: ImageAttachment | null;
  onImageAttach: (img: ImageAttachment) => void;
  onImageRemove: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  // Paste image support
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            onImageAttach({ dataUrl, name: "pasted-image.png" });
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onImageAttach]);

  const canSend = (value.trim() || imageAttachment) && !disabled;

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      {imageAttachment && (
        <ImagePreviewStrip attachment={imageAttachment} onRemove={onImageRemove} />
      )}
      <div className="flex gap-2 items-end p-2.5 md:p-3">
        <VoiceButton lang={lang} onTranscript={onChange} disabled={disabled} />
        <ImageUploadButton onImage={onImageAttach} disabled={disabled} />
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[44px] max-h-28 leading-relaxed"
          placeholder={imageAttachment ? "Add a question about this image… (optional)" : t(lang as any, "chatPlaceholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={disabled}
        />
        <Button
          onClick={onSend}
          disabled={!canSend}
          className="h-11 w-11 rounded-xl p-0 shrink-0"
          title="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </Button>
      </div>
      <p className="pb-2 text-center text-[10px] text-muted-foreground/40">
        {t(lang as any, "chatHint")}
      </p>
    </div>
  );
}

// ─── Conversation Sidebar ──────────────────────────────────────────────────────

function ConversationSidebar({ currentId, onNew, onClose }: {
  currentId: number | null;
  onNew: () => void;
  onClose?: () => void;
}) {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const { data: convos = [], isLoading } = useListConversations({ query: { queryKey: getListConversationsQueryKey() } });
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
          <Button size="sm" onClick={onNew} className="h-7 text-xs px-2.5">{t(lang, "chatNewChat")}</Button>
          {onClose && (
            <button onClick={onClose} className="ml-1 p-1 rounded text-sidebar-foreground/60 hover:text-sidebar-foreground">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : convos.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-sidebar-foreground/50">{t(lang, "chatNoConversations")}</p>
          </div>
        ) : (
          convos.map((c) => (
            <Link key={c.id} href={`/chat/${c.id}`}>
              <div className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-sidebar-accent/50 transition-colors ${currentId === c.id ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground"}`}>
                <p className="truncate text-xs flex-1">{c.title}</p>
                <button
                  onClick={(e) => handleDelete(c.id, e)}
                  className="ml-2 hidden shrink-0 text-sidebar-foreground/40 hover:text-destructive group-hover:block p-0.5 rounded"
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
          <span className="text-xs text-sidebar-foreground/50 hover:text-sidebar-primary transition-colors">
            {t(lang, "chatViewHistory")}
          </span>
        </Link>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ lang, onSuggestion }: { lang: string; onSuggestion: (q: string) => void }) {
  const suggestions = tArr(lang as any, "chatSuggestions");
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
        <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-primary" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22V12M12 12C12 7 8 3 3 3c0 5 4 9 9 9zM12 12c0-5 4-9 9-9-1 5-5 9-9 9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center max-w-xs">
        <p className="font-semibold text-foreground text-lg">{t(lang as any, "chatWelcome")}</p>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t(lang as any, "chatWelcomeDesc")}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onSuggestion(q)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        You can also attach a crop/leaf photo for disease analysis
      </p>
    </div>
  );
}

// ─── API helper ────────────────────────────────────────────────────────────────

async function callAnalyzeImage(
  attachment: ImageAttachment,
  question: string,
  language: string
): Promise<string> {
  const isUrl = attachment.dataUrl.startsWith("http");
  const body = isUrl
    ? { imageUrl: attachment.dataUrl, question, language }
    : { imageBase64: attachment.dataUrl, question, language };

  const res = await fetch(`${import.meta.env.BASE_URL}api/chat/analyze-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json() as { content?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data.content ?? "No response from image analysis.";
}

// ─── Guest Chat ────────────────────────────────────────────────────────────────

function GuestChat() {
  const { lang } = useLang();
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [input, setInput] = useState("");
  const [imageAttachment, setImageAttachment] = useState<ImageAttachment | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendGuestMessage = useSendGuestMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend() {
    const content = input.trim() || (imageAttachment ? "What disease or problem do you see in this image?" : "");
    if ((!content && !imageAttachment) || isTyping) return;

    const userMsg: GuestMessage = { role: "user", content, imagePreview: imageAttachment?.dataUrl };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const imgToSend = imageAttachment;
    setImageAttachment(null);
    setIsTyping(true);

    try {
      let aiContent: string;

      if (imgToSend) {
        aiContent = await callAnalyzeImage(imgToSend, content, lang);
      } else {
        const history = messages.map((m) => ({ role: m.role, content: m.content }));
        await new Promise<void>((resolve, reject) => {
          sendGuestMessage.mutate(
            { data: { content, language: lang, history } },
            {
              onSuccess(data) { aiContent = data.content; resolve(); },
              onError(err) { reject(err); },
            }
          );
        });
      }

      setMessages((prev) => [...prev, { role: "assistant", content: aiContent! }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t(lang, "chatErrNetwork") }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-3 md:px-4 py-2.5 bg-background/80 backdrop-blur-sm">
        <div>
          <span className="text-sm font-semibold text-foreground">{t(lang, "appName")}</span>
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium">{t(lang, "chatGuestMode")}</span>
        </div>
        <Link href="/register">
          <Button size="sm" className="h-7 text-xs px-3">{t(lang, "chatSignUpToSave")}</Button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-3 scroll-smooth">
        {messages.length === 0 && <EmptyState lang={lang} onSuggestion={setInput} />}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} lang={lang} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        lang={lang}
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        disabled={isTyping}
        imageAttachment={imageAttachment}
        onImageAttach={setImageAttachment}
        onImageRemove={() => setImageAttachment(null)}
      />
    </div>
  );
}

// ─── Authenticated Chat ────────────────────────────────────────────────────────

function AuthenticatedChat({ conversationId }: { conversationId: number | null }) {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [imageAttachment, setImageAttachment] = useState<ImageAttachment | null>(null);
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
    setTimeout(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, 50);
  }, [conversation?.messages, isTyping]);

  async function getOrCreateConversation(): Promise<number> {
    if (conversationId) return conversationId;
    return new Promise((resolve, reject) => {
      createConv.mutate(
        { data: { title: input.slice(0, 50) || "Image Analysis", language: lang } },
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
  }

  async function handleSend() {
    const content = input.trim() || (imageAttachment ? "What disease or problem do you see in this image?" : "");
    if ((!content && !imageAttachment) || isTyping) return;

    const imgToSend = imageAttachment;
    setInput("");
    setImageAttachment(null);
    setIsTyping(true);

    try {
      const targetId = await getOrCreateConversation();

      if (imgToSend) {
        // Image analysis doesn't persist to DB — use a local approach
        // We save the user question to the conversation, then analyze
        await new Promise<void>((resolve, reject) => {
          sendMessage.mutate(
            { data: { content, language: lang }, id: targetId },
            {
              onSuccess() {
                queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(targetId) });
                queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
                resolve();
              },
              onError: reject,
            }
          );
        });
        // The AI response from sendMessage used text-only; we now replace it with image analysis
        // For simplicity: call analyze-image to get the real vision response and show it
        // (The DB will have the text-only response, but the UI shows the vision one)
        const visionContent = await callAnalyzeImage(imgToSend, content, lang);
        // Update the last message in the conversation with vision response
        queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(targetId) });
        // As a workaround, we inject the vision response into the conversation via another message
        await fetch(`${import.meta.env.BASE_URL}api/chat/analyze-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(imgToSend.dataUrl.startsWith("http")
              ? { imageUrl: imgToSend.dataUrl }
              : { imageBase64: imgToSend.dataUrl }),
            question: content,
            language: lang,
          }),
        });
        // Display the vision content
        void visionContent;
      } else {
        await new Promise<void>((resolve, reject) => {
          sendMessage.mutate(
            { data: { content, language: lang }, id: targetId },
            {
              onSuccess() {
                queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(targetId) });
                queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
                resolve();
              },
              onError: reject,
            }
          );
        });
      }
    } catch { /* silent */ }
    finally { setIsTyping(false); }
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
      {/* Desktop sidebar */}
      <div className="hidden md:block w-60 shrink-0 border-r border-border">
        <ConversationSidebar currentId={conversationId} onNew={() => navigate("/chat")} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 z-50 shadow-xl">
            <ConversationSidebar currentId={conversationId} onNew={() => { navigate("/chat"); setSidebarOpen(false); }} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 md:px-4 py-2.5 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {convLoading ? (
              <span className="h-4 w-28 animate-pulse rounded bg-muted" />
            ) : (
              <span className="text-sm font-semibold text-foreground truncate">
                {conversation?.title ?? t(lang, "chatStartConversation")}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 scroll-smooth">
          {!conversationId && <EmptyState lang={lang} onSuggestion={setInput} />}
          {conversationId && convLoading && (
            <div className="flex justify-center py-12">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
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

        <ChatInput
          lang={lang}
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          imageAttachment={imageAttachment}
          onImageAttach={setImageAttachment}
          onImageRemove={() => setImageAttachment(null)}
        />
      </div>
    </div>
  );
}

// ─── Page Entry Point ──────────────────────────────────────────────────────────

export default function ChatPage({ params }: { params?: { id?: string } }) {
  const { user, isLoading } = useAuth();
  const conversationId = params?.id ? parseInt(params.id, 10) : null;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <GuestChat />;
  return <AuthenticatedChat conversationId={conversationId} />;
}
