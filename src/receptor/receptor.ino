#include <SPI.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <LoRa.h>
#include "SSD1306Wire.h"
#include "config.h"

#define SCK   5
#define MISO 19
#define MOSI 27
#define SS    18
#define RST   23
#define DIO0  26

#define HTTP_TIMEOUT_MS 5000

SSD1306Wire display(0x3c, SDA, SCL);

struct Posicion {
  String id;
  float lat;
  float lon;
  float speed;
  float battery;
  bool valid;
};

void mostrarLinea(const char* linea1, const char* linea2 = nullptr) {
  display.clear();
  display.drawString(0, 0, linea1);
  if (linea2) {
    display.drawString(0, 15, linea2);
  }
  display.display();
}

bool conectarWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  mostrarLinea("WiFi...", WIFI_SSID);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 30) {
    delay(500);
    Serial.print(".");
    intentos++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nError WiFi");
    mostrarLinea("Error WiFi");
    return false;
  }

  Serial.println("\nWiFi conectado");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  mostrarLinea("WiFi OK", WiFi.localIP().toString().c_str());
  delay(1000);

  return true;
}

Posicion parsearPaquete(const String& mensaje) {
  Posicion posicion;
  posicion.valid = false;

  String linea = mensaje;
  linea.trim();
  if (!linea.length()) {
    return posicion;
  }

  String campos[5];
  int campoIndex = 0;
  int inicio = 0;

  while (campoIndex < 5) {
    int fin = linea.indexOf(',', inicio);
    String parte = fin >= 0 ? linea.substring(inicio, fin) : linea.substring(inicio);
    parte.trim();
    campos[campoIndex++] = parte;
    if (fin < 0) break;
    inicio = fin + 1;
  }

  auto leerValor = [](const String& parte) -> String {
    int separador = parte.indexOf('=');
    if (separador < 0) return parte;
    return parte.substring(separador + 1);
  };

  if (linea.indexOf("ID=") >= 0) {
    posicion.id = leerValor(campos[0]);
    posicion.lat = leerValor(campos[1]).toFloat();
    posicion.lon = leerValor(campos[2]).toFloat();
    posicion.speed = leerValor(campos[3]).toFloat();
    posicion.battery = leerValor(campos[4]).toFloat();
  } else if (campoIndex >= 3) {
    posicion.id = campos[0];
    posicion.lat = campos[1].toFloat();
    posicion.lon = campos[2].toFloat();
    posicion.speed = campoIndex >= 4 ? campos[3].toFloat() : 0;
    posicion.battery = campoIndex >= 5 ? campos[4].toFloat() : 0;
  } else {
    return posicion;
  }

  if (
    posicion.id.length() == 0
    || posicion.lat < -90 || posicion.lat > 90
    || posicion.lon < -180 || posicion.lon > 180
  ) {
    return posicion;
  }

  posicion.valid = true;
  return posicion;
}

bool enviarPosicion(const Posicion& posicion) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado, reintentando...");
    if (!conectarWifi()) {
      return false;
    }
  }

  HTTPClient http;
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + API_TOKEN);

  String body = "{";
  body += "\"id\":\"" + posicion.id + "\",";
  body += "\"lat\":" + String(posicion.lat, 6) + ",";
  body += "\"lon\":" + String(posicion.lon, 6) + ",";
  body += "\"speed\":" + String(posicion.speed, 1) + ",";
  body += "\"battery\":" + String(posicion.battery, 1);
  body += "}";

  Serial.println("Enviando:");
  Serial.println(body);

  int status = http.POST(body);
  String respuesta = http.getString();
  http.end();

  Serial.print("HTTP ");
  Serial.println(status);
  if (respuesta.length()) {
    Serial.println(respuesta);
  }

  display.clear();
  display.drawString(0, 0, "HTTP " + String(status));
  display.drawString(0, 15, posicion.id);
  display.drawString(0, 30, String(posicion.lat, 4) + "," + String(posicion.lon, 4));
  display.display();

  return status >= 200 && status < 300;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  display.init();
  display.flipScreenVertically();
  display.setFont(ArialMT_Plain_10);

  mostrarLinea("Iniciando...");

  if (!conectarWifi()) {
    Serial.println("Continuando sin WiFi");
  }

  SPI.begin(SCK, MISO, MOSI, SS);
  LoRa.setPins(SS, RST, DIO0);

  while (!LoRa.begin(915E6)) {
    Serial.println("Esperando LoRa...");
    mostrarLinea("Error LoRa");
    delay(1000);
  }

  Serial.println("RECEPTOR LISTO");
  mostrarLinea("RX LISTO");
}

void loop() {
  int packetSize = LoRa.parsePacket();

  if (!packetSize) {
    return;
  }

  String mensaje = "";

  while (LoRa.available()) {
    mensaje += (char)LoRa.read();
  }

  Serial.println("Recibido:");
  Serial.println(mensaje);

  display.clear();
  display.drawString(0, 0, "PAQUETE RX");
  display.drawString(0, 15, mensaje.substring(0, 20));
  display.drawString(0, 40, "RSSI:");
  display.drawString(40, 40, String(LoRa.packetRssi()));
  display.display();

  Posicion posicion = parsearPaquete(mensaje);

  if (!posicion.valid) {
    Serial.println("Paquete invalido");
    mostrarLinea("Paquete invalido");
    return;
  }

  enviarPosicion(posicion);
}
