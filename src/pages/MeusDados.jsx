import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MeusDados() {
  const [cliente, setCliente] = useState(null)
  const [editando, setEditando] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    senhaAtual: '',
    novaSenha: ''
  })
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

    carregarDados(email)
  }, [navigate])

  const carregarDados = async (email) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/cliente/dados?email=${email}`)
      const data = await response.json()
      setCliente(data)
      setFormData({
        nome: data.nome,
        telefone: data.telefone,
        senhaAtual: '',
        novaSenha: ''
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados')
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
      const response = await fetch(`${API_URL}/cliente/atualizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cliente.email,
          ...formData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      alert('Dados atualizados com sucesso!')
      localStorage.setItem('clienteNome', formData.nome)
      setEditando(false)
      carregarDados(cliente.email)
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('clienteToken')
    localStorage.removeItem('clienteNome')
    localStorage.removeItem('clienteEmail')
    localStorage.removeItem('isAdmin')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#EAF6F6] to-white flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#EAF6F6] to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#6EC1E4]">Meus Dados</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/meus-agendamentos')}
                className="bg-[#6EC1E4] text-white px-4 py-2 rounded-lg hover:bg-[#5ab0d3] transition-all font-semibold"
              >
                Meus Agendamentos
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Sair
              </button>
            </div>
          </div>

          {!editando ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <label className="text-gray-600 text-sm">Nome</label>
                <p className="text-gray-900 font-semibold text-lg">{cliente?.nome}</p>
              </div>
              
              <div className="border-b pb-4">
                <label className="text-gray-600 text-sm">E-mail</label>
                <p className="text-gray-900 font-semibold">{cliente?.email}</p>
              </div>
              
              <div className="border-b pb-4">
                <label className="text-gray-600 text-sm">Telefone</label>
                <p className="text-gray-900 font-semibold">{cliente?.telefone}</p>
              </div>

              <div className="border-b pb-4">
                <label className="text-gray-600 text-sm">Membro desde</label>
                <p className="text-gray-900 font-semibold">
                  {new Date(cliente?.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <button
                onClick={() => setEditando(true)}
                className="w-full bg-[#6EC1E4] text-white font-bold py-3 rounded-lg hover:bg-[#5ab0d3] transition-all duration-300 mt-6"
              >
                Editar Dados
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nome" className="block text-gray-700 font-semibold mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                />
              </div>

              <div>
                <label htmlFor="telefone" className="block text-gray-700 font-semibold mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Alterar Senha (opcional)</h3>
                
                <div className="mb-4">
                  <label htmlFor="senhaAtual" className="block text-gray-700 font-semibold mb-2">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    id="senhaAtual"
                    name="senhaAtual"
                    value={formData.senhaAtual}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                  />
                </div>

                <div>
                  <label htmlFor="novaSenha" className="block text-gray-700 font-semibold mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    id="novaSenha"
                    name="novaSenha"
                    value={formData.novaSenha}
                    onChange={handleChange}
                    minLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#6EC1E4] text-white font-bold py-3 rounded-lg hover:bg-[#5ab0d3] transition-all disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
