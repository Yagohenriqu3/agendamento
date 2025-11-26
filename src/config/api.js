// Configuração da API
// Em desenvolvimento: usa localhost
// Em produção (build): usa URL relativa (mesmo domínio)

const isDevelopment = import.meta.env.DEV

export const API_URL = isDevelopment 
  ? 'http://localhost:3001/api' 
  : '/api'

export default API_URL
