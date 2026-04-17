import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Lang } from "@/i18n/strings";
import { t as translate } from "@/i18n/strings";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Parameters<typeof translate>[0]) => string;
}

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("km_lang");
    return (saved === "hi" || saved === "en") ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("km_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang: setLangState, t: (k) => translate(k, lang) }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be inside LanguageProvider");
  return ctx;
}
