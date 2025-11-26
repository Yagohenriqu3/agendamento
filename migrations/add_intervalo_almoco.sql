-- Adicionar configurações de intervalo de almoço
INSERT INTO Configuracao (chave, valor, tipo, descricao) VALUES
('intervalo_almoco_ativo', 'false', 'boolean', 'Se verdadeiro, bloqueia horários durante o intervalo de almoço'),
('intervalo_almoco_inicio', '12:00', 'string', 'Horário de início do intervalo de almoço (formato HH:mm)'),
('intervalo_almoco_fim', '13:00', 'string', 'Horário de fim do intervalo de almoço (formato HH:mm)')
ON DUPLICATE KEY UPDATE 
  valor = VALUES(valor),
  descricao = VALUES(descricao);
