import video1 from '../assets/4855893-hd_1080_1920_30fps.mp4'
import video2 from '../assets/5534664-uhd_2160_3840_30fps.mp4'
import video3 from '../assets/5534665-uhd_2160_3840_30fps.mp4'
import video4 from '../assets/5534667-uhd_2160_3840_30fps.mp4'

export default function Hero() {
  return (
    <section className='flex justify-center items-center w-full '>
      <div className=' flex flex-col items-center text-center  '>
       
       <div className='md:flex hidden justify-center bg-[#6EC1E4] w-full pt-30 pb-30'>
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
        <h1 className='text-[3em] mb-5 text-[#6EC1E4] font-bold'>Realce sua Beleza Natural com Tratamentos Estéticos Avançados</h1>
        <h2 className='text-[#222222] md:m-6 mt-10  text-[1.7em]'> Na Belleza Estética, oferecemos cuidados personalizados para você conquistar autoestima, bem-estar e resultados visíveis. Agende sua avaliação e descubra a diferença de um atendimento profissional e acolhedor. 
        <button className='bg-[#6EC1E4] text-white p-1 pl-3 pr-3 mt-4 cursor-pointer ml-3 rounded-2xl hover:bg-[#58a3c4] duration-300 hover:scale-105'>Agendar Avaliação Gratuita</button></h2>
      </div>
      </div>
      
    </section>
  )
}
