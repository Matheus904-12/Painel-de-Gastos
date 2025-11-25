<?php
// Conexão simples com MySQL
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'Painel_de_Gastos';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die('Erro de conexão: ' . $conn->connect_error);
}
?>