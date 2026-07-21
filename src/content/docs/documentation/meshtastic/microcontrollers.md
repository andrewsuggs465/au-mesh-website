---
title: Microcontrollers & Modems
description: MCU, LoRa modem, and GNSS options for Meshtastic nodes.
sidebar:
  order: 3
---

## Microcontrollers (MCUs)

### ESP32 / ESP32-S3

- **Best for:** MQTT gateways, portable nodes
- **Pros:** 2.4 GHz WiFi
- **Cons:** Higher power draw
- **Cost:** Low (~$2–$8 module)

| Feature | Detail |
|---|---|
| **Architecture** | Xtensa LX6 dual-core @ 240 MHz (ESP32); LX7 dual-core @ 240 MHz (S3) |
| **RAM** | 520 KB SRAM (ESP32); 512 KB + optional PSRAM (S3) |
| **Flash** | External, typically 4–16 MB |
| **Wi-Fi** | 802.11 b/g/n 2.4 GHz — yes on both |
| **Bluetooth** | BT Classic + BLE 4.2 (ESP32); BLE 5.0 (S3) |
| **Sleep Current** | ~10 µA deep sleep; ~40–80 mA typical active RX |
| **Operating Voltage** | 3.0–3.6 V |
| **USB** | Requires CP2102/CH340 bridge (ESP32); native USB on S3 |

### nRF52840

- **Best for:** Solar/battery-powered handhelds
- **Pros:** Exceptional power efficiency (~2 µA deep sleep)
- **Cons:** No Wi-Fi, mid-tier pricing
- **Cost:** Mid (~$10–$20 module)

| Feature | Detail |
|---|---|
| **Architecture** | ARM Cortex-M4F @ 64 MHz |
| **RAM** | 256 KB SRAM |
| **Flash** | 1 MB internal |
| **Wi-Fi** | None |
| **Bluetooth** | BLE 5.0 + Bluetooth Mesh + NFC |
| **Sleep Current** | ~2 µA deep sleep; as low as ~11 µA in typical Meshtastic standby |
| **Operating Voltage** | 1.7–5.5 V |
| **USB** | Native USB 2.0 Full Speed |

### SBC / Linux SoC

- **Best for:** Fixed gateway/router nodes, MQTT bridges, automation
- **Pros:** Full Linux OS, Wi-Fi/Bluetooth, can run Meshtastic daemon + other services
- **Cons:** High continuous power draw (600 mA – 2+ A @ 5 V), impractical for battery/sleep cycles
- **Cost:** High

| Feature | Detail |
|---|---|
| **Architecture** | ARM Cortex-A53/A72 @ 1.5–2.4 GHz |
| **RAM** | 512 MB – 8 GB |
| **Storage** | microSD / eMMC |
| **Wi-Fi** | 802.11ac dual-band (Pi 4/5, CM4) |
| **Bluetooth** | BLE 5.0 |
| **Idle Power** | ~600 mA – 2+ A @ 5 V |
| **Requires** | External LoRa HAT |

## LoRa Modems

### SX1262 / SX1268 (Sub-GHz, Recommended)

- **Pros:** Higher TX power, more efficient, smaller package

| Feature | Detail |
|---|---|
| **Frequency Bands** | SX1262: 868/915 MHz; SX1268: 433/470 MHz |
| **Range** | –148 dBm sensitivity @ SF12, 125 kHz BW |
| **Power** | ~4.6 mA RX, ~118 mA TX @ +22 dBm, 900 nA sleep |
| **Max TX Power** | +22 dBm |
| **Spreading Factors** | SF5–SF12 |
| **Bandwidth** | 7.8–500 kHz |
| **Max Air Data Rate** | ~62.5 kbps (LoRa mode) |
| **Interface** | SPI |
| **Supply Voltage** | 1.8–3.7 V |
| **Package** | QFN-24 (4×4 mm) |

### SX1276 / SX1278 (Legacy, Sub-GHz)

- **Status:** Legacy (still supported but not recommended)
- **Why:** Higher RX current, larger package, 3.3V only

| Feature | Detail |
|---|---|
| **Frequency Bands** | SX1276: 137–1020 MHz; SX1278: 137–525 MHz |
| **Range** | –148 dBm sensitivity @ SF12, 125 kHz BW |
| **Power** | ~10–12 mA RX, ~120 mA TX @ +20 dBm |
| **Max TX Power** | +20 dBm |
| **Spreading Factors** | SF6–SF12 |
| **Bandwidth** | 7.8–500 kHz |
| **Max Air Data Rate** | ~37.5 kbps (LoRa mode) |
| **Interface** | SPI |
| **Supply Voltage** | 3.3 V |
| **Package** | QFN-28 (6×6 mm) |

## GNSS

### L76K (Quectel)

- **Pros:** Low cost (~$2–5), minimal power draw, compact form factor
- **Cons:** Lower accuracy in urban canyons, less satellite constellation support

| Feature | Detail |
|---|---|
| **Positioning Support** | GPS, BeiDou, GLONASS |
| **Positioning Accuracy** | Standard precision (1-5 meters) |
| **Acquisition** | -148 dBm |
| **Re-Acquisition** | -160 dBm |
| **Tracking** | -162 dBm |
| **Position Accuracy (CEP)** | 2.0 meters |
| **Speed Accuracy** | 0.1 m/s |
| **Update Rate** | 5 Hz (configurable) |
| **Warm Start** | ~5–15 seconds |
| **Cold Start** | ~35 seconds |

### u-blox (NEO-M8 / NEO-M9 Series)

- **Pros:** Superior multi-constellation support, faster acquisition, better urban canyon performance, widely supported
- **Cons:** Higher cost (~$10–20), larger footprint, slightly higher power draw

| Feature | Detail |
|---|---|
| **Positioning Support** | GPS, BeiDou, GLONASS, Galileo (multi-constellation) |
| **Positioning Accuracy** | High precision (1–2.5 meters, 1–5 meters urban) |
| **Acquisition** | -150 dBm |
| **Re-Acquisition** | -163 dBm |
| **Tracking** | -166 dBm |
| **Position Accuracy (CEP)** | 1.0–1.5 meters |
| **Speed Accuracy** | 0.05 m/s |
| **Update Rate** | 10 Hz (configurable) |
| **Warm Start** | ~2–5 seconds |
| **Cold Start** | ~15–25 seconds |

### Quick Comparison

| | L76K | u-blox |
|---|---|---|
| **Cost** | $2–5 | $10–20 |
| **Accuracy (CEP)** | 2.0 m | 1.0–1.5 m |
| **Constellations** | 3 (GPS/BeiDou/GLONASS) | 4 (adds Galileo) |
| **Cold Start** | ~35 s | ~15–25 s |
| **Urban Performance** | Moderate | Excellent |
| **Power (active)** | 30–50 mA | 40–70 mA |
| **Best Use** | Budget builds, moderate precision | Precision required, difficult environments |
