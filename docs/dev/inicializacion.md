# Inicialización del entorno de desarrollo

Guía paso a paso para levantar Tracker en una máquina nueva (macOS, Linux o Windows).

## 1. Prerrequisitos

### Node.js

Verificar versión:

```bash
node -v
```

Debe ser **20 o superior**. Si no lo es, instalar desde [nodejs.org](https://nodejs.org/).

### Windows: compilación nativa

El paquete `better-sqlite3` necesita compilar código nativo. Instalar **Visual Studio Build Tools** con la carga de trabajo "Desktop development with C++", o Visual Studio Community con C++.

Si `npm install` falla en `better-sqlite3`, después de instalar las build tools:

```cmd
npm rebuild better-sqlite3
```

### Receptor LilyGo (opcional, para pruebas con hardware)

- [Arduino IDE](https://www.arduino.cc/en/software)
- Soporte de placas **ESP32** (Board Manager)
- Librerías desde Library Manager:
  - **LoRa** (Sandeep Mistry)
  - **ESP8266 and ESP32 OLED driver for SSD1306 displays** (ThingPulse)

Configuración recomendada en Arduino IDE (**Herramientas**):

| Opción | Valor |
|--------|-------|
| Placa | LilyGo LoRa32 (o equivalente ESP32 del modelo que uses) |
| **Upload Speed** | **115200** (ver [error al subir firmware](#error-al-subir-firmware-arduino-ide) si falla) |
| Monitor serial | **115200 baud** (después de subir el sketch) |

## 2. Clonar e instalar

```bash
git clone <url-del-repo>
cd Tracker
npm install
```

## 3. Variables de entorno

La carpeta `variables/` **no está en git**. Hay que crearla manualmente:

```bash
mkdir -p variables
```

### API (`variables/api.development.env`)

Crear el archivo con este contenido (ajustar secretos en producción):

```env
HTTP_PORT=3000
HTTP_BIND=0.0.0.0
ADMIN_BASE_URL=http://localhost:3001/
COOKIE_NAME=tracker_session
COOKIE_SIGN_SECRET=dev-secret-cambiar-en-prod
DB_FILENAME=./data/tracker.db
RECEPTOR_API_KEY=dev-receptor-key-cambiar-en-prod
VEHICULO_ONLINE_TIMEOUT_MS=60000
```

| Variable | Valor sugerido (dev) | Descripción |
|----------|----------------------|-------------|
| `HTTP_PORT` | `3000` | Puerto del servidor Express |
| `HTTP_BIND` | `0.0.0.0` | Interfaz de escucha. Usar `0.0.0.0` para que el LilyGo en la LAN pueda conectar. Usar `127.0.0.1` si solo se usa el admin en la misma máquina |
| `ADMIN_BASE_URL` | `http://localhost:3001/` | URL del admin (para CORS y redirects) |
| `COOKIE_NAME` | `tracker_session` | Nombre de la cookie de sesión |
| `COOKIE_SIGN_SECRET` | (dev) | Secreto para firmar JWT y cookies. Cambiar en producción |
| `DB_FILENAME` | `./data/tracker.db` | Ruta del archivo SQLite |
| `RECEPTOR_API_KEY` | (dev) | Clave Bearer compartida con el LilyGo receptor. Debe coincidir con `API_TOKEN` en `src/receptor/config.h` |
| `VEHICULO_ONLINE_TIMEOUT_MS` | `60000` | Milisegundos sin actualización para marcar un vehículo como offline en el admin |

### Admin (`variables/admin.development.env`)

```env
NODE_ENV=development
API_BASE_URL=http://localhost:3000/
NAME=Tracker
VEHICULO_POLL_MS=5000
```

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `NODE_ENV` | `development` | Entorno |
| `API_BASE_URL` | `http://localhost:3000/` | URL de la API (debe coincidir con `HTTP_PORT`) |
| `NAME` | `Tracker` | Nombre mostrado en el panel |
| `VEHICULO_POLL_MS` | `5000` | Intervalo de actualización del mapa (ms) |

Para probar solo el admin en local, no hace falta tocar nada más. Para probar el receptor en LAN, lo importante es `HTTP_BIND=0.0.0.0` y `RECEPTOR_API_KEY` en la API.

## 4. Crear el primer usuario

La base de datos se crea automáticamente al arrancar la API o al crear un usuario, pero **no hay usuarios por defecto**. Hay que crear uno con el script CLI.

### macOS / Linux

```bash
npm run usuario-crear -- --email admin@tracker.local --nombre Admin --apellido Tracker --password tu-password --rol administrador
```

### Windows

En PowerShell, `npm run ... --` no pasa bien los parámetros. Usar **CMD** o forzar CMD desde PowerShell:

**Opción A — CMD:**

```cmd
npm run usuario-crear -- --email admin@tracker.local --nombre Admin --apellido Tracker --password tu-password --rol administrador
```

**Opción B — PowerShell vía CMD:**

```powershell
cmd /c "npm run usuario-crear -- --email admin@tracker.local --nombre Admin --apellido Tracker --password tu-password --rol administrador"
```

**Opción C — Node directo:**

```powershell
node --env-file=variables/api.development.env src/cli/usuarioCrear.js --email 'admin@tracker.local' --nombre 'Admin' --apellido 'Tracker' --password 'tu-password'
```

El email va **entre comillas** por el carácter `@`.

Parámetros:

| Parámetro | Requerido | Descripción |
|-----------|-----------|-------------|
| `--email` | Sí | Email de login |
| `--nombre` | Sí | Nombre |
| `--apellido` | No | Apellido (default: vacío) |
| `--password` | Sí | Contraseña en texto plano (se hashea con bcrypt) |
| `--rol` | No | `administrador` (default) o `funcionario` |

## 5. Levantar los servicios

Se necesitan **dos procesos** en paralelo para el admin. Para probar solo el receptor, alcanza con la API.

**Terminal 1 — API:**

```bash
npm run api
```

Debería mostrar:

```
Main: Starting in development at 0.0.0.0:3000
```

Si muestra `127.0.0.1:3000`, revisar que `HTTP_BIND=0.0.0.0` esté en `variables/api.development.env`.

**Terminal 2 — Admin (opcional):**

```bash
npm run admin
```

Abre el navegador en `http://localhost:3001/login`.

### Cursor / VS Code

Usar las configuraciones de debug **Api** y **Admin** en `.vscode/launch.json`.

## 6. Verificar que funciona (admin)

1. Ir a `http://localhost:3001/login`
2. Ingresar con el email y contraseña creados en el paso 4
3. Debería redirigir al inicio con navbar y mensaje de bienvenida

Si el login falla:

- Confirmar que la API está corriendo en el puerto 3000
- Confirmar que `API_BASE_URL` en admin apunta a `http://localhost:3000/`
- Revisar la consola del navegador (errores CORS suelen indicar API caída o URL mal configurada)

## 7. Receptor LilyGo (LoRa → WiFi → API)

Checklist para probar en otra máquina de la red (ej. la PC de un compañero):

1. Clonar el repo, `npm install`, crear `variables/api.development.env` con `HTTP_BIND=0.0.0.0` y `RECEPTOR_API_KEY`.
2. Levantar la API (`npm run api`).
3. Obtener la IP LAN de esa máquina:
   - macOS: `ipconfig getifaddr en0` (o la interfaz WiFi activa)
   - Linux: `hostname -I`
   - Windows: `ipconfig` → IPv4 de la adaptador WiFi/Ethernet
4. Probar el endpoint con curl (desde la misma máquina o desde otra en la LAN).
5. Configurar y subir el firmware al LilyGo.

### Endpoint

| Método | Ruta | Auth |
|--------|------|------|
| `POST` | `/api/receptor/posicion` | `Authorization: Bearer <RECEPTOR_API_KEY>` |

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

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Identificador del vehículo (alfanumérico, `_` y `-` permitidos) |
| `lat` | number | Sí | Latitud (-90 a 90) |
| `lon` | number | Sí | Longitud (-180 a 180) |
| `speed` | number | No | Velocidad en km/h (default 0) |
| `battery` | number | No | Batería del dispositivo emisor, 0–100 % (default 0). No es la batería del vehículo |

La API hace upsert en la tabla `vehiculo`: crea el registro si no existe, o actualiza lat/lon/velocidad y batería del dispositivo si ya existe el mismo `id`.

En la consola de la API se loguea el body recibido y el resultado del parseo (`[Receptor] Raw:` / `[Receptor] Parsed:`).

### Probar con curl

Reemplazar `192.168.1.42` por la IP LAN de la máquina donde corre la API, y la clave por la de `RECEPTOR_API_KEY`:

```bash
curl -X POST http://192.168.1.42:3000/api/receptor/posicion \
  -H "Authorization: Bearer dev-receptor-key-cambiar-en-prod" \
  -H "Content-Type: application/json" \
  -d '{"id":"CAMION1","lat":-34.92,"lon":-56.17,"speed":25,"battery":0}'
```

Verificar en SQLite:

```bash
sqlite3 data/tracker.db "SELECT * FROM vehiculo;"
```

Repetir el curl con otros valores de `lat`/`lon` para confirmar que actualiza el mismo vehículo (mismo `id`).

### Firmware del receptor

1. Copiar la plantilla de configuración:

   ```bash
   cp src/receptor/config.h.example src/receptor/config.h
   ```

   (`config.h` está en `.gitignore` — no commitear credenciales WiFi ni el token.)

2. Editar `src/receptor/config.h`:

   ```cpp
   #define WIFI_SSID "nombre-de-la-red"
   #define WIFI_PASSWORD "clave-wifi"
   #define API_URL "http://192.168.1.42:3000/api/receptor/posicion"
   #define API_TOKEN "dev-receptor-key-cambiar-en-prod"
   ```

   - `API_URL`: IP LAN de la PC donde corre la API + `/api/receptor/posicion`
   - `API_TOKEN`: mismo valor que `RECEPTOR_API_KEY` en la API

3. Abrir `src/receptor/receptor.ino` en Arduino IDE, seleccionar la placa LilyGo LoRa32 (ESP32), configurar **Upload Speed = 115200** y subir. Cerrar el monitor serial antes de subir. Si el upload falla, ver [Error al subir firmware](#error-al-subir-firmware-arduino-ide).

4. Abrir el monitor serial a **115200 baud**. Debería mostrar conexión WiFi, IP asignada y `RECEPTOR LISTO`. Al recibir un paquete LoRa, muestra el mensaje, el POST HTTP y el código de respuesta.

### Formato del paquete LoRa

Los emisores pueden transmitir en cualquiera de estos formatos. Orden: id, lat, lon, velocidad (km/h), batería del dispositivo emisor (%):

```
CAMION1,-34.9201,-56.1700,25,0
ID=CAMION1,LAT=-34.9201,LON=-56.1700,VEL=25,BAT=0
```

El receptor parsea esos campos y los envía como JSON a la API.

### Firmware del emisor

1. Copiar `src/emisor/config.h.example` a `src/emisor/config.h`.
2. Ajustar `VEHICULO_ID`, pines GPS (`GPS_RX_PIN`, `GPS_TX_PIN`) y `INTERVALO_ENVIO_MS` si hace falta.
3. Abrir `src/emisor/emisor.ino` en Arduino IDE, configurar **Upload Speed = 115200** y subir al LilyGo emisor (mismas consideraciones que el receptor si falla el upload).

Librerías: LoRa, TinyGPS++, OLED SSD1306.

El emisor muestra satélites en pantalla y serial, pero no los manda en el paquete. El quinto campo es la batería del LilyGo (no del vehículo); hoy se envía 0 hasta leerla por hardware.

## 8. Qué no commitear

Estos paths están en `.gitignore` y son locales de cada desarrollador:

- `variables/` — archivos de entorno reales
- `data/` — base SQLite
- `node_modules/`
- `distribution/` — build del admin
- `src/receptor/config.h` — credenciales WiFi y token del dispositivo receptor
- `src/emisor/config.h` — ID del vehículo y pines GPS del emisor

Cada desarrollador tiene su propia base de datos, usuarios y configuración del LilyGo.

## 9. Problemas frecuentes

### La API no arranca / "app crashed"

Correr directo para ver el error real:

```bash
node --env-file=variables/api.development.env src/api/application/index.js
```

Causas comunes:

- Node menor a 20 (`--env-file` no existe)
- `better-sqlite3` no compiló (ver paso 1, Windows)
- Puerto 3000 ocupado
- Falta `variables/api.development.env`

### El admin titila o redirige en loop

- Asegurarse de que la API esté corriendo **antes** de abrir el admin
- Abrir directamente `http://localhost:3001/login`

### `usuario-crear` dice que faltan parámetros (Windows)

Ver sección 4 — usar CMD o node directo en lugar de PowerShell con `npm run ... --`.

### `npm install` falla en `better-sqlite3`

Instalar build tools (Windows) o Xcode CLI tools (macOS):

```bash
xcode-select --install   # macOS
```

Luego:

```bash
npm rebuild better-sqlite3
```

### El LilyGo no llega a la API

- Confirmar que la API muestra `0.0.0.0:3000` al arrancar (no `127.0.0.1`).
- Confirmar que `API_URL` en `config.h` usa la **IP LAN** de la PC, no `localhost`.
- Probar el mismo curl desde otra máquina en la red antes de depurar el hardware.
- Verificar que PC y LilyGo están en la misma red WiFi.
- Revisar firewall del sistema operativo (permitir conexiones entrantes al puerto 3000).

### HTTP 401 desde el LilyGo o curl

- `API_TOKEN` en `config.h` debe ser idéntico a `RECEPTOR_API_KEY` en la API.
- Reiniciar la API después de cambiar variables de entorno.
- El header debe ser exactamente: `Authorization: Bearer <clave>`.

### HTTP 400 desde la API

- Revisar la consola de la API: `[Receptor] Parse error:` indica qué campo falló.
- `id` alfanumérico; `lat`/`lon` numéricos y dentro de rango; `battery` (dispositivo emisor) entre 0 y 100.

### El LilyGo no conecta WiFi

- Revisar SSID y contraseña en `config.h`.
- Red WiFi de 2.4 GHz (muchos ESP32 no soportan 5 GHz).
- Monitor serial a 115200 baud para ver el error.

### Error al subir firmware (Arduino IDE)

El sketch puede **compilar bien** y fallar igual al subir. No es un problema de tamaño del código ni de `config.h`.

Error típico:

```text
A fatal error occurred: Unable to verify flash chip connection
(Serial data stream stopped: Possible serial noise or corruption.)
```

Suele aparecer cuando Arduino IDE sube a **921600 baud** (velocidad por defecto en muchas placas ESP32). A esa velocidad, cables USB malos, hubs o drivers inestables cortan la comunicación serial a mitad del flash.

**Solución más efectiva:** en Arduino IDE, **Herramientas → Upload Speed → 115200**. Si con eso funciona, podés probar subir a 460800; evitar 921600 salvo que el cable y el puerto sean muy confiables.

Checklist si sigue fallando:

1. **Cerrar el monitor serial** antes de subir (solo un programa puede usar el puerto COM).
2. **Cable USB de datos** conectado directo a la PC (sin hub). Probar otro cable o puerto USB.
3. **Modo bootloader en el LilyGo:** mantener **BOOT** presionado → pulsar **RESET** → soltar **BOOT** → subir de inmediato. En algunos modelos hay que mantener **BOOT** durante todo el upload.
4. **Placa correcta** en Herramientas (LilyGo LoRa32 / ESP32 acorde al hardware).
5. **Driver USB-serial** actualizado (CP210x o CH340, según el chip del LilyGo).
6. Tras un intento fallido: desconectar USB, volver a conectar, pulsar **RESET** y reintentar con Upload Speed = 115200.

Una vez subido el firmware, el monitor serial va a **115200 baud** (no confundir con la velocidad de upload).
