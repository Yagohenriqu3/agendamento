import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PainelAdmin() {
  const [agendamentos, setAgendamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicos, setServicos] = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [abaAtiva, setAbaAtiva] = useState('agendamentos') // 'agendamentos', 'clientes', 'administracao'
  const [subAbaAdmin, setSubAbaAdmin] = useState('servicos') // 'servicos', 'equipe', 'faturamento', 'configuracoes'
  const [configuracoes, setConfiguracoes] = useState({
    horario_abertura: '08:00',
    horario_fechamento: '18:00',
    dias_funcionamento: ['1','2','3','4','5','6'],
    dias_antecedencia_max: 30,
    intervalo_agendamento: 30
  })
  const [filtroData, setFiltroData] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [historicoCliente, setHistoricoCliente] = useState([])
  const [editandoAnotacao, setEditandoAnotacao] = useState(null)
  const [editandoValor, setEditandoValor] = useState(null)
  const [editandoCliente, setEditandoCliente] = useState(null)
  const [editandoColaborador, setEditandoColaborador] = useState(null)
  const [estatisticas, setEstatisticas] = useState(null)
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  const [adminNome, setAdminNome] = useState('')
  const [editandoServico, setEditandoServico] = useState(null)
  const [novoServico, setNovoServico] = useState({
    nome: '',
    duracao: '',
    preco: '',
    descricao: ''
  })
  const [novoColaborador, setNovoColaborador] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
    servicosIds: []
  })
  const [mostrarFormAgendamento, setMostrarFormAgendamento] = useState(false)
  const [reagendando, setReagendando] = useState(null)
  const [detalhesServicosModal, setDetalhesServicosModal] = useState(null)
  const [formAgendamento, setFormAgendamento] = useState({
    clienteId: '',
    servicoId: '',
    data: '',
    horario: '',
    observacoes: ''
  })
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)
  const agendamentosPorPagina = 15
  const [menuAberto, setMenuAberto] = useState(false)
  const [observacoesExpandidas, setObservacoesExpandidas] = useState({})
  const navigate = useNavigate()

  const API_URL = 'http://localhost:3001/api'

  useEffect(() => {
    // Verificar se está autenticado e é admin
    const token = localStorage.getItem('clienteToken')
    const nome = localStorage.getItem('clienteNome')
    const isAdmin = localStorage.getItem('isAdmin') === 'true'
    
    if (!token) {
      navigate('/login')
      return
    }

    if (!isAdmin) {
      // Se não for admin, redirecionar para área do cliente
      navigate('/meus-agendamentos')
      return
    }

    setAdminNome(nome || 'Administrador')
    carregarAgendamentos()
    carregarClientes()
    carregarServicos()
    carregarColaboradores()
    carregarEstatisticas()
    carregarConfiguracoes()
  }, [navigate])

  const carregarConfiguracoes = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/configuracoes`)
      const dados = await response.json()
      setConfiguracoes(dados)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const salvarConfiguracoes = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/configuracoes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configuracoes)
      })

      if (!response.ok) throw new Error('Erro ao salvar configurações')

      alert('✅ Configurações salvas com sucesso!')
      carregarConfiguracoes()
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    }
  }

  const carregarEstatisticas = async (mes = mesSelecionado) => {
    try {
      const response = await fetch(`${API_URL}/admin/estatisticas?mes=${mes}`)
      const dados = await response.json()
      setEstatisticas(dados)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const carregarServicos = async () => {
    try {
      const response = await fetch(`${API_URL}/servicos?todos=true`)
      const dados = await response.json()
      setServicos(dados)
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  const carregarAgendamentos = async (data = '', clienteNome = '') => {
    try {
      setLoading(true)
      let url = `${API_URL}/agendamentos?`
      
      const params = []
      if (data) params.push(`data=${data}`)
      if (clienteNome) params.push(`clienteNome=${encodeURIComponent(clienteNome)}`)
      
      url += params.join('&')
      
      const response = await fetch(url)
      const dados = await response.json()
      setAgendamentos(dados)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      alert('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const carregarClientes = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/clientes`)
      const dados = await response.json()
      setClientes(dados)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  const handleFiltroData = (e) => {
    const data = e.target.value
    setFiltroData(data)
    setPaginaAtual(1)
    carregarAgendamentos(data, filtroCliente)
  }

  const handleFiltroCliente = (e) => {
    const cliente = e.target.value
    setFiltroCliente(cliente)
    setPaginaAtual(1)
    carregarAgendamentos(filtroData, cliente)
  }

  const handleCancelar = async (id) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/agendamentos/${id}/cancelar`, {
        method: 'PATCH'
      })

      if (response.ok) {
        alert('Agendamento cancelado com sucesso!')
        carregarAgendamentos(filtroData)
      } else {
        throw new Error('Erro ao cancelar')
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      alert('Erro ao cancelar agendamento')
    }
  }

  const handleConfirmarPendente = async (id) => {
    if (!confirm('Confirmar este agendamento? O cliente receberá um email de confirmação.')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/agendamentos/${id}/confirmar-pendente`, {
        method: 'PATCH'
      })

      if (response.ok) {
        alert('Agendamento confirmado! Email enviado ao cliente.')
        carregarAgendamentos(filtroData)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao confirmar')
      }
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error)
      alert(error.message)
    }
  }

  const handleConcluir = async (id) => {
    if (!confirm('Marcar este agendamento como concluído?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/agendamentos/${id}/concluir`, {
        method: 'PATCH'
      })

      if (response.ok) {
        alert('Agendamento marcado como concluído!')
        carregarAgendamentos(filtroData)
      } else {
        throw new Error('Erro ao concluir')
      }
    } catch (error) {
      console.error('Erro ao concluir agendamento:', error)
      alert('Erro ao concluir agendamento')
    }
  }

  const handleAdicionarServico = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${API_URL}/admin/servicos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoServico)
      })

      if (!response.ok) throw new Error('Erro ao adicionar serviço')

      alert('Serviço adicionado com sucesso!')
      setNovoServico({ nome: '', duracao: '', preco: '', descricao: '' })
      carregarServicos()
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error)
      alert('Erro ao adicionar serviço')
    }
  }

  const handleEditarServico = async (id, dados) => {
    try {
      const response = await fetch(`${API_URL}/admin/servicos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      })

      if (!response.ok) throw new Error('Erro ao atualizar serviço')

      alert('Serviço atualizado com sucesso!')
      setEditandoServico(null)
      carregarServicos()
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
      alert('Erro ao atualizar serviço')
    }
  }

  const handleToggleAtivo = async (id, ativo) => {
    try {
      const response = await fetch(`${API_URL}/admin/servicos/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativo: !ativo })
      })

      if (!response.ok) throw new Error('Erro ao atualizar status do serviço')

      carregarServicos()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status do serviço')
    }
  }

  const handleExcluirServico = async (id) => {
    if (!confirm('Tem certeza que deseja EXCLUIR este serviço? Esta ação não pode ser desfeita!')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/servicos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir serviço')
      }

      alert('Serviço excluído com sucesso!')
      carregarServicos()
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
      alert(error.message)
    }
  }

  // ===== FUNÇÕES DE COLABORADORES =====
  
  const carregarColaboradores = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/colaboradores`)
      const dados = await response.json()
      setColaboradores(dados)
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error)
    }
  }

  const handleCriarColaborador = async (e) => {
    e.preventDefault()

    if (!novoColaborador.servicosIds || novoColaborador.servicosIds.length === 0) {
      alert('Selecione pelo menos um serviço que o colaborador pode realizar')
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/colaboradores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoColaborador)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar colaborador')
      }

      alert('Colaborador criado com sucesso!')
      setNovoColaborador({ nome: '', email: '', telefone: '', especialidade: '', servicosIds: [] })
      carregarColaboradores()
    } catch (error) {
      console.error('Erro ao criar colaborador:', error)
      alert(error.message)
    }
  }

  const handleEditarColaborador = async (e) => {
    e.preventDefault()

    if (!editandoColaborador.servicosIds || editandoColaborador.servicosIds.length === 0) {
      alert('Selecione pelo menos um serviço que o colaborador pode realizar')
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/colaboradores/${editandoColaborador.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editandoColaborador)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao editar colaborador')
      }

      alert('Colaborador atualizado com sucesso!')
      setEditandoColaborador(null)
      carregarColaboradores()
    } catch (error) {
      console.error('Erro ao editar colaborador:', error)
      alert(error.message)
    }
  }

  const handleToggleColaboradorStatus = async (id, ativo) => {
    try {
      const response = await fetch(`${API_URL}/admin/colaboradores/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativo: !ativo })
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      carregarColaboradores()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status do colaborador')
    }
  }

  const handleExcluirColaborador = async (id) => {
    if (!confirm('Tem certeza que deseja EXCLUIR este colaborador? Esta ação não pode ser desfeita!')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/colaboradores/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir colaborador')
      }

      alert('Colaborador excluído com sucesso!')
      carregarColaboradores()
    } catch (error) {
      console.error('Erro ao excluir colaborador:', error)
      alert(error.message)
    }
  }

  const handleToggleServicoColaborador = (servicoId) => {
    if (editandoColaborador) {
      const servicosAtuais = editandoColaborador.servicosIds || []
      const novoArray = servicosAtuais.includes(servicoId)
        ? servicosAtuais.filter(id => id !== servicoId)
        : [...servicosAtuais, servicoId]
      setEditandoColaborador({ ...editandoColaborador, servicosIds: novoArray })
    } else {
      const servicosAtuais = novoColaborador.servicosIds || []
      const novoArray = servicosAtuais.includes(servicoId)
        ? servicosAtuais.filter(id => id !== servicoId)
        : [...servicosAtuais, servicoId]
      setNovoColaborador({ ...novoColaborador, servicosIds: novoArray })
    }
  }

  const carregarHorariosDisponiveis = async (data, servicoId, agendamentoIdExcluir = null) => {
    if (!data || !servicoId) return

    try {
      // Buscar duração do serviço selecionado
      const servicoResponse = await fetch(`${API_URL}/servicos?todos=true`)
      const todosServicos = await servicoResponse.json()
      const servico = todosServicos.find(s => s.id === parseInt(servicoId))
      
      if (!servico) return
      
      const duracaoTotal = servico.duracao
      
      let url = `${API_URL}/horarios-disponiveis?data=${data}&duracaoTotal=${duracaoTotal}`
      if (agendamentoIdExcluir) {
        url += `&excluirAgendamento=${agendamentoIdExcluir}`
      }
      
      const response = await fetch(url)
      const resultado = await response.json()
      
      // O backend retorna { horariosDisponiveis: [...] }
      setHorariosDisponiveis(resultado.horariosDisponiveis || [])
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      setHorariosDisponiveis([])
    }
  }

  const handleCriarAgendamento = async (e) => {
    e.preventDefault()

    try {
      const cliente = clientes.find(c => c.id === parseInt(formAgendamento.clienteId))
      
      const dados = {
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        servicoId: formAgendamento.servicoId,
        data: formAgendamento.data,
        horario: formAgendamento.horario,
        observacoes: formAgendamento.observacoes
      }

      const response = await fetch(`${API_URL}/agendamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar agendamento')
      }

      alert('Agendamento criado com sucesso!')
      setMostrarFormAgendamento(false)
      setFormAgendamento({
        clienteId: '',
        servicoId: '',
        data: '',
        horario: '',
        observacoes: ''
      })
      setHorariosDisponiveis([])
      carregarAgendamentos(filtroData)
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      alert(error.message)
    }
  }

  const handleReagendar = async (e) => {
    e.preventDefault()

    try {
      const dados = {
        data: formAgendamento.data,
        horario: formAgendamento.horario,
        observacoes: formAgendamento.observacoes
      }
      
      console.log('Reagendando agendamento ID:', reagendando.id, 'com dados:', dados)
      
      const response = await fetch(`${API_URL}/admin/agendamentos/${reagendando.id}/reagendar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Erro do servidor:', error)
        throw new Error(error.error || 'Erro ao reagendar')
      }

      alert('Agendamento reagendado com sucesso!')
      setReagendando(null)
      setFormAgendamento({
        clienteId: '',
        servicoId: '',
        data: '',
        horario: '',
        observacoes: ''
      })
      setHorariosDisponiveis([])
      carregarAgendamentos(filtroData)
    } catch (error) {
      console.error('Erro ao reagendar:', error)
      alert(error.message)
    }
  }

  const iniciarReagendamento = (agendamento) => {
    setReagendando(agendamento)
    setFormAgendamento({
      clienteId: agendamento.clienteId,
      servicoId: agendamento.servicoId,
      data: '',
      horario: '',
      observacoes: agendamento.observacoes || ''
    })
  }

  const carregarHorariosParaReagendamento = async (data, agendamento) => {
    if (!data) return

    try {
      // Calcular duração: se for agendamento múltiplo, extrair da anotação
      let duracaoTotal = 0
      if (agendamento.anotacao && agendamento.anotacao.includes('Duração total:')) {
        const duracaoMatch = agendamento.anotacao.match(/Duração total: (\d+)min/)
        duracaoTotal = duracaoMatch ? parseInt(duracaoMatch[1]) : 0
      }
      
      // Se não encontrou na anotação, buscar duração do serviço
      if (duracaoTotal === 0) {
        const servicoResponse = await fetch(`${API_URL}/servicos?todos=true`)
        const todosServicos = await servicoResponse.json()
        const servico = todosServicos.find(s => s.id === agendamento.servicoId)
        duracaoTotal = servico ? servico.duracao : 30
      }
      
      let url = `${API_URL}/horarios-disponiveis?data=${data}&duracaoTotal=${duracaoTotal}&excluirAgendamento=${agendamento.id}`
      
      const response = await fetch(url)
      const resultado = await response.json()
      
      setHorariosDisponiveis(resultado.horariosDisponiveis || [])
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      setHorariosDisponiveis([])
    }
  }

  const abrirFormAgendamentoCliente = (cliente) => {
    setFormAgendamento({
      clienteId: cliente.id,
      servicoId: '',
      data: '',
      horario: '',
      observacoes: ''
    })
    setMostrarFormAgendamento(true)
    setAbaAtiva('agendamentos')
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const abrirHistoricoCliente = async (cliente) => {
    try {
      setClienteSelecionado(cliente)
      setLoading(true)
      
      const response = await fetch(`${API_URL}/admin/clientes/${cliente.id}/historico`)
      const dados = await response.json()
      setHistoricoCliente(dados)
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      alert('Erro ao carregar histórico do cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleEditarValor = async (agendamentoId, novoValor) => {
    try {
      const response = await fetch(`${API_URL}/admin/agendamentos/${agendamentoId}/valor`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ valor: parseFloat(novoValor) })
      })

      if (!response.ok) throw new Error('Erro ao atualizar valor')

      alert('Valor atualizado com sucesso!')
      setEditandoValor(null)
      carregarAgendamentos(filtroData, filtroCliente)
      // Recarregar estatísticas se estiver na aba de faturamento
      if (abaAtiva === 'administracao' && subAbaAdmin === 'faturamento') {
        carregarEstatisticas(mesSelecionado)
      }
    } catch (error) {
      console.error('Erro ao atualizar valor:', error)
      alert('Erro ao atualizar valor')
    }
  }

  const salvarAnotacao = async (agendamentoId, anotacao) => {
    try {
      const response = await fetch(`${API_URL}/admin/agendamentos/${agendamentoId}/anotacao`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ anotacao })
      })

      if (!response.ok) throw new Error('Erro ao salvar anotação')

      alert('Anotação salva com sucesso!')
      setEditandoAnotacao(null)
      
      // Recarregar histórico
      if (clienteSelecionado) {
        abrirHistoricoCliente(clienteSelecionado)
      }
    } catch (error) {
      console.error('Erro ao salvar anotação:', error)
      alert('Erro ao salvar anotação')
    }
  }

  const handleEditarCliente = async (clienteId, dados) => {
    try {
      const response = await fetch(`${API_URL}/admin/clientes/${clienteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      })

      if (!response.ok) throw new Error('Erro ao atualizar cliente')

      alert('Cliente atualizado com sucesso!')
      setEditandoCliente(null)
      carregarClientes()
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      alert('Erro ao atualizar cliente')
    }
  }

  const handleBloquearCliente = async (clienteId, bloqueado) => {
    const acao = bloqueado ? 'desbloquear' : 'bloquear'
    if (!confirm(`Tem certeza que deseja ${acao} este cliente?`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/clientes/${clienteId}/bloquear`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bloqueado: !bloqueado })
      })

      if (!response.ok) throw new Error('Erro ao bloquear/desbloquear cliente')

      alert(`Cliente ${acao === 'bloquear' ? 'bloqueado' : 'desbloqueado'} com sucesso!`)
      carregarClientes()
    } catch (error) {
      console.error('Erro ao bloquear/desbloquear cliente:', error)
      alert('Erro ao bloquear/desbloquear cliente')
    }
  }

  const handleExcluirCliente = async (clienteId) => {
    if (!confirm('Tem certeza que deseja EXCLUIR este cliente? Esta ação não pode ser desfeita e todos os agendamentos serão removidos!')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/clientes/${clienteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir cliente')

      alert('Cliente excluído com sucesso!')
      carregarClientes()
      carregarAgendamentos(filtroData, filtroCliente)
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      alert('Erro ao excluir cliente')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('clienteToken')
    localStorage.removeItem('clienteNome')
    localStorage.removeItem('clienteEmail')
    localStorage.removeItem('isAdmin')
    navigate('/login')
  }

  const formatarData = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmado':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      case 'concluido':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const dataHoje = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-linear-to-b from-[#EAF6F6] to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Botão Hambúrguer (Mobile) */}
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="md:hidden text-gray-700 hover:text-[#6EC1E4] transition-colors p-2"
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {menuAberto ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-[#6EC1E4]">
                  Painel Administrativo
                </h1>
                <p className="text-gray-600 mt-1 text-xs md:text-base">
                  Bem-vindo, {adminNome}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 md:px-6 py-2 rounded-lg hover:bg-red-600 transition-all font-semibold text-xs md:text-base"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        {/* Menu de Navegação Principal - Desktop */}
        <div className="hidden md:block bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setAbaAtiva('agendamentos')}
              className={`flex-1 py-4 px-6 font-semibold transition-all text-base border-b-2 ${
                abaAtiva === 'agendamentos'
                  ? 'text-[#6EC1E4] border-[#6EC1E4] bg-blue-50'
                  : 'text-gray-600 hover:text-[#6EC1E4] hover:bg-gray-50 border-transparent'
              }`}
            >
              📅 Agendamentos
            </button>
            <button
              onClick={() => setAbaAtiva('clientes')}
              className={`flex-1 py-4 px-6 font-semibold transition-all text-base border-b-2 ${
                abaAtiva === 'clientes'
                  ? 'text-[#6EC1E4] border-[#6EC1E4] bg-blue-50'
                  : 'text-gray-600 hover:text-[#6EC1E4] hover:bg-gray-50 border-transparent'
              }`}
            >
              👤 Clientes
            </button>
            <button
              onClick={() => setAbaAtiva('administracao')}
              className={`flex-1 py-4 px-6 font-semibold transition-all text-base border-b-2 ${
                abaAtiva === 'administracao'
                  ? 'text-[#6EC1E4] border-[#6EC1E4] bg-blue-50'
                  : 'text-gray-600 hover:text-[#6EC1E4] hover:bg-gray-50 border-transparent'
              }`}
            >
              ⚙️ Administração
            </button>
          </div>
        </div>

        {/* Menu Hambúrguer - Mobile */}
        {menuAberto && (
          <>
            {/* Overlay transparente para fechar menu ao clicar fora */}
            <div 
              className="md:hidden fixed inset-0 z-40" 
              onClick={() => setMenuAberto(false)}
            />
            
            {/* Menu lateral */}
            <div className="md:hidden fixed left-0 top-0 bottom-0 z-50 bg-white w-64 shadow-2xl animate-slide-in">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                  <button
                    onClick={() => setMenuAberto(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => {
                    setAbaAtiva('agendamentos');
                    setMenuAberto(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-lg font-semibold transition-all mb-2 ${
                    abaAtiva === 'agendamentos'
                      ? 'text-white bg-[#6EC1E4] shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📅 Agendamentos
                </button>
                
                <button
                  onClick={() => {
                    setAbaAtiva('clientes');
                    setMenuAberto(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-lg font-semibold transition-all mb-2 ${
                    abaAtiva === 'clientes'
                      ? 'text-white bg-[#6EC1E4] shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👤 Clientes
                </button>
                
                <div className="mb-2">
                  <button
                    onClick={() => setAbaAtiva('administracao')}
                    className={`w-full text-left py-3 px-4 rounded-lg font-semibold transition-all ${
                      abaAtiva === 'administracao'
                        ? 'text-white bg-[#6EC1E4] shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ⚙️ Administração
                  </button>
                  
                  {abaAtiva === 'administracao' && (
                    <div className="ml-4 mt-2 space-y-1">
                      <button
                        onClick={() => {
                          setSubAbaAdmin('servicos');
                          setMenuAberto(false);
                        }}
                        className={`w-full text-left py-2 px-4 rounded-lg text-sm transition-all ${
                          subAbaAdmin === 'servicos'
                            ? 'text-[#6EC1E4] bg-blue-50 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        📋 Serviços
                      </button>
                      
                      <button
                        onClick={() => {
                          setSubAbaAdmin('equipe');
                          setMenuAberto(false);
                        }}
                        className={`w-full text-left py-2 px-4 rounded-lg text-sm transition-all ${
                          subAbaAdmin === 'equipe'
                            ? 'text-[#6EC1E4] bg-blue-50 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        👥 Equipe
                      </button>
                      
                      <button
                        onClick={() => {
                          setSubAbaAdmin('faturamento');
                          setMenuAberto(false);
                        }}
                        className={`w-full text-left py-2 px-4 rounded-lg text-sm transition-all ${
                          subAbaAdmin === 'faturamento'
                            ? 'text-[#6EC1E4] bg-blue-50 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        💰 Faturamento
                      </button>
                      
                      <button
                        onClick={() => {
                          setSubAbaAdmin('configuracoes');
                          setMenuAberto(false);
                        }}
                        className={`w-full text-left py-2 px-4 rounded-lg text-sm transition-all ${
                          subAbaAdmin === 'configuracoes'
                            ? 'text-[#6EC1E4] bg-blue-50 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        ⚙️ Configurações
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sub-abas de Administração - Desktop */}
        {abaAtiva === 'administracao' && (
          <div className="hidden md:block bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setSubAbaAdmin('servicos')}
                className={`flex-1 py-3 px-6 font-medium transition-all text-base border-b-2 ${
                  subAbaAdmin === 'servicos'
                    ? 'text-[#6EC1E4] bg-blue-50 border-[#6EC1E4]'
                    : 'text-gray-600 hover:text-[#6EC1E4] hover:bg-gray-50 border-transparent'
                }`}
              >
                📋 Serviços
              </button>
              <button
                onClick={() => setSubAbaAdmin('equipe')}
                className={`flex-1 py-3 px-6 font-medium transition-all text-base border-b-2 ${
                  subAbaAdmin === 'equipe'
                    ? 'text-[#6EC1E4] bg-blue-50 border-[#6EC1E4]'
                    : 'text-gray-600 hover:text-[#6EC1E4] hover:bg-gray-50 border-transparent'
                }`}
              >
                👥 Equipe
              </button>
              <button
                onClick={() => setSubAbaAdmin('faturamento')}
                className={`flex-1 py-3 px-6 font-medium transition-all text-base border-b-2 ${
                  subAbaAdmin === 'faturamento'
                    ? 'text-[#6EC1E4] bg-blue-50 border-[#6EC1E4]'
                    : 'text-gray-600 hover:text-[#6EC1E4] hover:bg-gray-50 border-transparent'
                }`}
              >
                💰 Faturamento
              </button>
              <button
                onClick={() => setSubAbaAdmin('configuracoes')}
                className={`flex-1 py-3 px-6 font-medium transition-all text-base border-b-2 ${
                  subAbaAdmin === 'configuracoes'
                    ? 'text-[#6EC1E4] bg-blue-50 border-[#6EC1E4]'
                    : 'text-gray-600 hover:text-[#6EC1E4] hover:bg-gray-50 border-transparent'
                }`}
              >
                ⚙️ Configurações
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo das Abas */}
        {abaAtiva === 'agendamentos' ? (
          <>
            {/* Botão para criar novo agendamento */}
            <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
              <button
                onClick={() => setMostrarFormAgendamento(!mostrarFormAgendamento)}
                className="bg-[#6EC1E4] text-white px-6 py-3 rounded-lg hover:bg-[#5ab0d3] transition-all font-semibold"
              >
                {mostrarFormAgendamento ? 'Cancelar' : '+ Novo Agendamento'}
              </button>
            </div>

            {/* Formulário de novo agendamento */}
            {mostrarFormAgendamento && (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {formAgendamento.clienteId ? 
                    `Criar Agendamento para ${clientes.find(c => c.id === parseInt(formAgendamento.clienteId))?.nome || 'Cliente'}` : 
                    'Criar Novo Agendamento'
                  }
                </h3>
                <form onSubmit={handleCriarAgendamento} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                      <select
                        required
                        value={formAgendamento.clienteId}
                        onChange={(e) => setFormAgendamento({ ...formAgendamento, clienteId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      >
                        <option value="">Selecione um cliente</option>
                        {clientes.filter(c => !c.isAdmin).map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome} - {cliente.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Serviço</label>
                      <select
                        required
                        value={formAgendamento.servicoId}
                        onChange={(e) => {
                          const servicoId = e.target.value
                          setFormAgendamento({ ...formAgendamento, servicoId, horario: '' })
                          if (formAgendamento.data) {
                            carregarHorariosDisponiveis(formAgendamento.data, servicoId)
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      >
                        <option value="">Selecione um serviço</option>
                        {servicos.filter(s => s.ativo).map(servico => (
                          <option key={servico.id} value={servico.id}>
                            {servico.nome} - R$ {servico.preco.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data {configuracoes.dias_antecedencia_max && (
                          <span className="text-xs text-gray-500 font-normal">
                            (até {configuracoes.dias_antecedencia_max} dias de antecedência)
                          </span>
                        )}
                      </label>
                      <input
                        type="date"
                        required
                        min={(() => {
                          const amanha = new Date()
                          amanha.setDate(amanha.getDate() + 1)
                          return amanha.toISOString().split('T')[0]
                        })()}
                        max={(() => {
                          const hoje = new Date()
                          const diasMax = configuracoes.dias_antecedencia_max || 30
                          hoje.setDate(hoje.getDate() + diasMax)
                          return hoje.toISOString().split('T')[0]
                        })()}
                        value={formAgendamento.data}
                        onChange={(e) => {
                          const data = e.target.value
                          setFormAgendamento({ ...formAgendamento, data, horario: '' })
                          if (formAgendamento.servicoId) {
                            carregarHorariosDisponiveis(data, formAgendamento.servicoId)
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                      <select
                        required
                        value={formAgendamento.horario}
                        onChange={(e) => setFormAgendamento({ ...formAgendamento, horario: e.target.value })}
                        disabled={!formAgendamento.data || !formAgendamento.servicoId}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Selecione um horário</option>
                        {horariosDisponiveis.map(horario => (
                          <option key={horario} value={horario}>{horario}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                    <textarea
                      value={formAgendamento.observacoes}
                      onChange={(e) => setFormAgendamento({ ...formAgendamento, observacoes: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all font-semibold"
                  >
                    Criar Agendamento
                  </button>
                </form>
              </div>
            )}

            {/* Modal de Reagendamento */}
            {reagendando && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Reagendar: {reagendando.clienteNome}
                  </h3>
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Agendamento atual:</strong> {formatarData(reagendando.data)} às {reagendando.horario}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Serviço:</strong> {reagendando.servicoNome}
                    </p>
                    {reagendando.anotacao && reagendando.anotacao.includes('Agendamento combinado') && (
                      <div className="mt-2 p-2 bg-blue-100 rounded border-l-4 border-blue-500">
                        <p className="text-xs text-blue-800 font-semibold">📦 Agendamento Múltiplo</p>
                        {(() => {
                          const duracaoMatch = reagendando.anotacao.match(/Duração total: (\d+)min/)
                          const valorMatch = reagendando.anotacao.match(/Valor total: R\$ ([\d.,]+)/)
                          return (
                            <p className="text-xs text-blue-700 mt-1">
                              ⏱️ Duração: {duracaoMatch ? duracaoMatch[1] : '?'} min | 
                              💰 Valor: R$ {valorMatch ? valorMatch[1] : reagendando.servicoPreco?.toFixed(2)}
                            </p>
                          )
                        })()}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleReagendar} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nova Data {configuracoes.dias_antecedencia_max && (
                            <span className="text-xs text-gray-500 font-normal">
                              (até {configuracoes.dias_antecedencia_max} dias)
                            </span>
                          )}
                        </label>
                        <input
                          type="date"
                          required
                          min={(() => {
                            const amanha = new Date()
                            amanha.setDate(amanha.getDate() + 1)
                            return amanha.toISOString().split('T')[0]
                          })()}
                          max={(() => {
                            const hoje = new Date()
                            const diasMax = configuracoes.dias_antecedencia_max || 30
                            hoje.setDate(hoje.getDate() + diasMax)
                            return hoje.toISOString().split('T')[0]
                          })()}
                          value={formAgendamento.data}
                          onChange={(e) => {
                            const data = e.target.value
                            setFormAgendamento({ ...formAgendamento, data, horario: '' })
                            carregarHorariosParaReagendamento(data, reagendando)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Novo Horário</label>
                        <select
                          required
                          value={formAgendamento.horario}
                          onChange={(e) => setFormAgendamento({ ...formAgendamento, horario: e.target.value })}
                          disabled={!formAgendamento.data}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="">Selecione um horário</option>
                          {horariosDisponiveis.map(horario => (
                            <option key={horario} value={horario}>{horario}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                      <textarea
                        value={formAgendamento.observacoes}
                        onChange={(e) => setFormAgendamento({ ...formAgendamento, observacoes: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all font-semibold"
                      >
                        Confirmar Reagendamento
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReagendando(null)
                          setFormAgendamento({
                            clienteId: '',
                            servicoId: '',
                            data: '',
                            horario: '',
                            observacoes: ''
                          })
                          setHorariosDisponiveis([])
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-all font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal de Detalhes dos Serviços Múltiplos */}
            {detalhesServicosModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Detalhes do Agendamento
                    </h2>
                    <button
                      onClick={() => setDetalhesServicosModal(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Informações do Cliente */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Cliente</h3>
                      <p className="text-gray-700"><strong>Nome:</strong> {detalhesServicosModal.clienteNome}</p>
                      <p className="text-gray-700"><strong>Email:</strong> {detalhesServicosModal.clienteEmail}</p>
                      <p className="text-gray-700"><strong>Telefone:</strong> {detalhesServicosModal.telefone}</p>
                    </div>

                    {/* Data e Horário */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Data e Horário</h3>
                      <p className="text-gray-700"><strong>📅 Data:</strong> {formatarData(detalhesServicosModal.data)}</p>
                      <p className="text-gray-700"><strong>🕐 Horário:</strong> {detalhesServicosModal.horario}</p>
                      <p className="text-gray-700"><strong>Status:</strong> 
                        <span className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(detalhesServicosModal.status)}`}>
                          {detalhesServicosModal.status}
                        </span>
                      </p>
                    </div>

                    {/* Serviços */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">💆 Serviços Agendados</h3>
                      {detalhesServicosModal.anotacao && detalhesServicosModal.anotacao.includes('Agendamento combinado') ? (
                        <div className="space-y-3">
                          {/* Extrair informações da anotação */}
                          {(() => {
                            const anotacao = detalhesServicosModal.anotacao
                            const servicosMatch = anotacao.match(/Agendamento combinado: ([^(]+)/)
                            const duracaoMatch = anotacao.match(/Duração total: (\d+)min/)
                            const valorMatch = anotacao.match(/Valor total: R\$ ([\d.,]+)/)
                            
                            const servicos = servicosMatch ? servicosMatch[1].split(',').map(s => s.trim()) : []
                            const duracao = duracaoMatch ? duracaoMatch[1] : '0'
                            const valor = valorMatch ? valorMatch[1] : detalhesServicosModal.servicoPreco?.toFixed(2)

                            return (
                              <>
                                <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                                  <p className="font-medium text-gray-800 mb-2">Lista de Serviços:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {servicos.map((servico, index) => (
                                      <li key={index} className="text-gray-700">{servico}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="flex justify-between items-center pt-3 border-t-2 border-green-300">
                                  <div>
                                    <p className="text-sm text-gray-600">Duração Total</p>
                                    <p className="text-lg font-bold text-[#6EC1E4]">⏱️ {duracao} minutos</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">Valor Total</p>
                                    <p className="text-lg font-bold text-green-600">💰 R$ {valor}</p>
                                  </div>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                          <p className="font-medium text-gray-800">{detalhesServicosModal.servicoNome}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            💰 Valor: R$ {detalhesServicosModal.servicoPreco?.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Observações */}
                    {detalhesServicosModal.observacoes && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">📝 Observações do Cliente</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{detalhesServicosModal.observacoes}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setDetalhesServicosModal(null)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="filtroData" className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                Filtrar por Data
              </label>
              <input
                type="date"
                id="filtroData"
                value={filtroData}
                onChange={handleFiltroData}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] text-sm md:text-base"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="filtroCliente" className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                Filtrar por Cliente
              </label>
              <input
                type="text"
                id="filtroCliente"
                value={filtroCliente}
                onChange={handleFiltroCliente}
                placeholder="Digite o nome do cliente..."
                list="clientesLista"
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] text-sm md:text-base"
              />
              <datalist id="clientesLista">
                {clientes.filter(c => !c.isAdmin).map(cliente => (
                  <option key={cliente.id} value={cliente.nome} />
                ))}
              </datalist>
            </div>
            <button
              onClick={() => {
                setFiltroData('')
                setFiltroCliente('')
                setPaginaAtual(1)
                carregarAgendamentos()
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm md:text-base"
            >
              Limpar Filtros
            </button>
            <button
              onClick={() => {
                setFiltroData(dataHoje)
                setPaginaAtual(1)
                carregarAgendamentos(dataHoje, filtroCliente)
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-[#6EC1E4] text-white rounded-lg hover:bg-[#5ab0d3] transition-all font-semibold text-sm md:text-base"
            >
              Hoje
            </button>
          </div>
        </div>

        {/* Tabela de Agendamentos */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              Agendamentos ({agendamentos.length})
            </h2>
            {agendamentos.length > agendamentosPorPagina && (
              <p className="text-sm text-gray-500 mt-1">
                Página {paginaAtual} de {Math.ceil(agendamentos.length / agendamentosPorPagina)}
              </p>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm md:text-base">
              Carregando agendamentos...
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm md:text-base">
              Nenhum agendamento encontrado
            </div>
          ) : (
            <>
              {/* Visualização Desktop - Tabela */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serviço
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agendamentos
                      .slice((paginaAtual - 1) * agendamentosPorPagina, paginaAtual * agendamentosPorPagina)
                      .map((agendamento) => (
                      <React.Fragment key={agendamento.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm">
                            <div className="font-medium text-gray-900">{formatarData(agendamento.data)}</div>
                            <div className="text-gray-600">{agendamento.horario}</div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="font-medium text-gray-900">{agendamento.clienteNome}</div>
                            <div className="text-gray-600 text-xs">{agendamento.clienteEmail}</div>
                            <div className="text-gray-400 text-xs">{agendamento.telefone || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <span>{agendamento.servicoNome}</span>
                              {agendamento.anotacao && agendamento.anotacao.includes('Agendamento combinado') && (
                                <button
                                  onClick={() => setDetalhesServicosModal(agendamento)}
                                  className="text-[#6EC1E4] hover:text-[#5ab0d3] font-semibold text-xs bg-blue-50 px-2 py-1 rounded"
                                  title="Ver todos os serviços"
                                >
                                  +Múltiplos 🔍
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            {editandoValor === agendamento.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={agendamento.servicoPreco}
                                  id={`valor-${agendamento.id}`}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <button
                                  onClick={() => {
                                    const novoValor = document.getElementById(`valor-${agendamento.id}`).value
                                    handleEditarValor(agendamento.id, novoValor)
                                  }}
                                  className="text-green-600 hover:text-green-800 font-semibold text-xs"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setEditandoValor(null)}
                                  className="text-red-600 hover:text-red-800 font-semibold text-xs"
                                >
                                  ✗
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-900">R$ {agendamento.servicoPreco?.toFixed(2)}</span>
                                <button
                                  onClick={() => setEditandoValor(agendamento.id)}
                                  className="text-[#6EC1E4] hover:text-[#5ab0d3] text-xs"
                                >
                                  ✏️
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(agendamento.status)}`}>
                              {agendamento.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-2">
                              {(agendamento.status === 'concluido' || agendamento.status === 'cancelado') ? (
                                <span className="text-sm text-gray-400 italic">Sem ações</span>
                              ) : (
                                <select
                                  onChange={(e) => {
                                    const acao = e.target.value
                                    if (acao === 'confirmar') handleConfirmarPendente(agendamento.id)
                                    else if (acao === 'concluir') handleConcluir(agendamento.id)
                                    else if (acao === 'reagendar') iniciarReagendamento(agendamento)
                                    else if (acao === 'cancelar') handleCancelar(agendamento.id)
                                    e.target.value = ''
                                  }}
                                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent bg-white"
                                >
                                  <option value="">Ações...</option>
                                  {agendamento.status === 'pendente' && (
                                    <>
                                      <option value="confirmar">✅ Confirmar</option>
                                      <option value="reagendar">📅 Reagendar</option>
                                      <option value="cancelar">❌ Cancelar</option>
                                    </>
                                  )}
                                  {agendamento.status === 'confirmado' && (
                                    <>
                                      <option value="concluir">✓ Concluir</option>
                                      <option value="reagendar">📅 Reagendar</option>
                                      <option value="cancelar">❌ Cancelar</option>
                                    </>
                                  )}
                                </select>
                              )}
                              
                              {/* Botão Ver Observações */}
                              {agendamento.observacoes && (
                                <button
                                  onClick={() => setObservacoesExpandidas(prev => ({
                                    ...prev,
                                    [agendamento.id]: !prev[agendamento.id]
                                  }))}
                                  className="text-xs text-[#6EC1E4] hover:text-[#5ab0d3] font-semibold flex items-center gap-1"
                                >
                                  {observacoesExpandidas[agendamento.id] ? '▼' : '▶'} Ver observações
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Linha expandida com observações */}
                        {observacoesExpandidas[agendamento.id] && agendamento.observacoes && (
                          <tr>
                            <td colSpan="6" className="px-4 py-3 bg-blue-50 border-l-4 border-[#6EC1E4]">
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Observações do cliente:</span>
                                <p className="text-gray-600 mt-1">{agendamento.observacoes}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Visualização Mobile - Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {agendamentos
                  .slice((paginaAtual - 1) * agendamentosPorPagina, paginaAtual * agendamentosPorPagina)
                  .map((agendamento) => (
                    <div key={agendamento.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">{agendamento.clienteNome}</div>
                          <div className="text-sm text-gray-600">{agendamento.clienteEmail}</div>
                          <div className="text-xs text-gray-400">{agendamento.telefone || 'N/A'}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agendamento.status)}`}>
                          {agendamento.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Data:</span>
                          <div className="font-medium">{formatarData(agendamento.data)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Horário:</span>
                          <div className="font-medium">{agendamento.horario}</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-gray-500 text-sm">Serviço:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-medium">{agendamento.servicoNome}</span>
                          {agendamento.anotacao && agendamento.anotacao.includes('Agendamento combinado') && (
                            <button
                              onClick={() => setDetalhesServicosModal(agendamento)}
                              className="text-[#6EC1E4] hover:text-[#5ab0d3] font-semibold text-xs bg-blue-50 px-2 py-1 rounded"
                            >
                              +Múltiplos 🔍
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-gray-500 text-sm">Valor:</span>
                        {editandoValor === agendamento.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={agendamento.servicoPreco}
                              id={`valor-mobile-${agendamento.id}`}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={() => {
                                const novoValor = document.getElementById(`valor-mobile-${agendamento.id}`).value
                                handleEditarValor(agendamento.id, novoValor)
                              }}
                              className="text-green-600 hover:text-green-800 font-semibold"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditandoValor(null)}
                              className="text-red-600 hover:text-red-800 font-semibold"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-medium text-green-600">R$ {agendamento.servicoPreco?.toFixed(2)}</span>
                            <button
                              onClick={() => setEditandoValor(agendamento.id)}
                              className="text-[#6EC1E4] hover:text-[#5ab0d3] text-sm"
                            >
                              ✏️ Editar
                            </button>
                          </div>
                        )}
                      </div>

                      {(agendamento.status === 'concluido' || agendamento.status === 'cancelado') ? (
                        <div className="text-center py-2 text-sm text-gray-400 italic">
                          Sem ações disponíveis
                        </div>
                      ) : (
                        <select
                          onChange={(e) => {
                            const acao = e.target.value
                            if (acao === 'confirmar') handleConfirmarPendente(agendamento.id)
                            else if (acao === 'concluir') handleConcluir(agendamento.id)
                            else if (acao === 'reagendar') iniciarReagendamento(agendamento)
                            else if (acao === 'cancelar') handleCancelar(agendamento.id)
                            e.target.value = ''
                          }}
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent bg-white font-medium"
                        >
                          <option value="">Selecione uma ação...</option>
                          {agendamento.status === 'pendente' && (
                            <>
                              <option value="confirmar">✅ Confirmar Agendamento</option>
                              <option value="reagendar">📅 Reagendar</option>
                              <option value="cancelar">❌ Cancelar</option>
                            </>
                          )}
                          {agendamento.status === 'confirmado' && (
                            <>
                              <option value="concluir">✓ Marcar como Concluído</option>
                              <option value="reagendar">📅 Reagendar</option>
                              <option value="cancelar">❌ Cancelar</option>
                            </>
                          )}
                        </select>
                      )}
                      
                      {/* Botão Ver Observações Mobile */}
                      {agendamento.observacoes && (
                        <div className="mt-3">
                          <button
                            onClick={() => setObservacoesExpandidas(prev => ({
                              ...prev,
                              [agendamento.id]: !prev[agendamento.id]
                            }))}
                            className="w-full text-sm text-[#6EC1E4] hover:text-[#5ab0d3] font-semibold flex items-center justify-center gap-2 py-2 border border-[#6EC1E4] rounded-lg hover:bg-blue-50 transition-all"
                          >
                            {observacoesExpandidas[agendamento.id] ? '▼ Ocultar observações' : '▶ Ver observações'}
                          </button>
                          
                          {/* Observações expandidas */}
                          {observacoesExpandidas[agendamento.id] && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg border-l-4 border-[#6EC1E4]">
                              <span className="font-semibold text-gray-700 text-sm">Observações:</span>
                              <p className="text-gray-600 text-sm mt-1">{agendamento.observacoes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* Navegação de Paginação */}
          {agendamentos.length > agendamentosPorPagina && (
            <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Contador de registros */}
                <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                  <span className="hidden sm:inline">
                    Mostrando {Math.min((paginaAtual - 1) * agendamentosPorPagina + 1, agendamentos.length)} até {Math.min(paginaAtual * agendamentosPorPagina, agendamentos.length)} de {agendamentos.length} agendamentos
                  </span>
                  <span className="sm:hidden">
                    {Math.min((paginaAtual - 1) * agendamentosPorPagina + 1, agendamentos.length)}-{Math.min(paginaAtual * agendamentosPorPagina, agendamentos.length)} de {agendamentos.length}
                  </span>
                </div>
                
                {/* Controles de paginação */}
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                  {/* Botão Primeira (oculto em mobile) */}
                  <button
                    onClick={() => setPaginaAtual(1)}
                    disabled={paginaAtual === 1}
                    className="hidden sm:inline-flex px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Primeira
                  </button>
                  
                  {/* Botão Anterior */}
                  <button
                    onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                    disabled={paginaAtual === 1}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="sm:hidden">←</span>
                    <span className="hidden sm:inline">← Anterior</span>
                  </button>

                  {/* Números das páginas */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(agendamentos.length / agendamentosPorPagina) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(agendamentos.length / agendamentosPorPagina)
                        // Em mobile, mostrar apenas a página atual e adjacentes
                        if (window.innerWidth < 640) {
                          return Math.abs(page - paginaAtual) <= 1
                        }
                        // Em desktop, mostrar primeira, última e próximas à atual
                        return page === 1 || 
                               page === totalPages || 
                               Math.abs(page - paginaAtual) <= 1
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-1 sm:px-2 text-gray-500 text-xs sm:text-sm">...</span>
                          )}
                          <button
                            onClick={() => setPaginaAtual(page)}
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                              paginaAtual === page
                                ? 'bg-[#6EC1E4] text-white shadow-md'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Botão Próxima */}
                  <button
                    onClick={() => setPaginaAtual(prev => Math.min(prev + 1, Math.ceil(agendamentos.length / agendamentosPorPagina)))}
                    disabled={paginaAtual === Math.ceil(agendamentos.length / agendamentosPorPagina)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="sm:hidden">→</span>
                    <span className="hidden sm:inline">Próxima →</span>
                  </button>

                  {/* Botão Última (oculto em mobile) */}
                  <button
                    onClick={() => setPaginaAtual(Math.ceil(agendamentos.length / agendamentosPorPagina))}
                    disabled={paginaAtual === Math.ceil(agendamentos.length / agendamentosPorPagina)}
                    className="hidden sm:inline-flex px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Última
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

          </>
        ) : abaAtiva === 'clientes' ? (
          /* Aba de Clientes */
          <>
            {clienteSelecionado ? (
              /* Modal de Histórico do Cliente */
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Histórico de {clienteSelecionado.nome}
                      </h2>
                      <p className="text-gray-600">{clienteSelecionado.email} | {clienteSelecionado.telefone}</p>
                    </div>
                    <button
                      onClick={() => {
                        setClienteSelecionado(null)
                        setHistoricoCliente([])
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Carregando histórico...</div>
                  ) : historicoCliente.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Nenhum procedimento registrado</div>
                  ) : (
                    <div className="space-y-4">
                      {historicoCliente.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{item.servicoNome}</h3>
                              <p className="text-sm text-gray-600">
                                📅 {new Date(item.data).toLocaleDateString('pt-BR')} às {item.horario}
                              </p>
                              <p className="text-sm text-gray-600">💰 R$ {item.servicoPreco.toFixed(2)}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              item.status === 'concluido' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>

                          {item.observacoes && (
                            <div className="mb-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                              <p className="text-sm font-medium text-gray-700">Observações do agendamento:</p>
                              <p className="text-sm text-gray-600">{item.observacoes}</p>
                            </div>
                          )}

                          <div className="mt-3 border-t pt-3">
                            <p className="text-sm font-semibold text-gray-700 mb-2">📝 Anotações do Procedimento:</p>
                            {editandoAnotacao === item.id ? (
                              <div className="space-y-2">
                                <textarea
                                  id={`anotacao-${item.id}`}
                                  defaultValue={item.anotacao || ''}
                                  rows="4"
                                  placeholder="Adicione anotações sobre o procedimento realizado..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent text-sm"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      const anotacao = document.getElementById(`anotacao-${item.id}`).value
                                      salvarAnotacao(item.id, anotacao)
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditandoAnotacao(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-semibold"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {item.anotacao ? (
                                  <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.anotacao}</p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">Sem anotações</p>
                                )}
                                <button
                                  onClick={() => setEditandoAnotacao(item.id)}
                                  className="mt-2 text-[#6EC1E4] hover:text-[#5ab0d3] text-sm font-semibold"
                                >
                                  {item.anotacao ? 'Editar Anotação' : 'Adicionar Anotação'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        setClienteSelecionado(null)
                        setHistoricoCliente([])
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-6">
            {/* Busca de Cliente */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="buscaCliente" className="block text-gray-700 font-semibold mb-2">
                    Buscar Cliente
                  </label>
                  <input
                    type="text"
                    id="buscaCliente"
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                    placeholder="Digite o nome ou email do cliente..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                  />
                </div>
                {buscaCliente && (
                  <button
                    onClick={() => setBuscaCliente('')}
                    className="self-end px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Tabela de Clientes */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  Clientes Cadastrados ({clientes.filter(c => 
                    !buscaCliente || 
                    c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
                    c.email.toLowerCase().includes(buscaCliente.toLowerCase())
                  ).length})
                </h2>
              </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientes
                    .filter(c => 
                      !buscaCliente || 
                      c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
                      c.email.toLowerCase().includes(buscaCliente.toLowerCase())
                    )
                    .map((cliente) => (
                    <tr key={cliente.id} className={`hover:bg-gray-50 ${cliente.bloqueado ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.id}</td>
                      <td className="px-6 py-4 text-sm">
                        {editandoCliente === cliente.id ? (
                          <input
                            type="text"
                            defaultValue={cliente.nome}
                            id={`nome-${cliente.id}`}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{cliente.nome}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editandoCliente === cliente.id ? (
                          <input
                            type="email"
                            defaultValue={cliente.email}
                            id={`email-${cliente.id}`}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{cliente.email}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editandoCliente === cliente.id ? (
                          <input
                            type="text"
                            defaultValue={cliente.telefone}
                            id={`telefone-${cliente.id}`}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">{cliente.telefone}</span>
                            {cliente.telefone && (
                              <a
                                href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Abrir WhatsApp"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cliente.bloqueado ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {cliente.bloqueado ? 'Bloqueado' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cliente.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {cliente.isAdmin ? 'Administrador' : 'Cliente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!cliente.isAdmin && (
                          <div className="flex flex-col gap-1">
                            {editandoCliente === cliente.id ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const dados = {
                                      nome: document.getElementById(`nome-${cliente.id}`).value,
                                      email: document.getElementById(`email-${cliente.id}`).value,
                                      telefone: document.getElementById(`telefone-${cliente.id}`).value
                                    }
                                    handleEditarCliente(cliente.id, dados)
                                  }}
                                  className="text-green-600 hover:text-green-800 font-semibold text-xs"
                                >
                                  ✓ Salvar
                                </button>
                                <button
                                  onClick={() => setEditandoCliente(null)}
                                  className="text-gray-600 hover:text-gray-800 font-semibold text-xs"
                                >
                                  ✗ Cancelar
                                </button>
                              </div>
                            ) : (
                              <>
                                {/* Desktop: Botões */}
                                <div className="hidden md:flex flex-col gap-1">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => abrirHistoricoCliente(cliente)}
                                      className="text-purple-600 hover:text-purple-800 font-semibold text-xs"
                                    >
                                      📋 Histórico
                                    </button>
                                    <button
                                      onClick={() => abrirFormAgendamentoCliente(cliente)}
                                      className="text-[#6EC1E4] hover:text-[#5ab0d3] font-semibold text-xs"
                                    >
                                      + Agendar
                                    </button>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setEditandoCliente(cliente.id)}
                                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                                    >
                                      ✏️ Editar
                                    </button>
                                    <button
                                      onClick={() => handleBloquearCliente(cliente.id, cliente.bloqueado)}
                                      className={`${cliente.bloqueado ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'} font-semibold text-xs`}
                                    >
                                      {cliente.bloqueado ? '🔓 Desbloquear' : '🔒 Bloquear'}
                                    </button>
                                    <button
                                      onClick={() => handleExcluirCliente(cliente.id)}
                                      className="text-red-600 hover:text-red-800 font-semibold text-xs"
                                    >
                                      🗑️ Excluir
                                    </button>
                                  </div>
                                </div>

                                {/* Mobile: Select */}
                                <select
                                  onChange={(e) => {
                                    const acao = e.target.value
                                    if (acao === 'historico') abrirHistoricoCliente(cliente)
                                    else if (acao === 'agendar') abrirFormAgendamentoCliente(cliente)
                                    else if (acao === 'editar') setEditandoCliente(cliente.id)
                                    else if (acao === 'bloquear') handleBloquearCliente(cliente.id, cliente.bloqueado)
                                    else if (acao === 'excluir') handleExcluirCliente(cliente.id)
                                    e.target.value = ''
                                  }}
                                  className="md:hidden w-full px-2 py-2 border border-gray-300 rounded text-sm bg-white"
                                  defaultValue=""
                                >
                                  <option value="" disabled>Selecione uma ação</option>
                                  <option value="historico">📋 Ver Histórico</option>
                                  <option value="agendar">➕ Criar Agendamento</option>
                                  <option value="editar">✏️ Editar Dados</option>
                                  <option value="bloquear">{cliente.bloqueado ? '🔓 Desbloquear' : '🔒 Bloquear'}</option>
                                  <option value="excluir">🗑️ Excluir Cliente</option>
                                </select>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
          </>
        ) : abaAtiva === 'administracao' && subAbaAdmin === 'servicos' ? (
          /* Aba de Serviços */
          <div className="space-y-6">
            {/* Formulário para adicionar novo serviço */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Novo Serviço</h3>
              <form onSubmit={handleAdicionarServico} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Serviço</label>
                  <input
                    type="text"
                    required
                    value={novoServico.nome}
                    onChange={(e) => setNovoServico({ ...novoServico, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (minutos)
                    <span className="text-xs text-gray-500 ml-2">⏱️ Bloqueia múltiplos horários na agenda</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="30"
                    step="30"
                    value={novoServico.duracao}
                    onChange={(e) => setNovoServico({ ...novoServico, duracao: e.target.value })}
                    placeholder="Ex: 60, 90, 120..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Serviços de 60min bloqueiam 2 horários (2x30min). Serviços de 90min bloqueiam 3 horários (3x30min).
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={novoServico.preco}
                    onChange={(e) => setNovoServico({ ...novoServico, preco: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <input
                    type="text"
                    value={novoServico.descricao}
                    onChange={(e) => setNovoServico({ ...novoServico, descricao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="bg-[#6EC1E4] text-white px-6 py-2 rounded-lg hover:bg-[#5ab0d3] transition-colors font-semibold"
                  >
                    Adicionar Serviço
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de serviços */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Serviços Cadastrados ({servicos.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {servicos.map((servico) => (
                      <tr key={servico.id} className="hover:bg-gray-50">
                        {editandoServico === servico.id ? (
                          <>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                defaultValue={servico.nome}
                                id={`nome-${servico.id}`}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                defaultValue={servico.duracao}
                                id={`duracao-${servico.id}`}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                step="0.01"
                                defaultValue={servico.preco}
                                id={`preco-${servico.id}`}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                defaultValue={servico.descricao}
                                id={`descricao-${servico.id}`}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                servico.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {servico.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const dados = {
                                      nome: document.getElementById(`nome-${servico.id}`).value,
                                      duracao: document.getElementById(`duracao-${servico.id}`).value,
                                      preco: document.getElementById(`preco-${servico.id}`).value,
                                      descricao: document.getElementById(`descricao-${servico.id}`).value
                                    }
                                    handleEditarServico(servico.id, dados)
                                  }}
                                  className="text-green-600 hover:text-green-800 text-sm font-semibold"
                                >
                                  Salvar
                                </button>
                                <button
                                  onClick={() => setEditandoServico(null)}
                                  className="text-gray-600 hover:text-gray-800 text-sm font-semibold"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{servico.nome}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{servico.duracao} min</td>
                            <td className="px-6 py-4 text-sm text-gray-600">R$ {servico.preco.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{servico.descricao}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleAtivo(servico.id, servico.ativo)}
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  servico.ativo ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {servico.ativo ? 'Ativo' : 'Inativo'}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => setEditandoServico(servico.id)}
                                  className="text-[#6EC1E4] hover:text-[#5ab0d3] text-sm font-semibold"
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  onClick={() => handleExcluirServico(servico.id)}
                                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                                >
                                  🗑️ Excluir
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          </div>
        </div>
        ) : null}

        {/* Aba de Equipe/Colaboradores */}
        {abaAtiva === 'administracao' && subAbaAdmin === 'equipe' && (
          <div className="space-y-6">
            {/* Formulário de Novo Colaborador */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editandoColaborador ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}
              </h2>
              <form onSubmit={editandoColaborador ? handleEditarColaborador : handleCriarColaborador} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                    <input
                      type="text"
                      required
                      value={editandoColaborador ? editandoColaborador.nome : novoColaborador.nome}
                      onChange={(e) => editandoColaborador 
                        ? setEditandoColaborador({ ...editandoColaborador, nome: e.target.value })
                        : setNovoColaborador({ ...novoColaborador, nome: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      placeholder="Ex: Juliana Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={editandoColaborador ? editandoColaborador.email : novoColaborador.email}
                      onChange={(e) => editandoColaborador 
                        ? setEditandoColaborador({ ...editandoColaborador, email: e.target.value })
                        : setNovoColaborador({ ...novoColaborador, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      placeholder="juliana@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={editandoColaborador ? editandoColaborador.telefone : novoColaborador.telefone}
                      onChange={(e) => editandoColaborador 
                        ? setEditandoColaborador({ ...editandoColaborador, telefone: e.target.value })
                        : setNovoColaborador({ ...novoColaborador, telefone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
                    <input
                      type="text"
                      value={editandoColaborador ? editandoColaborador.especialidade : novoColaborador.especialidade}
                      onChange={(e) => editandoColaborador 
                        ? setEditandoColaborador({ ...editandoColaborador, especialidade: e.target.value })
                        : setNovoColaborador({ ...novoColaborador, especialidade: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      placeholder="Ex: Estética Facial"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Serviços que o colaborador pode realizar *</label>
                  {servicos.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                      ⚠️ Nenhum serviço cadastrado. Cadastre serviços na aba "Serviços" antes de adicionar colaboradores.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {servicos.map(servico => (
                          <label key={servico.id} className={`flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors ${!servico.ativo ? 'opacity-50' : ''}`}>
                            <input
                              type="checkbox"
                              checked={editandoColaborador 
                                ? (editandoColaborador.servicosIds || []).includes(servico.id)
                                : (novoColaborador.servicosIds || []).includes(servico.id)
                              }
                              onChange={() => handleToggleServicoColaborador(servico.id)}
                              className="w-4 h-4 text-[#6EC1E4] border-gray-300 rounded focus:ring-[#6EC1E4]"
                            />
                            <span className="text-sm text-gray-700 flex-1">
                              {servico.nome}
                              {!servico.ativo && <span className="ml-2 text-xs text-red-500">(Inativo)</span>}
                            </span>
                            <span className="text-xs text-gray-500">{servico.duracao}min</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        ✓ Selecione os serviços que este profissional está qualificado para realizar
                        {servicos.some(s => !s.ativo) && <span className="ml-2 text-yellow-600">• Serviços inativos estão disponíveis mas aparecem com opacidade</span>}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-[#6EC1E4] text-white px-6 py-2 rounded-lg hover:bg-[#5ab0d3] transition-all font-semibold"
                  >
                    {editandoColaborador ? 'Atualizar Colaborador' : 'Adicionar Colaborador'}
                  </button>
                  {editandoColaborador && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoColaborador(null)
                        setNovoColaborador({ nome: '', email: '', telefone: '', especialidade: '', servicosIds: [] })
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-all font-semibold"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista de Colaboradores */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Equipe ({colaboradores.length})
                </h2>
              </div>

              {colaboradores.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhum colaborador cadastrado
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Colaborador
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Especialidade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serviços
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {colaboradores.map((colaborador) => (
                        <tr key={colaborador.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{colaborador.nome}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div>{colaborador.email}</div>
                            <div className="text-xs">{colaborador.telefone || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {colaborador.especialidade || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {colaborador.servicosNomes && colaborador.servicosNomes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {colaborador.servicosNomes.map((nome, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {nome}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Nenhum serviço atribuído</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleColaboradorStatus(colaborador.id, colaborador.ativo)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                colaborador.ativo
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {colaborador.ativo ? 'Ativo' : 'Inativo'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium space-x-3">
                            <button
                              onClick={() => setEditandoColaborador(colaborador)}
                              className="text-[#6EC1E4] hover:text-[#5ab0d3] font-semibold"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleExcluirColaborador(colaborador.id)}
                              className="text-red-600 hover:text-red-800 font-semibold"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba de Faturamento */}
        {abaAtiva === 'administracao' && subAbaAdmin === 'faturamento' && (
          <div className="space-y-6">
            {/* Seletor de Mês */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-semibold">Período:</label>
                <input
                  type="month"
                  value={mesSelecionado}
                  onChange={(e) => {
                    setMesSelecionado(e.target.value)
                    carregarEstatisticas(e.target.value)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                />
              </div>
            </div>

            {!estatisticas ? (
              <div className="text-center py-8 text-gray-500">Carregando estatísticas...</div>
            ) : (
              <>
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {/* Faturamento Realizado */}
                  <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Faturamento Realizado</h3>
                      <span className="text-3xl">💰</span>
                    </div>
                    <p className="text-3xl font-bold">R$ {estatisticas.faturamentoRealizado.toFixed(2)}</p>
                    <p className="text-sm opacity-90 mt-1">{estatisticas.agendamentosConcluidos} procedimentos</p>
                  </div>

                  {/* Faturamento Futuro */}
                  <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Faturamento Futuro</h3>
                      <span className="text-3xl">📅</span>
                    </div>
                    <p className="text-3xl font-bold">R$ {estatisticas.faturamentoFuturo.toFixed(2)}</p>
                    <p className="text-sm opacity-90 mt-1">{estatisticas.agendamentosConfirmados} agendados</p>
                  </div>

                  {/* Total do Mês */}
                  <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Total do Mês</h3>
                      <span className="text-3xl">💎</span>
                    </div>
                    <p className="text-3xl font-bold">R$ {estatisticas.faturamentoTotal.toFixed(2)}</p>
                    <p className="text-sm opacity-90 mt-1">Realizado + Futuro</p>
                  </div>

                  {/* Clientes Atendidos */}
                  <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Clientes Atendidos</h3>
                      <span className="text-3xl">👥</span>
                    </div>
                    <p className="text-3xl font-bold">{estatisticas.totalClientes}</p>
                    <p className="text-sm opacity-90 mt-1">No período</p>
                  </div>
                </div>

                {/* Estatísticas Detalhadas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cliente Mais Recorrente */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      🏆 Cliente Mais Recorrente
                    </h3>
                    {estatisticas.clienteMaisRecorrente ? (
                      <div className="border-l-4 border-[#6EC1E4] pl-4">
                        <p className="text-lg font-semibold text-gray-800">{estatisticas.clienteMaisRecorrente.nome}</p>
                        <p className="text-sm text-gray-600">{estatisticas.clienteMaisRecorrente.email}</p>
                        <p className="text-2xl font-bold text-[#6EC1E4] mt-2">
                          {estatisticas.clienteMaisRecorrente.total} visitas
                        </p>
                        <p className="text-sm text-gray-600">
                          Faturamento: R$ {estatisticas.clienteMaisRecorrente.faturamento.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Nenhum cliente no período</p>
                    )}
                  </div>

                  {/* Procedimento Mais Realizado */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      ⭐ Procedimento Mais Realizado
                    </h3>
                    {estatisticas.procedimentoMaisRealizado ? (
                      <div className="border-l-4 border-purple-500 pl-4">
                        <p className="text-lg font-semibold text-gray-800">{estatisticas.procedimentoMaisRealizado.nome}</p>
                        <p className="text-2xl font-bold text-purple-600 mt-2">
                          {estatisticas.procedimentoMaisRealizado.total} vezes
                        </p>
                        <p className="text-sm text-gray-600">
                          Valor unitário: R$ {estatisticas.procedimentoMaisRealizado.preco.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total faturado: R$ {estatisticas.procedimentoMaisRealizado.faturamento.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Nenhum procedimento no período</p>
                    )}
                  </div>
                </div>

                {/* Top 5 Serviços */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Top 5 Serviços</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faturamento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {estatisticas.topServicos.map((servico, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-bold text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{servico.nome}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{servico.quantidade}x</td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600">
                              R$ {servico.faturamento.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top 5 Clientes */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">👑 Top 5 Clientes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitas</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faturamento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {estatisticas.topClientes.map((cliente, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-bold text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900">{cliente.nome}</p>
                              <p className="text-xs text-gray-500">{cliente.email}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{cliente.visitas}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600">
                              R$ {cliente.faturamento.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Aba de Configurações */}
        {abaAtiva === 'administracao' && subAbaAdmin === 'configuracoes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>⚙️</span>
                <span>Configurações do Sistema</span>
              </h2>

              <div className="space-y-6">
                {/* Horários de Funcionamento */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🕐 Horários de Funcionamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Abertura</label>
                      <input
                        type="time"
                        value={configuracoes.horario_abertura}
                        onChange={(e) => setConfiguracoes({ ...configuracoes, horario_abertura: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Fechamento</label>
                      <input
                        type="time"
                        value={configuracoes.horario_fechamento}
                        onChange={(e) => setConfiguracoes({ ...configuracoes, horario_fechamento: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Intervalo (minutos)</label>
                      <select
                        value={configuracoes.intervalo_agendamento}
                        onChange={(e) => setConfiguracoes({ ...configuracoes, intervalo_agendamento: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                      >
                        <option value="15">15 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="60">60 minutos</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dias de Funcionamento */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Dias de Funcionamento</h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { valor: '0', nome: 'Domingo' },
                      { valor: '1', nome: 'Segunda' },
                      { valor: '2', nome: 'Terça' },
                      { valor: '3', nome: 'Quarta' },
                      { valor: '4', nome: 'Quinta' },
                      { valor: '5', nome: 'Sexta' },
                      { valor: '6', nome: 'Sábado' }
                    ].map(dia => (
                      <button
                        key={dia.valor}
                        type="button"
                        onClick={() => {
                          const dias = configuracoes.dias_funcionamento || []
                          if (dias.includes(dia.valor)) {
                            setConfiguracoes({
                              ...configuracoes,
                              dias_funcionamento: dias.filter(d => d !== dia.valor)
                            })
                          } else {
                            setConfiguracoes({
                              ...configuracoes,
                              dias_funcionamento: [...dias, dia.valor]
                            })
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          (configuracoes.dias_funcionamento || []).includes(dia.valor)
                            ? 'bg-[#6EC1E4] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {dia.nome}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selecione os dias em que a empresa funciona. Clientes não poderão agendar em dias não selecionados.
                  </p>
                </div>

                {/* Antecedência Máxima */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">⏰ Antecedência de Agendamentos</h3>
                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de dias de antecedência
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={configuracoes.dias_antecedencia_max}
                      onChange={(e) => setConfiguracoes({ ...configuracoes, dias_antecedencia_max: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Clientes poderão agendar com até <strong>{configuracoes.dias_antecedencia_max} dias</strong> de antecedência.
                      Por exemplo, se configurar 30 dias, não será possível agendar para datas além de 1 mês no futuro.
                    </p>
                  </div>
                </div>

                {/* Preview das Configurações */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 Resumo das Configurações</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Funcionamento: <strong>{configuracoes.horario_abertura}</strong> às <strong>{configuracoes.horario_fechamento}</strong></li>
                    <li>• Intervalo entre agendamentos: <strong>{configuracoes.intervalo_agendamento} minutos</strong></li>
                    <li>• Dias de funcionamento: <strong>
                      {(configuracoes.dias_funcionamento || []).map(d => 
                        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][parseInt(d)]
                      ).join(', ')}
                    </strong></li>
                    <li>• Agendamentos permitidos com até: <strong>{configuracoes.dias_antecedencia_max} dias</strong> de antecedência</li>
                  </ul>
                </div>

                {/* Botão Salvar */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={salvarConfiguracoes}
                    className="bg-[#6EC1E4] text-white px-8 py-3 rounded-lg hover:bg-[#5ab0d3] transition-all font-semibold text-lg shadow-lg"
                  >
                    💾 Salvar Configurações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}