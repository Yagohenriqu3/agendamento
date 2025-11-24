import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '05112017',
    database: 'agendamento',
    multipleStatements: true
  });

  try {
    const migrationFile = process.argv[2] || 'add_duracao_total.sql';
    const sql = fs.readFileSync(path.join(__dirname, migrationFile), 'utf8');
    await connection.query(sql);
    console.log(`✅ Migration ${migrationFile} executada com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
