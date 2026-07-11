import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth";
import { ThemeProvider } from "@/contexts/theme";
import { LanguageProvider } from "@/contexts/language";
import Header from "@/components/layout/Header";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import ChatPage from "@/pages/chat";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import HistoryPage from "@/pages/history";
import FavoritesPage from "@/pages/favorites";
import FaqPage from "@/pages/faq";
import MarketPage from "@/pages/market";
import SettingsPage from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if ((error as { status?: number })?.status === 401) return false;
        if ((error as { status?: number })?.status === 404) return false;
        return failureCount < 2;
      },
      staleTime: 30 * 1000,
    },
  },
});

function AppLayout() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/chat">
        {() => (
          <div className="flex h-screen flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <ChatPage />
            </div>
          </div>
        )}
      </Route>
      <Route path="/chat/:id">
        {(params) => (
          <div className="flex h-screen flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <ChatPage params={{ id: params.id }} />
            </div>
          </div>
        )}
      </Route>
      <Route>
        {() => (
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Switch>
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
                <Route path="/history" component={HistoryPage} />
                <Route path="/favorites" component={FavoritesPage} />
                <Route path="/faq" component={FaqPage} />
                <Route path="/market" component={MarketPage} />
                <Route path="/settings" component={SettingsPage} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AppLayout />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
