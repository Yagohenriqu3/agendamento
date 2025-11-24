import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PainelAdmin() {
  const [agendamentos, setAgendamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicos, setServicos] = useState([])
  const [abaAtiva, setAbaAtiva] = useState('agendamentos') // 'agendamentos', 'clientes' ou 'servicos'
  const [filtroData, setFiltroData] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [historicoCliente, setHistoricoCliente] = useState([])
  const [editandoAnotacao, setEditandoAnotacao] = useState(null)
  const [editandoValor, setEditandoValor] = useState(null)
  const [editandoCliente, setEditandoCliente] = useState(null)
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
  const [mostrarFormAgendamento, setMostrarFormAgendamento] = useState(false)
  const [reagendando, setReagendando] = useState(null)
  const [formAgendamento, setFormAgendamento] = useState({
    clienteId: '',
    servicoId: '',
    data: '',
    horario: '',
    observacoes: ''
  })
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([])
  const navigate = useNavigate()

  const API_URL = 'https://agendamento-backend-pju8.onrender.com'

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
    carregarEstatisticas()
  }, [navigate])

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
    carregarAgendamentos(data, filtroCliente)
  }

  const handleFiltroCliente = (e) => {
    const cliente = e.target.value
    setFiltroCliente(cliente)
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

  const handleConfirmar = async (id) => {
    if (!confirm('Confirmar este agendamento como concluído?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/agendamentos/${id}/confirmar`, {
        method: 'PATCH'
      })

      if (response.ok) {
        alert('Agendamento confirmado como concluído!')
        carregarAgendamentos(filtroData)
      } else {
        throw new Error('Erro ao confirmar')
      }
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error)
      alert('Erro ao confirmar agendamento')
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

  const carregarHorariosDisponiveis = async (data, servicoId, agendamentoIdExcluir = null) => {
    if (!data || !servicoId) return

    try {
      let url = `${API_URL}/horarios-disponiveis?data=${data}&servicoId=${servicoId}`
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
      if (abaAtiva === 'faturamento') {
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#6EC1E4]">
                Painel Administrativo
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Bem-vindo, {adminNome}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-red-600 transition-all font-semibold text-sm md:text-base w-full sm:w-auto"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-x-auto">
          <div className="flex border-b min-w-max md:min-w-0">
            <button
              onClick={() => setAbaAtiva('agendamentos')}
              className={`flex-1 py-3 md:py-4 px-3 md:px-6 font-semibold transition-all text-sm md:text-base whitespace-nowrap ${
                abaAtiva === 'agendamentos'
                  ? 'text-[#6EC1E4] border-b-2 border-[#6EC1E4]'
                  : 'text-gray-600 hover:text-[#6EC1E4]'
              }`}
            >
              Agendamentos
            </button>
            <button
              onClick={() => setAbaAtiva('clientes')}
              className={`flex-1 py-3 md:py-4 px-3 md:px-6 font-semibold transition-all text-sm md:text-base whitespace-nowrap ${
                abaAtiva === 'clientes'
                  ? 'text-[#6EC1E4] border-b-2 border-[#6EC1E4]'
                  : 'text-gray-600 hover:text-[#6EC1E4]'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setAbaAtiva('servicos')}
              className={`flex-1 py-3 md:py-4 px-3 md:px-6 font-semibold transition-all text-sm md:text-base whitespace-nowrap ${
                abaAtiva === 'servicos'
                  ? 'text-[#6EC1E4] border-b-2 border-[#6EC1E4]'
                  : 'text-gray-600 hover:text-[#6EC1E4]'
              }`}
            >
              Serviços
            </button>
            <button
              onClick={() => setAbaAtiva('faturamento')}
              className={`flex-1 py-3 md:py-4 px-3 md:px-6 font-semibold transition-all text-sm md:text-base whitespace-nowrap ${
                abaAtiva === 'faturamento'
                  ? 'text-[#6EC1E4] border-b-2 border-[#6EC1E4]'
                  : 'text-gray-600 hover:text-[#6EC1E4]'
              }`}
            >
              Faturamento
            </button>
          </div>
        </div>

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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
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
                  </div>

                  <form onSubmit={handleReagendar} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nova Data</label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={formAgendamento.data}
                          onChange={(e) => {
                            const data = e.target.value
                            setFormAgendamento({ ...formAgendamento, data, horario: '' })
                            carregarHorariosDisponiveis(data, reagendando.servicoId, reagendando.id)
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
                carregarAgendamentos()
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm md:text-base"
            >
              Limpar Filtros
            </button>
            <button
              onClick={() => {
                setFiltroData(dataHoje)
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serviço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
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
                  {agendamentos.map((agendamento) => (
                    <tr key={agendamento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarData(agendamento.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {agendamento.horario}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agendamento.clienteNome}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{agendamento.clienteEmail}</div>
                        <div className="text-xs text-gray-400">{agendamento.telefone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agendamento.servicoNome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(agendamento.status)}`}>
                          {agendamento.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {agendamento.status === 'confirmado' && (
                          <>
                            <button
                              onClick={() => handleConfirmar(agendamento.id)}
                              className="text-green-600 hover:text-green-900 font-semibold"
                            >
                              Concluir
                            </button>
                            <button
                              onClick={() => iniciarReagendamento(agendamento)}
                              className="text-blue-600 hover:text-blue-900 font-semibold"
                            >
                              Reagendar
                            </button>
                            <button
                              onClick={() => handleCancelar(agendamento.id)}
                              className="text-red-600 hover:text-red-900 font-semibold"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Observações */}
        {agendamentos.some(a => a.observacoes) && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Observações dos Clientes</h3>
            <div className="space-y-3">
              {agendamentos
                .filter(a => a.observacoes)
                .map((agendamento) => (
                  <div key={agendamento.id} className="border-l-4 border-[#6EC1E4] pl-4 py-2">
                    <p className="text-sm font-semibold text-gray-700">
                      {agendamento.clienteNome} - {formatarData(agendamento.data)} às {agendamento.horario}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{agendamento.observacoes}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
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
                          <span className="text-gray-900">{cliente.telefone}</span>
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
        ) : abaAtiva === 'servicos' ? (
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duração (minutos)</label>
                  <input
                    type="number"
                    required
                    value={novoServico.duracao}
                    onChange={(e) => setNovoServico({ ...novoServico, duracao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                  />
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
                              <button
                                onClick={() => setEditandoServico(servico.id)}
                                className="text-[#6EC1E4] hover:text-[#5ab0d3] text-sm font-semibold"
                              >
                                Editar
                              </button>
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

        {/* Aba de Faturamento */}
        {abaAtiva === 'faturamento' && (
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
      </div>
    </div>
  )
}