
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/ChatGPT Image 4 de out. de 2025, 09_40_38.png'

export default function NavMenu() {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`bg-[#EAF6F6] shadow-sm sticky top-0 z-50 transition-all duration-500 ease-in-out ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className='container mx-auto px-4'>
            <div className="flex items-end gap-6 transition-all duration-500 ease-in-out">
                {/* Logo */}
                <div className={`transition-all duration-500 ease-in-out shrink-0 ${isScrolled ? 'h-12' : 'h-25'}`}>
                    <img 
                      src={logo} 
                      alt="logo Belleza Estética" 
                      className='w-full h-full object-contain transition-all duration-500 ease-in-out' 
                    />
                </div>
                
                {/* Menu de navegação */}
                <nav className="hidden md:flex transition-all duration-500 ease-in-out flex-1 justify-center " aria-label="Navegação principal">
                    <ul className="flex items-center gap-2 text-[#6EC1E4] font-semibold transition-all duration-500 ease-in-out">
                        <li>
                            {isHomePage ? (
                              <a 
                                href="#home" 
                                className="px-5 py-2 rounded-lg transition-all duration-300 hover:bg-[#6EC1E4] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                              >
                                  Home
                              </a>
                            ) : (
                              <Link 
                                to="/" 
                                className="px-5 py-2 rounded-lg transition-all duration-300 hover:bg-[#6EC1E4] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                              >
                                  Home
                              </Link>
                            )}
                        </li>
                        <li>
                            {isHomePage ? (
                              <a 
                                href="#sobre" 
                                className="px-5 py-2 rounded-lg transition-all duration-300 hover:bg-[#6EC1E4] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                              >
                                  Sobre a Clínica
                              </a>
                            ) : (
                              <Link 
                                to="/sobre-nos" 
                                className="px-5 py-2 rounded-lg transition-all duration-300 hover:bg-[#6EC1E4] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                              >
                                  Sobre a Clínica
                              </Link>
                            )}
                        </li>
                        <li>
                            {isHomePage ? (
                              <a 
                                href="#servicos" 
                                className="px-5 py-2 rounded-lg transition-all duration-300 hover:bg-[#6EC1E4] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                              >
                                  Serviços
                              </a>
                            ) : (
                              <Link 
                                to="/#servicos" 
                                className="px-5 py-2 rounded-lg transition-all duration-300 hover:bg-[#6EC1E4] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:ring-offset-2"
                              >
                                  Serviços
                              </Link>
                            )}
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
            </div>
        </div>
    </header>
  )
}
