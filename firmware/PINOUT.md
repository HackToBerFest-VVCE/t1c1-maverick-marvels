# Pin assignments — ESP32 DevKit v1 (30-pin)

Pin numbers only, as requested. All numbers are **GPIO** numbers, which is what
the sketch uses — not the physical pin position on the board.

Both peripherals share the ESP32's VSPI bus. Only the chip-select lines differ,
which is how two SPI devices coexist on one bus.

---

## RC522 RFID/NFC reader → ESP32

| RC522 pin | ESP32 GPIO |
|---|---|
| SDA / SS / CS | **5** |
| SCK | **18** |
| MOSI | **23** |
| MISO | **19** |
| RST | **22** |
| IRQ | not connected |
| GND | GND |
| VCC | **3V3** |

> **The RC522 is a 3.3V part.** 5V on VCC destroys it. There is no protection
> diode on the common red breakout board.

---

## ILI9341 TFT display (SPI) → ESP32

| TFT pin | ESP32 GPIO |
|---|---|
| CS | **15** |
| DC / RS | **2** |
| RESET | **4** |
| SDI / MOSI | **23** *(shared with RC522)* |
| SCK | **18** *(shared with RC522)* |
| SDO / MISO | **19** *(shared with RC522)* |
| LED / BL | **3V3** |
| VCC | **3V3** |
| GND | GND |

> GPIO 2 and GPIO 15 are strapping pins. They work fine for the TFT in normal
> operation, but if the board ever refuses to enter flash mode, unplug the TFT,
> flash, then reconnect.

---

## Indicators

| Part | ESP32 GPIO | Notes |
|---|---|---|
| Active buzzer (+) | **27** | short beep on a successful read |
| Status LED (anode) | **26** | through a 220Ω resistor to GND |

---

## Pins to leave alone

| GPIO | Why |
|---|---|
| 6, 7, 8, 9, 10, 11 | wired to the on-board SPI flash — using them bricks boot |
| 0 | boot strapping; held low enters flash mode |
| 34, 35, 36, 39 | input-only, no internal pull-up — no good for CS or RST |
| 1, 3 | UART0, used by serial monitor and flashing |

---

## TFT_eSPI configuration

The TFT_eSPI library reads its pins from `User_Setup.h`, **not** from the sketch.
Edit that file in the library folder, or ship a local `User_Setup.h` and define
`USER_SETUP_LOADED`. These values must match the table above:

```c
#define ILI9341_DRIVER
#define TFT_MISO 19
#define TFT_MOSI 23
#define TFT_SCLK 18
#define TFT_CS   15
#define TFT_DC    2
#define TFT_RST   4
#define SPI_FREQUENCY 40000000
#define LOAD_GLCD
#define LOAD_FONT2
#define LOAD_FONT4
```

A blank white screen almost always means these do not match the wiring.

---

## Libraries

| Library | Purpose |
|---|---|
| `MFRC522` (miguelbalboa) | RC522 reader |
| `TFT_eSPI` (Bodmer) | ILI9341 display |
| `ArduinoJson` v7 | parse the backend response |
| `WiFi`, `HTTPClient` | bundled with the ESP32 core |

Board in Arduino IDE: **ESP32 Dev Module**. Upload speed 921600. Partition
scheme: default.
