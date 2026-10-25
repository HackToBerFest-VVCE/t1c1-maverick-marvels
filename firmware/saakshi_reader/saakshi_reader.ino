/* ===========================================================================
 * SAAKSHI — NFC job-card reader
 * ESP32 Dev Module + RC522 + ILI9341 TFT
 *
 * WHAT THIS DOES
 *   Reads an NTAG213 card holding one job card number as an NDEF text record,
 *   asks the Saakshi backend for that worker's already-verified audit summary,
 *   and shows the result on the TFT.
 *
 * WHAT THIS DOES NOT DO
 *   It does not store documents. An NTAG213 has 144 bytes of user memory; one
 *   legible photo of a job card page is 300,000-800,000 bytes. The card is a
 *   pointer, nothing more — it saves a volunteer from typing an 18-character
 *   number in the sun.
 *
 *   It does not write audit data. The device is read-only against the backend.
 *
 *   It does not render Indian scripts. Devanagari and Tamil need complex text
 *   shaping (conjuncts, repositioned matras) that embedded text libraries do
 *   not perform. Mangled Hindi is worse than none, so the TFT shows ASCII only.
 *
 * WHY NTAG213 AND NOT MIFARE CLASSIC
 *   The RC522 reads both. Ordinary Android phones read NTAG; many cannot read
 *   MIFARE Classic, and iPhones cannot read it at all. One card type has to
 *   serve both the reader and the phone, and NTAG213 is the one that does.
 *   Storing the number as an NDEF text record means any stock NFC app on a
 *   phone can read it with no custom code.
 *
 * PINS
 *   See firmware/PINOUT.md. Both devices share VSPI; only CS differs.
 *   The RC522 is a 3.3V part — 5V on VCC destroys it.
 *
 * BOARD
 *   Arduino IDE -> ESP32 Dev Module. TFT_eSPI pins live in User_Setup.h,
 *   not in this file; they must match PINOUT.md.
 * ========================================================================= */

#include <SPI.h>
#include <MFRC522.h>
#include <TFT_eSPI.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#include "secrets.h"   // git-ignored. Copy secrets.example.h and fill it in.

/* ------------------------------ pins ----------------------------------- */
#define PIN_RC522_SS    5
#define PIN_RC522_RST  22
#define PIN_BUZZER     27
#define PIN_LED        26
/* SCK 18, MOSI 23, MISO 19 are the shared VSPI bus.
   TFT CS 15, DC 2, RST 4 are configured in TFT_eSPI's User_Setup.h. */

/* ---------------------------- behaviour -------------------------------- */
static const uint32_t HTTP_TIMEOUT_MS   = 6000;   // a hung reader must recover alone
static const uint32_t WIFI_TIMEOUT_MS   = 20000;
static const uint32_t SAME_CARD_LOCKOUT = 2500;   // ignore a re-read of one card
static const uint32_t RESULT_DWELL_MS   = 6000;   // how long a result stays up

/* ------------------------------ colours --------------------------------
   Pulled from the Saakshi palette so the device matches the dashboard.
   RGB565, converted from design/tokens.css. */
#define C_PAPER   0xFFDD   // #faf9f6  surface-card
#define C_INK     0x10A3   // #14161a  ink-primary
#define C_MUTED   0x7C11   // #7c828c  ink-muted
#define C_NAVY    0x113B   // #0f2740  brand-900
#define C_AMBER   0xCBC2   // #c77d13  accent-500   (action)
#define C_GOOD    0x0510   // #0ca30c  status-good
#define C_CRIT    0xD1C7   // #d03b3b  status-critical

MFRC522 rfid(PIN_RC522_SS, PIN_RC522_RST);
TFT_eSPI tft = TFT_eSPI();

static byte     lastUid[10]   = {0};
static byte     lastUidLen    = 0;
static uint32_t lastReadAt    = 0;

