import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavMenu from '../componentes/NavMenu'
import API_URL from '../config/api'

export default function FichaAnamnese() {
  const [etapaAtual, setEtapaAtual] = useState(1)
  const [clienteInfo, setClienteInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    // 1. Dados Pessoais
    nomeCompleto: '',
    idade: '',
    dataNascimento: '',
    telefone: '',
    profissao: '',
    endereco: '',
    comoSoube: '',
    
    // 2. Queixa Principal
    motivoTratamento: '',
    tempoQueixa: '',
    tratamentoAnterior: '',
    
    // 3. Histórico de Saúde
    doencas: {
      hipertensao: false,
      diabetes: false,
      problemasCardiacos: false,
      problemasRenais: false,
      problemasHepaticos: false,
      disturbiosHormonais: false,
      alergiaMedicamentos: false,
      alergiaDescricao: '',
      problemasCirculatorios: false,
      trombose: false,
      convulsoes: false,
      asma: false,
      problemasTireoide: false,
      doencasAutoimunes: false,
      historicoCancer: false
    },
    
    // 4. Medicamentos
    medicamentosContinuos: '',
    usaAnticoagulantes: '',
    terapiaHormonal: '',
    usaCorticoides: '',
    
    // 5. Hábitos de Vida
    fuma: '',
    fumaQuantidade: '',
    bebeAlcool: '',
    bebeFrequencia: '',
    atividadeFisica: '',
    hidratacaoDiaria: '',
    qualidadeSono: '',
    
    // 6. Histórico Estético/Cirúrgico
    cirurgias: {
      lipoaspiracao: false,
      abdominoplastia: false,
      cirurgiaFacial: false,
      implantes: false,
      outras: ''
    },
    tratamentosEsteticos: {
      limpezaPele: false,
      peeling: false,
      radiofrequencia: false,
      massagemModeladora: false,
      drenagemLinfatica: false,
      microagulhamento: false,
      preenchimento: false,
      toxinaBotulinica: false,
      laser: false,
      outros: ''
    },
    reacoesAdversas: '',
    
    // 7. Condições Dermatológicas
    alergiasCutaneas: '',
    usaAcidos: '',
    exposicaoSolar: '',
    tipoPele: '',
    manchasMelasma: '',
    cicatrizesHipertroficas: '',
    
    // 8. Estética Facial
    objetivoFacial: [],
    usaProtetorSolar: '',
    rotinaSkincareAtual: '',
    sensibilidadeToque: '',
    procedimentosFaciaisRecentes: '',
    
    // 9. Estética Corporal
    queixaCorporal: [],
    cicloMenstrualRegular: '',
    gestanteAmamentando: '',
    possuiDIU: '',
    tipoDIU: '',
    
    // 10. Contraindicações
    contraindicacoes: {
      marcapasso: false,
      metalCorpo: false,
      epilepsia: false,
      infeccoesAtivas: false,
      feridasPele: false,
      febreMalEstar: false,
      doencasTransmissiveis: false
    },
    cicatrizPele: '',
    corPele: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('clienteToken')
    const email = localStorage.getItem('clienteEmail')
    
    if (!token || !email) {
      alert('Você precisa estar logado para preencher a ficha de anamnese')
      navigate('/login-cliente')
      return
    }

    carregarDadosCliente(email)
  }, [navigate])

  const carregarDadosCliente = async (email) => {
    try {
      const response = await fetch(`${API_URL}/clientes?email=${email}`)
      const clienteData = await response.json()
      
      if (clienteData.length > 0) {
        const cliente = clienteData[0]
        setClienteInfo(cliente)
        
        // Preencher dados pessoais já existentes
        setFormData(prev => ({
          ...prev,
          nomeCompleto: cliente.nome || '',
          telefone: cliente.telefone || '',
          dataNascimento: cliente.dataNascimento || ''
        }))

        // Carregar ficha existente se houver
        if (cliente.fichaAnamnese) {
          const ficha = JSON.parse(cliente.fichaAnamnese)
          setFormData(prev => ({ ...prev, ...ficha }))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleArrayChange = (field, value) => {
    setFormData(prev => {
      const currentArray = prev[field]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      
      return { ...prev, [field]: newArray }
    })
  }

  const proximaEtapa = () => {
    if (etapaAtual < 10) {
      setEtapaAtual(etapaAtual + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const salvarFicha = async () => {
    if (!clienteInfo) return

    try {
      setLoading(true)
      
      const response = await fetch(`${API_URL}/admin/clientes/${clienteInfo.id}/anamnese`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fichaAnamnese: JSON.stringify(formData) })
      })

      if (response.ok) {
        alert('Ficha de anamnese salva com sucesso!')
        navigate('/meus-agendamentos')
      } else {
        throw new Error('Erro ao salvar ficha')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar ficha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const renderEtapa = () => {
    switch(etapaAtual) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#6EC1E4] mb-4">1. Dados Pessoais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nome Completo *</label>
                <input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Idade *</label>
                <input
                  type="number"
                  name="idade"
                  value={formData.idade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Data de Nascimento *</label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Telefone *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Profissão</label>
                <input
                  type="text"
                  name="profissao"
                  value={formData.profissao}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Como soube da clínica?</label>
                <input
                  type="text"
                  name="comoSoube"
                  value={formData.comoSoube}
                  onChange={handleInputChange}
                  placeholder="Ex: Instagram, indicação, etc"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Endereço Completo</label>
              <textarea
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#6EC1E4] mb-4">2. Queixa Principal</h2>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">O que motivou a procura pelo tratamento? *</label>
              <textarea
                name="motivoTratamento"
                value={formData.motivoTratamento}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                placeholder="Descreva o que te trouxe até aqui..."
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Há quanto tempo existe essa queixa?</label>
              <input
                type="text"
                name="tempoQueixa"
                value={formData.tempoQueixa}
                onChange={handleInputChange}
                placeholder="Ex: 6 meses, 2 anos..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Já realizou algum tratamento estético antes? Qual?</label>
              <textarea
                name="tratamentoAnterior"
                value={formData.tratamentoAnterior}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                placeholder="Descreva tratamentos anteriores..."
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#6EC1E4] mb-4">3. Histórico de Saúde</h2>
            <p className="text-gray-600 mb-4">Marque todas as condições que se aplicam:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'hipertensao', label: 'Hipertensão' },
                { key: 'diabetes', label: 'Diabetes' },
                { key: 'problemasCardiacos', label: 'Problemas cardíacos' },
                { key: 'problemasRenais', label: 'Problemas renais' },
                { key: 'problemasHepaticos', label: 'Problemas hepáticos' },
                { key: 'disturbiosHormonais', label: 'Distúrbios hormonais' },
                { key: 'problemasCirculatorios', label: 'Problemas circulatórios (varizes, má circulação)' },
                { key: 'trombose', label: 'Trombose / embolia' },
                { key: 'convulsoes', label: 'Convulsões' },
                { key: 'asma', label: 'Asma / bronquite' },
                { key: 'problemasTireoide', label: 'Problemas de tireoide' },
                { key: 'doencasAutoimunes', label: 'Doenças autoimunes' },
                { key: 'historicoCancer', label: 'Histórico de câncer' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.doencas[item.key]}
                    onChange={(e) => handleNestedChange('doencas', item.key, e.target.checked)}
                    className="w-5 h-5 text-[#6EC1E4] focus:ring-[#6EC1E4]"
                  />
                  <span className="text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <label className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.doencas.alergiaMedicamentos}
                  onChange={(e) => handleNestedChange('doencas', 'alergiaMedicamentos', e.target.checked)}
                  className="w-5 h-5 text-[#6EC1E4] focus:ring-[#6EC1E4] mt-1"
                />
                <div className="flex-1">
                  <span className="text-gray-700 font-semibold block mb-2">Alergias a medicamentos/cosméticos</span>
                  {formData.doencas.alergiaMedicamentos && (
                    <input
                      type="text"
                      value={formData.doencas.alergiaDescricao}
                      onChange={(e) => handleNestedChange('doencas', 'alergiaDescricao', e.target.value)}
                      placeholder="Quais medicamentos/cosméticos?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#6EC1E4] mb-4">4. Uso de Medicamentos</h2>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Faz uso de medicamentos contínuos? Quais?</label>
              <textarea
                name="medicamentosContinuos"
                value={formData.medicamentosContinuos}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                placeholder="Liste todos os medicamentos que usa regularmente..."
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Usa anticoagulantes ou anti-inflamatórios?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="usaAnticoagulantes"
                    value="sim"
                    checked={formData.usaAnticoagulantes === 'sim'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="usaAnticoagulantes"
                    value="nao"
                    checked={formData.usaAnticoagulantes === 'nao'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Faz terapia hormonal?</label>
              <input
                type="text"
                name="terapiaHormonal"
                value={formData.terapiaHormonal}
                onChange={handleInputChange}
                placeholder="Descreva qual tipo..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Usa corticoides?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="usaCorticoides"
                    value="sim"
                    checked={formData.usaCorticoides === 'sim'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="usaCorticoides"
                    value="nao"
                    checked={formData.usaCorticoides === 'nao'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#6EC1E4] mb-4">5. Hábitos de Vida</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Fuma?</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="fuma"
                      value="sim"
                      checked={formData.fuma === 'sim'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#6EC1E4]"
                    />
                    <span>Sim</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="fuma"
                      value="nao"
                      checked={formData.fuma === 'nao'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#6EC1E4]"
                    />
                    <span>Não</span>
                  </label>
                </div>
                {formData.fuma === 'sim' && (
                  <input
                    type="text"
                    name="fumaQuantidade"
                    value={formData.fumaQuantidade}
                    onChange={handleInputChange}
                    placeholder="Quantidade por dia"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                  />
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Consome bebida alcoólica?</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="bebeAlcool"
                      value="sim"
                      checked={formData.bebeAlcool === 'sim'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#6EC1E4]"
                    />
                    <span>Sim</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="bebeAlcool"
                      value="nao"
                      checked={formData.bebeAlcool === 'nao'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#6EC1E4]"
                    />
                    <span>Não</span>
                  </label>
                </div>
                {formData.bebeAlcool === 'sim' && (
                  <input
                    type="text"
                    name="bebeFrequencia"
                    value={formData.bebeFrequencia}
                    onChange={handleInputChange}
                    placeholder="Frequência"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                  />
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Atividade física</label>
                <input
                  type="text"
                  name="atividadeFisica"
                  value={formData.atividadeFisica}
                  onChange={handleInputChange}
                  placeholder="Tipo e frequência"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Hidratação diária (litros)</label>
                <input
                  type="text"
                  name="hidratacaoDiaria"
                  value={formData.hidratacaoDiaria}
                  onChange={handleInputChange}
                  placeholder="Ex: 2 litros"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Qualidade do sono</label>
              <div className="flex gap-4">
                {['boa', 'média', 'ruim'].map(opcao => (
                  <label key={opcao} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="qualidadeSono"
                      value={opcao}
                      checked={formData.qualidadeSono === opcao}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#6EC1E4]"
                    />
                    <span className="capitalize">{opcao}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#6EC1E4] mb-4">6. Histórico Estético / Cirúrgico</h2>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Cirurgias anteriores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'lipoaspiracao', label: 'Lipoaspiração' },
                  { key: 'abdominoplastia', label: 'Abdominoplastia' },
                  { key: 'cirurgiaFacial', label: 'Cirurgia facial' },
                  { key: 'implantes', label: 'Implantes / próteses' }
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cirurgias[item.key]}
                      onChange={(e) => handleNestedChange('cirurgias', item.key, e.target.checked)}
                      className="w-5 h-5 text-[#6EC1E4] focus:ring-[#6EC1E4]"
                    />
                    <span className="text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
              <input
                type="text"
                value={formData.cirurgias.outras}
                onChange={(e) => handleNestedChange('cirurgias', 'outras', e.target.value)}
                placeholder="Outras cirurgias..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] mt-3"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Tratamentos estéticos anteriores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'limpezaPele', label: 'Limpeza de pele' },
                  { key: 'peeling', label: 'Peeling' },
                  { key: 'radiofrequencia', label: 'Radiofrequência' },
                  { key: 'massagemModeladora', label: 'Massagem modeladora' },
                  { key: 'drenagemLinfatica', label: 'Drenagem linfática' },
                  { key: 'microagulhamento', label: 'Microagulhamento' },
                  { key: 'preenchimento', label: 'Preenchimento' },
                  { key: 'toxinaBotulinica', label: 'Toxina botulínica' },
                  { key: 'laser', label: 'Laser' }
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tratamentosEsteticos[item.key]}
                      onChange={(e) => handleNestedChange('tratamentosEsteticos', item.key, e.target.checked)}
                      className="w-5 h-5 text-[#6EC1E4] focus:ring-[#6EC1E4]"
                    />
                    <span className="text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
              <input
                type="text"
                value={formData.tratamentosEsteticos.outros}
                onChange={(e) => handleNestedChange('tratamentosEsteticos', 'outros', e.target.value)}
                placeholder="Outros tratamentos..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] mt-3"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Reações adversas anteriores? Quais?</label>
              <textarea
                name="reacoesAdversas"
                value={formData.reacoesAdversas}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                placeholder="Descreva qualquer reação adversa a tratamentos..."
              />
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#6EC1E4] mb-4">7. Condições Dermatológicas</h2>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Alergias cutâneas?</label>
              <input
                type="text"
                name="alergiasCutaneas"
                value={formData.alergiasCutaneas}
                onChange={handleInputChange}
                placeholder="Descreva..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Uso de ácidos no rosto?</label>
              <input
                type="text"
                name="usaAcidos"
                value={formData.usaAcidos}
                onChange={handleInputChange}
                placeholder="Quais ácidos?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Exposição solar</label>
              <div className="flex gap-4">
                {['baixa', 'moderada', 'alta'].map(nivel => (
                  <label key={nivel} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exposicaoSolar"
                      value={nivel}
                      checked={formData.exposicaoSolar === nivel}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#6EC1E4]"
                    />
                    <span className="capitalize">{nivel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Tipo de pele</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Seca', 'Oleosa', 'Mista', 'Sensível', 'Acneica'].map(tipo => (
                  <label key={tipo} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoPele"
                      value={tipo}
                      checked={formData.tipoPele === tipo}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#6EC1E4]"
                    />
                    <span>{tipo}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Histórico de manchas, melasma ou rosácea?</label>
              <textarea
                name="manchasMelasma"
                value={formData.manchasMelasma}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Cicatrizes hipertróficas / quelóides?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cicatrizesHipertroficas"
                    value="sim"
                    checked={formData.cicatrizesHipertroficas === 'sim'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cicatrizesHipertroficas"
                    value="nao"
                    checked={formData.cicatrizesHipertroficas === 'nao'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Cor da pele</label>
              <input
                type="text"
                name="corPele"
                value={formData.corPele}
                onChange={handleInputChange}
                placeholder="Ex: Clara, Morena, Negra..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#6EC1E4] mb-4">8. Estética Facial</h2>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Objetivo principal (pode marcar mais de um)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Redução de acne',
                  'Rejuvenescimento',
                  'Melhora de manchas',
                  'Controle de oleosidade',
                  'Hidratação',
                  'Firmeza da pele'
                ].map(objetivo => (
                  <label key={objetivo} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.objetivoFacial.includes(objetivo)}
                      onChange={() => handleArrayChange('objetivoFacial', objetivo)}
                      className="w-5 h-5 text-[#6EC1E4] focus:ring-[#6EC1E4]"
                    />
                    <span className="text-gray-700">{objetivo}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Usa protetor solar? Com que frequência?</label>
              <input
                type="text"
                name="usaProtetorSolar"
                value={formData.usaProtetorSolar}
                onChange={handleInputChange}
                placeholder="Ex: Diariamente, às vezes..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Rotina de skincare atual</label>
              <textarea
                name="rotinaSkincareAtual"
                value={formData.rotinaSkincareAtual}
                onChange={handleInputChange}
                rows="3"
                placeholder="Descreva sua rotina de cuidados com a pele..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Alguma sensibilidade ao toque?</label>
              <input
                type="text"
                name="sensibilidadeToque"
                value={formData.sensibilidadeToque}
                onChange={handleInputChange}
                placeholder="Descreva..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Procedimentos faciais recentes?</label>
              <textarea
                name="procedimentosFaciaisRecentes"
                value={formData.procedimentosFaciaisRecentes}
                onChange={handleInputChange}
                rows="2"
                placeholder="Quando e quais procedimentos..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#6EC1E4] mb-4">9. Estética Corporal</h2>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Queixa principal (pode marcar mais de uma)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Gordura localizada',
                  'Celulite',
                  'Flacidez',
                  'Edema / inchaço',
                  'Estrias',
                  'Pós-operatório'
                ].map(queixa => (
                  <label key={queixa} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.queixaCorporal.includes(queixa)}
                      onChange={() => handleArrayChange('queixaCorporal', queixa)}
                      className="w-5 h-5 text-[#6EC1E4] focus:ring-[#6EC1E4]"
                    />
                    <span className="text-gray-700">{queixa}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Ciclo menstrual regular?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cicloMenstrualRegular"
                    value="sim"
                    checked={formData.cicloMenstrualRegular === 'sim'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cicloMenstrualRegular"
                    value="nao"
                    checked={formData.cicloMenstrualRegular === 'nao'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Gestante ou amamentando?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gestanteAmamentando"
                    value="sim"
                    checked={formData.gestanteAmamentando === 'sim'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gestanteAmamentando"
                    value="nao"
                    checked={formData.gestanteAmamentando === 'nao'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Possui DIU?</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="possuiDIU"
                    value="sim"
                    checked={formData.possuiDIU === 'sim'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="possuiDIU"
                    value="nao"
                    checked={formData.possuiDIU === 'nao'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6EC1E4]"
                  />
                  <span>Não</span>
                </label>
              </div>
              {formData.possuiDIU === 'sim' && (
                <input
                  type="text"
                  name="tipoDIU"
                  value={formData.tipoDIU}
                  onChange={handleInputChange}
                  placeholder="Qual tipo?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
                />
              )}
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#6EC1E4] mb-4">10. Contraindicações Específicas</h2>
            <p className="text-gray-600 mb-4">Marque todas que se aplicam:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'marcapasso', label: 'Marcapasso' },
                { key: 'metalCorpo', label: 'Metal no corpo' },
                { key: 'epilepsia', label: 'Epilepsia' },
                { key: 'infeccoesAtivas', label: 'Infecções ativas' },
                { key: 'feridasPele', label: 'Feridas na pele' },
                { key: 'febreMalEstar', label: 'Febre ou mal-estar recente' },
                { key: 'doencasTransmissiveis', label: 'Doenças transmissíveis' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.contraindicacoes[item.key]}
                    onChange={(e) => handleNestedChange('contraindicacoes', item.key, e.target.checked)}
                    className="w-5 h-5 text-[#6EC1E4] focus:ring-[#6EC1E4]"
                  />
                  <span className="text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Alguma cicatriz na pele?</label>
              <textarea
                name="cicatrizPele"
                value={formData.cicatrizPele}
                onChange={handleInputChange}
                rows="2"
                placeholder="Descreva localização e características..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4]"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Importante:</strong> Todas as informações fornecidas são confidenciais e serão utilizadas exclusivamente para garantir a segurança e eficácia do seu tratamento estético.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <NavMenu />
      <div className="min-h-screen bg-linear-to-b from-[#EAF6F6] to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[#6EC1E4] mb-2">
              Ficha de Anamnese
            </h1>
            <p className="text-gray-600">
              Preencha todas as informações com atenção. Seus dados estão protegidos e são confidenciais.
            </p>
          </div>

          {/* Indicador de progresso */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Etapa {etapaAtual} de 10</span>
              <span className="text-sm text-gray-600">{Math.round((etapaAtual / 10) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[#6EC1E4] h-3 rounded-full transition-all duration-300"
                style={{ width: `${(etapaAtual / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {renderEtapa()}

            {/* Botões de navegação */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={etapaAnterior}
                disabled={etapaAtual === 1}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Anterior
              </button>

              {etapaAtual < 10 ? (
                <button
                  onClick={proximaEtapa}
                  className="px-6 py-3 bg-[#6EC1E4] text-white rounded-lg font-semibold hover:bg-[#5ab0d3] transition-all shadow-lg"
                >
                  Próxima →
                </button>
              ) : (
                <button
                  onClick={salvarFicha}
                  disabled={loading}
                  className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : '✓ Finalizar e Salvar'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
