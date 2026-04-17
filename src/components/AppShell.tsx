import { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLang } from "@/i18n/LanguageContext";
import { Sprout, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { t } = useLang();
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const u = () => setOnline(navigator.onLine);
    window.addEventListener("online", u);
    window.addEventListener("offline", u);
    return () => {
      window.removeEventListener("online", u);
      window.removeEventListener("offline", u);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header
        className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero text-primary-foreground shadow-leaf">
              <Sprout className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-bold text-foreground">{title ?? t("appName")}</p>
              {!title && <p className="text-[11px] text-muted-foreground">{t("tagline")}</p>}
            </div>
          </div>
          <LanguageToggle />
        </div>
        {!online && (
          <div className="bg-warning/20 text-warning-foreground px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-1.5">
            <WifiOff className="h-3.5 w-3.5" /> {t("offline")}
          </div>
        )}
      </header>
      <main className="mx-auto max-w-md px-4 pt-4 animate-fade-up">{children}</main>
      <BottomNav />
    </div>
  );
}
