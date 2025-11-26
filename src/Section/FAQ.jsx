import { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

export default function FAQ() {
  const [aberto, setAberto] = useState(null)

  const faqs = [
    {
      pergunta: "Os procedimentos são dolorosos?",
      resposta: "A maioria dos nossos tratamentos é indolor ou causa apenas um leve desconforto. Utilizamos técnicas modernas e, quando necessário, anestésicos tópicos para garantir seu conforto durante todo o procedimento."
    },
    {
      pergunta: "Quantas sessões são necessárias para ver resultados?",
      resposta: "O número de sessões varia de acordo com o tratamento escolhido e as características individuais de cada pessoa. Geralmente, começam a aparecer resultados já na primeira sessão, mas o protocolo completo costuma ter entre 6 a 10 sessões para resultados duradouros."
    },
    {
      pergunta: "Os tratamentos têm contraindicações?",
      resposta: "Alguns procedimentos podem ter contraindicações específicas como gravidez, lactação, doenças de pele ativas ou certas condições de saúde. Por isso, realizamos uma avaliação detalhada antes de iniciar qualquer tratamento para garantir sua segurança."
    },
    {
      pergunta: "Quais são as formas de pagamento aceitas?",
      resposta: "Aceitamos diversas formas de pagamento: dinheiro, cartões de crédito e débito (Visa, Mastercard, Elo), PIX e também oferecemos parcelamento em até 6x sem juros para determinados tratamentos."
    },
    {
      pergunta: "Preciso de preparo antes dos procedimentos?",
      resposta: "Dependendo do tratamento, pode haver algumas recomendações como evitar exposição solar, não usar maquiagem no dia ou suspender certos medicamentos. Todas as orientações específicas serão fornecidas durante a consulta de avaliação."
    },
    {
      pergunta: "Quanto tempo dura cada sessão?",
      resposta: "A duração varia conforme o procedimento: tratamentos faciais costumam durar entre 45 minutos a 1h30, enquanto procedimentos corporais podem levar de 1 a 2 horas. Informamos a duração exata no momento do agendamento."
    }
  ]

  const toggleFAQ = (index) => {
    setAberto(aberto === index ? null : index)
  }

  return (
    <section className="py-20 px-4 bg-linear-to-b from-white to-[#EAF6F6]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#6EC1E4] mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-gray-600 text-lg">
            Tire suas dúvidas sobre nossos tratamentos
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-800 pr-8">
                  {faq.pergunta}
                </h3>
                <div className="shrink-0 text-[#6EC1E4]">
                  {aberto === index ? (
                    <FaChevronUp className="w-5 h-5" />
                  ) : (
                    <FaChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              
              {aberto === index && (
                <div className="px-6 pb-6">
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.resposta}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Ainda tem dúvidas?</p>
          <a
            href="https://wa.me/5511999999999?text=Olá! Tenho algumas dúvidas sobre os tratamentos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Fale Conosco pelo WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
