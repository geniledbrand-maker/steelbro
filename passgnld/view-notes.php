<?php
/**
 * Просмотрщик заметок в формате JSON
 * Позволяет видеть содержимое data/notes.json в красивом виде
 */

$notesFile = __DIR__ . '/data/notes.json';

// Проверка существования файла
$fileExists = file_exists($notesFile);
$notes = [];
$error = null;

if ($fileExists) {
    $content = file_get_contents($notesFile);
    $notes = json_decode($content, true);

    if ($notes === null) {
        $error = json_last_error_msg();
    }
}

// Действия
$action = $_GET['action'] ?? '';

if ($action === 'download') {
    // Скачать JSON файл
    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="notes-backup-' . date('Y-m-d-His') . '.json"');
    if ($fileExists) {
        echo file_get_contents($notesFile);
    } else {
        echo '[]';
    }
    exit;
}

if ($action === 'export') {
    // Экспорт в читаемый текст
    header('Content-Type: text/plain; charset=utf-8');
    header('Content-Disposition: attachment; filename="notes-export-' . date('Y-m-d-His') . '.txt"');

    if (!empty($notes)) {
        foreach ($notes as $note) {
            echo "==============================================\n";
            echo "ЗАМЕТКА: " . ($note['title'] ?? 'Без названия') . "\n";
            echo "Создана: " . date('d.m.Y H:i', strtotime($note['createdAt'] ?? '')) . "\n";
            echo "Изменена: " . date('d.m.Y H:i', strtotime($note['updatedAt'] ?? '')) . "\n";
            if (!empty($note['tags'])) {
                echo "Теги: " . implode(', ', $note['tags']) . "\n";
            }
            echo "==============================================\n\n";
            echo $note['content'] ?? '';
            echo "\n\n\n";
        }
    } else {
        echo "Нет заметок\n";
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📝 Просмотр заметок (JSON)</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
        }

        .header h1 {
            color: #1f2937;
            font-size: 32px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .header p {
            color: #6b7280;
            font-size: 14px;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .stat-label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .stat-value {
            color: #1f2937;
            font-size: 28px;
            font-weight: bold;
        }

        .actions {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: #f3f4f6;
            color: #1f2937;
        }

        .btn-secondary:hover {
            background: #e5e7eb;
        }

        .notes-container {
            display: grid;
            gap: 16px;
        }

        .note-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;
        }

        .note-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .note-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 2px solid #f3f4f6;
        }

        .note-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            flex: 1;
        }

        .note-id {
            font-size: 12px;
            color: #9ca3af;
            font-family: 'Courier New', monospace;
        }

        .note-meta {
            display: flex;
            gap: 24px;
            margin-bottom: 16px;
            font-size: 13px;
            color: #6b7280;
        }

        .note-meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .note-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 16px;
        }

        .tag {
            background: #ede9fe;
            color: #6b21a8;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
        }

        .note-content {
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            color: #374151;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 300px;
            overflow-y: auto;
            font-size: 14px;
        }

        .note-content::-webkit-scrollbar {
            width: 8px;
        }

        .note-content::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 4px;
        }

        .note-content::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 4px;
        }

        .json-viewer {
            background: #1f2937;
            color: #f9fafb;
            padding: 24px;
            border-radius: 12px;
            overflow-x: auto;
            margin-top: 24px;
        }

        .json-viewer pre {
            margin: 0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
        }

        .error {
            background: #fef2f2;
            border: 2px solid #fca5a5;
            color: #991b1b;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 24px;
        }

        .empty-state {
            background: white;
            padding: 60px 40px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .empty-state h2 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 12px;
        }

        .empty-state p {
            color: #6b7280;
            font-size: 14px;
        }

        .file-info {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 13px;
            color: #92400e;
        }

        .file-path {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
        }

        @media (max-width: 768px) {
            .stats {
                grid-template-columns: 1fr;
            }

            .actions {
                flex-direction: column;
            }

            .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>
            <span>📝</span>
            Просмотр заметок
        </h1>
        <p>Визуализация содержимого файла data/notes.json</p>
    </div>

    <?php if (!$fileExists): ?>
        <div class="error">
            <strong>⚠️ Файл не найден:</strong> <code><?php echo $notesFile; ?></code>
            <p style="margin-top: 8px;">Создайте первую заметку в приложении, и файл создастся автоматически.</p>
        </div>
    <?php elseif ($error): ?>
        <div class="error">
            <strong>❌ Ошибка JSON:</strong> <?php echo htmlspecialchars($error); ?>
        </div>
    <?php endif; ?>

    <div class="file-info">
        <strong>📁 Файл:</strong> <span class="file-path"><?php echo htmlspecialchars($notesFile); ?></span><br>
        <?php if ($fileExists): ?>
            <strong>📊 Размер:</strong> <?php echo number_format(filesize($notesFile)); ?> байт<br>
            <strong>🕐 Изменен:</strong> <?php echo date('d.m.Y H:i:s', filemtime($notesFile)); ?>
        <?php endif; ?>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-label">Всего заметок</div>
            <div class="stat-value"><?php echo count($notes); ?></div>
        </div>
        <div class="stat-card">
            <div class="stat-label">С тегами</div>
            <div class="stat-value"><?php echo count(array_filter($notes, fn($n) => !empty($n['tags']))); ?></div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Файл существует</div>
            <div class="stat-value"><?php echo $fileExists ? '✅' : '❌'; ?></div>
        </div>
    </div>

    <div class="actions">
        <a href="?action=download" class="btn btn-primary" download>
            <span>💾</span> Скачать JSON
        </a>
        <a href="?action=export" class="btn btn-secondary" download>
            <span>📄</span> Экспорт в TXT
        </a>
        <a href="index.html" class="btn btn-secondary">
            <span>🏠</span> Вернуться к приложению
        </a>
        <a href="javascript:location.reload()" class="btn btn-secondary">
            <span>🔄</span> Обновить
        </a>
    </div>

    <?php if (!empty($notes)): ?>
        <div class="notes-container">
            <?php foreach ($notes as $note): ?>
                <div class="note-card">
                    <div class="note-header">
                        <div class="note-title">
                            <?php echo htmlspecialchars($note['title'] ?? 'Без названия'); ?>
                        </div>
                        <div class="note-id">
                            ID: <?php echo $note['id'] ?? 'N/A'; ?>
                        </div>
                    </div>

                    <div class="note-meta">
                        <div class="note-meta-item">
                            <span>📅</span>
                            Создана: <?php echo isset($note['createdAt']) ? date('d.m.Y H:i', strtotime($note['createdAt'])) : 'N/A'; ?>
                        </div>
                        <div class="note-meta-item">
                            <span>✏️</span>
                            Изменена: <?php echo isset($note['updatedAt']) ? date('d.m.Y H:i', strtotime($note['updatedAt'])) : 'N/A'; ?>
                        </div>
                        <div class="note-meta-item">
                            <span>📊</span>
                            <?php echo mb_strlen($note['content'] ?? '', 'UTF-8'); ?> символов
                        </div>
                    </div>

                    <?php if (!empty($note['tags'])): ?>
                        <div class="note-tags">
                            <?php foreach ($note['tags'] as $tag): ?>
                                <span class="tag"><?php echo htmlspecialchars($tag); ?></span>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <div class="note-content">
                        <?php echo htmlspecialchars($note['content'] ?? '(пусто)'); ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="json-viewer">
            <strong style="display: block; margin-bottom: 16px; font-size: 16px;">📋 Исходный JSON:</strong>
            <pre><?php echo htmlspecialchars(json_encode($notes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)); ?></pre>
        </div>
    <?php else: ?>
        <div class="empty-state">
            <h2>📭 Заметок пока нет</h2>
            <p>Создайте первую заметку в приложении, и она появится здесь</p>
            <br>
            <a href="index.html" class="btn btn-primary">
                <span>✨</span> Создать заметку
            </a>
        </div>
    <?php endif; ?>
</div>
</body>
</html>