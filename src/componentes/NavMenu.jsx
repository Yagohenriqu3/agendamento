
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/ChatGPT Image 4 de out. de 2025, 09_40_38.png'

export default function NavMenu() {
  const [clienteLogado, setClienteLogado] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    // Verificar se há usuário logado (cliente ou admin)
    const token = localStorage.getItem('clienteToken')
    const nome = localStorage.getItem('clienteNome')
    const adminStatus = localStorage.getItem('isAdmin') === 'true'
    
    if (token) {
      setClienteLogado(nome)
      setIsAdmin(adminStatus)
    } else {
      setClienteLogado(null)
      setIsAdmin(false)
    }
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('clienteToken')
    localStorage.removeItem('clienteNome')
    localStorage.removeItem('clienteEmail')
    localStorage.removeItem('isAdmin')
    setClienteLogado(null)
    setIsAdmin(false)
    setMenuAberto(false)
    navigate('/')
  }

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuAberto && !event.target.closest('.menu-usuario')) {
        setMenuAberto(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuAberto])

  return (
    <header className="bg-[#EAF6F6] shadow-sm sticky top-0 z-50 py-4">
        <div className='container mx-auto px-4'>
            <div className="flex items-center justify-between gap-6">
                {/* Logo */}
                <div className="h-16 shrink-0">
                    <img 
                      src={logo} 
                      alt="logo Belleza Estética" 
                      className='w-full h-full object-contain' 
                    />
                </div>
                
                {/* Menu de navegação */}
                <nav className="hidden md:flex flex-1 justify-center" aria-label="Navegação principal">
                    <ul className="flex items-center gap-2 text-[#6EC1E4] font-semibold">
                        <li>
                            <Link 
                                to="/" 
                                className="px-5 py-2 rounded-lg transition-all duration-300 hover:bg-[#6EC1E4] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                              >
                                  Home
                              </Link>
                        </li>
                        <li>
                            <Link 
                                to="/sobre-nos" 
                                className="px-5 py-2 rounded-lg transition-all duration-300 hover:bg-[#6EC1E4] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                              >
                                  Sobre a Clínica
                              </Link>
                        </li>
                        <li>
                            <Link 
                                to="/servicos" 
                                className="px-5 py-2 rounded-lg transition-all duration-300 hover:bg-[#6EC1E4] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                              >
                                  Serviços
                              </Link>
                        </li>
                        <li>
                            <Link 
                              to="/agendamento" 
                              className="px-5 py-2 rounded-lg transition-all duration-300 bg-[#6EC1E4] text-white hover:bg-[#5ab0d3] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                            >
                                Agendar
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Menu do Usuário - Alinhado à direita */}
                <div className="relative menu-usuario">
                  {clienteLogado ? (
                    <>
                      <button
                        onClick={() => setMenuAberto(!menuAberto)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6EC1E4] text-white hover:bg-[#5ab0d3] transition-all shadow-md"
                      >
                        <span className="hidden md:inline">{clienteLogado}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <svg className={`w-4 h-4 transition-transform ${menuAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {menuAberto && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                          {isAdmin ? (
                            <>
                              {/* Menu Admin */}
                              <Link
                                to="/admin/painel"
                                onClick={() => setMenuAberto(false)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#EAF6F6] transition-all"
                              >
                                <span>🏠</span>
                                <span>Painel Admin</span>
                              </Link>
                              <div className="border-t border-gray-200 my-1"></div>
                              <div className="px-4 py-1 text-xs text-gray-500 font-semibold">ACESSO RÁPIDO</div>
                              <Link
                                to="/admin/painel"
                                onClick={() => setMenuAberto(false)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#EAF6F6] transition-all"
                              >
                                <span>📅</span>
                                <span>Novo Agendamento</span>
                              </Link>
                              <Link
                                to="/"
                                onClick={() => setMenuAberto(false)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#EAF6F6] transition-all"
                              >
                                <span>🏡</span>
                                <span>Site Principal</span>
                              </Link>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-all"
                              >
                                <span>🚪</span>
                                <span>Sair</span>
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Menu Cliente */}
                              <Link
                                to="/agendamento"
                                onClick={() => setMenuAberto(false)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#EAF6F6] transition-all"
                              >
                                <span>📅</span>
                                <span>Agendar</span>
                              </Link>
                              <Link
                                to="/meus-agendamentos"
                                onClick={() => setMenuAberto(false)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#EAF6F6] transition-all"
                              >
                                <span>👤</span>
                                <span>Meu Perfil</span>
                              </Link>
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-all"
                              >
                                <span>🚪</span>
                                <span>Sair</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link 
                      to="/login-cliente" 
                      className="px-5 py-2 rounded-lg transition-all duration-300 border-2 border-[#6EC1E4] text-[#6EC1E4] hover:bg-[#6EC1E4] hover:text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                    >
                        Login / Cadastro
                    </Link>
                  )}
                </div>
            </div>
        </div>
    </header>
  )
}
