import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en",    native: "English",   label: "English"   },
  { code: "hi",    native: "हिन्दी",    label: "Hindi"     },
  { code: "mr",    native: "मराठी",     label: "Marathi"   },
  { code: "pa",    native: "ਪੰਜਾਬੀ",   label: "Punjabi"   },
  { code: "gu",    native: "ગુજરાતી",  label: "Gujarati"  },
  { code: "bn",    native: "বাংলা",    label: "Bengali"   },
  { code: "ta",    native: "தமிழ்",    label: "Tamil"     },
  { code: "te",    native: "తెలుగు",   label: "Telugu"    },
  { code: "kn",    native: "ಕನ್ನಡ",    label: "Kannada"   },
  { code: "ml",    native: "മലയാളം",   label: "Malayalam" },
  { code: "ur",    native: "اردو",      label: "Urdu"      },
  { code: "or",    native: "ଓଡ଼ିଆ",    label: "Odia"      },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

/**
 * Wait for a DOM element matching `selector` to appear,
 * using MutationObserver (no polling, no refresh needed).
 */
function waitForElement(selector: string, timeout = 8000): Promise<HTMLElement | null> {
  return new Promise(resolve => {
    const existing = document.querySelector<HTMLElement>(selector);
    if (existing) { resolve(existing); return; }

    const observer = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) { observer.disconnect(); resolve(el); }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); resolve(null); }, timeout);
  });
}

/**
 * Trigger Google Translate's hidden select to switch language — no page reload needed.
 */
async function doTranslate(langCode: string) {
  const sel = await waitForElement(".goog-te-combo") as HTMLSelectElement | null;
  if (!sel) { console.warn("[GT] .goog-te-combo not found"); return; }
  sel.value = langCode === "en" ? "" : langCode;
  sel.dispatchEvent(new Event("change", { bubbles: true }));
}

export function LanguageSelector() {
  const [open, setOpen]       = useState(false);
  const [current, setCurrent] = useState("en");
  const [ready, setReady]     = useState(false); // true once GT select is in DOM
  const dropdownRef           = useRef<HTMLDivElement>(null);

  /* ── Bootstrap Google Translate widget (hidden) ── */
  useEffect(() => {
    if (document.getElementById("__gt_script")) {
      // Script already injected (hot reload): just wait for select
      waitForElement(".goog-te-combo").then(el => { if (el) setReady(true); });
      return;
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "__gt_el",
      );
      // Wait for the actual <select> to appear after widget init
      waitForElement(".goog-te-combo").then(el => {
        if (el) setReady(true);
      });
    };

    const script = document.createElement("script");
    script.id   = "__gt_script";
    script.src  = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function select(code: string) {
    setOpen(false);
    setCurrent(code);
    await doTranslate(code);
  }

  const active = LANGUAGES.find(l => l.code === current);

  return (
    <>
      {/* Hidden Google Translate widget mount — must exist before script loads */}
      <div id="__gt_el" style={{ display: "none" }} aria-hidden="true" />

      <div ref={dropdownRef} className="relative">
        {/* Trigger button */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Change language / भाषा बदलें"
          title={ready ? "Change language / भाषा बदलें" : "Loading translator…"}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 text-sm font-medium",
            "transition-all hover:bg-muted hover:border-primary/40 hover:text-primary",
            open && "bg-muted border-primary/40 text-primary",
          )}
        >
          {ready
            ? <Globe className="h-4 w-4 shrink-0" />
            : <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          }
          <span className="hidden sm:inline max-w-[68px] truncate text-sm">
            {active?.native ?? "EN"}
          </span>
          <ChevronDown className={cn(
            "h-3 w-3 shrink-0 transition-transform",
            open && "rotate-180",
          )} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-11 z-[9999] w-52 overflow-hidden rounded-xl border border-border bg-card shadow-card-hover animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 border-b border-border/60">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                भाषा चुनें · Select Language
              </p>
            </div>
            <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
              {LANGUAGES.map(lang => (
                <li key={lang.code} role="option" aria-selected={current === lang.code}>
                  <button
                    onClick={() => select(lang.code)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted",
                      current === lang.code && "text-primary font-medium bg-primary/5",
                    )}
                  >
                    <span className="flex flex-col items-start leading-tight">
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-muted-foreground">{lang.label}</span>
                    </span>
                    {current === lang.code && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
            {!ready && (
              <div className="flex items-center gap-2 border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading translator…
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
