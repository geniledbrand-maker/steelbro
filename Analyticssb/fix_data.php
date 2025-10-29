<?php
/**
 * УЛУЧШЕННЫЙ СКРИПТ ДЛЯ ИСПРАВЛЕНИЯ ДАННЫХ
 * Версия 2.1 - с улучшенной обработкой ошибок
 */

header('Content-Type: text/html; charset=utf-8');

$dataFile = __DIR__ . '/dashboard_data.json';

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Исправление данных панели</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        ul {
            list-style: none;
            padding: 0;
        }
        li {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        li:before {
            content: '✓ ';
            color: #4CAF50;
            font-weight: bold;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 20px 0;
        }
        .stat-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .manual-fix {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .manual-fix h3 {
            margin-top: 0;
            color: #856404;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #4CAF50;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🔧 Исправление данных панели Analyticssb v2.1</h1>";

// Проверяем существование файла
if (!file_exists($dataFile)) {
    echo "<div class='error'>
            <strong>❌ Ошибка:</strong> Файл <code>dashboard_data.json</code> не найден!<br>
            Путь: <code>$dataFile</code>
          </div>";

    echo "<div class='info'>
            <strong>Решение:</strong><br>
            1. Убедитесь, что файл существует<br>
            2. Проверьте путь к файлу<br>
            3. Создайте файл вручную с базовой структурой
          </div>";

    echo "</div></body></html>";
    exit;
}

// Проверяем права на чтение
if (!is_readable($dataFile)) {
    echo "<div class='error'>
            <strong>❌ Ошибка:</strong> Нет прав на чтение файла!<br>
            Файл: <code>$dataFile</code>
          </div>";

    echo "<div class='warning'>
            <strong>Решение через SSH:</strong><br>
            <code>chmod 644 /home/shtop/zhar-svet.com/www/Analyticssb/dashboard_data.json</code>
          </div>";

    echo "</div></body></html>";
    exit;
}

// Проверяем права на запись
$canWrite = is_writable($dataFile);
$canWriteDir = is_writable(__DIR__);

if (!$canWrite) {
    echo "<div class='error'>
            <strong>❌ Ошибка:</strong> Нет прав на запись файла!
          </div>";

    echo "<div class='warning'>
            <strong>Решение через SSH:</strong><br>
            <code>chmod 666 /home/shtop/zhar-svet.com/www/Analyticssb/dashboard_data.json</code><br>
            или<br>
            <code>chown www-data:www-data /home/shtop/zhar-svet.com/www/Analyticssb/dashboard_data.json</code>
          </div>";
}

if (!$canWriteDir) {
    echo "<div class='warning'>
            <strong>⚠️ Предупреждение:</strong> Нет прав на запись в папку - не смогу создать резервную копию<br>
            Но попробую исправить данные напрямую!
          </div>";
}

// Загружаем данные
$content = file_get_contents($dataFile);
$data = json_decode($content, true);

if (!is_array($data)) {
    echo "<div class='error'>
            <strong>❌ Ошибка:</strong> Не удалось прочитать JSON файл!<br>
            JSON может быть повреждён.
          </div>";

    echo "<div class='info'>
            <strong>Содержимое файла (первые 500 символов):</strong><br>
            <pre>" . htmlspecialchars(substr($content, 0, 500)) . "</pre>
          </div>";

    echo "</div></body></html>";
    exit;
}

// Пытаемся создать резервную копию
$backupCreated = false;
if ($canWriteDir) {
    $backupFile = $dataFile . '.before-fix-' . date('Y-m-d-H-i-s');
    if (@copy($dataFile, $backupFile)) {
        echo "<div class='success'>
                ✅ Резервная копия создана:<br>
                <code>" . basename($backupFile) . "</code>
              </div>";
        $backupCreated = true;
    } else {
        echo "<div class='warning'>
                ⚠️ Не удалось создать резервную копию, но продолжаем...
              </div>";
    }
}

// Инициализируем массивы если их нет
foreach (['selected_products', 'custom_products', 'deleted_products'] as $key) {
    if (!isset($data[$key]) || !is_array($data[$key])) {
        $data[$key] = [];
    }
}

// Статистика ДО исправления
$stats_before = [
    'selected' => count($data['selected_products']),
    'custom' => count($data['custom_products']),
    'deleted' => count($data['deleted_products'])
];

echo "<h2>📊 Статистика ДО исправления:</h2>
      <div class='stats'>
        <div class='stat-box'>
            <div class='stat-number'>{$stats_before['selected']}</div>
            <div class='stat-label'>Выбранные изделия</div>
        </div>
        <div class='stat-box'>
            <div class='stat-number'>{$stats_before['custom']}</div>
            <div class='stat-label'>Пользовательские</div>
        </div>
        <div class='stat-box'>
            <div class='stat-number'>{$stats_before['deleted']}</div>
            <div class='stat-label'>Удалённые</div>
        </div>
      </div>";

// Находим изделия для добавления
$customNames = array_map(function($p) {
    return $p['name'];
}, $data['custom_products']);

$missingInSelected = array_filter($customNames, function($name) use ($data) {
    return !in_array($name, $data['selected_products']);
});

if (count($missingInSelected) > 0) {
    echo "<div class='warning'>
            <strong>⚠️ Обнаружена проблема:</strong><br>
            Найдено <strong>" . count($missingInSelected) . "</strong> изделий в <code>custom_products</code>, 
            которые отсутствуют в <code>selected_products</code>
          </div>";

    echo "<h3>🔧 Исправляем...</h3>";
    echo "<ul>";

    foreach ($missingInSelected as $name) {
        $data['selected_products'][] = $name;
        echo "<li>Добавлено: <strong>" . htmlspecialchars($name) . "</strong></li>";
    }

    echo "</ul>";

    // Пытаемся сохранить
    if ($canWrite) {
        $data['last_updated'] = date('Y-m-d H:i:s');
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        $result = @file_put_contents($dataFile, $json);

        if ($result !== false) {
            echo "<div class='success'>
                    <strong>✅ Данные успешно исправлены и сохранены!</strong>
                  </div>";

            $stats_after = [
                'selected' => count($data['selected_products']),
                'custom' => count($data['custom_products']),
                'deleted' => count($data['deleted_products'])
            ];

            echo "<h2>📊 Статистика ПОСЛЕ исправления:</h2>
                  <div class='stats'>
                    <div class='stat-box'>
                        <div class='stat-number'>{$stats_after['selected']}</div>
                        <div class='stat-label'>Выбранные изделия</div>
                    </div>
                    <div class='stat-box'>
                        <div class='stat-number'>{$stats_after['custom']}</div>
                        <div class='stat-label'>Пользовательские</div>
                    </div>
                    <div class='stat-box'>
                        <div class='stat-number'>{$stats_after['deleted']}</div>
                        <div class='stat-label'>Удалённые</div>
                    </div>
                  </div>";
        } else {
            echo "<div class='error'>
                    <strong>❌ Не удалось сохранить файл!</strong>
                  </div>";

            // Показываем инструкцию для ручного исправления
            showManualFix($data, $missingInSelected);
        }
    } else {
        echo "<div class='error'>
                <strong>❌ Нет прав на запись!</strong>
              </div>";

        // Показываем инструкцию для ручного исправления
        showManualFix($data, $missingInSelected);
    }
} else {
    echo "<div class='info'>
            <strong>ℹ️ Проверка пройдена:</strong><br>
            Все пользовательские изделия уже присутствуют в списке выбранных!<br>
            Исправления не требуются.
          </div>";
}

// Проверка на дубликаты
echo "<h2>🔍 Дополнительная проверка:</h2>";

$selectedUnique = array_unique($data['selected_products']);
if (count($selectedUnique) !== count($data['selected_products'])) {
    $duplicates = count($data['selected_products']) - count($selectedUnique);
    echo "<div class='warning'>
            ⚠️ Обнаружено <strong>$duplicates</strong> дубликатов в selected_products
          </div>";
} else {
    echo "<div class='success'>✅ Дубликатов в selected_products не обнаружено</div>";
}

echo "
        <h2>📋 Следующие шаги:</h2>
        <div class='info'>
            <ol style='list-style: decimal; padding-left: 20px;'>
                <li>Откройте панель Analyticssb</li>
                <li>Нажмите Ctrl+F5 для полной перезагрузки</li>
                <li>Проверьте, что все изделия отображаются</li>
                <li>Попробуйте добавить новое изделие и перезагрузить страницу</li>
                <li><strong>Удалите этот файл (fix_data.php) после проверки!</strong></li>
            </ol>
        </div>
    </div>
</body>
</html>";

// Функция для отображения инструкции ручного исправления
function showManualFix($data, $missingInSelected) {
    echo "<div class='manual-fix'>
            <h3>📝 Инструкция для ручного исправления</h3>
            <p>Так как автоматическое сохранение не удалось, вам нужно исправить файл вручную.</p>
            
            <strong>Шаг 1:</strong> Откройте файл через FTP/SSH:<br>
            <code>/home/shtop/zhar-svet.com/www/Analyticssb/dashboard_data.json</code><br><br>
            
            <strong>Шаг 2:</strong> Найдите секцию <code>\"selected_products\"</code><br><br>
            
            <strong>Шаг 3:</strong> Добавьте эти названия в массив:
            <pre>";

    foreach ($missingInSelected as $name) {
        echo "\"" . addslashes($name) . "\",\n";
    }

    echo "</pre>
            
            <strong>Пример правильной структуры:</strong>
            <pre>{
  \"selected_products\": [
    \"Существующее изделие 1\",
    \"Существующее изделие 2\",";

    foreach ($missingInSelected as $name) {
        echo "\n    \"" . addslashes($name) . "\",";
    }

    echo "
  ],
  \"custom_products\": [...]
}</pre>
            
            <p><strong>Шаг 4:</strong> Сохраните файл и перезагрузите страницу</p>
          </div>";
}
?>