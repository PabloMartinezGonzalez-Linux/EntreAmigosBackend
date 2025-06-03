// backend/controllers/adminController.mjs
import { pool } from '../db.mjs'; 

export const getAllUsers = async (req, res) => {
  try {
    const { gender, minAge, maxAge, role } = req.query;

    const conditions = [];
    const values = [];

    let index = 1;

    if (gender) {
      conditions.push(`gender = $${index}`);
      values.push(gender);
      index++;
    }

    if (minAge != null) {
      const min = parseInt(minAge, 10);
      if (!isNaN(min)) {
        conditions.push(`age >= $${index}`);
        values.push(min);
        index++;
      }
    }

    if (maxAge != null) {
      const max = parseInt(maxAge, 10);
      if (!isNaN(max)) {
        conditions.push(`age <= $${index}`);
        values.push(max);
        index++;
      }
    }

    if (role) {
      conditions.push(`role_id = $${index}`);
      values.push(role);
      index++;
    }

    let queryText = 'SELECT * FROM users';

    if (conditions.length > 0) {
      const whereClause = conditions.join(' AND ');
      queryText += ` WHERE ${whereClause}`;
    }

    const result = await pool.query(queryText, values);

    return res.status(200).json({
      result: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: `Usuario con id ${id} no encontrado`
      });
    }

    return res.status(200).json({
      message: `Usuario con id ${id} eliminado correctamente`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export const setRole = async (req, res) => {
  const { id } = req.params;
  const { role_id } = req.body; 

  try {
    const result = await pool.query(
      [role_id, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: `Usuario con id ${id} no encontrado`
      });
    }

    return res.status(200).json({
      message: `200`
    });
  } catch (error) {
    console.error('Error actualizando role del usuario:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export default { getAllUsers, deleteUser, setRole };
