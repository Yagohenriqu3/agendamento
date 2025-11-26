import mysql from 'mysql2/promise'

async function adicionarColunaConfig() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '05112017',
      database: 'agendamento',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })

    console.log('Adicionando coluna mostrar_valores_cliente...')
    
    await pool.query(`
      ALTER TABLE Configuracoes 
      ADD COLUMN IF NOT EXISTS mostrar_valores_cliente BOOLEAN DEFAULT TRUE
    `)

    console.log('✅ Coluna adicionada com sucesso!')

    // Verificar estrutura
    const [columns] = await pool.query('DESCRIBE Configuracoes')
    console.log('\nColunas da tabela Configuracoes:')
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`)
    })

    await pool.end()
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

adicionarColunaConfig()
