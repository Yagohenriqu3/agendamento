# Sistema de Agendamento - Belleza Estética

Sistema completo de agendamento para clínica de estética com integração MySQL via Prisma.

## 🚀 Configuração Inicial

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados MySQL

Edite o arquivo `.env` e configure sua conexão MySQL:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

**Exemplo:**
```env
DATABASE_URL="mysql://root:senha123@localhost:3306/agendamento"
```

**Nota:** Se você não tem senha no MySQL (comum em desenvolvimento), use:
```env
DATABASE_URL="mysql://root:@localhost:3306/agendamento"
```

### 3. Criar e Migrar o Banco de Dados

```bash
# Gera o Prisma Client e cria as tabelas no banco
npx prisma migrate dev --name init

# Popular o banco com serviços iniciais
npx prisma db seed
```

### 4. Verificar o Banco de Dados (Opcional)

Para visualizar os dados no Prisma Studio:
```bash
npx prisma studio
```

## 🏃 Executar o Projeto

Você precisa rodar dois servidores:

### Terminal 1 - Backend (API)
```bash
npm run server
```
O servidor API rodará em: http://localhost:3001

### Terminal 2 - Frontend (React)
```bash
npm run dev
```
O frontend rodará em: http://localhost:5173

## 📦 Estrutura do Banco de Dados

### Tabelas Criadas:

- **Cliente**: Armazena informações dos clientes
- **Servico**: Lista de serviços disponíveis
- **Agendamento**: Registros de agendamentos (com controle de horários únicos)

### Recursos:

✅ Horários únicos por data (não permite duplicação)  
✅ Listagem de horários disponíveis em tempo real  
✅ Serviços com preço e duração  
✅ Status de agendamento (confirmado, cancelado, concluído)  

## 🛠️ Tecnologias

- **Frontend**: React + Vite + TailwindCSS + React Router
- **Backend**: Node.js + Express
- **Banco de Dados**: MySQL + Prisma ORM
- **Validação**: Horários únicos por data/hora

## 📝 Endpoints da API

### GET `/api/servicos`
Lista todos os serviços ativos

### GET `/api/horarios-disponiveis?data=YYYY-MM-DD`
Retorna horários disponíveis para uma data específica

### POST `/api/agendamentos`
Cria um novo agendamento
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "servicoId": 1,
  "data": "2025-11-25",
  "horario": "14:00",
  "observacoes": "Primeira vez"
}
```

### GET `/api/agendamentos`
Lista agendamentos (com filtros opcionais)

### PATCH `/api/agendamentos/:id/cancelar`
Cancela um agendamento específico

## ⚠️ Troubleshooting

### Erro de conexão com MySQL:
- Verifique se o MySQL está rodando
- Confirme o usuário e senha no `.env`
- Certifique-se que o banco de dados existe

### Erro "Port 3001 already in use":
- Pare outros processos usando a porta 3001
- Ou altere a porta no `server/index.js`

### Prisma Client não encontrado:
```bash
npx prisma generate
```
