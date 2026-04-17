import { Languages } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className="gap-1.5 rounded-full bg-secondary/60 hover:bg-secondary text-secondary-foreground"
    >
      <Languages className="h-4 w-4" />
      <span className="font-semibold">{lang === "en" ? "हिं" : "EN"}</span>
    </Button>
  );
}
