import mysql from 'mysql2/promise'

async function testarFicha() {
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

    console.log('=== Testando estrutura da tabela Cliente ===')
    const [columns] = await pool.query('DESCRIBE Cliente')
    console.log('\nColunas da tabela Cliente:')
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`)
    })
    
    const temFichaAnamnese = columns.find(col => col.Field === 'fichaAnamnese')
    if (temFichaAnamnese) {
      console.log('\n✅ Coluna fichaAnamnese existe!')
    } else {
      console.log('\n❌ Coluna fichaAnamnese NÃO existe!')
      console.log('Execute: ALTER TABLE Cliente ADD COLUMN fichaAnamnese LONGTEXT NULL AFTER bloqueado;')
    }

    console.log('\n=== Testando dados dos clientes ===')
    const [clientes] = await pool.query('SELECT id, nome, email, fichaAnamnese, isAdmin, bloqueado, createdAt FROM Cliente ORDER BY createdAt DESC')
    console.log(`\nTotal de clientes: ${clientes.length}`)
    clientes.forEach(cliente => {
      console.log(`\nCliente: ${cliente.nome} (${cliente.email})`)
      console.log(`  ID: ${cliente.id}`)
      console.log(`  Tem ficha? ${cliente.fichaAnamnese ? 'SIM' : 'NÃO'}`)
      if (cliente.fichaAnamnese) {
        console.log(`  Tamanho: ${cliente.fichaAnamnese.length} caracteres`)
        console.log(`  Primeiros 100: ${cliente.fichaAnamnese.substring(0, 100)}`)
      }
    })

    await pool.end()
  } catch (error) {
    console.error('Erro:', error.message)
  }
}

testarFicha()
