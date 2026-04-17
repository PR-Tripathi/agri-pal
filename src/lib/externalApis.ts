// Public APIs — no key required
export interface WeatherSnapshot {
  tempC: number;
  humidity: number;
  rainfallMm: number;
  windKph: number;
  code: number;
  summary: string;
  locationName?: string;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=precipitation_sum&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather failed");
  const d = await res.json();
  const cur = d.current ?? {};
  const rainfall = (d.daily?.precipitation_sum?.[0] as number) ?? cur.precipitation ?? 0;
  return {
    tempC: cur.temperature_2m,
    humidity: cur.relative_humidity_2m,
    rainfallMm: rainfall,
    windKph: cur.wind_speed_10m,
    code: cur.weather_code,
    summary: weatherCodeToText(cur.weather_code),
  };
}

export interface SoilSnapshot {
  ph?: number;
  organicCarbon?: number;
  nitrogen?: number;
  soilType?: string;
}

// SoilGrids REST: properties endpoint
export async function fetchSoil(lat: number, lon: number): Promise<SoilSnapshot> {
  const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&property=nitrogen&property=soc&depth=0-5cm&value=mean`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("soil failed");
    const d = await res.json();
    const layers = d.properties?.layers ?? [];
    const find = (n: string) => layers.find((l: any) => l.name === n);
    const phLayer = find("phh2o");
    const nLayer = find("nitrogen");
    const socLayer = find("soc");
    const ph = phLayer?.depths?.[0]?.values?.mean;
    const nitrogen = nLayer?.depths?.[0]?.values?.mean;
    const soc = socLayer?.depths?.[0]?.values?.mean;
    return {
      ph: ph ? ph / 10 : undefined, // SoilGrids reports pH * 10
      nitrogen: nitrogen ?? undefined,
      organicCarbon: soc ? soc / 10 : undefined,
    };
  } catch (e) {
    console.warn("SoilGrids failed", e);
    return {};
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | undefined> {
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`);
    if (!r.ok) return undefined;
    const d = await r.json();
    const p = d.results?.[0];
    if (!p) return undefined;
    return [p.name, p.admin1].filter(Boolean).join(", ");
  } catch { return undefined; }
}

function weatherCodeToText(c: number): string {
  if (c == null) return "Clear";
  if (c === 0) return "Clear sky";
  if (c <= 3) return "Partly cloudy";
  if (c <= 48) return "Foggy";
  if (c <= 67) return "Rainy";
  if (c <= 77) return "Snow";
  if (c <= 82) return "Rain showers";
  if (c <= 99) return "Thunderstorm";
  return "Unknown";
}
