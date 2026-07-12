import { Link } from "wouter";
import { useListCrops, useListMarketPrices, useListGovernmentSchemes, getListCropsQueryKey, getListMarketPricesQueryKey, getListGovernmentSchemesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/language";
import { t } from "@/i18n";

export default function HomePage() {
  const { lang } = useLang();
  const { data: crops = [] } = useListCrops(undefined, { query: { queryKey: getListCropsQueryKey() } });
  const { data: prices = [] } = useListMarketPrices({ query: { queryKey: getListMarketPricesQueryKey() } });
  const { data: schemes = [] } = useListGovernmentSchemes({ query: { queryKey: getListGovernmentSchemesQueryKey() } });

  const FEATURES = [
    { title: t(lang, "featCropTitle"), desc: t(lang, "featCropDesc"), icon: "M12 22V12M12 12C12 7 8 3 3 3c0 5 4 9 9 9zM12 12c0-5 4-9 9-9-1 5-5 9-9 9z" },
    { title: t(lang, "featDiseaseTitle"), desc: t(lang, "featDiseaseDesc"), icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: t(lang, "featMarketTitle"), desc: t(lang, "featMarketDesc"), icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
    { title: t(lang, "featLangTitle"), desc: t(lang, "featLangDesc"), icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.619 3 18.129" },
    { title: t(lang, "featSchemesTitle"), desc: t(lang, "featSchemesDesc"), icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { title: t(lang, "featSeasonalTitle"), desc: t(lang, "featSeasonalDesc"), icon: "M12 3v1m0 16v1M3 12h1m16 0h1M5.636 5.636l.707.707M17.657 17.657l.707.707M5.636 18.364l.707-.707M17.657 6.343l.707-.707" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary px-4 py-20 text-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 11px)` }}
        />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm text-white">
            <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
            {t(lang, "appTagline")}
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            {t(lang, "heroTitle")}
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            {t(lang, "heroDesc")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/chat">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg w-full sm:w-auto">
                {t(lang, "heroCta")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                {t(lang, "heroCtaRegister")}
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/60">{t(lang, "heroFine")}</p>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-background px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground">{t(lang, "featEverything")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary" stroke="currentColor" strokeWidth="1.5">
                    <path d={f.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="mb-1.5 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live data strip */}
      {(crops.length > 0 || prices.length > 0) && (
        <section className="bg-muted/40 px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-3">
              {crops.length > 0 && (
                <div>
                  <h3 className="mb-4 font-semibold text-foreground">{t(lang, "homeRecentCrops")}</h3>
                  <div className="space-y-2">
                    {crops.slice(0, 5).map((crop) => (
                      <div key={crop.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {lang === "te" && crop.nameTelugu ? crop.nameTelugu : crop.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{crop.season}</p>
                        </div>
                        <Link href="/chat">
                          <span className="text-xs text-primary hover:underline cursor-pointer">Ask AI →</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {prices.length > 0 && (
                <div>
                  <h3 className="mb-4 font-semibold text-foreground">{t(lang, "homeMarketPrices")}</h3>
                  <div className="space-y-2">
                    {prices.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{p.cropName}</p>
                        <span className="text-sm font-bold text-primary">₹{Number(p.price).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/market">
                    <p className="mt-3 text-xs text-primary hover:underline cursor-pointer">{t(lang, "homeViewMarket")}</p>
                  </Link>
                </div>
              )}

              {schemes.length > 0 && (
                <div>
                  <h3 className="mb-4 font-semibold text-foreground">{t(lang, "homeGovtSchemes")}</h3>
                  <div className="space-y-2">
                    {schemes.slice(0, 4).map((s) => (
                      <div key={s.id} className="rounded-lg border border-border bg-card px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="bg-primary/5 px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground">{t(lang, "homeCta")}</h2>
          <p className="mt-3 text-muted-foreground">{t(lang, "homeCtaDesc")}</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/chat">
              <Button size="lg" className="font-semibold w-full sm:w-auto">
                {t(lang, "homeCtaBtn")}
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t(lang, "homeAvailable")}</p>
        </div>
      </section>
    </div>
  );
}
