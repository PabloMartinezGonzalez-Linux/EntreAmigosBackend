import { pool } from '../db.mjs';

// Mapa de puntos según posición
export const calculateScore = (position) => {
  const scoreMap = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1
  };
  return scoreMap[position] || 0;
};

export const updateKartingClassification = async () => {
  try {
    // 1. Recoger resultados válidos
    const { rows: results } = await pool.query(`
      SELECT ker.user_id, ker.position, e.name AS event_name
      FROM karting_event_results ker
      JOIN events e ON ker.event_id = e.id
      WHERE ker.position IS NOT NULL
    `);

    if (results.length === 0) {
      console.log('No hay resultados válidos para clasificar. Se omite actualización.');
      return;
    }

    // 2. Calcular puntos y mejor circuito
    const userStats = {};
    for (const { user_id, position, event_name } of results) {
      const pts = calculateScore(position);
      if (!userStats[user_id]) {
        userStats[user_id] = {
          total_points:  0,
          best_position: position,
          best_circuit:   event_name
        };
      }
      userStats[user_id].total_points += pts;
      if (position < userStats[user_id].best_position) {
        userStats[user_id].best_position = position;
        userStats[user_id].best_circuit = event_name;
      }
    }

    // 3. Ordenar ranking por puntos
    const ranking = Object.entries(userStats)
      .map(([user_id, stats]) => ({
        user_id:      parseInt(user_id, 10),
        points:       stats.total_points,
        best_circuit: stats.best_circuit
      }))
      .sort((a, b) => b.points - a.points);

    const topScore = ranking[0]?.points || 0;

    // 4. Resetear y poblar tabla de clasificaciones
    await pool.query('DELETE FROM karting_classifications');

    for (let i = 0; i < ranking.length; i++) {
      const { user_id, points, best_circuit } = ranking[i];
      const position = i + 1;
      const gap = topScore === points ? '-' : String(topScore - points);

      await pool.query(`
        INSERT INTO karting_classifications
          (position, points, user_id, gap, best_circuit)
        VALUES ($1, $2, $3, $4, $5)
      `, [position, points, user_id, gap, best_circuit]);
    }

    console.log('Clasificación actualizada correctamente.');

  } catch (err) {
    console.error('Error actualizando clasificación:', err);
    throw err;  // relanzamos para que el controlador lo capture
  }
};

export default {updateKartingClassification}
