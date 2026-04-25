import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";
import { Sprout, Camera, Mic, Cloud, Droplets, Thermometer, Wind, ArrowRight } from "lucide-react";
import { fetchWeather, reverseGeocode, type WeatherSnapshot } from "@/lib/externalApis";
import { getCache, setCache } from "@/lib/cache";
import heroImg from "@/assets/hero-farmer.jpg";

interface CachedRec {
  summary: string;
  topCrop?: string;
}

const Home = () => {
  const { t, lang } = useLang();
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [place, setPlace] = useState<string | undefined>();
  const [lastRec, setLastRec] = useState<CachedRec | null>(null);

  useEffect(() => {
    const cw = getCache<WeatherSnapshot & { locationName?: string }>("weather");
    if (cw) { setWeather(cw.value); setPlace(cw.value.locationName); }
    const cr = getCache<any>("lastRec");
    if (cr?.value?.crops?.length) {
      setLastRec({ summary: cr.value.summary, topCrop: cr.value.crops[0]?.localName });
    }

    if (!navigator.geolocation || !navigator.onLine) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const w = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          const merged = { ...w, locationName: name };
          setWeather(merged);
          setPlace(name);
          setCache("weather", merged);
        } catch (e) { console.warn(e); }
      },
      () => {},
      { timeout: 8000 }
    );
  }, []);

  const features = [
    { to: "/recommend", icon: Sprout, title: t("cropAdvisor"), desc: t("cropAdvisorDesc"), bg: "bg-primary/10 text-primary" },
    { to: "/scan", icon: Camera, title: t("diseaseScanner"), desc: t("diseaseScannerDesc"), bg: "bg-accent/15 text-accent" },
    { to: "/chat", icon: Mic, title: t("voiceAssistant"), desc: t("voiceAssistantDesc"), bg: "bg-success/15 text-success" },
  ];

  return (
    <AppShell>
      {/* Hero greeting */}
      <section className="rounded-3xl gradient-hero shadow-leaf overflow-hidden relative">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <img src={heroImg} alt="" className="h-full w-full object-cover" width={1024} height={768} />
        </div>
        <div className="relative p-5 text-primary-foreground">
          <p className="font-display text-2xl font-bold leading-tight">{t("goodMorning")}</p>
          <p className="text-sm opacity-90 mt-1">
            {place ?? t("heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Weather card */}
      <section className="mt-4 rounded-3xl bg-card p-4 shadow-soft border border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Cloud className="h-4 w-4 text-primary" /> {t("todayWeather")}
          </h2>
          <span className="text-xs text-muted-foreground">{weather?.summary ?? "—"}</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <WeatherStat icon={<Thermometer className="h-4 w-4" />} label={t("temp")} value={weather ? `${Math.round(weather.tempC)}°` : "—"} />
          <WeatherStat icon={<Droplets className="h-4 w-4" />} label={t("humidity")} value={weather ? `${Math.round(weather.humidity)}%` : "—"} />
          <WeatherStat icon={<Cloud className="h-4 w-4" />} label={t("rain")} value={weather ? `${weather.rainfallMm.toFixed(1)}mm` : "—"} />
          <WeatherStat icon={<Wind className="h-4 w-4" />} label={t("wind")} value={weather ? `${Math.round(weather.windKph)}` : "—"} />
        </div>
      </section>

      {/* Last recommendation */}
      <section className="mt-4 rounded-3xl gradient-soil p-4 border border-border">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{t("recentRec")}</p>
        {lastRec ? (
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-bold text-foreground">{lastRec.topCrop}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{lastRec.summary}</p>
            </div>
            <Link to="/recommend" className="text-primary text-sm font-semibold whitespace-nowrap flex items-center gap-1">
              {t("open")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">{t("noRecent")}</p>
        )}
      </section>

      {/* Feature cards */}
      <section className="mt-4 space-y-3">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="block rounded-3xl bg-card p-4 shadow-soft border border-border hover:shadow-leaf transition-smooth active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg}`}>
                <f.icon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <p className="font-display font-bold text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </section>

      <p className="mt-6 mb-2 text-center text-[11px] text-muted-foreground">
        {t("footerLine")}
      </p>
    </AppShell>
  );
};

function WeatherStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/50 px-2 py-2.5">
      <div className="flex items-center justify-center text-primary">{icon}</div>
      <p className="text-base font-bold text-foreground mt-1">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default Home;
