import { createContext, useContext, useState, ReactNode } from "react";

export const LANGUAGES = [
  { code: "en", native: "English",   label: "English"   },
  { code: "hi", native: "हिन्दी",    label: "Hindi"     },
  { code: "mr", native: "मराठी",     label: "Marathi"   },
  { code: "pa", native: "ਪੰਜਾਬੀ",   label: "Punjabi"   },
  { code: "gu", native: "ગુજરાતી",  label: "Gujarati"  },
  { code: "bn", native: "বাংলা",    label: "Bengali"   },
  { code: "ta", native: "தமிழ்",    label: "Tamil"     },
  { code: "te", native: "తెలుగు",   label: "Telugu"    },
  { code: "kn", native: "ಕನ್ನಡ",    label: "Kannada"   },
  { code: "ml", native: "മലയാളം",   label: "Malayalam" },
  { code: "ur", native: "اردو",      label: "Urdu"      },
  { code: "or", native: "ଓଡ଼ିଆ",    label: "Odia"      },
];

/** Read the active language from the googtrans cookie */
function readLangFromCookie(): string {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return m ? m[1] : (localStorage.getItem("fasalseva_lang") ?? "en");
}

interface LanguageContextType {
  lang: string;
  changeLang: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  changeLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Only used for the UI to show the correct native name in the button
  const [lang] = useState<string>(readLangFromCookie);

  /**
   * Set the googtrans cookie then reload — Google Translate reads the
   * cookie on page load and translates ALL text automatically.
   */
  function changeLang(code: string) {
    const hostname = window.location.hostname;

    if (code === "en") {
      // Clear cookie to restore original language
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname}`;
      localStorage.removeItem("fasalseva_lang");
    } else {
      document.cookie = `googtrans=/en/${code}; path=/`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=.${hostname}`;
      localStorage.setItem("fasalseva_lang", code);
    }

    // Reload so Google Translate processes the cookie on fresh page load
    window.location.reload();
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}