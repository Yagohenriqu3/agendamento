import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavMenu from '../componentes/NavMenu'

export default function Agendamento() {
  const [servicos, setServicos] = useState([])
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([])
  const [loading, setLoading] = useState(false)
  const [clienteNome, setClienteNome] = useState('')
  const [clienteEmail, setClienteEmail] = useState('')
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    servicoId: '',
    data: '',
    horario: '',
    observacoes: ''
  })

  const API_URL = 'https://agendamento-backend-pju8.onrender.com'

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
  }, [navigate])

  useEffect(() => {
    if (formData.data) {
      carregarHorariosDisponiveis()
    }
  }, [formData.data])

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
      const response = await fetch(`${API_URL}/horarios-disponiveis?data=${formData.data}`)
      const data = await response.json()
      setHorariosDisponiveis(data.horariosDisponiveis || [])
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      alert('Erro ao carregar horários disponíveis')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
        servicoId: formData.servicoId,
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
        servicoId: '',
        data: '',
        horario: '',
        observacoes: ''
      })
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
              <div>
                <label htmlFor="servicoId" className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                  Serviço Desejado
                </label>
                <select
                  id="servicoId"
                  name="servicoId"
                  value={formData.servicoId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all text-sm md:text-base"
                >
                  <option value="">Selecione um serviço</option>
                  {servicos.map(servico => (
                    <option key={servico.id} value={servico.id}>
                      {servico.nome} - R$ {servico.preco?.toFixed(2)} ({servico.duracao} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="data" className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                    Data
                  </label>
                  <input
                    type="date"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    min={dataMinima}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all text-sm md:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="horario" className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                    Horário {loading && '(carregando...)'}
                  </label>
                  <select
                    id="horario"
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    required
                    disabled={!formData.data || loading}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    <option value="">
                      {!formData.data ? 'Selecione uma data primeiro' : 
                       loading ? 'Carregando horários...' : 
                       horariosDisponiveis.length === 0 ? 'Sem horários disponíveis' : 
                       'Selecione um horário'}
                    </option>
                    {horariosDisponiveis.map(horario => (
                      <option key={horario} value={horario}>
                        {horario}
                      </option>
                    ))}
                  </select>
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
