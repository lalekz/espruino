# Espruino Projects Collection

This repository contains a collection of projects designed to work with Espruino-based controllers using the Espruino Web IDE environment.

## Prerequisites

To work with these projects, you'll need:

1. **Espruino Web IDE** - the development environment for programming Espruino-compatible controllers
   - [Online version](https://www.espruino.com/ide/)
   - [Desktop version](https://www.espruino.com/Web+IDE#download)

2. **Amperka Modules** - additional JavaScript modules for hardware interaction
   - Add to Espruino Web IDE settings:
     ```
     https://www.espruino.com/modules | https://js.amperka.ru/modules
     ```

## Supported Controllers

These projects are compatible with:
- Espruino controllers
- Iskra JS
- Iskra JS Mini
- BBC micro:bit
- STM32 Nucleo
- Wi-Fi Slot
- ESP32 WROOM DevKit v1

## Setup Instructions

### 1. Install Espruino Web IDE
Choose either the online or desktop version based on your operating system:
- Windows 8+ can use either version
- Windows 7 and below should use the desktop version

### 2. Configure Module URLs
Add Amperka modules to your Espruino Web IDE:
1. Go to Settings → Communications
2. In the "Module URL" field, enter:
   ```
   https://www.espruino.com/modules | https://js.amperka.ru/modules
   ```

### 3. Install Drivers (Windows only)
For STM32-based controllers, install the ST-LINK driver.

## Connection Methods

### Wireless (BLE)
Supported devices:
- Espruino MDBT42Q Breakout
- Espruino Puck.js
- Espruino Pixl.js

### Wired (UART)
Supported via USB connection for all listed controllers.

## Getting Started

1. Connect your controller to the Espruino Web IDE
2. Load one of the project files
3. Click the upload button (➡️) to flash the code to your device
4. Monitor debug output in the console

## Troubleshooting

If you encounter connection issues:
1. Try resetting your controller with `reset()` in the console
2. Verify you have the latest firmware version
3. Check your module URLs in settings
4. For Windows users, ensure proper drivers are installed
