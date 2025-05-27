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
    // 1. Agregar puntos por usuario
    const { rows: aggregates } = await pool.query(`
      SELECT
        ker.user_id,
        SUM(ker.points) AS total_points
      FROM karting_event_results ker
      GROUP BY ker.user_id
    `);

    if (aggregates.length === 0) {
      console.log('No hay resultados para agregar puntos. Se omite actualización.');
      return;
    }

    // 2. Ordenar de mayor a menor para asignar posiciones
    aggregates.sort((a, b) => Number(b.total_points) - Number(a.total_points));

    // 3. Calcular el máximo de puntos (líder)
    const topScore = Number(aggregates[0].total_points);

    // 4. Vaciar la tabla de clasificaciones
    await pool.query(`DELETE FROM karting_classifications`);

    // 5. Insertar por cada usuario su posición, puntos y gap
    const insertText = `
      INSERT INTO karting_classifications (user_id, position, points, gap)
      VALUES ($1, $2, $3, $4)
    `;

    for (let i = 0; i < aggregates.length; i++) {
      const { user_id, total_points } = aggregates[i];
      const points = Number(total_points);
      const position = i + 1;
      const gap = topScore - points;  // 0 para el líder, >0 para el resto

      await pool.query(insertText, [user_id, position, points, gap]);
    }

    console.log('Clasificación actualizada: suma de puntos, posición y gap.');

  } catch (err) {
    console.error('Error actualizando clasificación con posición y gap:', err);
    throw err;
  }
};

export default {updateKartingClassification}
