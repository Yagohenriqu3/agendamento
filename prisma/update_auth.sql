-- Adicionar campo isAdmin na tabela Cliente
ALTER TABLE Cliente ADD COLUMN isAdmin BOOLEAN DEFAULT FALSE;

-- Criar um usuário administrador
INSERT INTO Cliente (nome, email, telefone, password, isAdmin, createdAt) 
VALUES ('Administrador', 'admin@belleza.com', '(00) 00000-0000', 'admin123', TRUE, NOW());

-- Remover tabela Admin (não é mais necessária)
-- DROP TABLE IF EXISTS Admin;
