import { pool } from "../db.mjs";

export const updatePadelClassification = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE padel_classification");
    await client.query(`
      WITH summed AS (
        SELECT player1 AS user_id, SUM(points) AS points
        FROM padel_event_result
        GROUP BY player1
        UNION ALL
        SELECT player2 AS user_id, SUM(points) AS points
        FROM padel_event_result
        GROUP BY player2
      ), aggregated AS (
        SELECT user_id, SUM(points) AS points
        FROM summed
        GROUP BY user_id
      )
      INSERT INTO padel_classification (user_id, points, gap, position)
      SELECT
        user_id,
        points,
        MAX(points) OVER () - points AS gap,
        RANK() OVER (ORDER BY points DESC) AS position
      FROM aggregated;
    `);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
