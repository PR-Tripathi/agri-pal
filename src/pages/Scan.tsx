import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useLang } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, ScanSearch, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

interface Diag {
  isPlant: boolean;
  cropGuess: string;
  healthy: boolean;
  disease: string;
  severity: "none" | "mild" | "moderate" | "severe";
  confidencePercent: number;
  symptoms: string[]; causes: string[];
  organicTreatment: string[]; chemicalTreatment: string[]; prevention: string[];
}

const Scan = () => {
  const { t, lang } = useLang();
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diag, setDiag] = useState<Diag | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (f: File) => {
    if (f.size > 8 * 1024 * 1024) return toast.error("Image must be under 8MB");
    const reader = new FileReader();
    reader.onload = () => { setImg(reader.result as string); setDiag(null); };
    reader.readAsDataURL(f);
  };

  const diagnose = async () => {
    if (!img) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("disease-detect", {
        body: { imageBase64: img, language: lang },
      });
      if (error) throw error;
      if ((data as any)?.error === "rate_limited") return toast.error(t("errorRate"));
      if ((data as any)?.error === "payment_required") return toast.error(t("errorPay"));
      setDiag(data as Diag);
    } catch (e) {
      console.error(e);
      toast.error(t("errorGeneric"));
    } finally { setLoading(false); }
  };

  const sevColor = (s: string) =>
    s === "severe" ? "bg-destructive text-destructive-foreground"
      : s === "moderate" ? "bg-warning text-warning-foreground"
      : s === "mild" ? "bg-accent/80 text-accent-foreground"
      : "bg-success text-success-foreground";

  return (
    <AppShell title={t("diseaseScanner")}>
      <p className="text-sm text-muted-foreground mb-3">{t("diseaseDesc")}</p>

      <div
        onClick={() => fileRef.current?.click()}
        className="rounded-3xl border-2 border-dashed border-border bg-secondary/30 aspect-square overflow-hidden flex items-center justify-center cursor-pointer hover:bg-secondary/50 transition-smooth"
      >
        {img ? (
          <img src={img} alt="Selected leaf" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center text-muted-foreground p-6">
            <Camera className="h-12 w-12 mx-auto mb-2 text-primary" />
            <p className="font-semibold text-foreground">{t("takePhoto")}</p>
            <p className="text-xs mt-1">JPG / PNG · &lt; 8MB</p>
          </div>
        )}
      </div>
      <input
        ref={fileRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
      />

      {img && (
        <Button
          onClick={diagnose}
          disabled={loading}
          className="w-full h-12 mt-4 rounded-2xl gradient-hero text-primary-foreground shadow-leaf font-semibold"
        >
          <ScanSearch className="h-4 w-4 mr-2" />
          {loading ? t("diagnosing") : t("diagnose")}
        </Button>
      )}

      {diag && (
        <section className="mt-5 space-y-3 animate-fade-up">
          {!diag.isPlant ? (
            <div className="rounded-3xl bg-warning/15 border border-warning/40 p-4 flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm">{t("notPlant")}</p>
            </div>
          ) : diag.healthy ? (
            <div className="rounded-3xl bg-success/15 border border-success/40 p-4 flex gap-3 items-start">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-lg font-bold">{t("healthy")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{diag.cropGuess}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-3xl bg-card border border-border p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{diag.cropGuess}</p>
                    <p className="font-display text-xl font-bold text-foreground flex items-center gap-2 mt-0.5">
                      <ShieldAlert className="h-5 w-5 text-destructive" />
                      {diag.disease}
                    </p>
                  </div>
                  <span className={`rounded-full text-[10px] font-bold px-2.5 py-1 uppercase ${sevColor(diag.severity)}`}>
                    {diag.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Confidence: {Math.round(diag.confidencePercent)}%</p>
              </div>

              <Block title={t("symptoms")} items={diag.symptoms} />
              <Block title={t("causes")} items={diag.causes} />
              <Block title={t("organicTreatment")} items={diag.organicTreatment} accent />
              <Block title={t("chemicalTreatment")} items={diag.chemicalTreatment} />
              <Block title={t("prevention")} items={diag.prevention} />
            </>
          )}
        </section>
      )}
    </AppShell>
  );
};

function Block({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  if (!items?.length) return null;
  return (
    <div className={`rounded-3xl border border-border p-4 ${accent ? "bg-primary/5" : "bg-card"} shadow-soft`}>
      <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">{title}</p>
      <ul className="list-disc pl-5 mt-1.5 space-y-1 text-sm text-foreground">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

export default Scan;
