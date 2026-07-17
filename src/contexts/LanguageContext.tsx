import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations } from "@/constants/translations";

export const LANGUAGES = [
  { code: "en", native: "English", label: "English" },
  { code: "hi", native: "हिन्दी", label: "Hindi" },
  { code: "mr", native: "मराठी", label: "Marathi" },
];

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: string;
  changeLang: (code: string) => void;
  t: (key: TranslationKey | string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  changeLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("fasalseva_lang");
    if (savedLang && LANGUAGES.find(l => l.code === savedLang)) {
      setLang(savedLang);
    }
  }, []);

  function changeLang(code: string) {
    if (LANGUAGES.find(l => l.code === code)) {
      setLang(code);
      localStorage.setItem("fasalseva_lang", code);
    }
  }

  function t(key: string): string {
    const dict = translations[lang as keyof typeof translations] || translations.en;
    return (dict as any)[key] || key; // fallback to key itself if missing
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}