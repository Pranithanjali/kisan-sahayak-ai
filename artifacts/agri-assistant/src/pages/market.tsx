import {
  useListMarketPrices,
  useListGovernmentSchemes,
  useListSeasonalTips,
  getListMarketPricesQueryKey,
  getListGovernmentSchemesQueryKey,
  getListSeasonalTipsQueryKey,
} from "@workspace/api-client-react";

function PriceCard({ cropName, price, unit, market, date }: {
  cropName: string; price: number; unit: string; market: string; date: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
      <div>
        <p className="font-semibold text-sm text-foreground">{cropName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{market}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary">
          ₹{Number(price).toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </div>
    </div>
  );
}

const SEASON_COLORS: Record<string, string> = {
  Kharif: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Rabi: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Summer: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Annual: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

export default function MarketPage() {
  const { data: prices = [], isLoading: pricesLoading } = useListMarketPrices({
    query: { queryKey: getListMarketPricesQueryKey() },
  });
  const { data: schemes = [], isLoading: schemesLoading } = useListGovernmentSchemes({
    query: { queryKey: getListGovernmentSchemesQueryKey() },
  });
  const { data: tips = [], isLoading: tipsLoading } = useListSeasonalTips({
    query: { queryKey: getListSeasonalTipsQueryKey() },
  });

  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Farm Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Market prices, government schemes, and seasonal tips</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Today's Market Prices</h2>
            <span className="text-xs text-muted-foreground">{today}</span>
          </div>
          {pricesLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : prices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No price data available</p>
          ) : (
            <div className="space-y-2">
              {prices.map((p) => (
                <PriceCard key={p.id} {...p} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Seasonal Tips</h2>
          {tipsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {tips.map((tip) => (
                <div key={tip.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        SEASON_COLORS[tip.season] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tip.season}
                    </span>
                    <span className="text-xs text-muted-foreground">{tip.category}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">{tip.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Government Schemes</h2>
        {schemesLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold text-sm text-primary leading-tight">{scheme.name}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {scheme.description}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-foreground">
                    <span className="font-medium">Benefits: </span>
                    <span className="text-muted-foreground line-clamp-1">{scheme.benefits}</span>
                  </p>
                </div>
                {scheme.applicationUrl && (
                  <a
                    href={scheme.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-primary hover:underline"
                  >
                    Apply online
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
