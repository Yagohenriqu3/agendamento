-- Adicionar configuração para mostrar valores aos clientes
ALTER TABLE Configuracoes 
ADD COLUMN mostrar_valores_cliente BOOLEAN DEFAULT TRUE AFTER intervalo_almoco_fim;
