<?php
include 'db_connect.php';
header('Content-Type: application/json');

// CRUD simples para gastos
$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'create') {
    $nome = $_POST['nome'] ?? '';
    $valor = $_POST['valor'] ?? 0;
    $vencimento = $_POST['vencimento'] ?? '';
    $status = $_POST['status'] ?? '';
    $categoria = $_POST['categoria'] ?? '';
    $obs = $_POST['obs'] ?? '';
    $sql = "INSERT INTO gastos (nome, valor, vencimento, status, categoria, obs) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sdssss', $nome, $valor, $vencimento, $status, $categoria, $obs);
    $ok = $stmt->execute();
    echo json_encode(['success' => $ok]);
    exit;
}

if ($action === 'read') {
    $result = $conn->query('SELECT * FROM gastos ORDER BY id DESC');
    $gastos = [];
    while ($row = $result->fetch_assoc()) {
        $gastos[] = $row;
    }
    echo json_encode($gastos);
    exit;
}

if ($action === 'update') {
    $id = $_POST['id'] ?? 0;
    $nome = $_POST['nome'] ?? '';
    $valor = $_POST['valor'] ?? 0;
    $vencimento = $_POST['vencimento'] ?? '';
    $status = $_POST['status'] ?? '';
    $categoria = $_POST['categoria'] ?? '';
    $obs = $_POST['obs'] ?? '';
    $sql = "UPDATE gastos SET nome=?, valor=?, vencimento=?, status=?, categoria=?, obs=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sdssssi', $nome, $valor, $vencimento, $status, $categoria, $obs, $id);
    $ok = $stmt->execute();
    echo json_encode(['success' => $ok]);
    exit;
}

if ($action === 'delete') {
    $id = $_POST['id'] ?? 0;
    $sql = "DELETE FROM gastos WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    $ok = $stmt->execute();
    echo json_encode(['success' => $ok]);
    exit;
}

echo json_encode(['error' => 'Ação inválida']);
?>