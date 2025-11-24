-- Cria tabela de Colaboradores
CREATE TABLE IF NOT EXISTS Colaborador (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  especialidade VARCHAR(255),
  ativo BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_colaborador_ativo (ativo)
);

-- Cria tabela de relacionamento entre Colaboradores e Serviços
CREATE TABLE IF NOT EXISTS ColaboradorServico (
  id INT PRIMARY KEY AUTO_INCREMENT,
  colaboradorId INT NOT NULL,
  servicoId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (colaboradorId) REFERENCES Colaborador(id) ON DELETE CASCADE,
  FOREIGN KEY (servicoId) REFERENCES Servico(id) ON DELETE CASCADE,
  UNIQUE KEY unique_colaborador_servico (colaboradorId, servicoId),
  INDEX idx_colaborador_servico_colaborador (colaboradorId),
  INDEX idx_colaborador_servico_servico (servicoId)
);
