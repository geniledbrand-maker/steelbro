<?php
/**
 * Скрипт проверки системы заметок
 * Запустите этот файл в браузере для диагностики проблем
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Проверка системы заметок</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .check {
            background: white;
            padding: 20px;
            margin: 10px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .success { color: #10b981; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
        .warning { color: #f59e0b; font-weight: bold; }
        h1 { color: #1f2937; }
        h2 { color: #4b5563; margin-top: 0; }
        pre {
            background: #1f2937;
            color: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }
        .badge.ok { background: #d1fae5; color: #065f46; }
        .badge.fail { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
<h1>🔍 Диагностика системы заметок</h1>

<?php
$dataDir = __DIR__ . '/data';
$notesFile = $dataDir . '/notes.json';
$errors = [];
$warnings = [];
$success = [];

// 1. Проверка директории data
echo '<div class="check">';
echo '<h2>1. Проверка директории data/</h2>';
if (file_exists($dataDir)) {
    echo '<p class="success">✅ Директория существует</p>';
    echo '<p>Путь: <code>' . $dataDir . '</code></p>';
    $success[] = 'Директория data/ существует';
} else {
    echo '<p class="error">❌ Директория НЕ существует!</p>';
    $errors[] = 'Директория data/ не найдена';

    // Пытаемся создать
    if (mkdir($dataDir, 0777, true)) {
        echo '<p class="success">✅ Директория создана автоматически</p>';
        $success[] = 'Директория data/ создана';
    } else {
        echo '<p class="error">❌ Не удалось создать директорию</p>';
        $errors[] = 'Невозможно создать data/';
    }
}
echo '</div>';

// 2. Проверка прав на запись
echo '<div class="check">';
echo '<h2>2. Права доступа</h2>';
if (file_exists($dataDir)) {
    if (is_writable($dataDir)) {
        echo '<p class="success">✅ Директория доступна для записи</p>';
        $perms = substr(sprintf('%o', fileperms($dataDir)), -4);
        echo '<p>Права: <code>' . $perms . '</code></p>';
        $success[] = 'Права на запись в data/ есть';
    } else {
        echo '<p class="error">❌ Директория НЕ доступна для записи!</p>';
        echo '<p>Текущие права: <code>' . substr(sprintf('%o', fileperms($dataDir)), -4) . '</code></p>';
        echo '<p class="warning">Выполните: <code>chmod 777 data/</code></p>';
        $errors[] = 'Нет прав на запись в data/';
    }
}
echo '</div>';

// 3. Проверка файла notes.json
echo '<div class="check">';
echo '<h2>3. Файл notes.json</h2>';
if (file_exists($notesFile)) {
    echo '<p class="success">✅ Файл существует</p>';
    echo '<p>Путь: <code>' . $notesFile . '</code></p>';

    $size = filesize($notesFile);
    echo '<p>Размер: <strong>' . $size . ' байт</strong></p>';

    if (is_readable($notesFile)) {
        echo '<p class="success">✅ Файл доступен для чтения</p>';

        $content = file_get_contents($notesFile);
        $notes = json_decode($content, true);

        if ($notes === null) {
            echo '<p class="error">❌ Ошибка JSON в файле!</p>';
            echo '<p>Ошибка: <code>' . json_last_error_msg() . '</code></p>';
            $errors[] = 'Невалидный JSON в notes.json';
        } else {
            echo '<p class="success">✅ JSON валиден</p>';
            echo '<p>Количество заметок: <strong>' . count($notes) . '</strong></p>';
            $success[] = count($notes) . ' заметок в файле';

            if (count($notes) > 0) {
                echo '<h3>Заметки в файле:</h3>';
                echo '<pre>' . json_encode($notes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . '</pre>';
            }
        }
    }

    if (is_writable($notesFile)) {
        echo '<p class="success">✅ Файл доступен для записи</p>';
    } else {
        echo '<p class="error">❌ Файл НЕ доступен для записи!</p>';
        echo '<p class="warning">Выполните: <code>chmod 666 data/notes.json</code></p>';
        $errors[] = 'Нет прав на запись в notes.json';
    }
} else {
    echo '<p class="warning">⚠️ Файл не существует (создастся при первом сохранении)</p>';
    $warnings[] = 'Файл notes.json пока не создан';

    // Пытаемся создать тестовый файл
    if (is_writable($dataDir)) {
        if (file_put_contents($notesFile, '[]')) {
            echo '<p class="success">✅ Тестовый файл создан успешно</p>';
            $success[] = 'Тестовый notes.json создан';
        } else {
            echo '<p class="error">❌ Не удалось создать тестовый файл</p>';
            $errors[] = 'Невозможно создать notes.json';
        }
    }
}
echo '</div>';

// 4. Тест API
echo '<div class="check">';
echo '<h2>4. Проверка API</h2>';

// Проверяем, что api.php существует
$apiFile = __DIR__ . '/api.php';
if (file_exists($apiFile)) {
    echo '<p class="success">✅ Файл api.php существует</p>';
    $success[] = 'api.php найден';
} else {
    echo '<p class="error">❌ Файл api.php НЕ найден!</p>';
    $errors[] = 'api.php отсутствует';
}

echo '<p>Для полного теста API откройте в браузере:</p>';
echo '<ul>';
echo '<li><a href="api.php?action=loadNotes" target="_blank">api.php?action=loadNotes</a></li>';
echo '<li>Должен вернуть: <code>{"success":true,"notes":[...]}</code></li>';
echo '</ul>';
echo '</div>';

// 5. Итоговый отчет
echo '<div class="check">';
echo '<h2>📊 Итоговый отчет</h2>';

echo '<h3>✅ Успешно (' . count($success) . '):</h3>';
if (count($success) > 0) {
    echo '<ul>';
    foreach ($success as $s) {
        echo '<li>' . $s . '</li>';
    }
    echo '</ul>';
}

if (count($warnings) > 0) {
    echo '<h3>⚠️ Предупреждения (' . count($warnings) . '):</h3>';
    echo '<ul>';
    foreach ($warnings as $w) {
        echo '<li>' . $w . '</li>';
    }
    echo '</ul>';
}

if (count($errors) > 0) {
    echo '<h3>❌ Ошибки (' . count($errors) . '):</h3>';
    echo '<ul style="color: #ef4444;">';
    foreach ($errors as $e) {
        echo '<li><strong>' . $e . '</strong></li>';
    }
    echo '</ul>';

    echo '<h3>🔧 Как исправить:</h3>';
    echo '<pre>chmod 777 data/
chmod 666 data/notes.json</pre>';
} else {
    echo '<h3 class="success">🎉 Всё в порядке!</h3>';
    echo '<p>Система заметок должна работать корректно.</p>';
}

echo '</div>';

// 6. Информация о системе
echo '<div class="check">';
echo '<h2>💻 Информация о системе</h2>';
echo '<p>PHP версия: <strong>' . phpversion() . '</strong></p>';
echo '<p>Сервер: <strong>' . $_SERVER['SERVER_SOFTWARE'] . '</strong></p>';
echo '<p>Рабочая директория: <code>' . __DIR__ . '</code></p>';
echo '</div>';
?>

<div class="check">
    <h2>🔄 Следующие шаги</h2>
    <ol>
        <li>Если есть ошибки с правами - исправьте права доступа</li>
        <li>Откройте консоль браузера (F12)</li>
        <li>Перейдите на вкладку "Заметки"</li>
        <li>Создайте заметку</li>
        <li>Проверьте логи в консоли</li>
        <li>Перезагрузите страницу (F5)</li>
        <li>Проверьте, загрузилась ли заметка</li>
    </ol>
</div>

<div class="check">
    <h2>📞 Нужна помощь?</h2>
    <p>Скопируйте результаты этой диагностики и отправьте разработчику.</p>
</div>
</body>
</html>