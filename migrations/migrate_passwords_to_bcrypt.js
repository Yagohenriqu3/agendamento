import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

async function migratePasswords() {
  console.log('🔐 Iniciando migração de senhas para bcrypt...\n')

  const pool = mysql.createPool(process.env.DATABASE_URL)

  try {
    // Buscar todos os clientes
    const [clientes] = await pool.query('SELECT id, email, password FROM Cliente')

    console.log(`📊 Total de clientes encontrados: ${clientes.length}\n`)

    let migrated = 0
    let skipped = 0

    for (const cliente of clientes) {
      // Verificar se a senha já está em hash bcrypt (começa com $2a$ ou $2b$)
      if (cliente.password && (cliente.password.startsWith('$2a$') || cliente.password.startsWith('$2b$'))) {
        console.log(`⏭️  Cliente ${cliente.email} - Senha já está em bcrypt, pulando...`)
        skipped++
        continue
      }

      // Se não tem senha ou é muito curta, pular
      if (!cliente.password || cliente.password.length === 0) {
        console.log(`⚠️  Cliente ${cliente.email} - Senha vazia, pulando...`)
        skipped++
        continue
      }

      // Hash da senha atual (assumindo que está em texto plano)
      const hashedPassword = await bcrypt.hash(cliente.password, 10)

      // Atualizar no banco
      await pool.query(
        'UPDATE Cliente SET password = ? WHERE id = ?',
        [hashedPassword, cliente.id]
      )

      console.log(`✅ Cliente ${cliente.email} - Senha migrada com sucesso!`)
      migrated++
    }

    console.log('\n🎉 Migração concluída!')
    console.log(`✅ Senhas migradas: ${migrated}`)
    console.log(`⏭️  Senhas puladas: ${skipped}`)
    console.log(`📊 Total processado: ${clientes.length}`)

  } catch (error) {
    console.error('❌ Erro durante migração:', error)
  } finally {
    await pool.end()
  }
}

// Executar migração
migratePasswords()
