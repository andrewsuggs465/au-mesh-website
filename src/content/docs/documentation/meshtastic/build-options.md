---
title: Popular Build Options
description: WisBlock, Heltec, and Lilygo hardware platforms compared.
sidebar:
  order: 4
---

Once you've chosen an MCU and modem configuration, the next step is selecting a hardware platform. Here are three popular build options:

## Option A: WisBlock Meshtastic Starter Kit

RAK4631 Core module + RAK19007 Base Board

<img src="/images/Wisblock.png" alt="RAK WisBlock" width="300" height="432" />

## Option B: Heltec V4

WiFi LoRa 32 (V4), ESP32S3 + SX1262 LoRa Node, Meshtastic and LoRaWAN Compatible + L76K GNSS Module

<img src="/images/Heltec.png" alt="Heltec V4" width="300" height="300" />

## Option C: Lilygo T-Beam

Lilygo T-Beam Meshtastic

<img src="/images/Lilygo.png" alt="Lilygo T-Beam" width="300" height="300" />

## Full Board Comparison

| Board | WisBlock Meshtastic Starter Kit | Heltec V4 | Lilygo T-Beam |
| :------- | :----------- | :-------- | :------------ |
| Full Name | RAK4631 Core module + RAK19007 Base Board | WiFi LoRa 32 (V4), ESP32S3 + SX1262 LoRa Node, Meshtastic and LoRaWAN Compatible + L76K GNSS Module | Lilygo T-Beam Meshtastic |
| Link | [WisBlock Meshtastic Starter Kit](https://store.rakwireless.com/products/wisblock-meshtastic-starter-kit?index=6&intsource=rak_store&intmedium=organic&intcampaign=meshtastic_collection_page&intterm=hot_deals&intcontent=product_header&variant=43884034785478) | [Heltec V4](https://heltec.org/project/wifi-lora-32-v4/?attribute_pa_band=902-928mhz&attribute_display=OLED&attribute_transmission-power=28dbm&attribute_warehouse=US+%28United+States%29+Warehouse) | [Lilygo T-beam](https://lilygo.cc/en-us/products/t-beam-meshtastic?variant=45348463280309) |
| Price (Will be covered by club) | $30.99 | $27.90 | $33.15 |
| Microcontroller | Nordic nRF52840 | ESP32-S3R2 | ESP32 |
| Radio Chip | SX-1262 | SX-1262 | SX-1276 |
| TX Power | ~160mW (22dBm) | ~630mW (28dBm) | ~100mW (20dBm) |
| Includes GPS | No | Yes (external module) | Yes |
| WiFi | No | Yes | Yes |
| Screen | Optional (RAK1921) | 0.96in OLED | 0.96in OLED |
| Est. Battery Life (3000mAh) | ~278 hrs (11 days) | ~10.7 hrs | ~18.75 hrs *Note must use (one) 18650 cell* |

## Recommendations

**RAK WisBlock** is the usual first pick. The boards are **modular**, so you can
mix and match cores, radios, sensors, and power modules, and they come in
different sizes to fit whatever enclosure you are building. That modularity is
what makes them easy to extend later.

**Heltec** boards are all-in-one instead: a complete LoRa development board with
an **OLED display** and **higher TX power** already on it. Pick these if you want
less assembly.

For a **stationary or infrastructure node**, look at the
**[Heltec Meshtower](https://heltec.org/project/meshtower/)** or a comparable
RAK-based solar enclosure. These are built to sit outside long term, and usually
include:

- Solar charging
- Battery support
- Weatherproof enclosures
- Higher-gain external antennas for increased coverage
