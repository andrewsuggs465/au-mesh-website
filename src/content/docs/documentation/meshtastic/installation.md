---
title: Installation
description: Installing the Meshtastic app and flashing firmware.
sidebar:
  order: 7
---

:::caution
Never power on a LoRa radio without an antenna attached.
:::

Power on your node *with the antenna attached*, then connect via Bluetooth or USB.

## Install the Meshtastic App

- **Android:** [Google Play](https://play.google.com/store/apps/details?id=com.geeksville.mesh&hl=en-US) / [F-Droid](https://f-droid.org/packages/com.geeksville.mesh/) / [Github](https://github.com/meshtastic/Meshtastic-Android/releases)
- **iOS:** [App Store](https://apps.apple.com/us/app/meshtastic/id1586432531)
- **Linux:** [Meshtasticd](https://meshtastic.org/docs/hardware/devices/linux-native-hardware/)
- **Browser:** [Web Client](https://client.meshtastic.org)

---

## Web installation

Go to [Meshtastic Web Flasher](https://flasher.meshtastic.org), choose your device, then enable device firmware update (DFU) mode, depending on model, then flash the firmware!

### ESP32 DFU / USB Flashing

1. Hold the **BOOT** button (GPIO0)
2. Press and release **EN/RST**
3. Release **BOOT**

### nRF52840 USB DFU

1. Double-tap the **reset** button quickly
2. A USB mass storage drive appears (e.g., `NRF52BOOT`)
3. Drag and drop your `.uf2` file onto the drive, and you are done

---

## CLI Flashing

### ESP32 Device

[Meshtastic Docs](https://meshtastic.org/docs/getting-started/flashing-firmware/esp32/cli-script/)

### nRF52, RP2040, RP3250

[Meshtastic Docs](https://meshtastic.org/docs/getting-started/flashing-firmware/nrf52/)
