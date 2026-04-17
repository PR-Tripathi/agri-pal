import { NavLink, useLocation } from "react-router-dom";
import { Home, Sprout, Camera, MessageCircle } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { t } = useLang();
  const loc = useLocation();
  const items = [
    { to: "/", icon: Home, label: t("home") },
    { to: "/recommend", icon: Sprout, label: t("recommend") },
    { to: "/scan", icon: Camera, label: t("scan") },
    { to: "/chat", icon: MessageCircle, label: t("chat") },
  ];
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-md shadow-soft"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="mx-auto max-w-md grid grid-cols-4">
        {items.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname === to;
          return (
            <li key={to}>
              <NavLink
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 transition-smooth",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl transition-smooth",
                    active && "bg-primary/10"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className="text-[11px] font-medium">{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
