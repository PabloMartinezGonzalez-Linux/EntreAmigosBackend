const calculateScore = (position) => {
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

const updateKartingClassification = async () => {
  try {
    // 1. Obtener todos los resultados con posición válida
    const results = await pool.query(`
      SELECT ker.user_id, ker.position, e.name AS event_name
      FROM karting_event_results ker
      JOIN events e ON ker.event_id = e.id
      WHERE ker.position IS NOT NULL
    `);

    // 2. Calcular puntos por usuario y detectar mejor circuito
    const userStats = {};

    for (const row of results.rows) {
      const { user_id, position, event_name } = row;
      const score = calculateScore(position);

      if (!userStats[user_id]) {
        userStats[user_id] = {
          total_points: 0,
          best_position: position,
          best_circuit: event_name,
        };
      }

      userStats[user_id].total_points += score;

      if (position < userStats[user_id].best_position) {
        userStats[user_id].best_position = position;
        userStats[user_id].best_circuit = event_name;
      }
    }

    // 3. Crear ranking ordenado
    const ranking = Object.entries(userStats)
      .map(([user_id, stats]) => ({
        user_id: parseInt(user_id),
        points: stats.total_points,
        best_circuit: stats.best_circuit
      }))
      .sort((a, b) => b.points - a.points);

    const topScore = ranking[0]?.points || 0;

    // 4. Borrar clasificación anterior
    await pool.query('DELETE FROM karting_classifications');

    // 5. Insertar nueva clasificación
    for (let i = 0; i < ranking.length; i++) {
      const { user_id, points, best_circuit } = ranking[i];
      const position = i + 1;
      const gap = (topScore - points) === 0 ? '-' : (topScore - points).toString();

      // Obtener nombre y equipo del usuario
      const userResult = await pool.query(
        'SELECT name, team FROM users WHERE id = $1',
        [user_id]
      );

      const { name, team } = userResult.rows[0];

      await pool.query(`
        INSERT INTO karting_classifications 
        (position, points, name, team, gap, best_circuit)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [position, points, name, team, gap, best_circuit]);
    }

    console.log('Clasificación actualizada correctamente.');
  } catch (err) {
    console.error('Error actualizando clasificación:', err);
  }
};
