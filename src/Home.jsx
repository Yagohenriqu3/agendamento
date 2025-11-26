import Hero from './Section/Hero'
import NavMenu from './componentes/NavMenu'
import Sobre from './Section/Sobre'
import Servicos from './Section/Servicos'
import Estatisticas from './Section/Estatisticas'
import Diferenciais from './Section/Diferenciais'
import FAQ from './Section/FAQ'
import Depoimentos from './Section/Depoimentos'
import Contato from './Section/Contato'
import WhatsAppButton from './componentes/WhatsAppButton'
import { Link } from 'react-router-dom'

function Home() {


  return (
    <>
      <NavMenu/>
      <Hero/> 
      <Estatisticas/>
      <Sobre/>
      <Servicos/>
      <Diferenciais/>
      <Depoimentos/>
      <FAQ/>
      <Contato/>
      <WhatsAppButton/>
    </>
  )
}

export default Home
