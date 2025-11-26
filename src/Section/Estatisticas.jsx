import { FaUsers, FaClock, FaAward, FaStar } from 'react-icons/fa'

export default function Estatisticas() {
  const stats = [
    {
      icon: <FaUsers className="w-12 h-12" />,
      numero: "5.000+",
      label: "Clientes Atendidos",
      cor: "text-[#6EC1E4]"
    },
    {
      icon: <FaClock className="w-12 h-12" />,
      numero: "10+",
      label: "Anos de Experiência",
      cor: "text-purple-600"
    },
    {
      icon: <FaStar className="w-12 h-12" />,
      numero: "98%",
      label: "Satisfação",
      cor: "text-yellow-500"
    },
    {
      icon: <FaAward className="w-12 h-12" />,
      numero: "15+",
      label: "Profissionais Especializados",
      cor: "text-green-600"
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center transform hover:scale-110 transition-all duration-300"
            >
              <div className={`${stat.cor} flex justify-center mb-4 animate-bounce-slow`}>
                {stat.icon}
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                {stat.numero}
              </h3>
              <p className="text-gray-600 text-sm md:text-base font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