/* ======================================================================= */
/*                                 SETUP                                    */
/* ======================================================================= */

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(PIN_BUZZER, OUTPUT); digitalWrite(PIN_BUZZER, LOW);
  pinMode(PIN_LED,    OUTPUT); digitalWrite(PIN_LED,    LOW);

  tft.init();
  tft.setRotation(1);                 // 320x240 landscape
  tft.fillScreen(C_PAPER);

  SPI.begin();                        // VSPI: SCK 18, MISO 19, MOSI 23
  rfid.PCD_Init();
  rfid.PCD_SetAntennaGain(rfid.RxGain_max);

  splash("SAAKSHI", "starting");
  connectWiFi();
  screenIdle();
}

/* ======================================================================= */
/*                                  LOOP                                    */
/* ======================================================================= */

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    screenMessage("NO NETWORK", "reconnecting", C_CRIT);
    connectWiFi();
    screenIdle();
    return;
  }

  if (!rfid.PICC_IsNewCardPresent()) { delay(60); return; }
  if (!rfid.PICC_ReadCardSerial())   { delay(60); return; }

  // Debounce: the RC522 re-reads a resting card many times a second.
  if (isSameCardWithinLockout()) {
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    delay(120);
    return;
  }
  rememberCard();

  beep(60);
  digitalWrite(PIN_LED, HIGH);
  screenMessage("CARD READ", "looking up", C_NAVY);

  String jobCard = readJobCardNumber();

  if (jobCard.length() == 0) {
    screenMessage("UNREADABLE", "use manual entry", C_CRIT);
    Serial.println(F("[card] no NDEF text payload found"));
  } else {
    Serial.printf("[card] job card %s\n", maskId(jobCard).c_str());
    lookupAndShow(jobCard);
  }

  digitalWrite(PIN_LED, LOW);
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(RESULT_DWELL_MS);
  screenIdle();
}

/* ======================================================================= */
/*                             CARD READING                                 */
/* ======================================================================= */

/* NTAG213 user memory starts at page 4. MIFARE_Read returns 16 bytes (4 pages)
   per call, so two calls cover pages 4-11 — 32 bytes, comfortably more than an
   18-character job card number inside an NDEF text record. No authentication
   is needed for NTAG. */
String readJobCardNumber() {
  byte buf[64];
  byte n = 0;

  for (byte page = 4; page <= 8; page += 4) {
    byte chunk[18];                 // 16 data + 2 CRC
    byte size = sizeof(chunk);
    MFRC522::StatusCode st = rfid.MIFARE_Read(page, chunk, &size);
    if (st != MFRC522::STATUS_OK) {
      Serial.printf("[card] read page %u failed: %s\n",
                    page, rfid.GetStatusCodeName(st));
      break;
    }
    for (byte i = 0; i < 16 && n < sizeof(buf); i++) buf[n++] = chunk[i];
  }

  if (n == 0) return "";
  return parseNdefText(buf, n);
}

/* Parse an NDEF text record out of the raw page bytes.
 *
 * Expected layout written by scripts/write_card.py:
 *   0x03 <tlvLen>            NDEF message TLV
 *   0xD1 0x01 <payloadLen>   record header: MB|ME|SR, type length 1
 *   0x54                     type 'T' (text)
 *   <status> <lang...>       status byte; low 6 bits = language code length
 *   <text...>                the job card number
 *
 * Tolerant on purpose: cards get written by different tools, and a reader that
 * only accepts one exact byte layout fails in the field for no good reason.
 * Falls back to the longest printable ASCII run if the headers do not match. */
