import video1 from '../assets/4855893-hd_1080_1920_30fps.mp4'
import video2 from '../assets/5534664-uhd_2160_3840_30fps.mp4'
import video3 from '../assets/5534665-uhd_2160_3840_30fps.mp4'
import video4 from '../assets/5534667-uhd_2160_3840_30fps.mp4'
import { Link } from 'react-router-dom'
import { FaCalendarCheck, FaWhatsapp } from 'react-icons/fa'

export default function Hero() {
  // Número de WhatsApp (atualizar com o número real)
  const whatsappUrl = 'https://wa.me/5511999999999?text=' + encodeURIComponent('Olá! Gostaria de agendar minha avaliação gratuita.')
  
  return (
    <section id="home" className='flex justify-center items-center w-full '>
      <div className=' flex flex-col items-center text-center  '>
       
       <div className='md:flex hidden justify-center bg-linear-to-r from-[#6EC1E4] to-[#58a3c4] w-full pt-30 pb-30'>
       <video src={video2} 
       autoPlay 
       loop 
       muted
       className='w-[17em] mr-4 rounded-2xl hover:scale-110 duration-300  hover:p-1 '></video>

       <video src={video4} 
       autoPlay 
       loop 
       muted
       className='w-[17em] mr-4 rounded-2xl hover:scale-110 duration-300  hover:p-1 '></video>

       <video src={video1} 
       autoPlay 
       loop 
       muted
       className='w-[17em] mr-4 rounded-2xl hover:scale-110 duration-300  hover:p-1 '></video>

       <video src={video3} 
       autoPlay 
       loop 
       muted
       className='w-[17em] mr-2 rounded-2xl hover:scale-110 duration-300  hover:p-1 '></video>
       </div>
      
      <div className=' md:p-4 pl-20 pr-20 mb:mt-20 mb-20    '>
        <h1 className='text-[3em] mb-5 text-[#6EC1E4] font-bold'>
          Realce sua Beleza Natural com Tratamentos Estéticos Avançados
        </h1>
        <h2 className='text-[#222222] md:m-6 mt-10  text-[1.7em]'> 
          Na Belleza Estética, oferecemos cuidados personalizados para você conquistar autoestima, bem-estar e resultados visíveis. Agende sua avaliação e descubra a diferença de um atendimento profissional e acolhedor.
        </h2>
        
        {/* CTAs com destaque */}
        <div className='flex flex-col md:flex-row gap-4 justify-center items-center mt-8'>
          <Link 
            to="/agendamento"
            className='bg-[#6EC1E4] text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-[#58a3c4] duration-300 hover:scale-105 shadow-xl hover:shadow-2xl'
          >
            <FaCalendarCheck />
            Agendar Avaliação Gratuita
          </Link>
          
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className='bg-[#25D366] text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-[#20BA5A] duration-300 hover:scale-105 shadow-xl hover:shadow-2xl'
          >
            <FaWhatsapp />
            Fale Conosco
          </a>
        </div>
        
        {/* Value proposition badges */}
        <div className='flex flex-wrap justify-center gap-6 mt-10 text-gray-700'>
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>✓</span>
            <span className='font-semibold'>Primeira Consulta Grátis</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>✓</span>
            <span className='font-semibold'>Mais de 10 Anos de Experiência</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>✓</span>
            <span className='font-semibold'>Produtos Certificados Anvisa</span>
          </div>
        </div>
      </div>
      </div>
      
    </section>
  )
}
