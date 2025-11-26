import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function populateServicos() {
  console.log('🔄 Iniciando população de serviços...\n')

  const pool = mysql.createPool(process.env.DATABASE_URL)

  try {
    // 1. Desativar serviços existentes (não deletar por causa de foreign keys)
    console.log('🔄 Desativando serviços antigos...')
    await pool.query('UPDATE Servico SET ativo = 0')
    console.log('✅ Serviços antigos desativados\n')

    // 2. Serviços de Estética Facial
    console.log('💆 Inserindo serviços de Estética Facial...')
    const facial = [
      ['Limpeza de pele profunda', 60, 150.00, 'Tratamento completo para remover impurezas e renovar a pele do rosto'],
      ['Rejuvenescimento facial', 90, 280.00, 'Procedimento que estimula a produção de colágeno e reduz sinais de envelhecimento'],
      ['Peeling', 45, 180.00, 'Esfoliação profunda que remove células mortas e renova a textura da pele'],
      ['Hidratação intensiva', 50, 120.00, 'Tratamento hidratante profundo para peles secas e desidratadas'],
      ['Tratamentos anti-idade', 75, 320.00, 'Procedimentos avançados para combater rugas, linhas de expressão e flacidez']
    ]

    for (const [nome, duracao, preco, descricao] of facial) {
      await pool.query(
        'INSERT INTO Servico (nome, duracao, preco, descricao, ativo, createdAt) VALUES (?, ?, ?, ?, 1, NOW())',
        [nome, duracao, preco, descricao]
      )
      console.log(`   ✅ ${nome}`)
    }

    // 3. Serviços de Estética Corporal
    console.log('\n🏃 Inserindo serviços de Estética Corporal...')
    const corporal = [
      ['Modelagem corporal', 90, 200.00, 'Técnica para definir contornos corporais e reduzir gordura localizada'],
      ['Redução de medidas', 60, 180.00, 'Tratamento que auxilia na diminuição de medidas e definição do corpo'],
      ['Tratamentos contra celulite', 60, 160.00, 'Procedimentos especializados para reduzir a aparência de celulite'],
      ['Drenagem linfática', 75, 140.00, 'Massagem que estimula o sistema linfático, reduzindo inchaço e retenção de líquidos'],
      ['Firmeza da pele', 80, 220.00, 'Tratamento que melhora a elasticidade e firmeza da pele corporal']
    ]

    for (const [nome, duracao, preco, descricao] of corporal) {
      await pool.query(
        'INSERT INTO Servico (nome, duracao, preco, descricao, ativo, createdAt) VALUES (?, ?, ?, ?, 1, NOW())',
        [nome, duracao, preco, descricao]
      )
      console.log(`   ✅ ${nome}`)
    }

    // 4. Serviços de Bem-Estar
    console.log('\n🧘 Inserindo serviços de Bem-Estar e Relaxamento...')
    const bemEstar = [
      ['Massagens terapêuticas', 60, 130.00, 'Massagem relaxante que alivia tensões musculares e promove bem-estar'],
      ['Aromaterapia', 50, 110.00, 'Terapia com óleos essenciais para relaxamento e equilíbrio energético'],
      ['Cuidados de relaxamento', 90, 190.00, 'Sessão completa de cuidados exclusivos para renovar energia e promover relaxamento profundo']
    ]

    for (const [nome, duracao, preco, descricao] of bemEstar) {
      await pool.query(
        'INSERT INTO Servico (nome, duracao, preco, descricao, ativo, createdAt) VALUES (?, ?, ?, ?, 1, NOW())',
        [nome, duracao, preco, descricao]
      )
      console.log(`   ✅ ${nome}`)
    }

    // 5. Verificar total de ativos
    const [result] = await pool.query('SELECT COUNT(*) as total FROM Servico WHERE ativo = 1')
    console.log(`\n🎉 Concluído! Total de serviços ativos: ${result[0].total}`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await pool.end()
  }
}

populateServicos()
