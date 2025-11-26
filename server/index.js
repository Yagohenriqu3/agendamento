import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import nodemailer from 'nodemailer'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Necessário para usar __dirname no ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Criar pool de conexão MySQL
const pool = mysql.createPool(process.env.DATABASE_URL)

// Configurar transporte de email
let transporter

if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'seu-email@gmail.com') {
  // Usar configuração do .env se disponível
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
} else {
  // Modo de teste - apenas loga no console
  transporter = null
  console.log('⚠️  Modo de teste de email ativado - emails serão apenas logados no console')
}

// Função para enviar email
async function enviarEmail(para, assunto, html) {
  try {
    // Se não houver transporter configurado, apenas loga
    if (!transporter) {
      console.log('\n📧 ============ EMAIL DE TESTE ============')
      console.log('Para:', para)
      console.log('Assunto:', assunto)
      console.log('==========================================\n')
      return
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: para,
      subject: assunto,
      html: html
    })
    
    console.log('✅ Email enviado com sucesso para:', para)
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message)
    console.log('📧 Email não enviado para:', para, '- Assunto:', assunto)
  }
}

// Templates de email
function emailAgendamentoPendente(nome, data, horario, servico) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f39c12, #e67e22); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #f39c12; margin: 20px 0; }
        .info-box strong { color: #f39c12; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏳ Solicitação Recebida!</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Recebemos sua solicitação de agendamento e ela está em análise.</p>
          
          <div class="info-box">
            <p><strong>📅 Data:</strong> ${data}</p>
            <p><strong>🕐 Horário:</strong> ${horario}</p>
            <p><strong>💆 Serviço:</strong> ${servico}</p>
          </div>
          
          <p><strong>Em breve você receberá um email confirmando seu agendamento.</strong></p>
          <p>Nossa equipe está analisando a disponibilidade e entrará em contato em até 24 horas.</p>
          
          <p>Aguardamos você! 💙</p>
          <p><strong>Equipe Belleza Estética</strong></p>
        </div>
        <div class="footer">
          <p>Este é um email automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function emailAgendamentoConfirmado(nome, data, horario, servico) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6EC1E4, #EAF6F6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #6EC1E4; margin: 20px 0; }
        .info-box strong { color: #6EC1E4; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Agendamento Confirmado!</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Seu agendamento foi confirmado com sucesso. Estamos ansiosos para atendê-lo(a)!</p>
          
          <div class="info-box">
            <p><strong>📅 Data:</strong> ${data}</p>
            <p><strong>🕐 Horário:</strong> ${horario}</p>
            <p><strong>💆 Serviço:</strong> ${servico}</p>
          </div>
          
          <p>Por favor, chegue com 10 minutos de antecedência.</p>
          <p>Em caso de imprevistos, entre em contato conosco o quanto antes.</p>
          
          <p>Até breve! 💙</p>
          <p><strong>Equipe Belleza Estética</strong></p>
        </div>
        <div class="footer">
          <p>Este é um email automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function emailAgendamentoCancelado(nome, data, horario, servico) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #e74c3c; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Agendamento Cancelado</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>,</p>
          <p>Informamos que seu agendamento foi cancelado:</p>
          
          <div class="info-box">
            <p><strong>📅 Data:</strong> ${data}</p>
            <p><strong>🕐 Horário:</strong> ${horario}</p>
            <p><strong>💆 Serviço:</strong> ${servico}</p>
          </div>
          
          <p>Você pode fazer um novo agendamento a qualquer momento através do nosso site.</p>
          
          <p>Atenciosamente,</p>
          <p><strong>Equipe Belleza Estética</strong></p>
        </div>
        <div class="footer">
          <p>Este é um email automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function emailAgendamentoReagendado(nome, dataAntiga, horarioAntigo, dataNova, horarioNovo, servico) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f39c12, #e67e22); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .old { border-left: 4px solid #e74c3c; }
        .new { border-left: 4px solid #27ae60; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔄 Agendamento Reagendado</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Seu agendamento foi reagendado. Confira as informações atualizadas:</p>
          
          <div class="info-box old">
            <p><strong>❌ Agendamento Anterior:</strong></p>
            <p>📅 ${dataAntiga} às ${horarioAntigo}</p>
          </div>
          
          <div class="info-box new">
            <p><strong>✅ Novo Agendamento:</strong></p>
            <p><strong>📅 Data:</strong> ${dataNova}</p>
            <p><strong>🕐 Horário:</strong> ${horarioNovo}</p>
            <p><strong>💆 Serviço:</strong> ${servico}</p>
          </div>
          
          <p>Por favor, chegue com 10 minutos de antecedência.</p>
          <p>Em caso de dúvidas, entre em contato conosco.</p>
          
          <p>Até breve! 💙</p>
          <p><strong>Equipe Belleza Estética</strong></p>
        </div>
        <div class="footer">
          <p>Este é um email automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Configurar CORS para permitir ngrok e localhost
app.use(cors({
  origin: true, // Permite qualquer origem (necessário para ngrok)
  credentials: true
}))
app.use(express.json())

// ==================== ROTAS DE ADMIN ====================

// Login unificado (clientes e admin)
app.post('/api/cliente/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const [clientes] = await pool.query(
      'SELECT * FROM Cliente WHERE email = ? AND password = ?',
      [email, password]
    )

    if (clientes.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    const cliente = clientes[0]

    // Verificar se o cliente está bloqueado
    if (cliente.bloqueado && !cliente.isAdmin) {
      return res.status(403).json({ error: 'Sua conta foi bloqueada. Entre em contato com o administrador.' })
    }

    res.json({
      token: `cliente_${cliente.id}_${Date.now()}`,
      nome: cliente.nome,
      email: cliente.email,
      isAdmin: Boolean(cliente.isAdmin)
    })
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    res.status(500).json({ error: 'Erro ao fazer login' })
  }
})

// Buscar dados do cliente
app.get('/api/cliente/dados', async (req, res) => {
  try {
    const { email } = req.query

    const [clientes] = await pool.query(
      'SELECT id, nome, email, telefone, isAdmin, createdAt FROM Cliente WHERE email = ?',
      [email]
    )

    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' })
    }

    res.json(clientes[0])
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    res.status(500).json({ error: 'Erro ao buscar dados' })
  }
})

// Atualizar dados do cliente
app.put('/api/cliente/atualizar', async (req, res) => {
  try {
    const { email, nome, telefone, senhaAtual, novaSenha } = req.body

    // Se quiser alterar senha, validar senha atual
    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha' })
      }

      const [clientes] = await pool.query(
        'SELECT id FROM Cliente WHERE email = ? AND password = ?',
        [email, senhaAtual]
      )

      if (clientes.length === 0) {
        return res.status(401).json({ error: 'Senha atual incorreta' })
      }

      await pool.query(
        'UPDATE Cliente SET nome = ?, telefone = ?, password = ? WHERE email = ?',
        [nome, telefone, novaSenha, email]
      )
    } else {
      await pool.query(
        'UPDATE Cliente SET nome = ?, telefone = ? WHERE email = ?',
        [nome, telefone, email]
      )
    }

    res.json({ message: 'Dados atualizados com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar dados:', error)
    res.status(500).json({ error: 'Erro ao atualizar dados' })
  }
})

