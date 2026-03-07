<?php
session_start();
require_once '../config/connectiondb.php';
header('Content-Type: application/json');

// Get current user info from session
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'user') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $sql = "SELECT id, name, email, room_number FROM users WHERE id = :user_id AND role = 'student'";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(["success" => true, "user" => $user]);
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit();
    }

    $student_id = (int)$_SESSION['user_id'];

    $sql = "SELECT mr.id, mr.title, mr.description, mr.problem_type, mr.room_number, 
                   mr.status, mr.created_at, u.name AS assigned_worker_name
            FROM maintenance_requests mr
            LEFT JOIN users u ON mr.assigned_worker_id = u.id
            WHERE mr.student_id = :student_id
            ORDER BY mr.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $stmt->execute();
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "requests" => $requests]);
    exit();

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit();
    }

    $student_id   = (int)$_SESSION['user_id'];
    $room_number  = isset($_POST['room_number'])  ? trim($_POST['room_number'])  : '';
    $problem_type = isset($_POST['problem_type']) ? trim($_POST['problem_type']) : '';
    $title        = isset($_POST['title'])        ? trim($_POST['title'])        : '';
    $description  = isset($_POST['description'])  ? trim($_POST['description'])  : '';

    if (empty($room_number) || empty($problem_type) || empty($title) || empty($description)) {
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit();
    }

    $sql = "INSERT INTO maintenance_requests (student_id, room_number, problem_type, title, description) 
            VALUES (:student_id, :room_number, :problem_type, :title, :description)";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':student_id',   $student_id);
    $stmt->bindParam(':room_number',  $room_number);
    $stmt->bindParam(':problem_type', $problem_type);
    $stmt->bindParam(':title',        $title);
    $stmt->bindParam(':description',  $description);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Request created successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to create request"]);
    }
    exit();

} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit();
}