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
  password VARCHAR(100) NOT NULL ,
  role_id INT REFERENCES roles(id) ON DELETE SET NULL
);

-- Insertar algunos roles
INSERT INTO roles (nombre) VALUES
('admin'),
('user');