// Listar todos os clientes (só admin)
app.get('/api/admin/clientes', async (req, res) => {
  try {
    const [clientes] = await pool.query(
      'SELECT id, nome, email, telefone, isAdmin, bloqueado, createdAt, fichaAnamnese FROM Cliente ORDER BY createdAt DESC'
    )
    console.log(`\n📋 GET /api/admin/clientes - Retornando ${clientes.length} clientes`)
    console.log(`   Clientes com ficha: ${clientes.filter(c => c.fichaAnamnese).length}`)
    clientes.forEach(c => {
      if (c.fichaAnamnese) {
        console.log(`   - ${c.nome}: ${c.fichaAnamnese.length} chars`)
      }
    })
    res.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    res.status(500).json({ error: 'Erro ao buscar clientes' })
  }
})

// Editar dados do cliente (só admin)
app.put('/api/admin/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nome, email, telefone } = req.body

    if (!nome || !email || !telefone) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    await pool.query(
      'UPDATE Cliente SET nome = ?, email = ?, telefone = ? WHERE id = ?',
      [nome, email, telefone, id]
    )

    res.json({ message: 'Cliente atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    res.status(500).json({ error: 'Erro ao atualizar cliente' })
  }
})

// Salvar ficha de anamnese
app.put('/api/admin/clientes/:id/anamnese', async (req, res) => {
  try {
    const { id } = req.params
    const { fichaAnamnese } = req.body

    if (!fichaAnamnese) {
      return res.status(400).json({ error: 'Dados da ficha são obrigatórios' })
    }

    await pool.query(
      'UPDATE Cliente SET fichaAnamnese = ? WHERE id = ?',
      [fichaAnamnese, id]
    )

    res.json({ message: 'Ficha de anamnese salva com sucesso' })
  } catch (error) {
    console.error('Erro ao salvar ficha de anamnese:', error)
    res.status(500).json({ error: 'Erro ao salvar ficha de anamnese' })
  }
})

// Bloquear/Desbloquear cliente (só admin)
app.patch('/api/admin/clientes/:id/bloquear', async (req, res) => {
  try {
    const { id } = req.params
    const { bloqueado } = req.body

    await pool.query(
      'UPDATE Cliente SET bloqueado = ? WHERE id = ?',
      [bloqueado, id]
    )

    res.json({ message: bloqueado ? 'Cliente bloqueado' : 'Cliente desbloqueado' })
  } catch (error) {
    console.error('Erro ao bloquear/desbloquear cliente:', error)
    res.status(500).json({ error: 'Erro ao bloquear/desbloquear cliente' })
  }
})

// Excluir cliente (só admin) - Remove também seus agendamentos
app.delete('/api/admin/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se é admin
    const [cliente] = await pool.query('SELECT isAdmin FROM Cliente WHERE id = ?', [id])
    if (cliente.length > 0 && cliente[0].isAdmin) {
      return res.status(400).json({ error: 'Não é possível excluir um administrador' })
    }

    // Excluir agendamentos primeiro (foreign key)
    await pool.query('DELETE FROM Agendamento WHERE clienteId = ?', [id])
    
    // Excluir cliente
    await pool.query('DELETE FROM Cliente WHERE id = ?', [id])

    res.json({ message: 'Cliente excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir cliente:', error)
    res.status(500).json({ error: 'Erro ao excluir cliente' })
  }
})

// Buscar histórico de procedimentos do cliente (só admin)
app.get('/api/admin/clientes/:id/historico', async (req, res) => {
  try {
    const { id } = req.params
    
    const [historico] = await pool.query(
      `SELECT a.*, s.nome as servicoNome, COALESCE(a.valorCobrado, s.preco) as servicoPreco
       FROM Agendamento a
       JOIN Servico s ON a.servicoId = s.id
       WHERE a.clienteId = ?
       ORDER BY a.data DESC, a.horario DESC`,
      [id]
    )
    
    res.json(historico)
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    res.status(500).json({ error: 'Erro ao buscar histórico' })
  }
})

// Salvar/editar anotação do procedimento (só admin)
app.patch('/api/admin/agendamentos/:id/anotacao', async (req, res) => {
  try {
    const { id } = req.params
    const { anotacao } = req.body

    await pool.query(
      'UPDATE Agendamento SET anotacao = ?, updatedAt = NOW() WHERE id = ?',
      [anotacao || null, id]
    )

    res.json({ message: 'Anotação salva com sucesso' })
  } catch (error) {
    console.error('Erro ao salvar anotação:', error)
    res.status(500).json({ error: 'Erro ao salvar anotação' })
  }
})

