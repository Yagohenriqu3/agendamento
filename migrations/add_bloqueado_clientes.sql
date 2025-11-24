-- Adicionar coluna bloqueado na tabela Cliente
ALTER TABLE Cliente ADD COLUMN bloqueado BOOLEAN DEFAULT FALSE;
