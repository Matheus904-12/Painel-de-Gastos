<?php
// Conexão simples com MySQL
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'painel_gastos';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die('Erro de conexão: ' . $conn->connect_error);
}
?>