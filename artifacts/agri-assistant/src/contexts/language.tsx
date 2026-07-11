import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "@/i18n";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Lang) ?? "en";
    }
    return "en";
  });

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : lang === "te" ? "te" : "en";
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
