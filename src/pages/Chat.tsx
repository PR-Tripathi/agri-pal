import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, Volume2, Sprout } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSpeechRecognition, speak } from "@/lib/speech";
import { toast } from "sonner";

interface Msg { role: "user" | "assistant"; content: string }

const Chat = () => {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState<Msg[]>(() => {
    const saved = localStorage.getItem("km_chat");
    if (saved) try { return JSON.parse(saved); } catch {}
    return [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("km_chat", JSON.stringify(messages.slice(-30)));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const { supported, listening, start, stop } = useSpeechRecognition({
    lang: lang === "hi" ? "hi-IN" : "en-IN",
    onResult: (text, isFinal) => {
      setInput(text);
      if (isFinal) setTimeout(() => send(text), 200);
    },
  });

  const send = async (textArg?: string) => {
    const text = (textArg ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages, language: lang }),
      });
      if (resp.status === 429) { toast.error(t("errorRate")); setLoading(false); return; }
      if (resp.status === 402) { toast.error(t("errorPay")); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf; break;
          }
        }
      }

      if (assistantSoFar) speak(assistantSoFar, lang);
    } catch (e) {
      console.error(e);
      toast.error(t("errorGeneric"));
    } finally { setLoading(false); }
  };

  const suggestions = lang === "hi"
    ? ["गेहूं की बुवाई कब करूं?", "मेरे टमाटर के पत्ते पीले क्यों हैं?", "धान का बाज़ार भाव क्या है?"]
    : ["When should I sow wheat?", "Why are my tomato leaves yellow?", "How to control aphids organically?"];

  return (
    <AppShell title={t("chatTitle")}>
      <div ref={scrollRef} className="space-y-3 pb-32 max-h-[calc(100vh-260px)] overflow-y-auto">
        {messages.length === 0 && (
          <div className="rounded-3xl gradient-soil p-5 border border-border text-center">
            <Sprout className="h-10 w-10 mx-auto text-primary mb-2" />
            <p className="font-display text-lg font-bold">{t("appName")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("voiceAssistantDesc")}</p>
            <div className="mt-4 space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="block w-full text-left rounded-2xl bg-card border border-border px-3 py-2.5 text-sm hover:bg-secondary/50 transition-smooth"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-2.5 text-sm shadow-soft ${
                m.role === "user"
                  ? "gradient-hero text-primary-foreground rounded-br-md"
                  : "bg-card border border-border text-foreground rounded-bl-md"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:my-1">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  {m.content && (
                    <button
                      onClick={() => speak(m.content, lang)}
                      className="mt-1.5 text-xs text-primary inline-flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="h-3 w-3" /> {lang === "hi" ? "सुनें" : "Listen"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-3xl rounded-bl-md px-4 py-2.5 shadow-soft">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:120ms]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:240ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        className="fixed bottom-16 inset-x-0 px-4 py-3 bg-card/95 backdrop-blur-md border-t border-border"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="mx-auto max-w-md flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            onClick={() => {
              if (!supported) return toast.error(t("speakUnsupported"));
              listening ? stop() : start();
            }}
            className={`h-12 w-12 rounded-full flex-shrink-0 ${
              listening ? "bg-destructive hover:bg-destructive/90 animate-pulse-mic" : "bg-accent hover:bg-accent/90"
            } text-accent-foreground shadow-warm`}
            aria-label={listening ? "Stop" : t("speak")}
          >
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={listening ? t("listening") : t("askPlaceholder")}
            className="h-12 rounded-full px-5 bg-background"
          />
          <Button
            size="icon"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="h-12 w-12 rounded-full flex-shrink-0 gradient-hero text-primary-foreground shadow-leaf"
            aria-label={t("send")}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default Chat;
