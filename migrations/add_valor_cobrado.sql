-- Adicionar coluna valorCobrado na tabela Agendamento
ALTER TABLE Agendamento ADD COLUMN valorCobrado DECIMAL(10, 2) NULL;

-- Copiar os valores atuais dos serviços para os agendamentos existentes
UPDATE Agendamento a
JOIN Servico s ON a.servicoId = s.id
SET a.valorCobrado = s.preco
WHERE a.valorCobrado IS NULL;
