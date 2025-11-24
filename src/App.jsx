import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home.jsx'
import Agendamento from './pages/Agendamento.jsx'
import SobreNos from './pages/SobreNos.jsx'
import LoginCliente from './pages/LoginCliente.jsx'
import PainelAdmin from './pages/PainelAdmin.jsx'
import MeusDados from './pages/MeusDados.jsx'
import MeusAgendamentos from './pages/MeusAgendamentos.jsx'
import './App.css'


function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginCliente />} />
        <Route path="/agendamento" element={<Agendamento />} />
        <Route path="/sobre-nos" element={<SobreNos />} />
        <Route path="/meus-dados" element={<MeusDados />} />
        <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
        <Route path="/admin/painel" element={<PainelAdmin />} />
      </Routes>
    </Router>
  )
}

export default App
