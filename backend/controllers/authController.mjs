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
        role_id: user.role_id,
        address: user.address,
        age: user.age, 
        gender: user.gender,
        phone_number: user.phone_number
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
        role_id: user.role_id,
        address: user.address,
        age: user.age, 
        gender: user.gender,
        phone_number: user.phone_number
      },
      token: req.headers['authorization'].split(' ')[1]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el estado del usuario' });
  }
};

// Actualizar solo los campos proporcionados de un usuario
const updateUser = async (req, res) => {
  const { id } = req.params;
  // 1) Clonar y filtrar
  const updates = Object.entries(req.body)
    .filter(([_, v]) => v !== null && v !== undefined)
    .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});

  // 2) Si no hay nada que actualizar…
  const keys = Object.keys(updates);
  if (keys.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
  }

  // 3) Construir SET dinámico
  const fields = keys.map((k, i) => `${k} = $${i + 1}`);
  const values = keys.map(k => updates[k]);

  try {
    values.push(id);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${values.length}
      RETURNING id, name, role_id, address, age, gender, phone_number
    `;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

export { register, login, checkStatus,updateUser }