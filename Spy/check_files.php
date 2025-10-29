<?php
/**
 * Keys.so Spy - Проверка доступности файлов
 * Файл: check_files.php
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Keys.so Spy - Проверка файлов на сервере</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; }
        .file-check { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .success { color: #4caf50; }
        .error { color: #f44336; }
        .warning { color: #ff9800; }
        .info { color: #2196f3; }
        .btn { padding: 10px 20px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Keys.so Spy - Проверка файлов на сервере</h1>
        
        <div class="file-check">
            <h2>📊 Статус файлов</h2>
            <?php
            $files = [
                'index.html' => 'Главная страница',
                'assets/css/main.css' => 'Основные стили',
                'assets/css/sidebar.css' => 'Стили боковой панели',
                'assets/css/modal.css' => 'Стили модальных окон',
                'assets/css/tables.css' => 'Стили таблиц',
                'assets/js/utils.js' => 'Утилиты',
                'assets/js/api.js' => 'API клиент',
                'assets/js/app.js' => 'Главное приложение',
                'classes/DomainManager/DomainStorage.js' => 'Хранилище доменов',
                'classes/DomainManager/DomainUI.js' => 'UI доменов',
                'classes/DomainManager/DomainManager.js' => 'Менеджер доменов',
                'classes/Shared/TabManager.js' => 'Менеджер вкладок',
                'classes/Shared/ExportManager.js' => 'Менеджер экспорта',
                'classes/Shared/NotificationManager.js' => 'Менеджер уведомлений',
                'classes/Overview/OverviewTab.js' => 'Вкладка обзора',
                'classes/Keywords/KeywordsTab.js' => 'Вкладка ключевых слов',
                'test.html' => 'Базовый тест',
                'test_functionality.html' => 'Полный тест',
                'diagnostic.html' => 'Диагностика'
            ];
            
            $existingFiles = 0;
            $totalFiles = count($files);
            
            foreach ($files as $file => $description) {
                if (file_exists($file)) {
                    $size = filesize($file);
                    $modified = date('Y-m-d H:i:s', filemtime($file));
                    echo "<div class='success'>✅ {$file} - {$description} ({$size} байт, изменен: {$modified})</div>";
                    $existingFiles++;
                } else {
                    echo "<div class='error'>❌ {$file} - {$description} (НЕ НАЙДЕН)</div>";
                }
            }
            
            echo "<div class='info'>📊 Найдено файлов: {$existingFiles}/{$totalFiles}</div>";
            ?>
        </div>
        
        <div class="file-check">
            <h2>🌐 Информация о сервере</h2>
            <div class="info">🕒 Время сервера: <?php echo date('Y-m-d H:i:s'); ?></div>
            <div class="info">🌍 Временная зона: <?php echo date_default_timezone_get(); ?></div>
            <div class="info">📁 Рабочая директория: <?php echo getcwd(); ?></div>
            <div class="info">🌐 HTTP_HOST: <?php echo $_SERVER['HTTP_HOST'] ?? 'Не определен'; ?></div>
            <div class="info">📄 REQUEST_URI: <?php echo $_SERVER['REQUEST_URI'] ?? 'Не определен'; ?></div>
            <div class="info">🔒 HTTPS: <?php echo isset($_SERVER['HTTPS']) ? 'Да' : 'Нет'; ?></div>
        </div>
        
        <div class="file-check">
            <h2>🔧 Права доступа</h2>
            <?php
            $dirs = ['assets', 'assets/css', 'assets/js', 'classes', 'classes/DomainManager', 'classes/Shared', 'classes/Overview', 'classes/Keywords'];
            
            foreach ($dirs as $dir) {
                if (is_dir($dir)) {
                    $perms = substr(sprintf('%o', fileperms($dir)), -4);
                    echo "<div class='success'>✅ {$dir} - права: {$perms}</div>";
                } else {
                    echo "<div class='error'>❌ {$dir} - директория не найдена</div>";
                }
            }
            ?>
        </div>
        
        <div class="file-check">
            <h2>🔗 Быстрые ссылки</h2>
            <a href="index.html" class="btn">Главная страница</a>
            <a href="diagnostic.html" class="btn">Диагностика</a>
            <a href="test.html" class="btn">Базовый тест</a>
            <a href="test_functionality.html" class="btn">Полный тест</a>
            <a href="test_access.html" class="btn">Тест доступности</a>
            <a href="spy.html" class="btn">Старая версия</a>
        </div>
        
        <div class="file-check">
            <h2>📝 Рекомендации</h2>
            <?php if ($existingFiles < $totalFiles): ?>
                <div class="warning">⚠️ Некоторые файлы не найдены. Проверьте структуру проекта.</div>
            <?php else: ?>
                <div class="success">✅ Все файлы найдены! Проект готов к использованию.</div>
            <?php endif; ?>
            
            <?php if (!is_writable('.')): ?>
                <div class="warning">⚠️ Текущая директория не доступна для записи.</div>
            <?php endif; ?>
            
            <div class="info">💡 Если файлы не загружаются, проверьте права доступа и конфигурацию веб-сервера.</div>
        </div>
    </div>
</body>
</html>
