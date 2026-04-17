import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchSoil, fetchWeather, reverseGeocode, type WeatherSnapshot } from "@/lib/externalApis";
import { setCache, getCache } from "@/lib/cache";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Sparkles, Droplets, IndianRupee, Leaf, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Crop {
  name: string;
  localName: string;
  suitabilityPercent: number;
  estimatedYieldKgPerHectare: number;
  estimatedProfitPerAcreInr: number;
  sustainabilityScore: number;
  waterNeed: "low" | "medium" | "high";
  growthDurationDays: number;
  reasons: string[];
  tips: string[];
}
interface RecResult { summary: string; crops: Crop[] }

const Recommend = () => {
  const { t, lang } = useLang();
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [soil, setSoil] = useState({
    ph: "", moisture: "", nitrogen: "", phosphorus: "", potassium: "", soilType: "",
  });
  const [season, setSeason] = useState<string>("kharif");
  const [acres, setAcres] = useState<string>("2");
  const [result, setResult] = useState<RecResult | null>(() => getCache<RecResult>("lastRec")?.value ?? null);

  const useLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude, lon = pos.coords.longitude;
          const [w, s, name] = await Promise.all([
            fetchWeather(lat, lon),
            fetchSoil(lat, lon),
            reverseGeocode(lat, lon),
          ]);
          setLocation({ lat, lon, name });
          setWeather(w);
          setSoil((prev) => ({
            ...prev,
            ph: s.ph ? s.ph.toFixed(1) : prev.ph,
            nitrogen: s.nitrogen ? String(Math.round(s.nitrogen)) : prev.nitrogen,
          }));
          setCache("weather", { ...w, locationName: name });
          toast.success(name ? `📍 ${name}` : "Location ready");
        } catch (e: any) {
          toast.error(e.message ?? "Failed to fetch");
        } finally { setLoadingLoc(false); }
      },
      (err) => { setLoadingLoc(false); toast.error(err.message); },
      { timeout: 10000 }
    );
  };

  const submit = async () => {
    setLoadingRec(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("crop-recommend", {
        body: {
          language: lang,
          location,
          soil: {
            ph: num(soil.ph), moisture: num(soil.moisture),
            nitrogen: num(soil.nitrogen), phosphorus: num(soil.phosphorus),
            potassium: num(soil.potassium), soilType: soil.soilType || undefined,
          },
          weather: weather ? {
            tempC: weather.tempC, rainfallMm: weather.rainfallMm,
            humidity: weather.humidity, forecastSummary: weather.summary,
          } : undefined,
          season,
          landSizeAcres: num(acres),
        },
      });
      if (error) throw error;
      if ((data as any)?.error === "rate_limited") return toast.error(t("errorRate"));
      if ((data as any)?.error === "payment_required") return toast.error(t("errorPay"));
      const r = data as RecResult;
      setResult(r);
      setCache("lastRec", r);
    } catch (e: any) {
      console.error(e);
      toast.error(t("errorGeneric"));
    } finally { setLoadingRec(false); }
  };

  return (
    <AppShell title={t("cropAdvisor")}>
      <p className="text-sm text-muted-foreground mb-3">{t("soilDesc")}</p>

      <Button
        type="button"
        onClick={useLocation}
        disabled={loadingLoc}
        className="w-full h-12 rounded-2xl gradient-hero text-primary-foreground shadow-leaf font-semibold"
      >
        <MapPin className="h-4 w-4 mr-2" />
        {loadingLoc ? t("fetching") : t("useLocation")}
      </Button>
      {location?.name && <p className="mt-2 text-xs text-center text-muted-foreground">📍 {location.name}</p>}

      <div className="mt-4 rounded-3xl bg-card border border-border p-4 shadow-soft space-y-3">
        <h3 className="font-display font-bold">{t("soilTitle")}</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("ph")} value={soil.ph} onChange={(v) => setSoil({ ...soil, ph: v })} placeholder="6.5" />
          <Field label={t("moisture")} value={soil.moisture} onChange={(v) => setSoil({ ...soil, moisture: v })} placeholder="35" />
          <Field label={t("nitrogen")} value={soil.nitrogen} onChange={(v) => setSoil({ ...soil, nitrogen: v })} placeholder="80" />
          <Field label={t("phosphorus")} value={soil.phosphorus} onChange={(v) => setSoil({ ...soil, phosphorus: v })} placeholder="40" />
          <Field label={t("potassium")} value={soil.potassium} onChange={(v) => setSoil({ ...soil, potassium: v })} placeholder="40" />
          <div>
            <Label className="text-xs">{t("soilType")}</Label>
            <Select value={soil.soilType} onValueChange={(v) => setSoil({ ...soil, soilType: v })}>
              <SelectTrigger className="h-11 rounded-xl mt-1"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="loamy">Loamy / दोमट</SelectItem>
                <SelectItem value="clay">Clay / चिकनी</SelectItem>
                <SelectItem value="sandy">Sandy / रेतीली</SelectItem>
                <SelectItem value="black">Black / काली</SelectItem>
                <SelectItem value="red">Red / लाल</SelectItem>
                <SelectItem value="alluvial">Alluvial / जलोढ़</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t("season")}</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="h-11 rounded-xl mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kharif">Kharif (Jun–Oct)</SelectItem>
                <SelectItem value="rabi">Rabi (Nov–Apr)</SelectItem>
                <SelectItem value="zaid">Zaid (Mar–Jun)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label={t("landSize")} value={acres} onChange={setAcres} placeholder="2" />
        </div>
      </div>

      <Button
        onClick={submit}
        disabled={loadingRec}
        className="w-full h-12 mt-4 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-warm font-semibold"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {loadingRec ? t("recommending") : t("getRecs")}
      </Button>

      {result && (
        <section className="mt-5 space-y-3 animate-fade-up">
          <div className="rounded-3xl gradient-soil p-4 border border-border">
            <p className="text-sm text-foreground">{result.summary}</p>
          </div>
          {result.crops.map((c) => (
            <article key={c.name} className="rounded-3xl bg-card border border-border p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold text-foreground">{c.localName}</p>
                  <p className="text-xs text-muted-foreground">{c.name}</p>
                </div>
                <span className="rounded-full bg-primary/10 text-primary text-xs font-bold px-2.5 py-1">
                  {Math.round(c.suitabilityPercent)}% fit
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat icon={<Sparkles className="h-3.5 w-3.5" />} label={t("yield")} value={`${Math.round(c.estimatedYieldKgPerHectare)} kg/ha`} />
                <Stat icon={<IndianRupee className="h-3.5 w-3.5" />} label={t("profit")} value={`₹${Math.round(c.estimatedProfitPerAcreInr).toLocaleString("en-IN")}`} />
                <Stat icon={<Leaf className="h-3.5 w-3.5" />} label={t("sustainability")} value={`${Math.round(c.sustainabilityScore)}/100`} />
                <Stat icon={<Droplets className="h-3.5 w-3.5" />} label={t("water")} value={c.waterNeed} />
                <Stat icon={<Clock className="h-3.5 w-3.5" />} label={t("duration")} value={`${c.growthDurationDays} ${t("days")}`} />
              </div>
              <details className="mt-3 group">
                <summary className="cursor-pointer text-sm font-semibold text-primary list-none flex items-center justify-between">
                  <span>{t("reasons")} & {t("tips")}</span>
                  <span className="text-xs opacity-60 group-open:rotate-180 transition-smooth">▼</span>
                </summary>
                <div className="mt-2 space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{t("reasons")}</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">{c.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{t("tips")}</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">{c.tips.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                </div>
              </details>
            </article>
          ))}
        </section>
      )}
    </AppShell>
  );
};

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl mt-1"
      />
    </div>
  );
}
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-2">
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">{icon}{label}</p>
      <p className="text-sm font-bold text-foreground mt-0.5 capitalize">{value}</p>
    </div>
  );
}
function num(v: string): number | undefined {
  const n = parseFloat(v); return isNaN(n) ? undefined : n;
}

export default Recommend;
