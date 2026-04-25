import { Languages, Check } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { LANGS, getLangMeta } from "@/i18n/strings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  const current = getLangMeta(lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-full bg-secondary/60 hover:bg-secondary text-secondary-foreground"
        >
          <Languages className="h-4 w-4" />
          <span className="font-semibold">{current.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 max-h-80 overflow-y-auto">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="flex flex-col">
              <span className="font-semibold">{l.label}</span>
              <span className="text-xs text-muted-foreground">{l.english}</span>
            </span>
            {lang === l.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
