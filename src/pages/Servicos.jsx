import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaClock, FaMoneyBillWave, FaStar, FaMicroscope, FaGem, FaCalendarCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import NavMenu from '../componentes/NavMenu'
import LoadingSkeleton from '../componentes/LoadingSkeleton'
import API_URL from '../config/api'

export default function Servicos() {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [configuracoes, setConfiguracoes] = useState({ mostrar_valores_cliente: true })

  useEffect(() => {
    carregarServicos()
    carregarConfiguracoes()
  }, [])

  const carregarServicos = async () => {
    try {
      const response = await fetch(`${API_URL}/servicos`)
      const data = await response.json()
      
      if (response.ok) {
        // Filtrar apenas serviços ativos
        const servicosAtivos = data.filter(servico => servico.ativo)
        setServicos(servicosAtivos)
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarConfiguracoes = async () => {
    try {
      const response = await fetch(`${API_URL}/configuracoes`)
      const data = await response.json()
      
      if (response.ok && data.length > 0) {
        setConfiguracoes(data[0])
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco)
  }

  const formatarDuracao = (minutos) => {
    if (minutos >= 60) {
      const horas = Math.floor(minutos / 60)
      const mins = minutos % 60
      return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
    }
    return `${minutos} min`
  }

  return (
    <>
      <NavMenu />
      <div className="min-h-screen bg-linear-to-b from-[#EAF6F6] to-white">
        {/* Hero Section */}
        <div className="bg-[#6EC1E4] text-white py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Nossos Serviços
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Tratamentos estéticos de alta qualidade para realçar sua beleza natural
            </p>
          </div>
        </div>

        {/* Serviços Grid */}
        <div className="container mx-auto px-4 py-16">
          {loading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : servicos.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                Nenhum serviço disponível
              </h3>
              <p className="text-gray-500">
                Em breve teremos novos tratamentos disponíveis.
              </p>
            </div>
          ) : (
            <>
              {/* Carousel de Serviços */}
              <div className="relative px-12">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={30}
                  slidesPerView={1}
                  navigation={{
                    prevEl: '.swiper-button-prev-custom',
                    nextEl: '.swiper-button-next-custom',
                  }}
                  pagination={{ 
                    clickable: true,
                    dynamicBullets: true 
                  }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  breakpoints={{
                    640: {
                      slidesPerView: 1,
                    },
                    768: {
                      slidesPerView: 2,
                    },
                    1024: {
                      slidesPerView: 3,
                    },
                  }}
                  className="pb-12"
                >
                  {servicos.map((servico) => (
                    <SwiperSlide key={servico.id}>
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                        {/* Card Header */}
                        <div className="bg-linear-to-r from-[#6EC1E4] to-[#5ab0d3] p-6">
                          <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 min-h-14">
                            {servico.nome}
                          </h3>
                          <div className="flex items-center gap-4 text-white text-sm">
                            <span className="flex items-center gap-1">
                              <FaClock className="w-4 h-4" />
                              {formatarDuracao(servico.duracao)}
                            </span>
                            {configuracoes.mostrar_valores_cliente && (
                              <span className="flex items-center gap-1 font-semibold">
                                <FaMoneyBillWave className="w-4 h-4" />
                                {formatarPreco(servico.preco)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex flex-col" style={{ minHeight: '200px' }}>
                          {servico.descricao ? (
                            <p className="text-gray-600 leading-relaxed mb-6 grow line-clamp-4">
                              {servico.descricao}
                            </p>
                          ) : (
                            <p className="text-gray-400 italic mb-6 grow">
                              Tratamento especializado para seus cuidados estéticos.
                            </p>
                          )}

                          {/* Botão de Agendar */}
                          <Link
                            to="/agendamento"
                            className="flex items-center justify-center gap-2 w-full text-center bg-[#6EC1E4] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#5ab0d3] transition-all duration-300 shadow-md hover:shadow-lg mt-auto"
                          >
                            <FaCalendarCheck className="w-5 h-5" />
                            Agendar Agora
                          </Link>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Botões de navegação customizados */}
                <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#6EC1E4] hover:bg-[#6EC1E4] hover:text-white transition-all duration-300">
                  <FaChevronLeft className="w-6 h-6" />
                </button>
                <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#6EC1E4] hover:bg-[#6EC1E4] hover:text-white transition-all duration-300">
                  <FaChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* CTA Section */}
              <div className="mt-20 bg-linear-to-r from-[#6EC1E4] to-[#5ab0d3] rounded-3xl p-12 text-center text-white shadow-2xl">
                <h2 className="text-4xl font-bold mb-4">
                  Pronto para transformar sua beleza?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Agende agora seu tratamento e experimente o melhor da estética
                </p>
                <Link
                  to="/agendamento"
                  className="inline-flex items-center gap-3 bg-white text-[#6EC1E4] font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaCalendarCheck className="w-6 h-6" />
                  Fazer Agendamento
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="bg-white py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <FaStar className="text-6xl text-[#6EC1E4]" />
                </div>
                <h3 className="text-xl font-semibold text-[#6EC1E4] mb-2">
                  Profissionais Qualificados
                </h3>
                <p className="text-gray-600">
                  Equipe especializada e certificada para seu atendimento
                </p>
              </div>
              
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <FaMicroscope className="text-6xl text-[#6EC1E4]" />
                </div>
                <h3 className="text-xl font-semibold text-[#6EC1E4] mb-2">
                  Tecnologia Avançada
                </h3>
                <p className="text-gray-600">
                  Equipamentos modernos e técnicas atualizadas
                </p>
              </div>
              
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <FaGem className="text-6xl text-[#6EC1E4]" />
                </div>
                <h3 className="text-xl font-semibold text-[#6EC1E4] mb-2">
                  Resultados Comprovados
                </h3>
                <p className="text-gray-600">
                  Tratamentos eficazes com resultados visíveis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
