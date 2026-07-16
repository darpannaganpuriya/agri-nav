import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, X, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { voiceService } from "@/services/voiceService";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Tomato kitne din store kar sakte hain?",
  "Aaj ka mandi bhav kya hai?",
  "Cold storage kahan milega?",
  "Fasal ka sahi daam kab milega?",
];

export function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "🌾 Namaste! I'm your FasalSeva AI Agent. Ask me anything about shelf life, mandi prices, cold storage, weather, or farming advice — in Hindi or English!",
    },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  // Setup Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const r = new SpeechRecognition();
    r.lang = "hi-IN";
    r.continuous = false;
    r.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      ask(transcript);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setMsgs((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setThinking(true);
    try {
      const reply = await voiceService.askAssistant(trimmed);
      setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      {/* Floating FAB */ }
      <motion.button
        onClick={ () => setOpen((o) => !o) }
        aria-label="AI Agent"
        whileHover={ { scale: 1.08 } }
        whileTap={ { scale: 0.95 } }
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-glow gradient-primary"
      >
        <AnimatePresence mode="wait">
          { open ? (
            <motion.span key="close" initial={ { rotate: -90, opacity: 0 } } animate={ { rotate: 0, opacity: 1 } } exit={ { rotate: 90, opacity: 0 } } transition={ { duration: 0.15 } }>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={ { rotate: 90, opacity: 0 } } animate={ { rotate: 0, opacity: 1 } } exit={ { rotate: -90, opacity: 0 } } transition={ { duration: 0.15 } }>
              <Sparkles className="h-6 w-6" />
            </motion.span>
          ) }
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */ }
      <AnimatePresence>
        { open && (
          <motion.div
            initial={ { opacity: 0, y: 24, scale: 0.97 } }
            animate={ { opacity: 1, y: 0, scale: 1 } }
            exit={ { opacity: 0, y: 24, scale: 0.97 } }
            transition={ { type: "spring", damping: 24, stiffness: 320 } }
            className="fixed bottom-24 right-6 z-40 flex h-[560px] w-[93vw] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card-hover"
          >
            {/* Header */ }
            <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="relative grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-glow">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">FasalSeva AI Agent</p>
                  <p className="text-[11px] text-muted-foreground">Powered by n8n · Hindi &amp; English</p>
                </div>
              </div>
              <button onClick={ () => setOpen(false) } className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */ }
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              { msgs.map((m, i) => (
                <motion.div
                  key={ i }
                  initial={ { opacity: 0, y: 8 } }
                  animate={ { opacity: 1, y: 0 } }
                  transition={ { duration: 0.2 } }
                  className={ cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start") }
                >
                  { m.role === "assistant" && (
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </span>
                  ) }
                  <div
                    className={ cn(
                      "max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "gradient-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm",
                    ) }
                  >
                    { m.text }
                  </div>
                </motion.div>
              )) }

              {/* Thinking animation */ }
              { thinking && (
                <motion.div initial={ { opacity: 0, y: 8 } } animate={ { opacity: 1, y: 0 } } className="flex items-end gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                    { [0, 0.15, 0.3].map((delay, idx) => (
                      <motion.span
                        key={ idx }
                        className="block h-2 w-2 rounded-full bg-primary/60"
                        animate={ { y: [0, -5, 0] } }
                        transition={ { duration: 0.6, repeat: Infinity, delay } }
                      />
                    )) }
                  </div>
                </motion.div>
              ) }
              <div ref={ bottomRef } />
            </div>

            {/* Suggestions */ }
            <div className="border-t border-border/40 px-3 pt-2.5">
              <div className="flex flex-wrap gap-1.5">
                { SUGGESTIONS.map((s) => (
                  <button
                    key={ s }
                    onClick={ () => ask(s) }
                    disabled={ thinking }
                    className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  >
                    { s }
                  </button>
                )) }
              </div>
            </div>

            {/* Input */ }
            <div className="p-3 pt-2">
              <form onSubmit={ (e) => { e.preventDefault(); ask(input); } } className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={ listening ? "default" : "outline" }
                  size="icon"
                  className={ cn("h-9 w-9 shrink-0", listening && "gradient-primary text-primary-foreground animate-pulse") }
                  onClick={ toggleListening }
                  aria-label="Mic"
                  title={ listening ? "Stop listening" : "Start voice input (Hindi)" }
                >
                  { listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" /> }
                </Button>
                <Input
                  value={ input }
                  onChange={ (e) => setInput(e.target.value) }
                  placeholder={ listening ? "Listening…" : "Ask anything in Hindi or English…" }
                  className="h-9 text-sm"
                  disabled={ thinking }
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 shrink-0 gradient-primary text-primary-foreground"
                  disabled={ thinking || !input.trim() }
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        ) }
      </AnimatePresence>
    </>
  );
}
