import recepcao from '../assets/ChatGPT Image 4 de out. de 2025, 10_32_26.png'

export default function Sobre() {
  return (
    <section id="sobre" className="md:flex justify-center md:p-10 h-auto mb-20  ">
        <div>
            <img src={recepcao} alt="recepça" className='h-full' />
        </div>
        <div className="bg-[#6EC1E4] flex flex-col items-center md:w-[80vw] md:p-10 p-5 ">
        
        <h1 className="text-4xl font-bold md:mb-10 mb-5 text-center text-[#F9F9F9]">A Clínica de Estética que Valoriza Sua Beleza</h1>
        
        <p className="text-3xl text-center text-[#F9F9F9]">Há anos, a Belezza Estética se dedica a transformar vidas por meio de tratamentos estéticos faciais e corporais de alta qualidade. Nossa equipe de especialistas utiliza técnicas modernas e seguras para proporcionar resultados naturais e duradouros. Cada atendimento é personalizado, focado em suas necessidades, para que você se sinta confiante e renovada.</p>
        
        </div>
    </section>
  )
}
