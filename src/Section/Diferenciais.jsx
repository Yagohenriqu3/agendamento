import { FaShieldAlt, FaCertificate, FaHandHoldingHeart, FaUserMd } from 'react-icons/fa'

export default function Diferenciais() {
  const diferenciais = [
    {
      icon: <FaUserMd className="w-10 h-10" />,
      titulo: "Primeira Consulta Grátis",
      descricao: "Avaliação completa sem compromisso para entender suas necessidades"
    },
    {
      icon: <FaCertificate className="w-10 h-10" />,
      titulo: "Produtos Certificados",
      descricao: "Todos os produtos utilizados são certificados pela Anvisa"
    },
    {
      icon: <FaShieldAlt className="w-10 h-10" />,
      titulo: "Ambiente Higienizado",
      descricao: "Protocolos rigorosos de limpeza e esterilização para sua segurança"
    },
    {
      icon: <FaHandHoldingHeart className="w-10 h-10" />,
      titulo: "Atendimento Personalizado",
      descricao: "Cada tratamento é único e desenvolvido especialmente para você"
    }
  ]

  return (
    <section className="py-20 px-4 bg-[#6EC1E4]">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Por Que Nos Escolher?
          </h2>
          <p className="text-white text-lg opacity-90">
            Compromisso com excelência e sua satisfação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {diferenciais.map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-[#6EC1E4] mb-4 flex justify-center">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                {item.titulo}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {item.descricao}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-2xl p-8 shadow-xl border-2 border-[#6EC1E4]">
            <p className="text-[#6EC1E4] text-2xl font-bold mb-2">
              💎 Garantia de Satisfação
            </p>
            <p className="text-gray-700 text-lg">
              Sua beleza e bem-estar são nossa prioridade
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
