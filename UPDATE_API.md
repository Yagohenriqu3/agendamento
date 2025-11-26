# Script para atualizar API_URL em todos os arquivos

Arquivos a atualizar:
- src/pages/Agendamento.jsx
- src/pages/MeusDados.jsx
- src/pages/MeusAgendamentos.jsx
- src/pages/LoginCliente.jsx
- src/pages/Login.jsx
- src/pages/FichaAnamnese.jsx

## Mudanças necessárias:

1. Adicionar import no topo:
```javascript
import API_URL from '../config/api'
```

2. Remover a linha:
```javascript
const API_URL = 'http://localhost:3001/api'
```

Isso permite que:
- **Desenvolvimento (npm run dev)**: use `http://localhost:3001/api`
- **Produção (npm run build + ngrok)**: use `/api` (URL relativa)
