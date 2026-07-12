import { useState } from "react";
import { useListFaq, getListFaqQueryKey } from "@workspace/api-client-react";
import { useLang } from "@/contexts/language";
import { t } from "@/i18n";
import type { Lang } from "@/i18n";

export default function FaqPage() {
  const { lang } = useLang();
  const { data: faqItems = [], isLoading } = useListFaq({
    query: { queryKey: getListFaqQueryKey() },
  });
  const [openId, setOpenId] = useState<number | null>(null);

  const categories = [...new Set(faqItems.map((f) => f.category))];

  function getQuestion(item: typeof faqItems[0]) {
    if (lang === "te" && item.questionTelugu) return item.questionTelugu;
    return item.question;
  }

  function getAnswer(item: typeof faqItems[0]) {
    if (lang === "te" && item.answerTelugu) return item.answerTelugu;
    return item.answer;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t(lang, "faqTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t(lang, "faqSubtitle")}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : faqItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t(lang, "noData")}</p>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const items = faqItems.filter((f) => f.category === category);
            return (
              <div key={category}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">{category}</h2>
                <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                  {items.map((item) => {
                    const isOpen = openId === item.id;
                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40 focus:outline-none"
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                          aria-expanded={isOpen}
                        >
                          <span className="text-sm font-medium text-foreground leading-snug">
                            {getQuestion(item)}
                          </span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96" : "max-h-0"}`}
                        >
                          <div className="px-5 pb-5 pt-1">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {getAnswer(item)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prompt to chat */}
      <div className="mt-10 rounded-xl border border-border bg-primary/5 p-5 text-center">
        <p className="text-sm font-medium text-foreground">
          {lang === "hi" ? "अपना प्रश्न नहीं मिला?" : lang === "te" ? "మీ ప్రశ్న కనుగొనలేదా?" : "Didn't find your question?"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {lang === "hi" ? "AI से सीधे पूछें — हिंदी, तेलुगु या अंग्रेजी में।" : lang === "te" ? "AI తో నేరుగా మాట్లాడండి — తెలుగు, హిందీ లేదా ఇంగ్లీషులో." : "Ask our AI directly — in English, Hindi, or Telugu."}
        </p>
        <a
          href="/chat"
          className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t(lang as Lang, "heroCta")}
        </a>
      </div>
    </div>
  );
}
