import { useState, useEffect } from 'react'
import { FaWhatsapp } from 'react-icons/fa'

export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)
  
  // Número de telefone (remover espaços e caracteres especiais)
  const phoneNumber = '5511999999999' // ATUALIZAR COM O NÚMERO REAL DA CLÍNICA
  
  // Mensagem pré-preenchida
  const message = 'Olá! Gostaria de agendar uma consulta ou tirar dúvidas sobre os tratamentos.'
  
  // URL do WhatsApp com mensagem
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  
  // Mostrar botão após rolar 300px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        fixed bottom-6 right-6 z-50
        bg-[#25D366] hover:bg-[#20BA5A]
        text-white rounded-full
        w-16 h-16 flex items-center justify-center
        shadow-2xl hover:shadow-3xl
        transition-all duration-300
        transform hover:scale-110
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
      `}
      aria-label="Fale conosco pelo WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8 animate-pulse" />
      
      {/* Badge de notificação opcional */}
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
        !
      </span>
    </a>
  )
}
