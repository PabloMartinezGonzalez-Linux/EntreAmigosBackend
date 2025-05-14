-- Crear la base de datos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'entre_amigos_bd') THEN
        CREATE DATABASE entre_amigos_bd;
    END IF;
END $$;

-- Conectarse a la base de datos
\connect entre_amigos_bd;

-- Crear tabla de roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(25) NOT NULL UNIQUE
);

-- Crear tabla de usuarios con un campo rol
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role_id INT REFERENCES roles(id) ON DELETE SET NULL
);

-- Insertar algunos roles
INSERT INTO roles (nombre) VALUES
('admin'),
('user');

-- Crear tabla de eventos
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sport_type VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL,
  is_future BOOLEAN NOT NULL
);

-- Insertar eventos de karting
INSERT INTO events (name, sport_type, event_date, is_future) VALUES
('Karting GP Valencia', 'karting', '2025-05-20', true),
('Karting GP Madrid', 'karting', '2025-06-15', false);


-- Crear tabla de resultados de eventos de karting
CREATE TABLE karting_event_results (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  position INT NOT NULL,
  quick_lap VARCHAR(50),
  average_time VARCHAR(50)
);

-- Crear tabla de clasificación general de karting
CREATE TABLE karting_classifications (
  id SERIAL PRIMARY KEY,
  position INT NOT NULL,
  points INT NOT NULL,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team VARCHAR(100),
  gap VARCHAR(50),
  best_circuit VARCHAR(100)
);

