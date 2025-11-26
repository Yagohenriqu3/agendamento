import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavMenu from '../componentes/NavMenu'
import API_URL from '../config/api'

export default function Agendamento() {
  const [servicos, setServicos] = useState([])
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([])
  const [horariosComVagas, setHorariosComVagas] = useState([])
  const [configuracoes, setConfiguracoes] = useState({
    dias_antecedencia_max: 30,
    dias_funcionamento: ['1','2','3','4','5','6']
  })
  const [loading, setLoading] = useState(false)
  const [clienteNome, setClienteNome] = useState('')
  const [clienteEmail, setClienteEmail] = useState('')
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    servicosIds: [],
    data: '',
    horario: '',
    observacoes: ''
  })
  const [servicosSelecionados, setServicosSelecionados] = useState([])

  useEffect(() => {
    // Verificar se o cliente está logado
    const token = localStorage.getItem('clienteToken')
    const nome = localStorage.getItem('clienteNome')
    const email = localStorage.getItem('clienteEmail')
    
    if (!token || !email) {
      // Redirecionar para login se não estiver autenticado
      navigate('/login')
      return
    }

    setClienteNome(nome)
    setClienteEmail(email)
    carregarServicos()
    carregarConfiguracoes()
  }, [navigate])

  const carregarConfiguracoes = async () => {
    try {
      const response = await fetch(`${API_URL}/configuracoes/publicas`)
      const data = await response.json()
      setConfiguracoes(data)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  useEffect(() => {
    if (formData.data && servicosSelecionados.length > 0) {
      carregarHorariosDisponiveis()
    } else {
      setHorariosDisponiveis([])
    }
  }, [formData.data, servicosSelecionados])

  const carregarServicos = async () => {
    try {
      const response = await fetch(`${API_URL}/servicos`)
      const data = await response.json()
      setServicos(data)
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
      alert('Erro ao carregar serviços. Verifique se o servidor está rodando.')
    }
  }

  const carregarHorariosDisponiveis = async () => {
    try {
      setLoading(true)
      
      // Calcular duração total dos serviços selecionados
      const duracaoTotal = servicosSelecionados.reduce((total, s) => total + s.duracao, 0)
      
      console.log('Serviços selecionados:', servicosSelecionados)
      console.log('Duração total calculada:', duracaoTotal)
      
      if (duracaoTotal === 0) {
        console.warn('Duração total é 0, serviços podem não ter duração definida')
        setHorariosDisponiveis([])
        setHorariosComVagas([])
        return
      }
      
      // Pegar o primeiro serviço para buscar colaboradores
      const primeiroServicoId = servicosSelecionados[0]?.id
      
      const url = `${API_URL}/horarios-disponiveis?data=${formData.data}&duracaoTotal=${duracaoTotal}${primeiroServicoId ? `&servicoId=${primeiroServicoId}` : ''}`
      console.log('URL de busca:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      console.log('Horários disponíveis recebidos:', data.horariosDisponiveis)
      console.log('Horários com vagas:', data.horariosComVagas)
      setHorariosDisponiveis(data.horariosDisponiveis || [])
      setHorariosComVagas(data.horariosComVagas || [])
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      alert('Erro ao carregar horários disponíveis')
    } finally {
      setLoading(false)
    }
  }

  const handleAdicionarServico = (servicoId) => {
    const servico = servicos.find(s => s.id === parseInt(servicoId))
    if (servico && !servicosSelecionados.find(s => s.id === servico.id)) {
      const novosServicos = [...servicosSelecionados, servico]
      setServicosSelecionados(novosServicos)
      setFormData(prev => ({
        ...prev,
        servicosIds: novosServicos.map(s => s.id),
        horario: '' // Limpar horário ao mudar serviços
      }))
    }
  }

  const handleRemoverServico = (servicoId) => {
    const novosServicos = servicosSelecionados.filter(s => s.id !== servicoId)
    setServicosSelecionados(novosServicos)
    setFormData(prev => ({
      ...prev,
      servicosIds: novosServicos.map(s => s.id),
      horario: '' // Limpar horário ao mudar serviços
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      
      // Limpar horário quando trocar data
      if (name === 'data') {
        newData.horario = ''
      }
      
      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Buscar dados completos do cliente
      const clienteResponse = await fetch(`${API_URL}/cliente/dados?email=${clienteEmail}`)
      const clienteData = await clienteResponse.json()
      
      // Dados completos do agendamento
      const dadosAgendamento = {
        nome: clienteNome,
        email: clienteEmail,
        telefone: clienteData.telefone || '(00) 00000-0000',
        servicosIds: formData.servicosIds,
        data: formData.data,
        horario: formData.horario,
        observacoes: formData.observacoes
      }
      
      const response = await fetch(`${API_URL}/agendamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosAgendamento)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar agendamento')
      }

      const agendamento = await response.json()
      alert('Agendamento realizado com sucesso!')
      
      // Limpar formulário
      setFormData({
        servicosIds: [],
        data: '',
        horario: '',
        observacoes: ''
      })
      setServicosSelecionados([])
      setHorariosDisponiveis([])
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('clienteToken')
    localStorage.removeItem('clienteNome')
    localStorage.removeItem('clienteEmail')
    navigate('/login')
  }

  // Calcular data mínima (amanhã) e máxima (baseado na configuração)
  const calcularDatasPermitidas = () => {
    const hoje = new Date()
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)
    
    const dataMaxima = new Date(hoje)
    const diasMax = configuracoes.dias_antecedencia_max || 30
    dataMaxima.setDate(dataMaxima.getDate() + diasMax)
    
    return {
      min: amanha.toISOString().split('T')[0],
      max: dataMaxima.toISOString().split('T')[0]
    }
  }

  const datasPermitidas = calcularDatasPermitidas()

  // Função para validar se a data é permitida (dia da semana)
  const isDiaPermitido = (dataString) => {
    const data = new Date(dataString + 'T00:00:00')
    const diaSemana = data.getDay().toString()
    const diasFuncionamento = configuracoes.dias_funcionamento || ['1','2','3','4','5','6']
    return diasFuncionamento.includes(diaSemana)
  }

  // Data mínima é hoje
  const dataMinima = new Date().toISOString().split('T')[0]

  return (
    <>
      <NavMenu />
      <div className="min-h-screen bg-linear-to-b from-[#EAF6F6] to-white py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-[#6EC1E4]">
                Agende sua Consulta
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Bem-vindo(a), <span className="font-semibold">{clienteNome}</span>!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm w-full sm:w-auto"
            >
              Sair
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Seleção de Serviços */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Serviços Desejados
                </label>
                <div className="flex gap-2">
                  <select
                    id="servicoSelect"
                    className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all text-sm md:text-base"
                  >
                    <option value="">Selecione um serviço para adicionar</option>
                    {servicos
                      .filter(s => !servicosSelecionados.find(sel => sel.id === s.id))
                      .map(servico => (
                        <option key={servico.id} value={servico.id}>
                          {servico.nome} - R$ {servico.preco?.toFixed(2)} ({servico.duracao} min)
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const select = document.getElementById('servicoSelect')
                      if (select.value) {
                        handleAdicionarServico(select.value)
                        select.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-[#6EC1E4] text-white rounded-lg hover:bg-[#5ab0d3] transition-all font-semibold text-sm"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de Serviços Selecionados */}
              {servicosSelecionados.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">
                    Serviços Selecionados ({servicosSelecionados.length})
                  </h3>
                  <div className="space-y-2">
                    {servicosSelecionados.map((servico) => (
                      <div key={servico.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm md:text-base">{servico.nome}</p>
                          <p className="text-xs md:text-sm text-gray-600">
                            R$ {servico.preco?.toFixed(2)} • {servico.duracao} minutos
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverServico(servico.id)}
                          className="ml-3 text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          ✕ Remover
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-blue-300">
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="font-semibold text-gray-700">Duração Total:</span>
                      <span className="font-bold text-[#6EC1E4]">
                        {servicosSelecionados.reduce((total, s) => total + s.duracao, 0)} minutos
                      </span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base mt-1">
                      <span className="font-semibold text-gray-700">Valor Total:</span>
                      <span className="font-bold text-green-600">
                        R$ {servicosSelecionados.reduce((total, s) => total + s.preco, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="data" className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                    Data {configuracoes.dias_antecedencia_max && (
                      <span className="text-xs text-gray-500 font-normal">
                        (até {configuracoes.dias_antecedencia_max} dias de antecedência)
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={(e) => {
                      const novadata = e.target.value
                      // Validar se é dia permitido
                      if (novadata && !isDiaPermitido(novadata)) {
                        alert('A empresa não funciona neste dia da semana. Por favor, selecione outro dia.')
                        return
                      }
                      handleChange(e)
                    }}
                    min={datasPermitidas.min}
                    max={datasPermitidas.max}
                    required
                    disabled={servicosSelecionados.length === 0}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
                  />
                  {servicosSelecionados.length === 0 ? (
                    <p className="text-xs text-gray-500 mt-1">Adicione pelo menos um serviço primeiro</p>
                  ) : (
                    <p className="text-xs text-blue-600 mt-1">
                      📅 Datas disponíveis: {new Date(datasPermitidas.min).toLocaleDateString('pt-BR')} até {new Date(datasPermitidas.max).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="horario" className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                    Horário Disponível {loading && '(carregando...)'}
                  </label>
                  
                  <select
                    id="horario"
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    required
                    disabled={!formData.data || servicosSelecionados.length === 0 || loading}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    <option value="">
                      {servicosSelecionados.length === 0 ? 'Adicione serviços primeiro' :
                       !formData.data ? 'Selecione uma data' : 
                       loading ? 'Carregando horários...' : 
                       horariosComVagas.length === 0 ? 'Sem horários disponíveis' : 
                       'Selecione um horário'}
                    </option>
                    {horariosComVagas.map(item => (
                      <option key={item.horario} value={item.horario}>
                        {item.horario} - {item.vagasDisponiveis === 1 ? '1 vaga disponível' : `${item.vagasDisponiveis} vagas disponíveis`}
                      </option>
                    ))}
                  </select>

                  {horariosComVagas.length === 0 && formData.data && servicosSelecionados.length > 0 && !loading && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                      <p className="text-xs text-yellow-800 flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <span>Sem horários disponíveis para esta data. Verifique se há colaboradores atribuídos aos serviços selecionados na aba Equipe.</span>
                      </p>
                    </div>
                  )}

                  {horariosComVagas.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        <span>
                          {horariosComVagas.some(h => h.vagasDisponiveis > 1) 
                            ? 'Horários com múltiplas vagas disponíveis! Você será atendido por um dos nossos profissionais qualificados.'
                            : 'Você será atendido por um dos nossos profissionais qualificados.'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="observacoes" className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all resize-none text-sm md:text-base"
                  placeholder="Alguma observação adicional..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6EC1E4] text-white font-bold py-3 md:py-4 rounded-lg hover:bg-[#5ab0d3] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? 'Processando...' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
