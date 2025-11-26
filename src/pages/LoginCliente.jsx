import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import NavMenu from '../componentes/NavMenu'
import API_URL from '../config/api'

export default function LoginCliente() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
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

    const loadingToast = toast.loading(isLogin ? 'Entrando...' : 'Criando conta...')

    try {
      const endpoint = isLogin ? '/cliente/login' : '/cliente/registro'
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar requisição')
      }

      // Salvar dados do cliente no localStorage
      localStorage.setItem('clienteToken', data.token)
      localStorage.setItem('clienteNome', data.nome)
      localStorage.setItem('clienteEmail', data.email)
      localStorage.setItem('isAdmin', data.isAdmin)
      
      toast.success(isLogin ? '✅ Login realizado!' : '✅ Conta criada com sucesso!', { id: loadingToast })
      
      // Redirecionar baseado no tipo de usuário
      if (data.isAdmin) {
        navigate('/admin/painel')
      } else {
        navigate('/meus-agendamentos')
      }
      
    } catch (error) {
      console.error('Erro:', error)
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
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Faça login para agendar' : 'Cadastre-se para começar'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              {!isLogin && (
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              )}

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
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6EC1E4] text-white font-bold py-4 rounded-lg hover:bg-[#5ab0d3] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setFormData({ nome: '', email: '', telefone: '', password: '' })
                }}
                className="text-[#6EC1E4] hover:text-[#5ab0d3] font-semibold"
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <a 
                href="/"
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Voltar para o site
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
