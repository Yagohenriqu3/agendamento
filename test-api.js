// Teste da API de clientes
async function testarAPI() {
  try {
    console.log('=== Testando API /api/admin/clientes ===\n')
    
    const response = await fetch('http://localhost:3001/api/admin/clientes')
    const clientes = await response.json()
    
    console.log(`Total de clientes: ${clientes.length}\n`)
    
    clientes.forEach((cliente, index) => {
      console.log(`${index + 1}. ${cliente.nome} (${cliente.email})`)
      console.log(`   ID: ${cliente.id}`)
      console.log(`   Telefone: ${cliente.telefone}`)
      console.log(`   Admin: ${cliente.isAdmin ? 'Sim' : 'Não'}`)
      console.log(`   Bloqueado: ${cliente.bloqueado ? 'Sim' : 'Não'}`)
      console.log(`   Tem fichaAnamnese: ${cliente.fichaAnamnese ? 'SIM' : 'NÃO'}`)
      
      if (cliente.fichaAnamnese) {
        console.log(`   Tipo: ${typeof cliente.fichaAnamnese}`)
        console.log(`   Length: ${cliente.fichaAnamnese.length}`)
        console.log(`   É vazio?: ${cliente.fichaAnamnese.trim() === ''}`)
        console.log(`   Primeiros 100 chars: "${cliente.fichaAnamnese.substring(0, 100)}"`)
        
        try {
          const ficha = JSON.parse(cliente.fichaAnamnese)
          console.log(`   ✅ JSON válido - campos: ${Object.keys(ficha).length}`)
        } catch (e) {
          console.log(`   ❌ JSON inválido: ${e.message}`)
        }
      }
      console.log('')
    })
    
    const comFicha = clientes.filter(c => c.fichaAnamnese && c.fichaAnamnese.trim() !== '')
    console.log(`\n📊 Resumo: ${comFicha.length} cliente(s) com ficha preenchida`)
    if (comFicha.length > 0) {
      console.log('Clientes com ficha:', comFicha.map(c => c.nome).join(', '))
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message)
  }
}

testarAPI()
