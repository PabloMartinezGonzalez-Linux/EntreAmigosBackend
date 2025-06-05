import { pool } from "../db.mjs";
import { updatePadelClassification } from "../services/padelServices.mjs";

export const postEventResult = async (req, res) => {
  const { game_id, player1, player2, set1, set2, set3, resultado } = req.body;

  if (
    game_id == null ||
    player1 == null ||
    player2 == null ||
    set1 == null ||
    set2 == null ||
    set3 == null ||
    resultado == null
  ) {
    return res
      .status(400)
      .json({ message: "Faltan datos obligatorios en la petición." });
  }

  if (typeof resultado !== "number" || (resultado !== 2 && resultado !== 1)) {
    return res.status(400).json({
      message: "'resultado' debe ser el número de sets ganados (2 o 1).",
    });
  }

  const puntos = resultado === 2 ? 3 : 0;

  try {
    const insertQuery = `
      INSERT INTO padel_event_result
        (game_id, player1, player2, set1, set2, set3, resultado, points)
      VALUES
        ($1,      $2,      $3,      $4,   $5,   $6,   $7,        $8)
      RETURNING *;
    `;
    const values = [
      game_id,
      player1,
      player2,
      set1,
      set2,
      set3,
      resultado,
      puntos,
    ];

    const result = await pool.query(insertQuery, values);
    const newEventResult = result.rows[0];

    await updatePadelClassification();

    return res.status(201).json({ result: newEventResult });
  } catch (err) {
    console.error("Error al insertar nuevo event result:", err);
    return res.status(500).json({ message: "Error de servidor" });
  }
};

export const getEventResult = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id AS team_id,
        game_id,
        player1,
        player2,
        set1,
        set2,
        set3,
        resultado,
        points
      FROM padel_event_result
      ORDER BY id;
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No events found." });
    }

    return res.status(200).json({ result: result.rows });
  } catch (err) {
    console.error("Error fetching events:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getEventResultById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT
        e.id                 AS team_id,
        e.game_id,
        u1.name              AS player1_name,
        u2.name              AS player2_name,
        e.set1,
        e.set2,
        e.set3,
        e.resultado,
        e.points
      FROM padel_event_result AS e
      JOIN users AS u1 ON e.player1 = u1.id
      JOIN users AS u2 ON e.player2 = u2.id
      WHERE e.game_id = $1
      ORDER BY e.points DESC, e.resultado DESC
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No events found." });
    }

    return res.status(200).json({ result: result.rows });
  } catch (err) {
    console.error("Error fetching events:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getClassification = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pc.user_id,
        u.name       AS user_name,
        pc.points,
        pc.gap,
        pc.position
      FROM padel_classification AS pc
      JOIN users AS u
        ON pc.user_id = u.id
      ORDER BY pc.position ASC;
    `);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay datos de clasificación." });
    }

    return res.status(200).json({ result: result.rows });
  } catch (err) {
    console.error("Error fetching classification:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export default {
  getEventResult,
  getEventResultById,
  getClassification,
  postEventResult,
};
