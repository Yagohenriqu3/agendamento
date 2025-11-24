-- Adiciona coluna duracaoTotal na tabela Agendamento
ALTER TABLE Agendamento ADD COLUMN duracaoTotal INT NULL COMMENT 'Duração total em minutos (para agendamentos combinados)';

-- Atualiza registros existentes com a duração do serviço
UPDATE Agendamento a
JOIN Servico s ON a.servicoId = s.id
SET a.duracaoTotal = s.duracao
WHERE a.duracaoTotal IS NULL;