String parseNdefText(const byte* buf, byte len) {
  for (byte i = 0; i + 6 < len; i++) {
    if (buf[i] != 0x03) continue;                 // NDEF TLV
    byte p = i + 2;                               // skip tag + length
    if (p + 4 >= len) break;
    if ((buf[p] & 0x07) != 0x01) continue;        // TNF 1, well-known
    byte payloadLen = buf[p + 2];
    if (buf[p + 3] != 0x54) continue;             // type 'T'
    byte statusAt = p + 4;
    if (statusAt >= len) break;
    byte langLen  = buf[statusAt] & 0x3F;
    byte textAt   = statusAt + 1 + langLen;
    byte textLen  = (payloadLen > 1 + langLen) ? payloadLen - 1 - langLen : 0;
    if (textLen == 0 || textAt + textLen > len) break;

    String out;
    for (byte k = 0; k < textLen; k++) {
      char c = (char)buf[textAt + k];
      if (c >= 32 && c <= 126) out += c;
    }
    out.trim();
    if (out.length()) return out;
  }
  return longestPrintableRun(buf, len);
}

String longestPrintableRun(const byte* buf, byte len) {
  String best, cur;
  for (byte i = 0; i < len; i++) {
    char c = (char)buf[i];
    bool ok = (c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') ||
              (c >= 'a' && c <= 'z') || c == '-' || c == '/';
    if (ok) { cur += c; }
    else    { if (cur.length() > best.length()) best = cur; cur = ""; }
  }
  if (cur.length() > best.length()) best = cur;
  best.trim();
  return best.length() >= 6 ? best : "";
}

bool isSameCardWithinLockout() {
  if (rfid.uid.size != lastUidLen) return false;
  if (millis() - lastReadAt > SAME_CARD_LOCKOUT) return false;
  for (byte i = 0; i < rfid.uid.size; i++)
    if (rfid.uid.uidByte[i] != lastUid[i]) return false;
  return true;
}

void rememberCard() {
  lastUidLen = rfid.uid.size;
  for (byte i = 0; i < lastUidLen && i < sizeof(lastUid); i++)
    lastUid[i] = rfid.uid.uidByte[i];
  lastReadAt = millis();
}

/* ======================================================================= */
/*                               BACKEND                                    */
/* ======================================================================= */

/* GET {BACKEND_URL}/api/nfc/resolve?job_card=...
 *
 * The backend returns ASCII-safe fields only, because this screen cannot
 * render Indic text:
 *   { "found": true, "name_latin": "...", "panchayat_latin": "...",
 *     "unpaid_paise": 180000, "days_missing": 6, "status": "due" }
 *
 * Money crosses the wire in paise as an integer. Never as a float — a rounding
 * error in someone's wages is not an acceptable class of bug. */
void lookupAndShow(const String& jobCard) {
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/nfc/resolve?job_card=" + jobCard;

  http.setTimeout(HTTP_TIMEOUT_MS);
  http.setConnectTimeout(HTTP_TIMEOUT_MS);
  if (!http.begin(url)) {
    screenMessage("LOOKUP FAILED", "bad backend url", C_CRIT);
    return;
  }
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);

  int code = http.GET();
  if (code != 200) {
    Serial.printf("[http] status %d\n", code);
    screenMessage("LOOKUP FAILED", ("http " + String(code)).c_str(), C_CRIT);
    http.end();
    return;
  }

  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, http.getStream());
  http.end();

  if (err) {
    Serial.printf("[json] %s\n", err.c_str());
    screenMessage("BAD RESPONSE", err.c_str(), C_CRIT);
    return;
  }

  if (!doc["found"].as<bool>()) {
    screenMessage("NOT ON FILE", "run an audit first", C_MUTED);
    return;
  }

  screenResult(
    doc["name_latin"]      | "-",
    doc["panchayat_latin"] | "-",
    doc["unpaid_paise"]    | 0L,
    doc["days_missing"]    | 0,
    doc["status"]          | "unknown"
  );
}

/* ======================================================================= */
/*                                SCREENS                                   */
/* ======================================================================= */

