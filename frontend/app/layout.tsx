import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "IoT Live Monitoring System", description: "Real-time ESP32 sensor monitoring" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
