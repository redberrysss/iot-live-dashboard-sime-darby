# IoT Live Monitoring System

A real-time Next.js dashboard for an ESP32 serving actual AJ-SR04M distance and MQ-2 raw ADC readings. The dashboard never creates fallback readings: when the board is unavailable it preserves collected history and shows a disconnected state.

## 1. Hardware and safety

| Device | ESP32 pin |
|---|---:|
| AJ-SR04M TRIG | GPIO 26 |
| AJ-SR04M ECHO | GPIO 27 |
| MQ-2 analog output | GPIO 34 |

**Voltage warning:** ESP32 GPIOs are 3.3 V only. Many ultrasonic modules and common MQ-2 breakout boards output 5 V on ECHO/AO when powered at 5 V. Put a suitable voltage divider or logic-level shifter between each 5 V output and the ESP32 input. Never connect a 5 V signal directly to GPIO 27 or GPIO 34. The MQ-2 value displayed here is an uncalibrated 12-bit ADC measurement; it is not PPM and must not be used as a certified safety alarm.

## 2. Flash the ESP32

1. Open `esp32/esp32_monitoring.ino` in Arduino IDE.
2. Copy `esp32/wifi_secrets.example.h` to `esp32/wifi_secrets.h`, then enter your hotspot name and password. This local file is git-ignored.
3. Select your ESP32 board and serial port, then upload.
4. Open Serial Monitor at **115200 baud**. It prints `ESP32 IP address: ...`; copy that address. Your Mac and ESP32 must join the same hotspot/local Wi-Fi.

The firmware samples sensors every 500 ms into cached values, so the HTTP handler stays responsive. Test it at `http://YOUR_ESP32_IP/api/sensors`.

## 3. Run the dashboard on macOS

```bash
cd /Users/kerol/iot-live-dashboard/frontend
npm install
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_ESP32_URL to your ESP32 IP (optional)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Enter the IP in **Dashboard Settings** (for example `http://192.168.1.42`) and select **Save & Connect**. The selected address is saved in browser local storage. The dashboard polls the live endpoint every 500 ms, avoids overlapping requests, reconnects automatically, retains up to 60 readings, and can export the current history as CSV.

## API response

`GET /api/sensors` returns `distance` as `null` for an ultrasonic timeout, plus raw `mq2`, `distanceValid`, Wi-Fi state, and `millis()` uptime. CORS headers allow the locally hosted Next.js frontend to call the ESP32 directly. Wi-Fi credentials are never exposed via this endpoint.
