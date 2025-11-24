-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS Admin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir admin padrão (usuário: admin, senha: admin123)
-- Nota: Em produção, use bcrypt para hash de senhas
INSERT INTO Admin (username, password, nome) VALUES
('admin', 'admin123', 'Administrador');
