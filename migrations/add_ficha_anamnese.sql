-- Adicionar coluna fichaAnamnese na tabela Cliente
ALTER TABLE Cliente 
ADD COLUMN fichaAnamnese LONGTEXT NULL AFTER bloqueado;
