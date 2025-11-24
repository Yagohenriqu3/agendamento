import mysql from 'mysql2/promise';

async function checkConstraint() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '05112017',
    database: 'agendamento'
  });

  try {
    const [constraints] = await connection.query(`
      SHOW INDEXES FROM Agendamento WHERE Key_name LIKE '%data%horario%'
    `);
    
    console.log('📋 Constraints encontradas:');
    console.table(constraints);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

checkConstraint();
