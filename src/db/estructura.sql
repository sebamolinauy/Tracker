CREATE TABLE IF NOT EXISTS usuario (
  usuarioId INTEGER PRIMARY KEY AUTOINCREMENT,
  usuarioEmail TEXT NOT NULL UNIQUE COLLATE NOCASE,
  usuarioNombre TEXT NOT NULL,
  usuarioApellido TEXT NOT NULL DEFAULT '',
  usuarioPasswordHash TEXT NOT NULL,
  usuarioRol TEXT NOT NULL DEFAULT 'administrador'
    CHECK (usuarioRol IN ('administrador', 'funcionario')),
  usuarioHabilitado INTEGER NOT NULL DEFAULT 1,
  usuarioUltimaActividad TEXT
);

CREATE TABLE IF NOT EXISTS vehiculo (
  vehiculoId INTEGER PRIMARY KEY AUTOINCREMENT,
  vehiculoCodigo TEXT NOT NULL UNIQUE COLLATE NOCASE,
  vehiculoLat REAL NOT NULL,
  vehiculoLon REAL NOT NULL,
  vehiculoVelocidad REAL NOT NULL DEFAULT 0,
  vehiculoBateria REAL NOT NULL DEFAULT 0,
  vehiculoUltimaActualizacion TEXT NOT NULL,
  vehiculoCreado TEXT NOT NULL
);
