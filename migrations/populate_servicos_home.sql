-- Script para limpar serviços antigos e adicionar os serviços da home
-- Execute este script no MySQL

-- 1. Deletar todos os serviços existentes
DELETE FROM Servico;

-- 2. Resetar o auto_increment (opcional, para IDs começarem do 1)
ALTER TABLE Servico AUTO_INCREMENT = 1;

-- 3. Inserir serviços de Estética Facial
INSERT INTO Servico (nome, duracao_minutos, preco, descricao, ativo, createdAt) VALUES
('Limpeza de pele profunda', 60, 150.00, 'Tratamento completo para remover impurezas e renovar a pele do rosto', 1, NOW()),
('Rejuvenescimento facial', 90, 280.00, 'Procedimento que estimula a produção de colágeno e reduz sinais de envelhecimento', 1, NOW()),
('Peeling', 45, 180.00, 'Esfoliação profunda que remove células mortas e renova a textura da pele', 1, NOW()),
('Hidratação intensiva', 50, 120.00, 'Tratamento hidratante profundo para peles secas e desidratadas', 1, NOW()),
('Tratamentos anti-idade', 75, 320.00, 'Procedimentos avançados para combater rugas, linhas de expressão e flacidez', 1, NOW());

-- 4. Inserir serviços de Estética Corporal
INSERT INTO Servico (nome, duracao_minutos, preco, descricao, ativo, createdAt) VALUES
('Modelagem corporal', 90, 200.00, 'Técnica para definir contornos corporais e reduzir gordura localizada', 1, NOW()),
('Redução de medidas', 60, 180.00, 'Tratamento que auxilia na diminuição de medidas e definição do corpo', 1, NOW()),
('Tratamentos contra celulite', 60, 160.00, 'Procedimentos especializados para reduzir a aparência de celulite', 1, NOW()),
('Drenagem linfática', 75, 140.00, 'Massagem que estimula o sistema linfático, reduzindo inchaço e retenção de líquidos', 1, NOW()),
('Firmeza da pele', 80, 220.00, 'Tratamento que melhora a elasticidade e firmeza da pele corporal', 1, NOW());

-- 5. Inserir serviços de Bem-Estar e Relaxamento
INSERT INTO Servico (nome, duracao_minutos, preco, descricao, ativo, createdAt) VALUES
('Massagens terapêuticas', 60, 130.00, 'Massagem relaxante que alivia tensões musculares e promove bem-estar', 1, NOW()),
('Aromaterapia', 50, 110.00, 'Terapia com óleos essenciais para relaxamento e equilíbrio energético', 1, NOW()),
('Cuidados de relaxamento', 90, 190.00, 'Sessão completa de cuidados exclusivos para renovar energia e promover relaxamento profundo', 1, NOW());

-- 6. Verificar os serviços inseridos
SELECT * FROM Servico ORDER BY id;
