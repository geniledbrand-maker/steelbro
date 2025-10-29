<?php
// Простой загрузчик файлов
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Проверяем метод
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Только POST запросы']);
    exit;
}

// Проверяем наличие файлов
if (!isset($_FILES['files']) || empty($_FILES['files']['name'][0])) {
    echo json_encode(['success' => false, 'error' => 'Файлы не выбраны']);
    exit;
}

$uploadDir = '/home/shtop/zhar-svet.com/www/';
$uploadedFiles = [];
$errors = [];

// Создаём директорию если не существует
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Обрабатываем каждый файл
for ($i = 0; $i < count($_FILES['files']['name']); $i++) {
    $fileName = $_FILES['files']['name'][$i];
    $fileTmp = $_FILES['files']['tmp_name'][$i];
    $fileSize = $_FILES['files']['size'][$i];
    $fileError = $_FILES['files']['error'][$i];
    
    // Проверяем ошибки загрузки
    if ($fileError !== UPLOAD_ERR_OK) {
        $errors[] = "Ошибка загрузки файла $fileName";
        continue;
    }
    
    // Проверяем размер файла (максимум 10MB)
    if ($fileSize > 10 * 1024 * 1024) {
        $errors[] = "Файл $fileName слишком большой (максимум 10MB)";
        continue;
    }
    
    // Безопасное имя файла
    $safeFileName = basename($fileName);
    $targetPath = $uploadDir . $safeFileName;
    
    // Загружаем файл
    if (move_uploaded_file($fileTmp, $targetPath)) {
        $uploadedFiles[] = $fileName;
        chmod($targetPath, 0644); // Права на чтение
    } else {
        $errors[] = "Не удалось загрузить файл $fileName";
    }
}

// Результат
if (empty($errors)) {
    echo json_encode([
        'success' => true,
        'message' => 'Все файлы загружены успешно',
        'files' => $uploadedFiles
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => implode(', ', $errors),
        'uploaded' => $uploadedFiles
    ]);
}
?>
