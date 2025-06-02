// backend/controllers/adminController.mjs
import { pool } from '../db.mjs'; 

export const getAllUsers = async (req, res) => {
  try {
    // pool.query() devuelve un objeto, no un array
    const result = await pool.query('SELECT * FROM users');
    
    // Extraemos rows directamente del objeto
    const rows = result.rows;

    return res.status(200).json({
      result: rows
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
    // Ejecutamos la consulta de eliminación
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      // No se encontró ningún usuario con ese ID
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
      'UPDATE users SET role_id = $1 WHERE id = $2',
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
