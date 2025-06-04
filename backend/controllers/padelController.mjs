import { pool } from "../db.mjs";

export const getEventResult = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id       AS team_id,
        game_id,
        player1,
        player2,
        set1,
        set2,
        set3,
        resultado
        
      FROM padel_event_result
      ORDER BY id
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
        id       AS team_id,
        game_id,
        player1,
        player2,
        set1,
        set2,
        set3,
        resultado
      FROM padel_event_result
      WHERE game_id = $1
      ORDER BY id
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

export default {
  getEventResult,
  getEventResultById,
};
