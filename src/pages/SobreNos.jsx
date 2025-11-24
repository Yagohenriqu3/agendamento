import NavMenu from '../componentes/NavMenu'

export default function SobreNos() {
  return (
    <>
      <NavMenu />
      <div className="min-h-screen bg-gradient-to-b from-[#EAF6F6] to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-[#6EC1E4] text-center mb-8">
            Sobre Nós
          </h1>

          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* Nossa História */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Nossa História
              </h2>
              <p className="text-gray-600 leading-relaxed">
                A Belleza Estética nasceu do sonho de proporcionar beleza, bem-estar e autoestima 
                para nossos clientes. Com anos de experiência no mercado de estética, nos dedicamos 
                a oferecer os melhores tratamentos com tecnologia de ponta e profissionais altamente 
                qualificados.
              </p>
            </section>

            {/* Nossa Missão */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Nossa Missão
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Promover a saúde e a beleza através de tratamentos estéticos personalizados, 
                utilizando as técnicas mais modernas e seguras do mercado, sempre priorizando 
                o bem-estar e a satisfação de nossos clientes.
              </p>
            </section>

            {/* Nossos Valores */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Nossos Valores
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#6EC1E4] font-bold mr-3">•</span>
                  <p className="text-gray-600">
                    <strong className="text-gray-800">Excelência:</strong> Buscamos sempre a qualidade 
                    máxima em todos os nossos serviços
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="text-[#6EC1E4] font-bold mr-3">•</span>
                  <p className="text-gray-600">
                    <strong className="text-gray-800">Segurança:</strong> Utilizamos apenas produtos 
                    certificados e equipamentos de última geração
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="text-[#6EC1E4] font-bold mr-3">•</span>
                  <p className="text-gray-600">
                    <strong className="text-gray-800">Ética:</strong> Transparência e honestidade em 
                    todas as nossas relações
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="text-[#6EC1E4] font-bold mr-3">•</span>
                  <p className="text-gray-600">
                    <strong className="text-gray-800">Respeito:</strong> Valorizamos cada cliente e 
                    suas necessidades individuais
                  </p>
                </li>
              </ul>
            </section>

            {/* Nossa Equipe */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Nossa Equipe
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Contamos com uma equipe multidisciplinar de profissionais especializados e 
                certificados, que passam por constante atualização e treinamento para oferecer 
                os melhores resultados. Nossa equipe inclui dermatologistas, esteticistas, 
                biomédicos e fisioterapeutas dermatofuncionais.
              </p>
            </section>

            {/* Diferenciais */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Nossos Diferenciais
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#EAF6F6] p-4 rounded-lg">
                  <h3 className="font-bold text-[#6EC1E4] mb-2">Tecnologia Avançada</h3>
                  <p className="text-gray-600 text-sm">
                    Equipamentos modernos e técnicas inovadoras
                  </p>
                </div>
                <div className="bg-[#EAF6F6] p-4 rounded-lg">
                  <h3 className="font-bold text-[#6EC1E4] mb-2">Atendimento Personalizado</h3>
                  <p className="text-gray-600 text-sm">
                    Tratamentos adaptados às suas necessidades
                  </p>
                </div>
                <div className="bg-[#EAF6F6] p-4 rounded-lg">
                  <h3 className="font-bold text-[#6EC1E4] mb-2">Ambiente Acolhedor</h3>
                  <p className="text-gray-600 text-sm">
                    Espaço confortável e relaxante
                  </p>
                </div>
                <div className="bg-[#EAF6F6] p-4 rounded-lg">
                  <h3 className="font-bold text-[#6EC1E4] mb-2">Resultados Comprovados</h3>
                  <p className="text-gray-600 text-sm">
                    Satisfação e confiança de nossos clientes
                  </p>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <div className="text-center pt-6">
              <p className="text-gray-600 mb-4">
                Venha nos conhecer e descubra como podemos ajudá-lo a alcançar seus objetivos estéticos!
              </p>
              <a 
                href="/agendamento"
                className="inline-block bg-[#6EC1E4] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#5ab0d3] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Agende sua Consulta
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