// Editar valor cobrado no agendamento (só admin)
app.patch('/api/admin/agendamentos/:id/valor', async (req, res) => {
  try {
    const { id } = req.params
    const { valor } = req.body

    if (!valor || valor < 0) {
      return res.status(400).json({ error: 'Valor inválido' })
    }

    // Atualizar o valor cobrado específico deste agendamento
    await pool.query(
      'UPDATE Agendamento SET valorCobrado = ?, updatedAt = NOW() WHERE id = ?',
      [valor, id]
    )

    res.json({ message: 'Valor atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar valor:', error)
    res.status(500).json({ error: 'Erro ao atualizar valor' })
  }
})

// Buscar estatísticas de faturamento e métricas (só admin)
app.get('/api/admin/estatisticas', async (req, res) => {
  try {
    const { mes } = req.query // Formato: YYYY-MM
    
    if (!mes) {
      return res.status(400).json({ error: 'Mês é obrigatório' })
    }

    // Faturamento realizado (concluídos)
    const [faturamentoRealizado] = await pool.query(
      `SELECT COALESCE(SUM(COALESCE(a.valorCobrado, s.preco)), 0) as total, COUNT(*) as quantidade
       FROM Agendamento a
       JOIN Servico s ON a.servicoId = s.id
       WHERE DATE_FORMAT(a.data, '%Y-%m') = ? AND a.status = 'concluido'`,
      [mes]
    )

    // Faturamento futuro (confirmados)
    const [faturamentoFuturo] = await pool.query(
      `SELECT COALESCE(SUM(COALESCE(a.valorCobrado, s.preco)), 0) as total, COUNT(*) as quantidade
       FROM Agendamento a
       JOIN Servico s ON a.servicoId = s.id
       WHERE DATE_FORMAT(a.data, '%Y-%m') = ? AND a.status = 'confirmado'`,
      [mes]
    )

    // Total de clientes únicos no mês
    const [totalClientes] = await pool.query(
      `SELECT COUNT(DISTINCT a.clienteId) as total
       FROM Agendamento a
       WHERE DATE_FORMAT(a.data, '%Y-%m') = ? AND a.status IN ('confirmado', 'concluido')`,
      [mes]
    )

    // Cliente mais recorrente
    const [clienteMaisRecorrente] = await pool.query(
      `SELECT c.nome, c.email, COUNT(*) as total, SUM(COALESCE(a.valorCobrado, s.preco)) as faturamento
       FROM Agendamento a
       JOIN Cliente c ON a.clienteId = c.id
       JOIN Servico s ON a.servicoId = s.id
       WHERE DATE_FORMAT(a.data, '%Y-%m') = ? AND a.status IN ('confirmado', 'concluido')
       GROUP BY a.clienteId
       ORDER BY total DESC
       LIMIT 1`,
      [mes]
    )

    // Procedimento mais realizado
    const [procedimentoMaisRealizado] = await pool.query(
      `SELECT s.nome, s.preco, COUNT(*) as total, SUM(COALESCE(a.valorCobrado, s.preco)) as faturamento
       FROM Agendamento a
       JOIN Servico s ON a.servicoId = s.id
       WHERE DATE_FORMAT(a.data, '%Y-%m') = ? AND a.status IN ('confirmado', 'concluido')
       GROUP BY a.servicoId
       ORDER BY total DESC
       LIMIT 1`,
      [mes]
    )

    // Top 5 serviços
    const [topServicos] = await pool.query(
      `SELECT s.nome, COUNT(*) as quantidade, SUM(COALESCE(a.valorCobrado, s.preco)) as faturamento
       FROM Agendamento a
       JOIN Servico s ON a.servicoId = s.id
       WHERE DATE_FORMAT(a.data, '%Y-%m') = ? AND a.status IN ('confirmado', 'concluido')
       GROUP BY a.servicoId
       ORDER BY quantidade DESC
       LIMIT 5`,
      [mes]
    )

    // Top 5 clientes
    const [topClientes] = await pool.query(
      `SELECT c.nome, c.email, COUNT(*) as visitas, SUM(COALESCE(a.valorCobrado, s.preco)) as faturamento
       FROM Agendamento a
       JOIN Cliente c ON a.clienteId = c.id
       JOIN Servico s ON a.servicoId = s.id
       WHERE DATE_FORMAT(a.data, '%Y-%m') = ? AND a.status IN ('confirmado', 'concluido')
       GROUP BY a.clienteId
       ORDER BY faturamento DESC
       LIMIT 5`,
      [mes]
    )

    res.json({
      faturamentoRealizado: parseFloat(faturamentoRealizado[0].total),
      agendamentosConcluidos: faturamentoRealizado[0].quantidade,
      faturamentoFuturo: parseFloat(faturamentoFuturo[0].total),
      agendamentosConfirmados: faturamentoFuturo[0].quantidade,
      faturamentoTotal: parseFloat(faturamentoRealizado[0].total) + parseFloat(faturamentoFuturo[0].total),
      totalClientes: totalClientes[0].total,
      clienteMaisRecorrente: clienteMaisRecorrente[0] || null,
      procedimentoMaisRealizado: procedimentoMaisRealizado[0] || null,
      topServicos: topServicos,
      topClientes: topClientes
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    res.status(500).json({ error: 'Erro ao buscar estatísticas' })
  }
})

// Confirmar agendamento pendente (só admin) - Muda de pendente para confirmado
app.patch('/api/admin/agendamentos/:id/confirmar-pendente', async (req, res) => {
  try {
    const { id } = req.params

    // Buscar informações do agendamento
    const [agendamento] = await pool.query(
      `SELECT a.*, c.nome as clienteNome, c.email as clienteEmail, 
              s.nome as servicoNome
       FROM Agendamento a
       JOIN Cliente c ON a.clienteId = c.id
       JOIN Servico s ON a.servicoId = s.id
       WHERE a.id = ?`,
      [id]
    )

    if (agendamento.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' })
    }

    const info = agendamento[0]

    if (info.status !== 'pendente') {
      return res.status(400).json({ error: 'Este agendamento já foi processado' })
    }

    // Atualizar status para confirmado
    await pool.query(
      'UPDATE Agendamento SET status = ?, updatedAt = NOW() WHERE id = ?',
      ['confirmado', id]
    )

    // Enviar email de confirmação para o cliente
    const dataFormatada = new Date(info.data).toLocaleDateString('pt-BR')
    enviarEmail(
      info.clienteEmail,
      '✅ Agendamento Confirmado - Belleza Estética',
      emailAgendamentoConfirmado(info.clienteNome, dataFormatada, info.horario, info.servicoNome)
    )

    res.json({ message: 'Agendamento confirmado e cliente notificado por email' })
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error)
    res.status(500).json({ error: 'Erro ao confirmar agendamento' })
  }
})

// Marcar agendamento como concluído (só admin)
app.patch('/api/agendamentos/:id/concluir', async (req, res) => {
  try {
    const { id } = req.params

    await pool.query(
      'UPDATE Agendamento SET status = ?, updatedAt = NOW() WHERE id = ?',
      ['concluido', id]
    )

    res.json({ message: 'Agendamento marcado como concluído' })
  } catch (error) {
    console.error('Erro ao concluir agendamento:', error)
    res.status(500).json({ error: 'Erro ao concluir agendamento' })
  }
})

// Reagendar agendamento (só admin)
app.patch('/api/admin/agendamentos/:id/reagendar', async (req, res) => {
  const connection = await pool.getConnection()
  
  try {
    const { id } = req.params
    const { data, horario, observacoes } = req.body

    console.log('Reagendamento - ID:', id, 'Data:', data, 'Horário:', horario)

    if (!data || !horario) {
      return res.status(400).json({ error: 'Data e horário são obrigatórios' })
    }

    await connection.beginTransaction()

    // Buscar informações do agendamento atual
    const [agendamentoAtual] = await connection.query(
      `SELECT a.*, c.nome as clienteNome, c.email as clienteEmail, 
              s.nome as servicoNome, a.duracaoTotal
       FROM Agendamento a
       JOIN Cliente c ON a.clienteId = c.id
       JOIN Servico s ON a.servicoId = s.id
       WHERE a.id = ?`,
      [id]
    )

    if (agendamentoAtual.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: 'Agendamento não encontrado' })
    }

    const info = agendamentoAtual[0]
    const dataAntigaFormatada = new Date(info.data).toLocaleDateString('pt-BR')

    // Calcular duração: primeiro verificar se há duracaoTotal no banco
    let duracaoTotal = info.duracaoTotal
    
    // Se não houver duracaoTotal, tentar extrair da anotação (retrocompatibilidade)
    if (!duracaoTotal && info.anotacao && info.anotacao.includes('Duração total:')) {
      const duracaoMatch = info.anotacao.match(/Duração total: (\d+)min/)
      duracaoTotal = duracaoMatch ? parseInt(duracaoMatch[1]) : 0
    }
    
    // Se ainda não encontrou, buscar duração do serviço
    if (!duracaoTotal) {
      const [servico] = await connection.query(
        'SELECT duracao FROM Servico WHERE id = ?',
        [info.servicoId]
      )
      duracaoTotal = servico[0].duracao
    }

    // Calcular todos os horários que serão ocupados pelo reagendamento
    const horariosQueSeraOcupado = calcularHorariosOcupados(horario, duracaoTotal)

    // Buscar todos os agendamentos existentes para verificar conflitos (exceto o atual)
    const [agendamentosExistentes] = await connection.query(
      `SELECT a.horario, COALESCE(a.duracaoTotal, s.duracao) as duracao
       FROM Agendamento a
       JOIN Servico s ON a.servicoId = s.id
       WHERE DATE(a.data) = ? AND a.status != ? AND a.id != ?`,
      [data, 'cancelado', id]
    )

    // Verificar se há conflito com algum agendamento existente
    for (const ag of agendamentosExistentes) {
      const horariosOcupados = calcularHorariosOcupados(ag.horario, ag.duracao)
      
      // Verificar se há interseção entre os horários
      const temConflito = horariosQueSeraOcupado.some(h => horariosOcupados.includes(h))
      
      if (temConflito) {
        await connection.rollback()
        return res.status(409).json({ error: 'Este horário conflita com outro agendamento. Por favor, escolha outro horário.' })
      }
    }

    // Atualizar agendamento
    const [result] = await connection.query(
      'UPDATE Agendamento SET data = ?, horario = ?, observacoes = ?, updatedAt = NOW() WHERE id = ?',
      [data, horario, observacoes || null, id]
    )

    console.log('Linhas afetadas:', result.affectedRows)

    await connection.commit()

    // Enviar email de reagendamento
    const dataNovaFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
    enviarEmail(
      info.clienteEmail,
      '🔄 Agendamento Reagendado - Belleza Estética',
      emailAgendamentoReagendado(info.clienteNome, dataAntigaFormatada, info.horario, dataNovaFormatada, horario, info.servicoNome)
    )

    res.json({ message: 'Agendamento reagendado com sucesso' })
  } catch (error) {
    await connection.rollback()
    console.error('Erro ao reagendar agendamento:', error.message, error.stack)
    res.status(500).json({ error: 'Erro ao reagendar agendamento', details: error.message })
  } finally {
    connection.release()
  }
})

