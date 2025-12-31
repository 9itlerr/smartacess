# SmartAccess - RFID Access Control System

🔐 **Modern RFID-based employee access control system** with real-time monitoring and ESP32 integration.

## 🌟 Features

- ✅ **Real-time Access Control** - Monitor employee entries/exits instantly
- 📅 **Custom Schedules** - Define specific access hours per employee/group
- 📊 **Detailed Reports** - Generate access reports by period, employee, or department
- 🛡️ **Maximum Security** - Encrypted RFID badges with unauthorized access alerts
- 📱 **Mobile Friendly** - Responsive interface for all devices
- 🔌 **ESP32 Integration** - Easy connection with ESP32 RFID readers

## 🚀 Live Demo

Visit the live application: [SmartAccess on Vercel](https://smartacess.vercel.app)

## 📁 Project Structure

```
deepMINI/
├── frontend/           # Web interface
│   ├── index.html     # Landing page
│   ├── pages/         # Application pages
│   └── js/            # JavaScript files
├── backend/           # Node.js server
│   └── server.js      # API server
├── sketch_dec28a/     # Arduino sketch for ESP32
└── ESP32_SmartAccess/ # ESP32 configuration sketch
```

## 🛠️ Technologies

- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Backend**: Node.js, Express
- **Hardware**: ESP32, RFID-RC522
- **Deployment**: Vercel

## 📦 Installation

### Frontend (Vercel)
The frontend is automatically deployed on Vercel.

### Backend (Local)
```bash
cd backend
npm install
node server.js
```

### ESP32 Setup
1. Open `ESP32_SmartAccess/sketch_dec28a.ino` in Arduino IDE
2. Install required libraries: WiFi, HTTPClient, WebServer, EEPROM
3. Upload to your ESP32
4. Connect to "SmartAccess-Setup" WiFi network
5. Configure your WiFi credentials at http://192.168.4.1

## 🔧 Configuration

The ESP32 will create a configuration portal on first boot:
- **SSID**: SmartAccess-Setup
- **Password**: setup123
- **Config URL**: http://192.168.4.1

## 📝 License

University project - All rights reserved © 2024

## 👥 Author

Created by [@9itlerr](https://github.com/9itlerr)
