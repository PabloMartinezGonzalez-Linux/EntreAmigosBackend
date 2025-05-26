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
  const { eventId } = req.params;  
  try {
    const result = await pool.query(
      `SELECT u.id AS user_id, 
              u.name AS user_name, 
              COALESCE(er.position, 0) AS position, 
              COALESCE(er.quick_lap, '00:00') AS quick_lap, 
              COALESCE(er.average_time, '00:00') AS average_time
       FROM karting_event_results er
       JOIN users u ON u.id = er.user_id
       WHERE er.event_id = $1`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `No results found for event ID: ${eventId}` });
    }

    return res.status(200).json({result: result.rows});

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const actualizarClasificacionKarting = async (req, res) => {
  try {
    await updateKartingClassification();
    res.status(200).json({ message: 'Clasificación actualizada correctamente.' });
  } catch (err) {
    console.error('Error en controlador actualizarClasificacionKarting:', err);
    res.status(500).json({ message: 'Error actualizando clasificación.' });
  }
};

export const getKartingClassification = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        kc.user_id,
        kc.position,
        kc.points,
        u.name       AS user_name,
        kc.gap,
        kc.best_circuit
      FROM karting_classifications kc
      JOIN users u ON kc.user_id = u.id
      ORDER BY kc.position;
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No hay datos de clasificación.' });
    }

    return res.status(200).json({
      result: result.rows.map(row => ({
        user_id:      row.user_id,
        position:     row.position,
        points:       row.points,
        user_name:    row.user_name,
        gap:          row.gap,
        best_circuit: row.best_circuit
      }))
    });

  } catch (err) {
    console.error('Error en controlador getKartingClassification:', err);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getEventList = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id       AS event_id,
        name,
        sport_type,
        event_date,
        is_future
      FROM events
      ORDER BY id;
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No events found.' });
    }

    return res.status(200).json({ result: result.rows });

  } catch (err) {
    console.error('Error fetching events:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateSingleEventResult = async (req, res) => {
  const { event_id, user_id, position, quick_lap, average_time } = req.body;
  console.log(req.body)

  if (!event_id || !user_id || position === undefined || !quick_lap || !average_time) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      `UPDATE karting_event_results
       SET position = $1,
           quick_lap = $2,
           average_time = $3
       WHERE event_id = $4 AND user_id = $5`,
      [position, quick_lap, average_time, event_id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No result found for user_id ${user_id} in event_id ${event_id}` });
    }

    await updateKartingClassification();

    return res.status(200).json({ message: '200' });

  } catch (err) {
    console.error('Error updating single event result:', err);
    return res.status(500).json({ message: 'Server error while updating result.' });
  }
};

export const upsertEvent = async (req, res) => {

  const raw = req.body;

  const converted = {
    event_id:   raw.event_id ?? null,
    name:       raw.name,
    sport_type: raw.sport_type,
    event_date: raw.event_date,                      
    is_future:  raw.is_future === true || raw.is_future === 'true'        
  };

  const {
    event_id,
    name,
    sport_type,
    event_date,
    is_future
  } = converted;

  if (!name || !sport_type || !event_date || typeof is_future !== 'boolean') {
    return res
      .status(400)
      .json({ message: 'Faltan campos obligatorios o tienen formato inválido.' });
  }

  try {
    let result;

    if (event_id != null) {
      result = await pool.query(`
        INSERT INTO events (id, name, sport_type, event_date, is_future)
        VALUES ($1, $2, $3, TO_DATE($4, 'DD/MM/YYYY'), $5)
        ON CONFLICT (id) DO UPDATE
          SET
            name       = EXCLUDED.name,
            sport_type = EXCLUDED.sport_type,
            event_date = EXCLUDED.event_date,
            is_future  = EXCLUDED.is_future
        RETURNING 
          id         AS event_id,
          name,
          sport_type,
          event_date,
          is_future;
      `, [
        event_id,
        name,
        sport_type,
        event_date,
        is_future
      ]);
    } else {
      result = await pool.query(`
        INSERT INTO events (name, sport_type, event_date, is_future)
        VALUES (
          $1,
          $2,
          TO_DATE($3, 'DD/MM/YYYY'),
          $4
        )
        RETURNING
          id         AS event_id,
          name,
          sport_type,
          event_date,
          is_future;
      `, [
        name,
        sport_type,
        event_date,
        is_future
      ]);
    }

    const statusCode = event_id != null ? 200 : 201;
    return res
      .status(statusCode)
      .json({ message: 'OK', data: result.rows[0] });

  } catch (err) {
    console.error('Error upserting event:', err);
    return res
      .status(500)
      .json({ message: 'Error interno del servidor.' });
  }
};

export const cancelRegisterUserForNextEvent = async (req, res) => {
  // Leemos el user_id de los params en lugar del body
  const { user_id } = req.params;

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

    // Comprobar si el usuario está registrado en el evento
    const checkUserRegistration = await pool.query(
      'SELECT * FROM karting_event_results WHERE user_id = $1 AND event_id = $2',
      [user_id, event.id]
    );

    if (checkUserRegistration.rows.length === 0) {
      // El usuario no está registrado en este evento
      return res.status(400).json({ message: 'User is not registered for this event.' });
    }

    // Eliminar la inscripción del usuario
    await pool.query(
      'DELETE FROM karting_event_results WHERE user_id = $1 AND event_id = $2',
      [user_id, event.id]
    );

    // Actualizar la clasificación tras la cancelación
    await updateKartingClassification();

    return res.status(200).json({ message: 'User registration canceled successfully.' });
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
  getKartingClassification,
  getEventList,
  updateSingleEventResult,
  upsertEvent,
  cancelRegisterUserForNextEvent
};
