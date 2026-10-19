export type SensorPayload = { distance: number | null; mq2: number; distanceValid: boolean; wifiConnected: boolean; uptime: number };
export type HistoryPoint = SensorPayload & { timestamp: string; epoch: number };

export function normaliseBaseUrl(value: string) { const url = value.trim().replace(/\/$/, ""); return url ? (url.startsWith("http") ? url : `http://${url}`) : ""; }
export async function fetchSensors(baseUrl: string, signal?: AbortSignal): Promise<SensorPayload> {
  const response = await fetch(`${normaliseBaseUrl(baseUrl)}/api/sensors`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`ESP32 API returned ${response.status}`);
  const data: unknown = await response.json();
  if (!data || typeof data !== "object") throw new Error("Invalid ESP32 response");
  const reading = data as Record<string, unknown>;
  if (typeof reading.mq2 !== "number" || typeof reading.distanceValid !== "boolean" || typeof reading.wifiConnected !== "boolean" || typeof reading.uptime !== "number") throw new Error("Incomplete ESP32 response");
  return { distance: typeof reading.distance === "number" ? reading.distance : null, mq2: reading.mq2, distanceValid: reading.distanceValid, wifiConnected: reading.wifiConnected, uptime: reading.uptime };
}
