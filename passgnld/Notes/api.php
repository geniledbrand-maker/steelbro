<?php
header('Content-Type: application/json');

// Путь к директории с данными
$dataDir = __DIR__ . '/data/';

// Проверяем существование директории, иначе создаем
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Путь к файлу с заметками
$notesFile = $dataDir . 'notes.json';

// Получаем действие из GET-параметра
$action = $_GET['action'] ?? '';

// Обработка различных действий
switch ($action) {
    case 'loadNotes':
        loadNotes();
        break;
    case 'saveNotes':
        saveNotes();
        break;
    default:
        echo json_encode([
            'success' => false,
            'error' => 'Неизвестное действие'
        ]);
        break;
}

// Загрузка заметок из файла
function loadNotes() {
    global $notesFile;

    if (file_exists($notesFile)) {
        $notes = file_get_contents($notesFile);
        echo $notes;
    } else {
        echo json_encode([
            'success' => true,
            'notes' => []
        ]);
    }
}

// Сохранение заметок в файл
function saveNotes() {
    global $notesFile;

    // Получаем данные из POST-запроса
    $input = file_get_contents('php://input');
    global $notesFile;

    // Получаем данные из POST-запроса
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Проверяем, есть ли данные
    if (!$data || !isset($data['notes'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Неверный формат данных'
        ]);
        return;
    }

    // Сохраняем данные в файл
    try {
        file_put_contents($notesFile, json_encode([
            'success' => true,
            'notes' => $data['notes']
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        echo json_encode([
            'success' => true
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Ошибка сохранения: ' . $e->getMessage()
        ]);
    }
}
```

5. Создадим файл .htaccess для директории data:
```
# Запрещаем прямой доступ к директории
Order deny,allow
Deny from all