void chrome(const char* heading, uint16_t accent) {
  tft.fillScreen(C_PAPER);
  tft.fillRect(0, 0, 320, 34, C_NAVY);
  // the tricolour rule from the dashboard masthead, 3px
  tft.fillRect(0,   34, 107, 3, 0xFCA6);   // saffron #ff9933
  tft.fillRect(107, 34, 106, 3, 0xFFFF);   // white
  tft.fillRect(213, 34, 107, 3, 0x1420);   // green #138808

  tft.setTextColor(C_PAPER, C_NAVY);
  tft.setTextDatum(ML_DATUM);
  tft.drawString("SAAKSHI", 10, 17, 2);

  tft.setTextColor(accent, C_PAPER);
  tft.setTextDatum(TL_DATUM);
  tft.drawString(heading, 10, 48, 2);
}

void splash(const char* title, const char* sub) {
  chrome(title, C_NAVY);
  tft.setTextColor(C_MUTED, C_PAPER);
  tft.drawString(sub, 10, 72, 2);
}

void screenIdle() {
  chrome("READY", C_NAVY);
  tft.setTextColor(C_INK, C_PAPER);
  tft.drawString("Tap a job card", 10, 90, 4);
  tft.setTextColor(C_MUTED, C_PAPER);
  tft.drawString("Reads the number only.", 10, 130, 2);
  tft.drawString("No documents are stored on the card.", 10, 150, 2);

  tft.setTextDatum(BL_DATUM);
  tft.setTextColor(C_MUTED, C_PAPER);
  tft.drawString(WiFi.localIP().toString(), 10, 232, 1);
  tft.setTextDatum(TL_DATUM);
}

void screenMessage(const char* title, const char* detail, uint16_t accent) {
  chrome(title, accent);
  tft.setTextColor(C_INK, C_PAPER);
  tft.drawString(detail, 10, 96, 4);
}

void screenResult(const char* name, const char* panchayat,
                  long unpaidPaise, int daysMissing, const char* status) {
  bool due = (strcmp(status, "due") == 0) || unpaidPaise > 0;
  chrome(due ? "AMOUNT DUE" : "NO DISCREPANCY", due ? C_AMBER : C_GOOD);

  tft.setTextColor(C_INK, C_PAPER);
  tft.drawString(name, 10, 46, 4);

  tft.setTextColor(C_MUTED, C_PAPER);
  tft.drawString(panchayat, 10, 78, 2);

  // The figure, large. Rupees and paise, never abbreviated — this is money
  // someone is owed and it gets read aloud at a village meeting.
  char amount[24];
  snprintf(amount, sizeof(amount), "Rs %ld.%02ld",
           unpaidPaise / 100, labs(unpaidPaise % 100));
  tft.setTextColor(due ? C_AMBER : C_GOOD, C_PAPER);
  tft.drawString(amount, 10, 104, 6);

  char days[32];
  snprintf(days, sizeof(days), "%d day(s) missing from roll", daysMissing);
  tft.setTextColor(C_INK, C_PAPER);
  tft.drawString(days, 10, 162, 2);

  tft.setTextColor(C_MUTED, C_PAPER);
  tft.drawString("Open the app to file a grievance.", 10, 188, 2);
}

/* ======================================================================= */
/*                               PLUMBING                                   */
/* ======================================================================= */

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);   // never logged

  uint32_t started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < WIFI_TIMEOUT_MS) {
    delay(250);
    Serial.print('.');
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("[wifi] "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(F("[wifi] failed"));
  }
}

void beep(uint16_t ms) {
  digitalWrite(PIN_BUZZER, HIGH);
  delay(ms);
  digitalWrite(PIN_BUZZER, LOW);
}

/* Identifiers are masked in every log line. A leaked job card number links a
   named person to a government entitlement dispute. */
String maskId(const String& id) {
  if (id.length() <= 4) return "****";
  String out;
  for (size_t i = 0; i < id.length() - 4; i++) out += '*';
  return out + id.substring(id.length() - 4);
}
