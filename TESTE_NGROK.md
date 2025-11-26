# 🚀 GUIA RÁPIDO - NGROK

## ✅ O que foi feito:

1. ✅ Servidor atualizado para servir frontend buildado
2. ✅ API_URL centralizado que funciona em dev e produção
3. ✅ Arquivos principais atualizados (PainelAdmin, Agendamento, MeusAgendamentos)

## 📋 Passo a Passo para Testar:

### 1. Build do Frontend
```powershell
npm run build
```

### 2. Iniciar o Servidor (Terminal 1)
```powershell
node server/index.js
```

Você deve ver:
```
✅ Servindo frontend em modo produção
🚀 Servidor rodando na porta 3001
```

### 3. Testar Localmente
Abra: `http://localhost:3001`
- Se funcionar, está pronto para ngrok!

### 4. Ngrok (Terminal 2)
```powershell
ngrok http 3001
```

Copie a URL que aparecer (tipo: `https://abc123.ngrok-free.app`)

### 5. Acesse pelo Ngrok
Cole a URL no navegador e teste!

## ⚠️ IMPORTANTE:

**Arquivos que ainda precisam ser atualizados manualmente:**
- `src/pages/Login.jsx`
- `src/pages/LoginCliente.jsx`
- `src/pages/MeusDados.jsx`
- `src/pages/FichaAnamnese.jsx`

Para atualizar, adicione no início de cada arquivo:
```javascript
import API_URL from '../config/api'
```

E remova a linha:
```javascript
const API_URL = 'http://localhost:3001/api'
```

## 🐛 Se der erro:

1. **Página em branco**: Rode `npm run build` novamente
2. **API não funciona**: Verifique se o servidor está rodando
3. **Ngrok não conecta**: Reinicie o ngrok

## 💡 Dica:

Toda vez que mudar o código frontend, rode:
```powershell
npm run build
```

E reinicie o servidor!
