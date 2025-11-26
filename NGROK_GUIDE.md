# 🚀 Guia para Colocar Online com Ngrok

## Passo a Passo

### 1. Build do Frontend
```bash
npm run build
```
Isso cria a pasta `dist/` com o frontend otimizado.

### 2. Iniciar o Servidor
```bash
node server/index.js
```
O servidor vai rodar na porta 3001 e servir tanto a API quanto o frontend.

### 3. Expor com Ngrok (em outro terminal)
```bash
ngrok http 3001
```

### 4. Usar a URL do Ngrok
O ngrok vai gerar uma URL tipo: `https://abc123.ngrok-free.app`

**IMPORTANTE:** Você precisa atualizar o `API_URL` no frontend para usar a mesma URL base!

## Como Funciona

✅ **Rotas da API:** `https://sua-url.ngrok.io/api/*`
✅ **Frontend:** `https://sua-url.ngrok.io/` (qualquer outra rota)

O servidor está configurado para:
1. Primeiro tentar responder com rotas da API (`/api/*`)
2. Se não for API, servir os arquivos estáticos do React (pasta `dist/`)
3. Qualquer rota desconhecida retorna `index.html` (para o React Router funcionar)

## ⚠️ Problema Comum: API_URL

Os componentes React estão usando:
```javascript
const API_URL = 'http://localhost:3001/api'
```

Para funcionar online, você tem 2 opções:

### Opção 1: Usar URL Relativa (Recomendado)
Mude em todos os arquivos de:
```javascript
const API_URL = 'http://localhost:3001/api'
```
Para:
```javascript
const API_URL = '/api'
```

### Opção 2: Variável de Ambiente
1. Crie `.env` no frontend:
```
VITE_API_URL=/api
```

2. Use nos componentes:
```javascript
const API_URL = import.meta.env.VITE_API_URL || '/api'
```

## 🔄 Fluxo Completo

```bash
# Terminal 1 - Build e iniciar servidor
npm run build
node server/index.js

# Terminal 2 - Ngrok
ngrok http 3001
```

Pronto! Acesse a URL do ngrok no navegador.

## 🐛 Troubleshooting

### Frontend não carrega
- Verifique se a pasta `dist/` existe
- Rode `npm run build` novamente

### API não funciona
- Veja o console do navegador (F12)
- Verifique se as URLs estão corretas
- Confirme que o servidor está rodando

### Ngrok mostra erro
- Certifique-se que a porta 3001 não está bloqueada
- Tente reiniciar o ngrok
- Versão gratuita tem limite de requisições

## 📝 Notas

- Ngrok gratuito: URL muda toda vez que reinicia
- Banco de dados ainda é local (MySQL no seu PC)
- Para produção real, considere hospedar em servidor cloud