// ==================== ROTAS DE SERVIÇOS (ADMIN) ====================

// Adicionar novo serviço
app.post('/api/admin/servicos', async (req, res) => {
  try {
    const { nome, duracao, preco, descricao } = req.body

    if (!nome || !duracao || !preco) {
      return res.status(400).json({ error: 'Nome, duração e preço são obrigatórios' })
    }

    const [result] = await pool.query(
      'INSERT INTO Servico (nome, duracao, preco, descricao, ativo, createdAt) VALUES (?, ?, ?, ?, TRUE, NOW())',
      [nome, duracao, preco, descricao || '']
    )

    res.status(201).json({ 
      id: result.insertId,
      message: 'Serviço adicionado com sucesso' 
    })
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error)
    res.status(500).json({ error: 'Erro ao adicionar serviço' })
  }
})

// Atualizar serviço
app.put('/api/admin/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nome, duracao, preco, descricao } = req.body

    await pool.query(
      'UPDATE Servico SET nome = ?, duracao = ?, preco = ?, descricao = ? WHERE id = ?',
      [nome, duracao, preco, descricao || '', id]
    )

    res.json({ message: 'Serviço atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    res.status(500).json({ error: 'Erro ao atualizar serviço' })
  }
})

// Ativar/desativar serviço
app.patch('/api/admin/servicos/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params
    const { ativo } = req.body

    await pool.query(
      'UPDATE Servico SET ativo = ? WHERE id = ?',
      [ativo, id]
    )

    res.json({ message: 'Status do serviço atualizado' })
  } catch (error) {
    console.error('Erro ao atualizar status do serviço:', error)
    res.status(500).json({ error: 'Erro ao atualizar status' })
  }
})

// Excluir serviço (só admin)
app.delete('/api/admin/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se existem agendamentos com este serviço
    const [agendamentos] = await pool.query(
      'SELECT COUNT(*) as total FROM Agendamento WHERE servicoId = ? AND status IN ("confirmado", "concluido")',
      [id]
    )

    if (agendamentos[0].total > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir este serviço pois existem agendamentos vinculados a ele. Considere desativá-lo.' 
      })
    }

    // Excluir o serviço
    await pool.query('DELETE FROM Servico WHERE id = ?', [id])

    res.json({ message: 'Serviço excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir serviço:', error)
    res.status(500).json({ error: 'Erro ao excluir serviço' })
  }
})

// ==================== ROTAS DE COLABORADORES ====================

// Listar colaboradores (admin)
app.get('/api/admin/colaboradores', async (req, res) => {
  try {
    const [colaboradores] = await pool.query(`
      SELECT c.*, 
             GROUP_CONCAT(DISTINCT s.id) as servicosIds,
             GROUP_CONCAT(DISTINCT s.nome) as servicosNomes
      FROM Colaborador c
      LEFT JOIN ColaboradorServico cs ON c.id = cs.colaboradorId
      LEFT JOIN Servico s ON cs.servicoId = s.id
      GROUP BY c.id
      ORDER BY c.nome
    `)
    
    // Formatar os dados
    const colaboradoresFormatados = colaboradores.map(col => ({
      ...col,
      servicosIds: col.servicosIds ? col.servicosIds.split(',').map(id => parseInt(id)) : [],
      servicosNomes: col.servicosNomes ? col.servicosNomes.split(',') : []
    }))
    
    res.json(colaboradoresFormatados)
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error)
    res.status(500).json({ error: 'Erro ao buscar colaboradores' })
  }
})

// Criar colaborador (admin)
app.post('/api/admin/colaboradores', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { nome, email, telefone, especialidade, servicosIds } = req.body

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' })
    }

    await connection.beginTransaction()

    // Verificar se email já existe
    const [existente] = await connection.query(
      'SELECT id FROM Colaborador WHERE email = ?',
      [email]
    )

    if (existente.length > 0) {
      await connection.rollback()
      return res.status(400).json({ error: 'Email já cadastrado' })
    }

    // Criar colaborador
    const [result] = await connection.query(
      'INSERT INTO Colaborador (nome, email, telefone, especialidade, ativo, createdAt, updatedAt) VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())',
      [nome, email, telefone || null, especialidade || null]
    )

    const colaboradorId = result.insertId

    // Adicionar serviços se fornecidos
    if (servicosIds && servicosIds.length > 0) {
      const values = servicosIds.map(servicoId => [colaboradorId, servicoId])
      await connection.query(
        'INSERT INTO ColaboradorServico (colaboradorId, servicoId) VALUES ?',
        [values]
      )
    }

    await connection.commit()

    res.status(201).json({ 
      id: colaboradorId,
      message: 'Colaborador criado com sucesso' 
    })
  } catch (error) {
    await connection.rollback()
    console.error('Erro ao criar colaborador:', error)
    res.status(500).json({ error: 'Erro ao criar colaborador' })
  } finally {
    connection.release()
  }
})

// Atualizar colaborador (admin)
app.put('/api/admin/colaboradores/:id', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { id } = req.params
    const { nome, email, telefone, especialidade, servicosIds } = req.body

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' })
    }

    await connection.beginTransaction()

    // Verificar se email já existe em outro colaborador
    const [existente] = await connection.query(
      'SELECT id FROM Colaborador WHERE email = ? AND id != ?',
      [email, id]
    )

    if (existente.length > 0) {
      await connection.rollback()
      return res.status(400).json({ error: 'Email já cadastrado para outro colaborador' })
    }

    // Atualizar colaborador
    await connection.query(
      'UPDATE Colaborador SET nome = ?, email = ?, telefone = ?, especialidade = ?, updatedAt = NOW() WHERE id = ?',
      [nome, email, telefone || null, especialidade || null, id]
    )

    // Remover serviços antigos
    await connection.query(
      'DELETE FROM ColaboradorServico WHERE colaboradorId = ?',
      [id]
    )

    // Adicionar novos serviços
    if (servicosIds && servicosIds.length > 0) {
      const values = servicosIds.map(servicoId => [id, servicoId])
      await connection.query(
        'INSERT INTO ColaboradorServico (colaboradorId, servicoId) VALUES ?',
        [values]
      )
    }

    await connection.commit()

    res.json({ message: 'Colaborador atualizado com sucesso' })
  } catch (error) {
    await connection.rollback()
    console.error('Erro ao atualizar colaborador:', error)
    res.status(500).json({ error: 'Erro ao atualizar colaborador' })
  } finally {
    connection.release()
  }
})

