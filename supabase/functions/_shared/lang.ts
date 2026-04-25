// Maps a language code to a human-readable name for the LLM system prompt.
export type LangCode =
  | "en" | "hi" | "bn" | "ta" | "te" | "mr" | "gu" | "kn" | "pa" | "bho";

const NAMES: Record<LangCode, string> = {
  en: "English",
  hi: "Hindi (Devanagari script)",
  bn: "Bengali (Bangla script)",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi (Devanagari script)",
  gu: "Gujarati",
  kn: "Kannada",
  pa: "Punjabi (Gurmukhi script)",
  bho: "Bhojpuri (written in Devanagari script)",
};

export function languageName(code?: string): string {
  if (!code) return NAMES.en;
  return NAMES[code as LangCode] ?? NAMES.en;
}
