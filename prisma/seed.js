import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient({})

async function main() {
  console.log('🌱 Iniciando seed...')

  // Criar serviços
  const servicos = [
    {
      nome: 'Limpeza de Pele',
      duracao: 60,
      preco: 150.00,
      descricao: 'Limpeza profunda da pele com extração de cravos e hidratação',
      ativo: true
    },
    {
      nome: 'Botox',
      duracao: 30,
      preco: 800.00,
      descricao: 'Aplicação de toxina botulínica para redução de rugas',
      ativo: true
    },
    {
      nome: 'Preenchimento Facial',
      duracao: 45,
      preco: 1200.00,
      descricao: 'Preenchimento com ácido hialurônico',
      ativo: true
    },
    {
      nome: 'Peeling Químico',
      duracao: 60,
      preco: 300.00,
      descricao: 'Renovação celular através de ácidos',
      ativo: true
    },
    {
      nome: 'Tratamento a Laser',
      duracao: 45,
      preco: 500.00,
      descricao: 'Tratamento com laser para manchas e rejuvenescimento',
      ativo: true
    },
    {
      nome: 'Massagem Facial',
      duracao: 45,
      preco: 120.00,
      descricao: 'Massagem relaxante e drenante para o rosto',
      ativo: true
    }
  ]

  for (const servico of servicos) {
    await prisma.servico.upsert({
      where: { nome: servico.nome },
      update: {},
      create: servico
    })
  }

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
