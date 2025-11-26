CREATE DATABASE Painel_de_Gastos;

USE Painel_de_Gastos;

CREATE TABLE IF NOT EXISTS gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    vencimento DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    categoria VARCHAR(50),
    obs TEXT
);

SELECT * FROM gastos;