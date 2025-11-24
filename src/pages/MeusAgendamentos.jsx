import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const API_URL = 'https://agendamento-backend-pju8.onrender.com'

  useEffect(() => {
    const token = localStorage.getItem('clienteToken')
    const email = localStorage.getItem('clienteEmail')
    
    if (!token || !email) {
      navigate('/login')
      return
    }

    carregarAgendamentos(email)
  }, [navigate])

  const carregarAgendamentos = async (email) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/agendamentos?clienteEmail=${email}`)
      const data = await response.json()
      setAgendamentos(data)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      alert('Erro ao carregar agendamentos')
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
        carregarAgendamentos(email)
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error)
      alert('Erro ao cancelar agendamento')
    }
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
    <div className="min-h-screen bg-linear-to-b from-[#EAF6F6] to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#6EC1E4]">Meus Agendamentos</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/agendamento')}
                className="bg-[#6EC1E4] text-white px-4 py-2 rounded-lg hover:bg-[#5ab0d3] transition-all font-semibold"
              >
                Novo Agendamento
              </button>
              <button
                onClick={() => navigate('/meus-dados')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Meus Dados
              </button>
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Data</p>
                          <p className="font-semibold text-gray-900">{formatarData(agendamento.data)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Horário</p>
                          <p className="font-semibold text-gray-900">{agendamento.horario}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Valor</p>
                          <p className="font-semibold text-gray-900">R$ {agendamento.servicoPreco?.toFixed(2)}</p>
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
    </div>
  )
}
