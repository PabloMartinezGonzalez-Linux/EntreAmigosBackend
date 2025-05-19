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

export default { getAllUsers };
