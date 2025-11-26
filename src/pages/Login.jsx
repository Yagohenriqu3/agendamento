import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import NavMenu from '../componentes/NavMenu'
import API_URL from '../config/api'

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const loadingToast = toast.loading('Entrando...')

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      // Salvar token no localStorage
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminNome', data.nome)
      
      toast.success('✅ Login realizado com sucesso!', { id: loadingToast })
      
      // Redirecionar para o painel
      navigate('/admin/painel')
      
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      toast.error(error.message, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <NavMenu />
      <div className="min-h-screen bg-linear-to-b from-[#EAF6F6] to-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#6EC1E4] mb-2">
            Área do Administrador
          </h1>
          <p className="text-gray-600">
            Faça login para acessar o painel
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">
                Usuário
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all"
                placeholder="Digite seu usuário"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all"
                placeholder="Digite sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6EC1E4] text-white font-bold py-4 rounded-lg hover:bg-[#5ab0d3] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href="/"
              className="text-[#6EC1E4] hover:text-[#5ab0d3] font-semibold"
            >
              ← Voltar para o site
            </a>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Usuário padrão: <strong>admin</strong></p>
          <p>Senha padrão: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
    </>
  )
}
