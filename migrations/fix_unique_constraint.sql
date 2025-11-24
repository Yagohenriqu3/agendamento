-- Remover constraint antiga que impede múltiplos agendamentos no mesmo horário
ALTER TABLE Agendamento 
DROP INDEX Agendamento_data_horario_key;

-- Adicionar nova constraint que permite múltiplos agendamentos no mesmo horário
-- desde que sejam com colaboradores diferentes
ALTER TABLE Agendamento 
ADD UNIQUE INDEX Agendamento_data_horario_colaborador_key (data, horario, colaboradorId);
