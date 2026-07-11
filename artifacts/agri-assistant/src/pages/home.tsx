import { Link } from "wouter";
import { useListCrops, useListMarketPrices, useListGovernmentSchemes, getListCropsQueryKey, getListMarketPricesQueryKey, getListGovernmentSchemesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    title: "Crop Guidance",
    desc: "Get expert advice on when and how to grow any crop suited to your region and season.",
    icon: "M12 2C7 2 3 7 3 12s4 10 9 10 9-4.5 9-10S17 2 12 2z",
  },
  {
    title: "Disease Diagnosis",
    desc: "Describe symptoms and get instant identification with treatment and prevention guidance.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Market Prices",
    desc: "Live mandi prices from across India to help you sell at the right time and place.",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
  {
    title: "Telugu Support",
    desc: "Full support in Telugu so every farmer can access expert knowledge in their own language.",
    icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.619 3 18.129",
  },
  {
    title: "Government Schemes",
    desc: "Stay updated on PM-KISAN, crop insurance, subsidies, and other farmer welfare programs.",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    title: "Seasonal Tips",
    desc: "Timely advice for soil preparation, irrigation, pest control, and post-harvest management.",
    icon: "M12 3v1m0 16v1M3 12h1m16 0h1M5.636 5.636l.707.707M17.657 17.657l.707.707M5.636 18.364l.707-.707M17.657 6.343l.707-.707",
  },
];

export default function HomePage() {
  const { data: crops = [] } = useListCrops({
    query: { queryKey: getListCropsQueryKey() },
  });
  const { data: prices = [] } = useListMarketPrices({
    query: { queryKey: getListMarketPricesQueryKey() },
  });
  const { data: schemes = [] } = useListGovernmentSchemes({
    query: { queryKey: getListGovernmentSchemesQueryKey() },
  });

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary px-4 py-20 text-center">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 11px)`,
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm text-white">
            <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
            AI-Powered Agriculture Assistant
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Your Expert Farm Advisor,<br />Always Available
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Ask anything about crops, diseases, fertilizers, market prices, or government schemes — in English or Telugu.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/chat">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg w-full sm:w-auto">
                Start Chatting Free
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/60">No account needed · Free to use · Telugu supported</p>
        </div>
      </section>

      <section className="bg-background py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-foreground mb-10">Everything a farmer needs</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary" stroke="currentColor" strokeWidth="1.5">
                    <path d={feat.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">{feat.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {crops.length > 0 && (
        <section className="bg-muted/40 py-16 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Crops We Know</h2>
              <Link href="/chat">
                <Button variant="outline" size="sm">Ask about any crop</Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {crops.slice(0, 6).map((crop) => (
                <div key={crop.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {crop.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground">{crop.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{crop.season} · {crop.soilType}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {prices.length > 0 && (
        <section className="bg-background py-16 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Live Market Prices</h2>
              <Link href="/market">
                <Button variant="outline" size="sm">View all</Button>
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {prices.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <span className="text-sm font-medium text-foreground">{p.cropName}</span>
                  <span className="font-bold text-primary">₹{Number(p.price).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {schemes.length > 0 && (
        <section className="bg-muted/40 py-16 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Government Schemes</h2>
              <Link href="/market">
                <Button variant="outline" size="sm">View all</Button>
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {schemes.slice(0, 4).map((s) => (
                <div key={s.id} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-primary leading-tight">{s.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-primary py-16 px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-white">Ready to grow smarter?</h2>
          <p className="mt-2 text-white/80">Join farmers already using KrishiAI for better harvests.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/chat">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold w-full sm:w-auto">
                Chat now, no signup needed
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
