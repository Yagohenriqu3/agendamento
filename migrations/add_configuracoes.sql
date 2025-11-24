-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS Configuracao (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'json'
  descricao TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO Configuracao (chave, valor, tipo, descricao) VALUES
('horario_abertura', '08:00', 'string', 'Horário de abertura da empresa'),
('horario_fechamento', '18:00', 'string', 'Horário de fechamento da empresa'),
('dias_funcionamento', '["1","2","3","4","5","6"]', 'json', 'Dias da semana que funciona (0=Domingo, 1=Segunda, ..., 6=Sábado)'),
('dias_antecedencia_max', '30', 'number', 'Máximo de dias de antecedência permitidos para agendamento'),
('intervalo_agendamento', '30', 'number', 'Intervalo em minutos entre agendamentos')
ON DUPLICATE KEY UPDATE 
  valor = VALUES(valor),
  updatedAt = CURRENT_TIMESTAMP;
