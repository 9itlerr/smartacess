#include <EEPROM.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <WiFi.h>

// Mode de l'ESP32
enum Mode { CONFIG, NORMAL };
Mode currentMode = CONFIG;

WebServer server(80);

// Structure pour sauvegarder la configuration
struct Config {
  char ssid[32];
  char password[64];
  char serverUrl[100];
  char deviceId[20];
  char secretKey[20];
  bool configured;
};

Config config;

void setup() {
  Serial.begin(115200);
  EEPROM.begin(512);

  Serial.println("\n══════════════════════════════════");
  Serial.println("      ESP32 SmartAccess");
  Serial.println("══════════════════════════════════");

  // Lire la configuration
  EEPROM.get(0, config);

  if (config.configured) {
    // Mode NORMAL - Connecte au WiFi de l'utilisateur
    Serial.println("Mode: NORMAL");
    Serial.print("Connexion à: ");
    Serial.println(config.ssid);

    WiFi.begin(config.ssid, config.password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n✅ Connecté au WiFi!");
      Serial.print("IP: ");
      Serial.println(WiFi.localIP());
      currentMode = NORMAL;
      startNormalMode();
    } else {
      Serial.println("\n❌ Échec connexion WiFi");
      startConfigMode();
    }
  } else {
    // Mode CONFIG - Crée un point d'accès
    Serial.println("Mode: CONFIGURATION");
    startConfigMode();
  }
}

void loop() {
  server.handleClient();

  if (currentMode == NORMAL) {
    // En mode normal, envoyer un ping régulièrement
    static unsigned long lastPing = 0;
    if (millis() - lastPing > 30000) {
      sendPing();
      lastPing = millis();
    }

    // Simulation RFID
    static unsigned long lastRFID = 0;
    if (millis() - lastRFID > 10000) {
      simulateRFID();
      lastRFID = millis();
    }
  }
}

// ================= MODE CONFIGURATION =================
void startConfigMode() {
  currentMode = CONFIG;

  // Créer un point d'accès temporaire
  WiFi.softAP("SmartAccess-Setup", "setup123");

  Serial.println("\n📱 MODE CONFIGURATION:");
  Serial.println("WiFi: SmartAccess-Setup");
  Serial.println("Password: setup123");
  Serial.print("IP: ");
  Serial.println(WiFi.softAPIP());
  Serial.println("Allez à: http://192.168.4.1");
  Serial.println("══════════════════════════════════\n");

  // Page web de configuration
  server.on("/", HTTP_GET, []() {
    String page = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Configuration ESP32</title>
  <style>
    body { font-family: Arial; padding: 20px; max-width: 400px; margin: 0 auto; }
    .step { background: #e8f4ff; padding: 15px; margin: 15px 0; border-radius: 8px; }
    input { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; }
    button { background: #4CAF50; color: white; padding: 12px; width: 100%; border: none; border-radius: 4px; font-size: 16px; }
  </style>
</head>
<body>
  <h2>⚙️ Configuration ESP32</h2>
  
  <div class="step">
    <h3>1. Votre WiFi</h3>
    <input id="ssid" placeholder="Nom de votre WiFi (SSID)">
    <input id="password" type="password" placeholder="Mot de passe WiFi">
  </div>
  
  <div class="step">
    <h3>2. Informations ESP32</h3>
    <p>Device ID: <strong id="deviceId">ESP-)rawliteral" +
                  String(ESP.getEfuseMac(), HEX) + R"rawliteral(</strong></p>
    <p>Secret Key: <strong id="secretKey">123456</strong></p>
  </div>
  
  <div class="step">
    <h3>3. Valider</h3>
    <button onclick="saveConfig()">✅ Enregistrer Configuration</button>
  </div>
  
  <script>
    function saveConfig() {
      const config = {
        ssid: document.getElementById('ssid').value,
        password: document.getElementById('password').value,
        deviceId: document.getElementById('deviceId').textContent,
        secretKey: document.getElementById('secretKey').textContent
      };
      
      fetch('/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(config)
      })
      .then(() => {
        alert('Configuration sauvegardée! Redémarrage...');
        setTimeout(() => location.reload(), 2000);
      });
    }
  </script>
</body>
</html>
)rawliteral";
    server.send(200, "text/html", page);
  });

  server.on("/save", HTTP_POST, []() {
    if (server.hasArg("plain")) {
      String body = server.arg("plain");

      // Sauvegarder la configuration
      strncpy(config.ssid, server.arg("ssid").c_str(), 31);
      strncpy(config.password, server.arg("password").c_str(), 63);
      strncpy(config.deviceId, server.arg("deviceId").c_str(), 19);
      strncpy(config.secretKey, server.arg("secretKey").c_str(), 19);
      strncpy(config.serverUrl, "http://192.168.1.100:3000", 99); // IP du PC
      config.configured = true;

      EEPROM.put(0, config);
      EEPROM.commit();

      server.send(200, "application/json", "{\"status\":\"ok\"}");

      // Redémarrer dans 2 secondes
      delay(2000);
      ESP.restart();
    }
  });

  server.begin();
}

// ================= MODE NORMAL =================
void startNormalMode() {
  // Page web d'information simple
  server.on("/", HTTP_GET, []() {
    String page = "<html><body style='font-family:Arial;padding:20px;'>";
    page += "<h2>ESP32 SmartAccess</h2>";
    page += "<p><strong>Status:</strong> ✅ Actif</p>";
    page += "<p><strong>WiFi:</strong> " + String(config.ssid) + "</p>";
    page +=
        "<p><strong>Device ID:</strong> " + String(config.deviceId) + "</p>";
    page += "<p>Connecté au serveur: " + String(config.serverUrl) + "</p>";
    page += "</body></html>";
    server.send(200, "text/html", page);
  });

  server.begin();

  // Enregistrer l'appareil sur le serveur
  registerDevice();
}

void registerDevice() {
  HTTPClient http;
  http.begin(String(config.serverUrl) + "/api/esp32/register");
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"deviceId\":\"" + String(config.deviceId) +
                   "\",\"secretKey\":\"" + String(config.secretKey) + "\"}";

  http.POST(payload);
  http.end();
}

void sendPing() {
  HTTPClient http;
  http.begin(String(config.serverUrl) + "/api/esp32/ping");
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"deviceId\":\"" + String(config.deviceId) +
                   "\",\"secretKey\":\"" + String(config.secretKey) + "\"}";

  http.POST(payload);
  http.end();
}

void simulateRFID() {
  String badgeId = "TEST" + String(millis() % 1000);

  HTTPClient http;
  http.begin(String(config.serverUrl) + "/api/esp32/scan");
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"deviceId\":\"" + String(config.deviceId) +
                   "\",\"secretKey\":\"" + String(config.secretKey) +
                   "\",\"badgeId\":\"" + badgeId + "\"}";

  http.POST(payload);
  http.end();
}