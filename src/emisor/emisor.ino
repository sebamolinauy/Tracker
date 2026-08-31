#include <SPI.h>
#include <LoRa.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include "SSD1306Wire.h"
#include "config.h"

#define SCK   5
#define MISO 19
#define MOSI 27
#define SS    18
#define RST   23
#define DIO0  26

SSD1306Wire display(0x3c, SDA, SCL);

TinyGPSPlus gps;
HardwareSerial GPS_Serial(1);

float leerBateriaPorcentaje() {
  const int muestras = 8;
  uint32_t suma = 0;
  for (int i = 0; i < muestras; i++) {
    suma += analogRead(BAT_PIN);
    delay(2);
  }
  float raw = suma / (float)muestras;
  float voltage = (raw / 4095.0f) * 3.3f * BAT_DIVIDER;
  float pct = (voltage - BAT_VOLT_MIN) / (BAT_VOLT_MAX - BAT_VOLT_MIN) * 100.0f;
  if (pct < 0) pct = 0;
  if (pct > 100) pct = 100;
  return pct;
}

void mostrarLinea(const char* linea1, const char* linea2 = nullptr, const char* linea3 = nullptr) {
  display.clear();
  display.drawString(0, 0, linea1);
  if (linea2) {
    display.drawString(0, 15, linea2);
  }
  if (linea3) {
    display.drawString(0, 30, linea3);
  }
  display.display();
}

bool iniciarLoRa() {
  SPI.begin(SCK, MISO, MOSI, SS);
  LoRa.setPins(SS, RST, DIO0);

  while (!LoRa.begin(LORA_BAND)) {
    Serial.println("Esperando LoRa...");
    mostrarLinea("Error LoRa");
    delay(1000);
  }

  Serial.println("LoRa OK");
  return true;
}

String armarMensaje(float lat, float lon, float speed, float battery) {
  return VEHICULO_ID + String(",") +
    String(lat, 6) + String(",") +
    String(lon, 6) + String(",") +
    String(speed, 1) + String(",") +
    String(battery, 0);
}

bool enviarPorLoRa(const String& mensaje) {
  LoRa.beginPacket();
  LoRa.print(mensaje);
  return LoRa.endPacket();
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  display.init();
  display.flipScreenVertically();
  display.setFont(ArialMT_Plain_10);

  mostrarLinea("Iniciando...");

  Serial.println("================================");
  Serial.println(" EMISOR GPS + LoRa");
  Serial.println("================================");
  Serial.print("Vehiculo: ");
  Serial.println(VEHICULO_ID);

  GPS_Serial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  pinMode(BAT_PIN, INPUT);
  analogSetAttenuation(ADC_11db);

  if (!iniciarLoRa()) {
    return;
  }

  mostrarLinea("LoRa OK", "Esperando GPS");
  delay(500);
}

void loop() {
  while (GPS_Serial.available()) {
    gps.encode(GPS_Serial.read());
  }

  static unsigned long ultimoEnvio = 0;
  unsigned long ahora = millis();

  if (ahora - ultimoEnvio < INTERVALO_ENVIO_MS) {
    return;
  }

  ultimoEnvio = ahora;

  if (!gps.location.isValid()) {
    Serial.println("Sin senal GPS");

    display.clear();
    display.drawString(0, 0, "Esperando GPS");
    display.drawString(0, 15, "Sin fix");
    if (gps.satellites.isValid()) {
      display.drawString(0, 30, "SAT: " + String(gps.satellites.value()));
    }
    display.display();
    return;
  }

  float lat = gps.location.lat();
  float lon = gps.location.lng();
  float speed = gps.speed.isValid() ? gps.speed.kmph() : 0;
  int sats = gps.satellites.isValid() ? gps.satellites.value() : 0;
  float battery = leerBateriaPorcentaje();

  String mensaje = armarMensaje(lat, lon, speed, battery);

  if (!enviarPorLoRa(mensaje)) {
    Serial.println("Error al transmitir LoRa");
    mostrarLinea("Error TX LoRa");
    return;
  }

  Serial.println("Enviado:");
  Serial.println(mensaje);
  Serial.print("Satelites: ");
  Serial.println(sats);
  Serial.print("Bateria: ");
  Serial.println(battery, 0);

  display.clear();
  display.drawString(0, 0, "TRANSMITIENDO");
  display.drawString(0, 15, VEHICULO_ID);
  display.drawString(0, 30, "SAT: " + String(sats) + " BAT: " + String(battery, 0) + "%");
  display.drawString(0, 45, String(lat, 4) + "," + String(lon, 4));
  display.display();
}
