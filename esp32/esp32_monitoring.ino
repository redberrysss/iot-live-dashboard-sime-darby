#include <WiFi.h>
#include <WebServer.h>
#include "wifi_secrets.h"

// Hardware assignments — retain these to match the connected sensors.
const uint8_t TRIG_PIN = 26;
const uint8_t ECHO_PIN = 27;
const uint8_t MQ2_PIN = 34;
const unsigned long SAMPLE_INTERVAL_MS = 500;
const unsigned long ULTRASONIC_TIMEOUT_US = 60000UL;

WebServer server(80);
float latestDistance = 0;
int latestMq2 = 0;
bool distanceValid = false;
unsigned long lastSampleAt = 0;

void addCorsHeaders() { server.sendHeader("Access-Control-Allow-Origin", "*"); server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS"); server.sendHeader("Access-Control-Allow-Headers", "Content-Type"); }

void sampleSensors() {
  // A short timeout prevents a disconnected ultrasonic sensor from blocking the web server.
  // Preserved from the original AJ-SR04M reading sequence.
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(5);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(20);
  digitalWrite(TRIG_PIN, LOW);
  unsigned long duration = pulseIn(ECHO_PIN, HIGH, ULTRASONIC_TIMEOUT_US);
  distanceValid = duration > 0;
  if (distanceValid) latestDistance = (duration * 0.0343f) / 2.0f;
  latestMq2 = analogRead(MQ2_PIN); // Raw 12-bit ADC value: 0..4095, not PPM.
}

void handleSensors() {
  addCorsHeaders();
  String json = "{\"distance\":";
  json += distanceValid ? String(latestDistance, 1) : "null";
  json += ",\"mq2\":" + String(latestMq2);
  json += ",\"distanceValid\":" + String(distanceValid ? "true" : "false");
  json += ",\"wifiConnected\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false");
  json += ",\"uptime\":" + String(millis()) + "}";
  server.send(200, "application/json", json);
}

void connectWifi() {
  WiFi.mode(WIFI_STA); WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 15000) { delay(250); Serial.print("."); }
  if (WiFi.status() == WL_CONNECTED) { Serial.println(); Serial.print("ESP32 IP address: "); Serial.println(WiFi.localIP()); }
  else Serial.println("\nWi-Fi unavailable; background reconnection will continue.");
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT); pinMode(ECHO_PIN, INPUT); pinMode(MQ2_PIN, INPUT);
  analogReadResolution(12);
  connectWifi();
  server.on("/api/sensors", HTTP_GET, handleSensors);
  server.on("/api/sensors", HTTP_OPTIONS, []() { addCorsHeaders(); server.send(204); });
  server.begin(); Serial.println("HTTP server started: GET /api/sensors");
}

void loop() {
  server.handleClient();
  if (millis() - lastSampleAt >= SAMPLE_INTERVAL_MS) { lastSampleAt = millis(); sampleSensors(); }
  if (WiFi.status() != WL_CONNECTED) { static unsigned long lastReconnect = 0; if (millis() - lastReconnect > 10000) { lastReconnect = millis(); WiFi.disconnect(); WiFi.begin(WIFI_SSID, WIFI_PASSWORD); } }
}
