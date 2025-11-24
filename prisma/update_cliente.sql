-- Adicionar campo password na tabela Cliente
ALTER TABLE Cliente ADD COLUMN password VARCHAR(255);

-- Se já tiver clientes cadastrados sem senha, pode definir uma senha padrão
-- UPDATE Cliente SET password = '123456' WHERE password IS NULL;
