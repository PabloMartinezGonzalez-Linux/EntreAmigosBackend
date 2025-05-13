import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.mjs'; 

// Registrar un usuario
const register = async (req, res) => {
  const { name, password, role_id = 2} = req.body;
  try {
    // Comprobar si el usuario ya existe
    const userCheck = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario en la base de datos
    const newUser = await pool.query(
      'INSERT INTO users (name, password, role_id) VALUES ($1, $2, $3) RETURNING *',
      [name, hashedPassword, role_id]
    );

    // Generar token JWT
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, role_id: newUser.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({ user: newUser.rows[0], token: token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// Loguear un usuario
const login = async (req, res) => {
  const { name, password } = req.body;
  try {
    // Buscar usuario por nombre
    const result = await pool.query('SELECT * FROM users WHERE name = $1', [name]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User no encontrado' });
    }

    const user = result.rows[0];

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Devolver respuesta con token
    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        password: user.password,
        role_id: user.role_id
      },
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

const checkStatus = async (req, res) => {
  try {
    const { id } = req.user;

    // Buscar al usuario en la base de datos
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        password: user.password,
        role_id: user.role_id
      },
      token: req.headers['authorization'].split(' ')[1]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el estado del usuario' });
  }
};

export { register, login, checkStatus }