// Ativar/Desativar colaborador (admin)
app.patch('/api/admin/colaboradores/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { ativo } = req.body

    await pool.query(
      'UPDATE Colaborador SET ativo = ?, updatedAt = NOW() WHERE id = ?',
      [ativo, id]
    )

    res.json({ message: `Colaborador ${ativo ? 'ativado' : 'desativado'} com sucesso` })
  } catch (error) {
    console.error('Erro ao atualizar status do colaborador:', error)
    res.status(500).json({ error: 'Erro ao atualizar status' })
  }
})

// Excluir colaborador (admin)
app.delete('/api/admin/colaboradores/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se existem agendamentos com este colaborador
    const [agendamentos] = await pool.query(
      'SELECT COUNT(*) as total FROM Agendamento WHERE colaboradorId = ? AND status IN ("confirmado", "pendente")',
      [id]
    )

    if (agendamentos[0].total > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir este colaborador pois existem agendamentos vinculados. Considere desativá-lo.' 
      })
    }

    // Excluir o colaborador (relacionamentos serão removidos automaticamente por CASCADE)
    await pool.query('DELETE FROM Colaborador WHERE id = ?', [id])

    res.json({ message: 'Colaborador excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir colaborador:', error)
    res.status(500).json({ error: 'Erro ao excluir colaborador' })
  }
})

// Buscar colaboradores disponíveis para um serviço
app.get('/api/colaboradores/servico/:servicoId', async (req, res) => {
  try {
    const { servicoId } = req.params
    const { data, horario } = req.query

    const [colaboradores] = await pool.query(`
      SELECT DISTINCT c.id, c.nome, c.especialidade
      FROM Colaborador c
      INNER JOIN ColaboradorServico cs ON c.id = cs.colaboradorId
      WHERE cs.servicoId = ? AND c.ativo = TRUE
      ORDER BY c.nome
    `, [servicoId])

    // Se data e horário forem fornecidos, filtrar apenas disponíveis
    if (data && horario) {
      const [ocupados] = await pool.query(`
        SELECT colaboradorId 
        FROM Agendamento 
        WHERE DATE(data) = ? AND horario = ? AND status != 'cancelado'
      `, [data, horario])

      const idsOcupados = ocupados.map(a => a.colaboradorId)
      const disponiveis = colaboradores.filter(c => !idsOcupados.includes(c.id))
      return res.json(disponiveis)
    }

    res.json(colaboradores)
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error)
    res.status(500).json({ error: 'Erro ao buscar colaboradores' })
  }
})

// ==================== ROTAS PÚBLICAS ====================

// Registro de cliente
app.post('/api/cliente/registro', async (req, res) => {
  try {
    const { nome, email, telefone, password } = req.body

    if (!nome || !email || !telefone || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' })
    }

    // Verificar se email já existe
    const [existente] = await pool.query(
      'SELECT id FROM Cliente WHERE email = ?',
      [email]
    )

    if (existente.length > 0) {
      return res.status(409).json({ error: 'Este email já está cadastrado' })
    }

    // Criar cliente
    const [result] = await pool.query(
      'INSERT INTO Cliente (nome, email, telefone, password, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [nome, email, telefone, password]
    )

    res.status(201).json({
      token: `cliente_${result.insertId}_${Date.now()}`,
      nome,
      email
    })
  } catch (error) {
    console.error('Erro ao registrar cliente:', error)
    res.status(500).json({ error: 'Erro ao registrar cliente' })
  }
})

// Login de cliente
app.post('/api/cliente/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const [clientes] = await pool.query(
      'SELECT * FROM Cliente WHERE email = ? AND password = ?',
      [email, password]
    )

    if (clientes.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    const cliente = clientes[0]

    res.json({
      token: `cliente_${cliente.id}_${Date.now()}`,
      nome: cliente.nome,
      email: cliente.email
    })
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    res.status(500).json({ error: 'Erro ao fazer login' })
  }
})


// Função auxiliar para calcular próximos horários baseado na duração
function calcularHorariosOcupados(horarioInicial, duracaoMinutos) {
  const horarios = []
  const [hora, minuto] = horarioInicial.split(':').map(Number)
  let totalMinutos = hora * 60 + minuto
  
  // Adicionar o horário inicial
  horarios.push(horarioInicial)
  
  // Calcular quantos slots de 30 minutos são necessários
  const slotsNecessarios = Math.ceil(duracaoMinutos / 30)
  
  // Adicionar os próximos horários
  for (let i = 1; i < slotsNecessarios; i++) {
    totalMinutos += 30
    const h = Math.floor(totalMinutos / 60)
    const m = totalMinutos % 60
    horarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
  }
  
  return horarios
}

