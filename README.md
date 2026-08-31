# Tracker

Sistema de seguimiento de vehículos. Este repositorio está en migración: el código legacy vive en `Desktop/Tracker/` y el proyecto nuevo se construye de a poco en `src/`.

## Componentes actuales

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| **API** | `src/api/` | Servidor HTTP Express con SQLite |
| **Admin** | `src/admin/` | Panel web React + Vite + Radix Themes |
| **CLI** | `src/cli/` | Scripts de utilidad (crear usuarios) |
| **Receptor** | `src/receptor/` | Firmware Arduino (LilyGo): recibe posiciones por LoRa y las envía a la API por WiFi |
| **Emisor** | `src/emisor/` | Firmware Arduino (LilyGo): lee GPS y transmite posición por LoRa |
| **Legacy** | `Desktop/Tracker/` | Monolito anterior (sin tocar por ahora) |

### Flujo del receptor

```
Emisor LoRa  →  LilyGo receptor (WiFi)  →  POST /api/receptor/posicion  →  SQLite (tabla vehiculo)
```

Los emisores pueden transmitir en cualquiera de estos formatos:

```
CAMION1,-34.9201,-56.1700,25,0
ID=CAMION1,LAT=-34.9201,LON=-56.1700,VEL=25,BAT=0
```

Orden: id, lat, lon, velocidad (km/h), batería del dispositivo emisor (%). Enviar 0 hasta tener lectura en el LilyGo.

## Stack

- **Backend:** Node.js, Express 5, Kysely, SQLite (`better-sqlite3`)
- **Frontend:** React 19, Vite, React Router, Radix Themes
- **Auth admin:** usuario/contraseña local, sesión JWT en cookie firmada httpOnly
- **Auth receptor:** Bearer token compartido (`RECEPTOR_API_KEY`)
- **Firmware:** Arduino / ESP32 (LoRa, WiFi, HTTPClient)

## Requisitos

- Node.js **20 o superior** (necesario por `--env-file`)
- En Windows: herramientas de compilación nativas para `better-sqlite3` (Visual Studio Build Tools)
- Para el receptor/emisor: [Arduino IDE](https://www.arduino.cc/en/software) con soporte ESP32 y librerías LoRa + OLED. Subir firmware con **Upload Speed = 115200** (ver [troubleshooting de upload](docs/dev/inicializacion.md#error-al-subir-firmware-arduino-ide) en la guía de inicialización)

## Inicio rápido

Instrucciones detalladas en [docs/dev/inicializacion.md](docs/dev/inicializacion.md).

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivos de entorno (ver docs para contenido de ejemplo)
mkdir -p variables
# crear variables/api.development.env y variables/admin.development.env

# 3. Crear el primer usuario administrador
npm run usuario-crear -- --email admin@tracker.local --nombre Admin --apellido Tracker --password tu-password --rol administrador

# 4. Levantar (dos terminales)
npm run api     # API (configurar HTTP_BIND=0.0.0.0 para pruebas con el LilyGo en LAN)
npm run admin   # http://localhost:3001/login
```

La API debe estar corriendo antes de usar el admin. Para probar el receptor LilyGo en la red local, la API tiene que escuchar en `0.0.0.0` y tener configurada `RECEPTOR_API_KEY`.

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run api` | Servidor API en modo desarrollo (con recarga automática) |
| `npm run admin` | Panel admin con Vite dev server |
| `npm run build-admin` | Build de producción del admin → `distribution/admin/` |
| `npm run usuario-crear` | Crear un usuario en la base de datos |
| `npm run lint` | ESLint sobre `src/` |

## Estructura del proyecto

```
Tracker/
├── Desktop/Tracker/       # Código legacy (referencia)
├── src/
│   ├── api/               # Express: routes, controllers, models, services
│   ├── admin/             # React admin panel
│   ├── db/                # Schema SQLite (estructura.sql)
│   ├── cli/               # Scripts CLI
│   ├── emisor/            # Firmware LilyGo emisor (emisor.ino, config.h.example)
│   └── receptor/          # Firmware LilyGo receptor (receptor.ino, config.h.example)
├── variables/             # Variables de entorno (no commitear)
├── data/                  # Base SQLite local (no commitear)
├── distribution/          # Build del admin (no commitear)
└── docs/dev/              # Documentación de desarrollo
```

## API del receptor

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/receptor/posicion` | `Authorization: Bearer <RECEPTOR_API_KEY>` | Upsert de posición de vehículo |

Body JSON:

```json
{
  "id": "CAMION1",
  "lat": -34.9201,
  "lon": -56.1700,
  "speed": 25,
  "battery": 0
}
```

Respuesta `200`: datos del vehículo guardado. Errores comunes: `401` (token inválido), `400` (payload inválido).

## Debug en Cursor / VS Code

En `.vscode/launch.json` hay configuraciones **Api** y **Admin** para arrancar con el botón de play.

## Documentación

- [Inicialización del entorno de desarrollo](docs/dev/inicializacion.md) — setup completo, prueba del receptor y troubleshooting
