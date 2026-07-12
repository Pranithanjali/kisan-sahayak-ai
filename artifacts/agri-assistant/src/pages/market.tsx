import { useState } from "react";
import {
  useListMarketPrices,
  useListGovernmentSchemes,
  useListSeasonalTips,
  getListMarketPricesQueryKey,
  getListGovernmentSchemesQueryKey,
  getListSeasonalTipsQueryKey,
} from "@workspace/api-client-react";
import { useLang } from "@/contexts/language";
import { t } from "@/i18n";
import type { Lang } from "@/i18n";

const SEASON_COLORS: Record<string, string> = {
  Kharif: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Rabi: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Summer: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Annual: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "All Seasons": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

export default function MarketPage() {
  const { lang } = useLang();
  const { data: prices = [], isLoading: pricesLoading } = useListMarketPrices({ query: { queryKey: getListMarketPricesQueryKey() } });
  const { data: schemes = [], isLoading: schemesLoading } = useListGovernmentSchemes({ query: { queryKey: getListGovernmentSchemesQueryKey() } });
  const { data: tips = [], isLoading: tipsLoading } = useListSeasonalTips({ query: { queryKey: getListSeasonalTipsQueryKey() } });
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const today = new Date().toLocaleDateString(
    lang === "hi" ? "hi-IN" : lang === "te" ? "te-IN" : "en-IN",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t(lang as Lang, "marketTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t(lang as Lang, "marketSubtitle")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Market Prices */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{t(lang as Lang, "marketPrices")}</h2>
            <span className="text-xs text-muted-foreground">{today}</span>
          </div>
          {pricesLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : prices.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t(lang as Lang, "marketNoData")}</p>
          ) : (
            <div className="space-y-2">
              {prices.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/20 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{p.cropName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.market}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-base">
                      ₹{Number(p.price).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {t(lang as Lang, "marketLastUpdated")}: {today}
          </p>
        </section>

        {/* Seasonal Tips */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">{t(lang as Lang, "marketSeasonalTips")}</h2>
          {tipsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : tips.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t(lang as Lang, "marketNoData")}</p>
          ) : (
            <div className="space-y-3">
              {tips.map((tip) => {
                const isExpanded = expandedTip === tip.id;
                const colorClass = SEASON_COLORS[tip.season] ?? "bg-muted text-muted-foreground";
                return (
                  <div key={tip.id} className="rounded-xl border border-border bg-card overflow-hidden">
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                      onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                    >
                      <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                        {tip.season}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">
                          {tip.title}
                        </p>
                        {!isExpanded && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {tip.content}
                          </p>
                        )}
                      </div>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? "max-h-96" : "max-h-0"}`}>
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tip.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Government Schemes */}
      <section className="mt-10">
        <h2 className="mb-5 text-lg font-semibold text-foreground">{t(lang as Lang, "marketSchemes")}</h2>
        {schemesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(lang as Lang, "marketNoData")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schemes.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-foreground leading-snug">{s.name}</h3>
                  {s.benefits && (
                    <span className="shrink-0 text-xs font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                      {s.benefits.length > 20 ? s.benefits.slice(0, 20) + "…" : s.benefits}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{s.description}</p>
                {s.eligibility && (
                  <p className="text-xs text-foreground/60">
                    <span className="font-medium">
                      {lang === "hi" ? "पात्रता:" : lang === "te" ? "అర్హత:" : "Eligibility:"}
                    </span>{" "}
                    {s.eligibility}
                  </p>
                )}
                <a
                  href="/chat"
                  className="mt-1 text-xs text-primary hover:underline"
                >
                  {t(lang as Lang, "marketLearnMore")}
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