// Rota para buscar horários disponíveis
app.get('/api/horarios-disponiveis', async (req, res) => {
  try {
    const { data, servicoId, duracaoTotal, excluirAgendamento } = req.query
    
    if (!data) {
      return res.status(400).json({ error: 'Data é obrigatória' })
    }

    // Buscar configurações
    const [configRows] = await pool.query(`
      SELECT chave, valor, tipo 
      FROM Configuracao 
      WHERE chave IN ('horario_abertura', 'horario_fechamento', 'dias_funcionamento', 'dias_antecedencia_max', 'intervalo_agendamento', 'intervalo_almoco_ativo', 'intervalo_almoco_inicio', 'intervalo_almoco_fim')
    `)
    
    const config = {}
    configRows.forEach(c => {
      if (c.tipo === 'json') {
        config[c.chave] = JSON.parse(c.valor)
      } else if (c.tipo === 'number') {
        config[c.chave] = parseInt(c.valor)
      } else if (c.tipo === 'boolean') {
        config[c.chave] = c.valor === 'true'
      } else {
        config[c.chave] = c.valor
      }
    })

    // Validar se a data está dentro do período permitido
    const dataAgendamento = new Date(data + 'T00:00:00')
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const diferencaDias = Math.ceil((dataAgendamento - hoje) / (1000 * 60 * 60 * 24))
    
    if (diferencaDias < 0) {
      return res.status(400).json({ error: 'Não é possível agendar em datas passadas' })
    }
    
    const diasMaxAntecedencia = config.dias_antecedencia_max || 30
    if (diferencaDias > diasMaxAntecedencia) {
      return res.status(400).json({ 
        error: `Agendamentos permitidos apenas com até ${diasMaxAntecedencia} dias de antecedência` 
      })
    }

    // Validar dia da semana
    const diaSemana = dataAgendamento.getDay().toString()
    const diasFuncionamento = config.dias_funcionamento || ['1','2','3','4','5','6']
    
    if (!diasFuncionamento.includes(diaSemana)) {
      return res.status(400).json({ error: 'A empresa não funciona neste dia da semana' })
    }

    let duracaoParaBusca = 0
    let servicoIdParaBusca = servicoId

    // Se duracaoTotal for fornecida (múltiplos serviços), usar ela
    if (duracaoTotal) {
      duracaoParaBusca = parseInt(duracaoTotal)
    } 
    // Caso contrário, buscar duração do serviço único
    else if (servicoId) {
      const [servico] = await pool.query(
        'SELECT duracao FROM Servico WHERE id = ?',
        [servicoId]
      )

      if (servico.length === 0) {
        return res.status(400).json({ error: 'Serviço não encontrado' })
      }

      duracaoParaBusca = servico[0].duracao
    } else {
      return res.status(400).json({ error: 'servicoId ou duracaoTotal é obrigatório' })
    }

    // Buscar quantos colaboradores podem realizar este serviço
    let totalColaboradores = 1 // Default: sem sistema de colaboradores
    
    if (servicoIdParaBusca) {
      const [colaboradores] = await pool.query(`
        SELECT COUNT(DISTINCT c.id) as total
        FROM Colaborador c
        INNER JOIN ColaboradorServico cs ON c.id = cs.colaboradorId
        WHERE cs.servicoId = ? AND c.ativo = TRUE
      `, [servicoIdParaBusca])
      
      console.log(`[DEBUG] Serviço ID: ${servicoIdParaBusca}`)
      console.log(`[DEBUG] Colaboradores ativos encontrados: ${colaboradores[0].total}`)
      
      if (colaboradores[0].total > 0) {
        totalColaboradores = colaboradores[0].total
      }
    }
    
    console.log(`[DEBUG] Total de colaboradores para o serviço: ${totalColaboradores}`)

    // Buscar todos os agendamentos para a data específica com suas durações
    let query = `
      SELECT a.horario, COALESCE(a.duracaoTotal, s.duracao) as duracao, a.colaboradorId
      FROM Agendamento a
      JOIN Servico s ON a.servicoId = s.id
      WHERE DATE(a.data) = ? AND a.status != ?
    `
    const params = [data, 'cancelado']
    
    if (excluirAgendamento) {
      query += ' AND a.id != ?'
      params.push(excluirAgendamento)
    }
    
    const [agendamentos] = await pool.query(query, params)

    // Contar quantos agendamentos existem para cada horário (considerando duração)
    const contagemPorHorario = {}
    
    agendamentos.forEach(ag => {
      const horariosDoAgendamento = calcularHorariosOcupados(ag.horario, ag.duracao)
      horariosDoAgendamento.forEach(h => {
        contagemPorHorario[h] = (contagemPorHorario[h] || 0) + 1
      })
    })
    
    console.log(`[DEBUG] Agendamentos encontrados: ${agendamentos.length}`)
    console.log('[DEBUG] Contagem por horário:', contagemPorHorario)

    // Usar horários das configurações
    const horarioAbertura = config.horario_abertura || '08:00'
    const horarioFechamento = config.horario_fechamento || '18:00'
    const intervalo = config.intervalo_agendamento || 30
    const intervaloAlmocoAtivo = config.intervalo_almoco_ativo === true || config.intervalo_almoco_ativo === 'true'
    const intervaloAlmocoInicio = config.intervalo_almoco_inicio || '12:00'
    const intervaloAlmocoFim = config.intervalo_almoco_fim || '13:00'
    
    console.log('[DEBUG] Configurações de almoço:', {
      ativo: intervaloAlmocoAtivo,
      inicio: intervaloAlmocoInicio,
      fim: intervaloAlmocoFim
    })
    
    const [horaAbre, minAbre] = horarioAbertura.split(':').map(Number)
    const [horaFecha, minFecha] = horarioFechamento.split(':').map(Number)
    
    const minutosAbertura = horaAbre * 60 + minAbre
    const minutosFechamento = horaFecha * 60 + minFecha
    
    // Converter horários de almoço para minutos
    let minutosAlmocoInicio = 0
    let minutosAlmocoFim = 0
    if (intervaloAlmocoAtivo) {
      const [horaAlmocoIni, minAlmocoIni] = intervaloAlmocoInicio.split(':').map(Number)
      const [horaAlmocoFim, minAlmocoFim] = intervaloAlmocoFim.split(':').map(Number)
      minutosAlmocoInicio = horaAlmocoIni * 60 + minAlmocoIni
      minutosAlmocoFim = horaAlmocoFim * 60 + minAlmocoFim
      
      console.log('[DEBUG] Intervalo de almoço em minutos:', {
        inicio: minutosAlmocoInicio,
        fim: minutosAlmocoFim
      })
    }

    // Gerar todos os horários possíveis baseado nas configurações
    const todosHorarios = []
    for (let minutos = minutosAbertura; minutos < minutosFechamento; minutos += intervalo) {
      const h = Math.floor(minutos / 60)
      const m = minutos % 60
      todosHorarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    }

    // Filtrar horários disponíveis e calcular vagas
    const horariosComVagas = todosHorarios
      .map(horario => {
        const horariosNecessarios = calcularHorariosOcupados(horario, duracaoParaBusca)
        
        // Verificar se algum horário necessário cai no intervalo de almoço
        if (intervaloAlmocoAtivo) {
          for (const h of horariosNecessarios) {
            const [hora, min] = h.split(':').map(Number)
            const minutosSlot = hora * 60 + min
            
            // Se o horário está dentro do intervalo de almoço, não está disponível
            if (minutosSlot >= minutosAlmocoInicio && minutosSlot < minutosAlmocoFim) {
              console.log(`[DEBUG] Horário ${h} bloqueado - cai no intervalo de almoço`)
              return {
                horario,
                vagasDisponiveis: 0,
                totalVagas: totalColaboradores
              }
            }
          }
        }
        
        // Verificar quantas vagas estão disponíveis
        let vagasDisponiveis = totalColaboradores
        
        for (const h of horariosNecessarios) {
          // Verificar se o horário não ultrapassa o horário de fechamento
          const [hora, min] = h.split(':').map(Number)
          const minutosSlot = hora * 60 + min
          
          if (minutosSlot >= minutosFechamento) {
            vagasDisponiveis = 0
            break
          }
          if (hora >= 18) {
            vagasDisponiveis = 0
            break
          }
          
          // Calcular vagas disponíveis para este slot
          const ocupados = contagemPorHorario[h] || 0
          const vagasNesteSlot = totalColaboradores - ocupados
          
          // A vaga disponível é o mínimo entre todos os slots necessários
          vagasDisponiveis = Math.min(vagasDisponiveis, vagasNesteSlot)
        }
        
        return {
          horario,
          vagasDisponiveis,
          totalVagas: totalColaboradores
        }
      })
      .filter(item => item.vagasDisponiveis > 0)

    const horariosDisponiveis = horariosComVagas.map(item => item.horario)

    res.json({ 
      horariosDisponiveis,
      horariosComVagas // Incluir informação detalhada sobre vagas
    })
  } catch (error) {
    console.error('Erro ao buscar horários:', error)
    res.status(500).json({ error: 'Erro ao buscar horários disponíveis' })
  }
})

