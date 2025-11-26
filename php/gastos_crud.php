<?php

header('Content-Type: application/json');
require_once 'db_connect.php';

// Função para obter dados do corpo da requisição JSON
function getJsonBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

$action = $_GET['action'] ?? null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    if (isset($body['action'])) {
        $action = $body['action'];
    }
}

$response = [ 'success' => false ];

if (!$action) {
    echo json_encode([ 'success' => false, 'error' => 'Ação não especificada.' ]);
    exit;
}

// CREATE
if ($action === 'create') {
    $gasto = $_POST['gasto'] ?? ($body['gasto'] ?? null);
    if (!$gasto) {
        echo json_encode([ 'success' => false, 'error' => 'Dados do gasto ausentes.' ]);
        exit;
    }
    $stmt = $conn->prepare('INSERT INTO gastos (nome, valor, vencimento, status, categoria) VALUES (?, ?, ?, ?, ?)');
    $stmt->bind_param('sdsss', $gasto['nome'], $gasto['valor'], $gasto['vencimento'], $gasto['status'], $gasto['categoria']);
    if ($stmt->execute()) {
        $response = [ 'success' => true, 'id' => $conn->insert_id ];
    } else {
        $response = [ 'success' => false, 'error' => $stmt->error ];
    }
    $stmt->close();
}
// READ
else if ($action === 'read') {
    $result = $conn->query('SELECT * FROM gastos ORDER BY vencimento DESC');
    $gastos = [];
    while ($row = $result->fetch_assoc()) {
        $gastos[] = $row;
    }
    $response = [ 'success' => true, 'gastos' => $gastos ];
}
// UPDATE
else if ($action === 'update') {
    $id = $_POST['id'] ?? ($body['id'] ?? null);
    $gasto = $_POST['gasto'] ?? ($body['gasto'] ?? null);
    if (!$id || !$gasto) {
        echo json_encode([ 'success' => false, 'error' => 'ID ou dados do gasto ausentes.' ]);
        exit;
    }
    $stmt = $conn->prepare('UPDATE gastos SET nome=?, valor=?, vencimento=?, status=?, categoria=? WHERE id=?');
    $stmt->bind_param('sdsssi', $gasto['nome'], $gasto['valor'], $gasto['vencimento'], $gasto['status'], $gasto['categoria'], $id);
    if ($stmt->execute()) {
        $response = [ 'success' => true ];
    } else {
        $response = [ 'success' => false, 'error' => $stmt->error ];
    }
    $stmt->close();
}
// DELETE
else if ($action === 'delete') {
    $id = $_POST['id'] ?? ($body['id'] ?? null);
    if (!$id) {
        echo json_encode([ 'success' => false, 'error' => 'ID ausente.' ]);
        exit;
    }
    $stmt = $conn->prepare('DELETE FROM gastos WHERE id=?');
    $stmt->bind_param('i', $id);
    if ($stmt->execute()) {
        $response = [ 'success' => true ];
    } else {
        $response = [ 'success' => false, 'error' => $stmt->error ];
    }
    $stmt->close();
}
else {
    $response = [ 'success' => false, 'error' => 'Ação inválida.' ];
}

$conn->close();
echo json_encode($response);
?>