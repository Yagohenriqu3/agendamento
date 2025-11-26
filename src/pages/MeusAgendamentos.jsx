import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavMenu from '../componentes/NavMenu'
import API_URL from '../config/api'

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [clienteInfo, setClienteInfo] = useState(null)
  const [estatisticas, setEstatisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mostrarFicha, setMostrarFicha] = useState(false)
  const [fichaData, setFichaData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('clienteToken')
    const email = localStorage.getItem('clienteEmail')
    
    if (!token || !email) {
      navigate('/login-cliente')
      return
    }

    carregarDadosCliente(email)
  }, [navigate])

  const carregarDadosCliente = async (email) => {
    try {
      setLoading(true)
      
      // Carregar agendamentos
      const responseAgendamentos = await fetch(`${API_URL}/agendamentos?clienteEmail=${email}`)
      const agendamentosData = await responseAgendamentos.json()
      setAgendamentos(agendamentosData)
      
      // Buscar informações do cliente
      const responseCliente = await fetch(`${API_URL}/clientes?email=${email}`)
      const clienteData = await responseCliente.json()
      console.log('Dados do cliente:', clienteData)
      if (clienteData.length > 0) {
        setClienteInfo(clienteData[0])
        console.log('Cliente info setada:', clienteData[0])
        console.log('Tem ficha?', clienteData[0].fichaAnamnese)
      }
      
      // Calcular estatísticas
      const confirmados = agendamentosData.filter(a => a.status === 'confirmado')
      const cancelados = agendamentosData.filter(a => a.status === 'cancelado')
      
      setEstatisticas({
        confirmados,
        cancelados
      })
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar informações')
    } finally {
      setLoading(false)
    }
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
        const email = localStorage.getItem('clienteEmail')
        carregarDadosCliente(email)
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error)
      alert('Erro ao cancelar agendamento')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('clienteToken')
    localStorage.removeItem('clienteNome')
    localStorage.removeItem('clienteEmail')
    localStorage.removeItem('isAdmin')
    navigate('/')
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

  return (
    <>
      <NavMenu />
      <div className="min-h-screen bg-linear-to-b from-[#EAF6F6] to-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header do Perfil */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#6EC1E4] mb-2">
                Meu Perfil
              </h1>
              {clienteInfo && (
                <div className="text-gray-600">
                  <p className="text-lg font-semibold">{clienteInfo.nome}</p>
                  <p className="text-sm">{clienteInfo.email}</p>
                  <p className="text-sm">{clienteInfo.telefone}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button
                onClick={() => navigate('/agendamento')}
                className="bg-[#6EC1E4] text-white px-6 py-3 rounded-lg hover:bg-[#5ab0d3] transition-all font-semibold shadow-lg"
              >
                ➕ Novo Agendamento
              </button>
              <button
                onClick={() => {
                  if (clienteInfo?.fichaAnamnese) {
                    // Visualizar ficha existente
                    const ficha = JSON.parse(clienteInfo.fichaAnamnese)
                    setFichaData(ficha)
                    setMostrarFicha(true)
                  } else {
                    // Preencher nova ficha
                    navigate('/ficha-anamnese')
                  }
                }}
                className={`px-6 py-3 rounded-lg transition-all font-semibold ${
                  clienteInfo?.fichaAnamnese 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {clienteInfo?.fichaAnamnese ? '📄 Ver Minha Ficha' : '📋 Preencher Ficha'}
              </button>
              <button
                onClick={() => navigate('/meus-dados')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                ⚙️ Editar Dados
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all font-semibold"
              >
                🚪 Sair
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Histórico de Agendamentos</h2>
          
          {/* Legenda de Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre os Status dos Agendamentos:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px]">⏳ Pendente:</span>
                <span>Seu agendamento está aguardando confirmação da clínica. Você receberá uma notificação assim que for confirmado.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px]">✅ Confirmado:</span>
                <span>Seu agendamento foi confirmado! Compareça no horário marcado que estaremos te aguardando.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px]">❌ Cancelado:</span>
                <span>Este agendamento foi cancelado.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px]">✔️ Concluído:</span>
                <span>Serviço realizado com sucesso.</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando agendamentos...</div>
          ) : agendamentos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Você ainda não tem agendamentos</p>
              <button
                onClick={() => navigate('/agendamento')}
                className="bg-[#6EC1E4] text-white px-6 py-3 rounded-lg hover:bg-[#5ab0d3] transition-all font-semibold"
              >
                Fazer um Agendamento
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {agendamentos.map((agendamento) => (
                <div key={agendamento.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{agendamento.servicoNome}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(agendamento.status)}`}>
                          {agendamento.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 flex items-center gap-1">
                            <span>📅</span> Data
                          </p>
                          <p className="font-semibold text-gray-900">{formatarData(agendamento.data)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 flex items-center gap-1">
                            <span>🕐</span> Horário
                          </p>
                          <p className="font-semibold text-gray-900">{agendamento.horario}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 flex items-center gap-1">
                            <span>💰</span> Valor
                          </p>
                          <p className="font-semibold text-gray-900">R$ {agendamento.servicoPreco?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 flex items-center gap-1">
                            <span>📊</span> Status
                          </p>
                          <p className="font-semibold text-gray-900 capitalize">{agendamento.status}</p>
                        </div>
                      </div>

                      {agendamento.observacoes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-600 text-sm">Observações:</p>
                          <p className="text-gray-800">{agendamento.observacoes}</p>
                        </div>
                      )}
                    </div>

                    {agendamento.status === 'confirmado' && (
                      <button
                        onClick={() => handleCancelar(agendamento.id)}
                        className="ml-4 text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Visualização da Ficha */}
      {mostrarFicha && fichaData && (
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-purple-600">📋 Minha Ficha de Anamnese</h2>
                <p className="text-gray-600 text-sm mt-1">Visualize e edite suas informações</p>
              </div>
              <button
                onClick={() => setMostrarFicha(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados Pessoais */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">👤 Dados Pessoais</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {fichaData.nomeCompleto}</p>
                    <p><strong>Idade:</strong> {fichaData.idade}</p>
                    <p><strong>Profissão:</strong> {fichaData.profissao}</p>
                    <p><strong>Como soube:</strong> {fichaData.comoSoube}</p>
                  </div>
                </div>

                {/* Queixa Principal */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">🎯 Queixa Principal</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Motivo:</strong> {fichaData.motivoTratamento}</p>
                    <p><strong>Tempo:</strong> {fichaData.tempoQueixa}</p>
                  </div>
                </div>

                {/* Histórico de Saúde */}
                <div className="bg-red-50 p-4 rounded-lg col-span-1 md:col-span-2">
                  <h4 className="font-semibold text-red-800 mb-3">⚠️ Histórico de Saúde</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {fichaData.doencas?.hipertensao && <span className="text-red-700">• Hipertensão</span>}
                    {fichaData.doencas?.diabetes && <span className="text-red-700">• Diabetes</span>}
                    {fichaData.doencas?.problemasCardiacos && <span className="text-red-700">• Problemas cardíacos</span>}
                    {fichaData.doencas?.alergiaMedicamentos && (
                      <span className="text-red-700">• Alergia: {fichaData.doencas.alergiaDescricao}</span>
                    )}
                    {fichaData.doencas?.problemasTireoide && <span className="text-red-700">• Tireoide</span>}
                    {fichaData.doencas?.trombose && <span className="text-red-700">• Trombose</span>}
                    {!Object.values(fichaData.doencas || {}).some(v => v === true) && (
                      <span className="text-gray-500 italic">Nenhuma condição reportada</span>
                    )}
                  </div>
                </div>

                {/* Medicamentos */}
                {fichaData.medicamentosContinuos && (
                  <div className="bg-yellow-50 p-4 rounded-lg col-span-1 md:col-span-2">
                    <h4 className="font-semibold text-yellow-800 mb-3">💊 Medicamentos</h4>
                    <p className="text-sm">{fichaData.medicamentosContinuos}</p>
                  </div>
                )}

                {/* Hábitos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">🏃 Hábitos de Vida</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Fuma:</strong> {fichaData.fuma}</p>
                    <p><strong>Álcool:</strong> {fichaData.bebeAlcool}</p>
                    <p><strong>Atividade física:</strong> {fichaData.atividadeFisica || 'Não informado'}</p>
                    <p><strong>Sono:</strong> {fichaData.qualidadeSono}</p>
                  </div>
                </div>

                {/* Pele */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">✨ Condições da Pele</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tipo:</strong> {fichaData.tipoPele}</p>
                    <p><strong>Cor:</strong> {fichaData.corPele}</p>
                    <p><strong>Exposição solar:</strong> {fichaData.exposicaoSolar}</p>
                  </div>
                </div>

                {/* Contraindicações */}
                {fichaData.contraindicacoes && (
                  <div className="bg-red-50 p-4 rounded-lg col-span-1 md:col-span-2">
                    <h4 className="font-semibold text-red-800 mb-3">🚫 Contraindicações</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {fichaData.contraindicacoes.marcapasso && <span className="text-red-700">• Marcapasso</span>}
                      {fichaData.contraindicacoes.metalCorpo && <span className="text-red-700">• Metal no corpo</span>}
                      {fichaData.contraindicacoes.epilepsia && <span className="text-red-700">• Epilepsia</span>}
                      {fichaData.contraindicacoes.infeccoesAtivas && <span className="text-red-700">• Infecções ativas</span>}
                      {fichaData.gestanteAmamentando === 'sim' && <span className="text-red-700">• Gestante/Amamentando</span>}
                      {!Object.values(fichaData.contraindicacoes || {}).some(v => v === true) && fichaData.gestanteAmamentando !== 'sim' && (
                        <span className="text-gray-500 italic">Nenhuma contraindicação</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Objetivos */}
                {fichaData.objetivoFacial?.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg col-span-1 md:col-span-2">
                    <h4 className="font-semibold text-blue-800 mb-3">🎯 Objetivos do Tratamento</h4>
                    <div className="flex flex-wrap gap-2">
                      {fichaData.objetivoFacial.map((obj, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setMostrarFicha(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setMostrarFicha(false)
                  navigate('/ficha-anamnese')
                }}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
              >
                ✏️ Editar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