// Rota para listar serviços
app.get('/api/servicos', async (req, res) => {
  try {
    const { todos } = req.query
    
    let query = 'SELECT * FROM Servico'
    
    // Se não for requisição admin (todos=true), mostrar apenas ativos
    if (todos !== 'true') {
      query += ' WHERE ativo = TRUE'
    }
    
    query += ' ORDER BY nome'
    
    const [servicos] = await pool.query(query)
    res.json(servicos)
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    res.status(500).json({ error: 'Erro ao buscar serviços' })
  }
})

// Rota para criar agendamento
app.post('/api/agendamentos', async (req, res) => {
  const connection = await pool.getConnection()
  
  try {
    const { nome, email, telefone, servicoId, servicosIds, data, horario, observacoes } = req.body

    // Suportar tanto serviço único quanto múltiplos serviços
    const servicosParaAgendar = servicosIds && servicosIds.length > 0 ? servicosIds : [servicoId]

    // Validações
    if (!nome || !email || !telefone || !servicosParaAgendar.length || !data || !horario) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' })
    }

    await connection.beginTransaction()

    // Buscar informações de todos os serviços
    const [servicos] = await connection.query(
      `SELECT id, nome, duracao, preco FROM Servico WHERE id IN (${servicosParaAgendar.map(() => '?').join(',')})`,
      servicosParaAgendar
    )

    if (servicos.length === 0) {
      await connection.rollback()
      return res.status(400).json({ error: 'Serviço(s) não encontrado(s)' })
    }

    // Calcular duração e preço total
    const duracaoTotal = servicos.reduce((total, s) => total + s.duracao, 0)
    const precoTotal = servicos.reduce((total, s) => total + parseFloat(s.preco), 0)

    // Calcular todos os horários que serão ocupados por este agendamento
    const horariosQueSeraOcupado = calcularHorariosOcupados(horario, duracaoTotal)

    // Buscar quantos colaboradores podem realizar o serviço principal
    const servicoPrincipal = servicos[0]
    const [colaboradoresCapazes] = await connection.query(`
      SELECT COUNT(DISTINCT c.id) as total
      FROM Colaborador c
      INNER JOIN ColaboradorServico cs ON c.id = cs.colaboradorId
      WHERE cs.servicoId = ? AND c.ativo = TRUE
    `, [servicoPrincipal.id])
    
    const totalColaboradores = colaboradoresCapazes[0].total || 1

    // Contar quantos agendamentos já existem para cada horário necessário
    const contagemPorHorario = {}
    
    for (const horarioNecessario of horariosQueSeraOcupado) {
      const [agendamentosNoHorario] = await connection.query(
        `SELECT COUNT(*) as total
         FROM Agendamento a
         WHERE DATE(a.data) = ? 
         AND a.horario = ?
         AND a.status != ?`,
        [data, horarioNecessario, 'cancelado']
      )
      
      contagemPorHorario[horarioNecessario] = agendamentosNoHorario[0].total
    }

    // Verificar se há colaboradores disponíveis em todos os horários necessários
    for (const horarioNecessario of horariosQueSeraOcupado) {
      if (contagemPorHorario[horarioNecessario] >= totalColaboradores) {
        await connection.rollback()
        return res.status(409).json({ 
          error: 'Não há profissionais disponíveis neste horário. Por favor, escolha outro horário.' 
        })
      }
    }

    // Buscar ou criar cliente
    let [cliente] = await connection.query(
      'SELECT id FROM Cliente WHERE email = ?',
      [email]
    )

    let clienteId
    if (cliente.length === 0) {
      const [result] = await connection.query(
        'INSERT INTO Cliente (nome, email, telefone, createdAt) VALUES (?, ?, ?, NOW())',
        [nome, email, telefone]
      )
      clienteId = result.insertId
    } else {
      clienteId = cliente[0].id
    }

    // Buscar colaborador disponível para o serviço principal
    let colaboradorId = null
    
    const [colaboradoresDisponiveis] = await connection.query(`
      SELECT c.id
      FROM Colaborador c
      INNER JOIN ColaboradorServico cs ON c.id = cs.colaboradorId
      WHERE cs.servicoId = ? AND c.ativo = TRUE
    `, [servicos[0].id])
    
    if (colaboradoresDisponiveis.length > 0) {
      // Buscar qual colaborador está menos ocupado neste horário
      const [ocupacao] = await connection.query(`
        SELECT colaboradorId, COUNT(*) as total
        FROM Agendamento
        WHERE DATE(data) = ? AND horario = ? AND status != 'cancelado'
        AND colaboradorId IN (${colaboradoresDisponiveis.map(() => '?').join(',')})
        GROUP BY colaboradorId
      `, [data, horario, ...colaboradoresDisponiveis.map(c => c.id)])
      
      const idsOcupados = ocupacao.map(o => o.colaboradorId)
      const colaboradorLivre = colaboradoresDisponiveis.find(c => !idsOcupados.includes(c.id))
      
      colaboradorId = colaboradorLivre ? colaboradorLivre.id : null
    }

    // Criar um agendamento para o primeiro serviço (agendamento principal)
    const [agendamento] = await connection.query(
      'INSERT INTO Agendamento (clienteId, servicoId, data, horario, observacoes, valorCobrado, duracaoTotal, colaboradorId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [clienteId, servicos[0].id, data, horario, observacoes || null, precoTotal, duracaoTotal, colaboradorId, 'pendente']
    )

    // Se houver múltiplos serviços, adicionar anotação informando quais foram combinados
    if (servicos.length > 1) {
      const nomesServicos = servicos.map(s => s.nome).join(', ')
      const anotacaoServicos = `Agendamento combinado: ${nomesServicos} (Duração total: ${duracaoTotal}min, Valor total: R$ ${precoTotal.toFixed(2)})`
      
      await connection.query(
        'UPDATE Agendamento SET anotacao = ? WHERE id = ?',
        [anotacaoServicos, agendamento.insertId]
      )
    }

    await connection.commit()

    // Enviar email de recebimento do pedido
    const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
    const nomesServicos = servicos.map(s => s.nome).join(', ')
    enviarEmail(
      email,
      '⏳ Solicitação de Agendamento Recebida - Belleza Estética',
      emailAgendamentoPendente(nome, dataFormatada, horario, nomesServicos)
    )

    res.status(201).json({ 
      id: agendamento.insertId,
      message: 'Agendamento criado com sucesso' 
    })
  } catch (error) {
    await connection.rollback()
    console.error('Erro ao criar agendamento:', error)
    res.status(500).json({ error: 'Erro ao criar agendamento' })
  } finally {
    connection.release()
  }
})

// Rota para buscar cliente por email
app.get('/api/clientes', async (req, res) => {
  try {
    const { email } = req.query
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const [clientes] = await pool.query(
      'SELECT id, nome, email, telefone, bloqueado, createdAt, fichaAnamnese FROM Cliente WHERE email = ?',
      [email]
    )
    
    res.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    res.status(500).json({ error: 'Erro ao buscar cliente' })
  }
})

