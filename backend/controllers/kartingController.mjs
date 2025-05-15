import { pool } from '../db.mjs';
import { updateKartingClassification } from '../services/kartingServices.mjs'

export const registerUserForNextEvent = async (req, res) => {
  const { user_id } = req.body;

  try {
    // Obtener el próximo evento de karting futuro
    const result = await pool.query(
      'SELECT * FROM events WHERE sport_type = $1 AND is_future = true LIMIT 1',
      ['karting']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No upcoming karting events found.' });
    }

    const event = result.rows[0];

    // Comprobar si el usuario ya está registrado en el evento
    const checkUserRegistration = await pool.query(
      'SELECT * FROM karting_event_results WHERE user_id = $1 AND event_id = $2',
      [user_id, event.id]
    );

    if (checkUserRegistration.rows.length > 0) {
      // El usuario ya está registrado en este evento
      return res.status(400).json({ message: 'User is already registered for this event.' });
    }

    // Si el usuario no está registrado, realizar la inserción
    await pool.query(
      'INSERT INTO karting_event_results (event_id, user_id, position, quick_lap, average_time) VALUES ($1, $2, $3, $4, $5)',
      [event.id, user_id, null, null, null]
    );

    await updateKartingClassification();

    return res.status(200).json({ message: '200' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUsersForNextEvent = async (req, res) => {
  try {
    // Consultar el próximo evento de karting con is_future = true
    const eventResult = await pool.query(
      'SELECT * FROM events WHERE sport_type = $1 AND is_future = true LIMIT 1',
      ['karting']
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: 'No upcoming karting events found.' });
    }

    const event = eventResult.rows[0];

    // Obtener los usuarios registrados en el evento
    const result = await pool.query(
      `SELECT u.id, u.name 
       FROM users u
       JOIN karting_event_results er ON u.id = er.user_id
       WHERE er.event_id = $1`,
      [event.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No users found for this event.' });
    }

    return res.status(200).json({ result: result.rows});

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getEventResultsByEventId = async (req, res) => {
  const { eventId } = req.params;  // Obtén el ID del evento de los parámetros de la URL

  try {
    // Consultar los resultados del evento especificado por eventId
    const result = await pool.query(
      `SELECT u.id, 
              u.name, 
              COALESCE(er.position, 0) AS position, 
              COALESCE(er.quick_lap, '00:00') AS quick_lap, 
              COALESCE(er.average_time, '00:00') AS average_time
              COALESCE(er.score, 0) AS average_time
       FROM karting_event_results er
       JOIN users u ON u.id = er.user_id
       WHERE er.event_id = $1`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `No results found for event ID: ${eventId}` });
    }

    return res.status(200).json(result.rows);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// En kartingController.mjs
export const actualizarClasificacionKarting = async (req, res) => {
  try {
    await updateKartingClassification();
    res.status(200).json({ message: 'Clasificación actualizada correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error actualizando clasificación.' });
  }
};

export const getKartingClassification = async (req, res) => {
  try {
    // Consultar toda la clasificación de karting incluyendo el user_id
    const result = await pool.query(`
      SELECT kc.user_id, kc.position, kc.points, u.name AS user_name, kc.team, kc.gap, kc.best_circuit
      FROM karting_classifications kc
      JOIN users u ON kc.user_id = u.id
      ORDER BY kc.position;
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No classification data found.' });
    }

    // Devolver los datos con el formato deseado
    return res.status(200).json({
      result: result.rows.map(row => ({
        user_id: row.user_id,  // Incluir user_id
        position: row.position,
        points: row.points,
        user_name: row.user_name,
        team: row.team,
        gap: row.gap,
        best_circuit: row.best_circuit
      }))
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};




export default { 
  registerUserForNextEvent, 
  getUsersForNextEvent, 
  getEventResultsByEventId, 
  actualizarClasificacionKarting,
  getKartingClassification
};
