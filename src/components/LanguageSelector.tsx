import { useRef, useState, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGUAGES, useLanguage } from "@/contexts/LanguageContext";

export function LanguageSelector() {
  const { lang, changeLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 text-sm font-medium",
          "transition-all hover:bg-muted hover:border-primary/40 hover:text-primary",
          open && "bg-muted border-primary/40 text-primary",
        )}
      >
        <Globe className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline max-w-[72px] truncate text-sm">
          {active.native}
        </span>
        <ChevronDown className={cn("h-3 w-3 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-[99] w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Select Language
            </p>
          </div>

          <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
            {LANGUAGES.map((language) => (
              <li key={language.code} role="option" aria-selected={lang === language.code}>
                <button
                  onClick={() => {
                    setOpen(false);
                    changeLang(language.code);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted",
                    lang === language.code && "text-primary font-medium bg-primary/5",
                  )}
                >
                  <span className="flex flex-col items-start leading-tight">
                    <span>{language.native}</span>
                    <span className="text-[10px] text-muted-foreground">{language.label}</span>
                  </span>
                  {lang === language.code && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}