// Rota para listar agendamentos
app.get('/api/agendamentos', async (req, res) => {
  try {
    const { data, clienteEmail, clienteNome } = req.query
    
    let query = `
      SELECT a.*, c.nome as clienteNome, c.email as clienteEmail, c.telefone,
             s.nome as servicoNome, COALESCE(a.valorCobrado, s.preco) as servicoPreco
      FROM Agendamento a
      JOIN Cliente c ON a.clienteId = c.id
      JOIN Servico s ON a.servicoId = s.id
      WHERE 1=1
    `
    const params = []
    
    if (data) {
      query += ' AND DATE(a.data) = ?'
      params.push(data)
    }
    
    if (clienteEmail) {
      query += ' AND c.email = ?'
      params.push(clienteEmail)
    }

    if (clienteNome) {
      query += ' AND c.nome LIKE ?'
      params.push(`%${clienteNome}%`)
    }

    query += ' ORDER BY a.data ASC, a.horario ASC'

    const [agendamentos] = await pool.query(query, params)
    res.json(agendamentos)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    res.status(500).json({ error: 'Erro ao buscar agendamentos' })
  }
})

// Rota para cancelar agendamento
app.patch('/api/agendamentos/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params

    // Buscar informações do agendamento antes de cancelar
    const [agendamento] = await pool.query(
      `SELECT a.*, c.nome as clienteNome, c.email as clienteEmail, 
              s.nome as servicoNome
       FROM Agendamento a
       JOIN Cliente c ON a.clienteId = c.id
       JOIN Servico s ON a.servicoId = s.id
       WHERE a.id = ?`,
      [id]
    )

    if (agendamento.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' })
    }

    const info = agendamento[0]

    // Cancelar agendamento
    await pool.query(
      'UPDATE Agendamento SET status = ?, updatedAt = NOW() WHERE id = ?',
      ['cancelado', id]
    )

    // Enviar email de cancelamento
    const dataFormatada = new Date(info.data).toLocaleDateString('pt-BR')
    enviarEmail(
      info.clienteEmail,
      '❌ Agendamento Cancelado - Belleza Estética',
      emailAgendamentoCancelado(info.clienteNome, dataFormatada, info.horario, info.servicoNome)
    )

    res.json({ message: 'Agendamento cancelado com sucesso' })
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error)
    res.status(500).json({ error: 'Erro ao cancelar agendamento' })
  }
})

// ============ ROTAS DE CONFIGURAÇÕES ============

// Buscar todas as configurações
app.get('/api/admin/configuracoes', async (req, res) => {
  try {
    const [configuracoes] = await pool.query('SELECT * FROM Configuracao ORDER BY chave')
    
    // Transformar array em objeto para facilitar uso no frontend
    const config = {}
    configuracoes.forEach(c => {
      if (c.tipo === 'json') {
        config[c.chave] = JSON.parse(c.valor)
      } else if (c.tipo === 'number') {
        config[c.chave] = parseInt(c.valor)
      } else if (c.tipo === 'boolean') {
        config[c.chave] = c.valor === 'true'
      } else {
        config[c.chave] = c.valor
      }
    })
    
    res.json(config)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    res.status(500).json({ error: 'Erro ao buscar configurações' })
  }
})

// Buscar configurações públicas (para clientes)
app.get('/api/configuracoes/publicas', async (req, res) => {
  try {
    const [configuracoes] = await pool.query(`
      SELECT chave, valor, tipo 
      FROM Configuracao 
      WHERE chave IN ('horario_abertura', 'horario_fechamento', 'dias_funcionamento', 'dias_antecedencia_max', 'intervalo_agendamento')
    `)
    
    const config = {}
    configuracoes.forEach(c => {
      if (c.tipo === 'json') {
        config[c.chave] = JSON.parse(c.valor)
      } else if (c.tipo === 'number') {
        config[c.chave] = parseInt(c.valor)
      } else if (c.tipo === 'boolean') {
        config[c.chave] = c.valor === 'true'
      } else {
        config[c.chave] = c.valor
      }
    })
    
    res.json(config)
  } catch (error) {
    console.error('Erro ao buscar configurações públicas:', error)
    res.status(500).json({ error: 'Erro ao buscar configurações' })
  }
})

// Atualizar configuração específica
app.put('/api/admin/configuracoes/:chave', async (req, res) => {
  try {
    const { chave } = req.params
    const { valor } = req.body

    // Validações específicas
    if (chave === 'horario_abertura' || chave === 'horario_fechamento') {
      // Validar formato HH:MM
      if (!/^\d{2}:\d{2}$/.test(valor)) {
        return res.status(400).json({ error: 'Formato de horário inválido. Use HH:MM' })
      }
    }

    if (chave === 'dias_antecedencia_max' || chave === 'intervalo_agendamento') {
      if (isNaN(valor) || parseInt(valor) < 0) {
        return res.status(400).json({ error: 'Valor deve ser um número positivo' })
      }
    }

    if (chave === 'dias_funcionamento') {
      if (!Array.isArray(valor)) {
        return res.status(400).json({ error: 'dias_funcionamento deve ser um array' })
      }
    }

    // Preparar valor para salvar
    let valorParaSalvar = valor
    if (typeof valor === 'object') {
      valorParaSalvar = JSON.stringify(valor)
    } else {
      valorParaSalvar = String(valor)
    }

    await pool.query(
      'UPDATE Configuracao SET valor = ?, updatedAt = NOW() WHERE chave = ?',
      [valorParaSalvar, chave]
    )

    res.json({ message: 'Configuração atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error)
    res.status(500).json({ error: 'Erro ao atualizar configuração' })
  }
})

// Atualizar múltiplas configurações de uma vez
app.put('/api/admin/configuracoes', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const configuracoes = req.body // { chave1: valor1, chave2: valor2, ... }

    await connection.beginTransaction()

    for (const [chave, valor] of Object.entries(configuracoes)) {
      let valorParaSalvar = valor
      if (typeof valor === 'object') {
        valorParaSalvar = JSON.stringify(valor)
      } else {
        valorParaSalvar = String(valor)
      }

      await connection.query(
        'UPDATE Configuracao SET valor = ?, updatedAt = NOW() WHERE chave = ?',
        [valorParaSalvar, chave]
      )
    }

    await connection.commit()
    res.json({ message: 'Configurações atualizadas com sucesso' })
  } catch (error) {
    await connection.rollback()
    console.error('Erro ao atualizar configurações:', error)
    res.status(500).json({ error: 'Erro ao atualizar configurações' })
  } finally {
    connection.release()
  }
})

// ==================== SERVIR FRONTEND (PRODUCTION) ====================
// IMPORTANTE: Isso deve ficar DEPOIS de todas as rotas da API
// Em produção, serve os arquivos estáticos do build do React

// Verifica se existe a pasta dist (build do frontend)
import { existsSync } from 'fs'
const distPath = path.join(__dirname, '..', 'dist')

if (existsSync(distPath)) {
  // Servir arquivos estáticos do frontend buildado
  app.use(express.static(distPath))
  
  // Rota catch-all para SPA do React
  // Qualquer rota que NÃO seja da API retorna o index.html
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
  
  console.log('✅ Servindo frontend em modo produção')
} else {
  console.log('⚠️  Pasta dist não encontrada - modo desenvolvimento (frontend separado)')
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})

// Manter o processo ativo
process.stdin.resume()

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM recebido, fechando servidor...')
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT recebido, fechando servidor...')
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
})
