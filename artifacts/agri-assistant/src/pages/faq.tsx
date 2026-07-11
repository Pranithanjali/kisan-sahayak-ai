import { useState } from "react";
import { useListFaq, getListFaqQueryKey } from "@workspace/api-client-react";

export default function FaqPage() {
  const { data: faqItems = [], isLoading } = useListFaq({
    query: { queryKey: getListFaqQueryKey() },
  });
  const [lang, setLang] = useState<"en" | "te">("en");
  const [open, setOpen] = useState<number | null>(null);

  const categories = [...new Set(faqItems.map((f) => f.category))];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Common farming questions answered</p>
        </div>
        <div className="flex rounded-md border border-border overflow-hidden">
          {(["en", "te"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                lang === l
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {l === "en" ? "English" : "Telugu"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{category}</h2>
              <div className="divide-y divide-border rounded-lg border border-border bg-card overflow-hidden">
                {faqItems
                  .filter((f) => f.category === category)
                  .map((item) => (
                    <div key={item.id}>
                      <button
                        className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-muted/50 transition-colors"
                        onClick={() => setOpen(open === item.id ? null : item.id)}
                      >
                        <span className="text-sm font-medium text-foreground pr-4">
                          {lang === "te" && item.questionTelugu ? item.questionTelugu : item.question}
                        </span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                            open === item.id ? "rotate-180" : ""
                          }`}
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {open === item.id && (
                        <div className="bg-muted/30 px-4 pb-4 pt-1">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {lang === "te" && item.answerTelugu ? item.answerTelugu : item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
