"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSensors, type HistoryPoint, type SensorPayload } from "@/lib/esp32";

const MAX_HISTORY = 60;
export function useSensorData(url: string, interval: number) {
  const [reading, setReading] = useState<SensorPayload | null>(null); const [history, setHistory] = useState<HistoryPoint[]>([]); const [online, setOnline] = useState(false); const [paused, setPaused] = useState(false); const [lastSuccess, setLastSuccess] = useState<Date | null>(null); const [received, setReceived] = useState(0); const busy = useRef(false); const requestController = useRef<AbortController | null>(null); const urlRef = useRef(url); const intervalRef = useRef(interval); const pausedRef = useRef(paused);
  useEffect(() => { urlRef.current = url; intervalRef.current = interval; pausedRef.current = paused; }, [url, interval, paused]);
  const poll = useCallback(async () => { if (busy.current || pausedRef.current || !urlRef.current) return; busy.current = true; const controller = new AbortController(); requestController.current = controller; const timeout = window.setTimeout(() => controller.abort(), Math.max(intervalRef.current * 2, 3000)); try { const next = await fetchSensors(urlRef.current, controller.signal); const now = new Date(); setReading(next); setOnline(true); setLastSuccess(now); setReceived(value => value + 1); setHistory(old => [...old, { ...next, timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), epoch: now.getTime() }].slice(-MAX_HISTORY)); } catch { setOnline(false); } finally { window.clearTimeout(timeout); if (requestController.current === controller) requestController.current = null; busy.current = false; } }, []);
  useEffect(() => { poll(); const id = window.setInterval(poll, interval); return () => { window.clearInterval(id); requestController.current?.abort(); }; }, [poll, interval, url, paused]);
  return { reading, history, online, paused, setPaused, lastSuccess, received, poll, clearHistory: () => setHistory([]) };
}
