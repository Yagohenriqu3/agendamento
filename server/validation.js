import { z } from 'zod'

// Schema de validação para registro de cliente
export const registroSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  telefone: z.string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .regex(/^[0-9\s\-\(\)]+$/, 'Telefone deve conter apenas números'),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
})

// Schema de validação para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

// Schema de validação para criar agendamento
export const agendamentoSchema = z.object({
  cliente_id: z.number().int().positive('ID do cliente inválido'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (formato: YYYY-MM-DD)'),
  horario: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido (formato: HH:MM)'),
  servicos: z.array(z.number().int().positive()).min(1, 'Selecione pelo menos um serviço'),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional()
})

// Schema de validação para criar serviço
export const servicoSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  duracao_minutos: z.number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima é 15 minutos')
    .max(480, 'Duração máxima é 480 minutos (8 horas)'),
  preco: z.number()
    .min(0, 'Preço não pode ser negativo')
    .max(99999.99, 'Preço máximo é 99999.99'),
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
})

// Schema de validação para colaborador
export const colaboradorSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .optional(),
  telefone: z.string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .regex(/^[0-9\s\-\(\)]+$/, 'Telefone deve conter apenas números')
    .optional(),
  especialidade: z.string()
    .max(100, 'Especialidade deve ter no máximo 100 caracteres')
    .optional()
})

// Middleware para validar dados com Zod
export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: errors 
        })
      }
      next(error)
    }
  }
}
