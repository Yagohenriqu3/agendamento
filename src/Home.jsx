import Hero from './Section/Hero'
import NavMenu from './componentes/NavMenu'
import Sobre from './Section/Sobre'
import Servicos from './Section/Servicos'
import Depoimentos from './Section/Depoimentos'
import Contato from './Section/Contato'
import { Link } from 'react-router-dom'

function Home() {


  return (
    <>
      <NavMenu/>
       <Hero/> 
       <Sobre/>
       <Servicos/>
       <Depoimentos/>
       <Contato/>
       
      
    </>
  )
}

export default Home
