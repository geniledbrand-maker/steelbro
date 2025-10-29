<?php
/**
 * СКРИПТ ДЛЯ УДАЛЕНИЯ ДУБЛИКАТОВ
 * Версия 1.0
 *
 * Этот скрипт удаляет дубликаты из selected_products
 * Запустите ОДИН РАЗ после fix_data.php
 */

header('Content-Type: text/html; charset=utf-8');

$dataFile = __DIR__ . '/dashboard_data.json';

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Удаление дубликатов</title>
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
        .stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
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
        .duplicate-item {
            background: #fff3cd;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🧹 Удаление дубликатов</h1>";

// Проверяем файл
if (!file_exists($dataFile)) {
    echo "<div class='error'>
            <strong>❌ Ошибка:</strong> Файл <code>dashboard_data.json</code> не найден!
          </div>";
    echo "</div></body></html>";
    exit;
}

// Загружаем данные
$data = json_decode(file_get_contents($dataFile), true);

if (!is_array($data)) {
    echo "<div class='error'>
            <strong>❌ Ошибка:</strong> Не удалось прочитать JSON файл!
          </div>";
    echo "</div></body></html>";
    exit;
}

// Инициализируем массивы
foreach (['selected_products', 'custom_products', 'deleted_products'] as $key) {
    if (!isset($data[$key]) || !is_array($data[$key])) {
        $data[$key] = [];
    }
}

// Статистика ДО
$countBefore = count($data['selected_products']);

echo "<h2>📊 Статистика ДО очистки:</h2>
      <div class='stats'>
        <div class='stat-box'>
            <div class='stat-number'>$countBefore</div>
            <div class='stat-label'>Всего изделий (с дубликатами)</div>
        </div>
        <div class='stat-box'>
            <div class='stat-number'>" . count(array_unique($data['selected_products'])) . "</div>
            <div class='stat-label'>Уникальных изделий</div>
        </div>
      </div>";

// Находим дубликаты
$counts = array_count_values($data['selected_products']);
$duplicates = array_filter($counts, function($count) {
    return $count > 1;
});

if (count($duplicates) > 0) {
    echo "<div class='warning'>
            <strong>⚠️ Найдено дубликатов:</strong> " . count($duplicates) . "
          </div>";

    echo "<h3>🔍 Список дубликатов:</h3>";
    foreach ($duplicates as $name => $count) {
        echo "<div class='duplicate-item'>
                <strong>" . htmlspecialchars($name) . "</strong> — встречается <strong>$count</strong> раз(а)
              </div>";
    }

    // Удаляем дубликаты
    echo "<h3>🧹 Удаляем дубликаты...</h3>";

    $originalCount = count($data['selected_products']);
    $data['selected_products'] = array_values(array_unique($data['selected_products']));
    $newCount = count($data['selected_products']);
    $removed = $originalCount - $newCount;

    echo "<div class='info'>
            ✓ Удалено дубликатов: <strong>$removed</strong>
          </div>";

    // Сохраняем
    $data['last_updated'] = date('Y-m-d H:i:s');
    $result = file_put_contents($dataFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    if ($result !== false) {
        echo "<div class='success'>
                <strong>✅ Данные успешно сохранены!</strong>
              </div>";

        echo "<h2>📊 Статистика ПОСЛЕ очистки:</h2>
              <div class='stats'>
                <div class='stat-box'>
                    <div class='stat-number'>$newCount</div>
                    <div class='stat-label'>Всего изделий</div>
                </div>
                <div class='stat-box'>
                    <div class='stat-number'>$removed</div>
                    <div class='stat-label'>Удалено дубликатов</div>
                </div>
              </div>";
    } else {
        echo "<div class='error'>
                <strong>❌ Не удалось сохранить файл!</strong><br>
                Проверьте права доступа.
              </div>";
    }

} else {
    echo "<div class='success'>
            <strong>✅ Дубликатов не обнаружено!</strong><br>
            Все изделия уникальны.
          </div>";
}

// Дополнительная проверка custom_products
echo "<h2>🔍 Дополнительная проверка:</h2>";

$customNames = array_map(function($p) { return $p['name']; }, $data['custom_products']);
$selectedNames = $data['selected_products'];

$missingInSelected = array_diff($customNames, $selectedNames);
$missingInCustom = array_diff($selectedNames, $customNames);

// Фильтруем изделия из products.json
$productsFile = __DIR__ . '/products.json';
$standardProducts = [];
if (file_exists($productsFile)) {
    $productsData = json_decode(file_get_contents($productsFile), true);
    if (isset($productsData['all_products'])) {
        $standardProducts = array_map(function($p) {
            return $p['name'];
        }, $productsData['all_products']);
    }
}

// Убираем стандартные изделия из проверки
$missingInCustomFiltered = array_filter($missingInCustom, function($name) use ($standardProducts) {
    return !in_array($name, $standardProducts);
});

if (count($missingInSelected) > 0) {
    echo "<div class='warning'>
            ⚠️ Изделия в custom_products, но отсутствующие в selected_products: <strong>" . count($missingInSelected) . "</strong>
          </div>";
}

if (count($missingInCustomFiltered) > 0) {
    echo "<div class='warning'>
            ⚠️ Изделия в selected_products, но отсутствующие в custom_products (не стандартные): <strong>" . count($missingInCustomFiltered) . "</strong>
          </div>";
}

if (count($missingInSelected) === 0 && count($missingInCustomFiltered) === 0) {
    echo "<div class='success'>✅ Все пользовательские изделия синхронизированы</div>";
}

echo "
        <h2>📋 Следующие шаги:</h2>
        <div class='info'>
            <ol style='list-style: decimal; padding-left: 20px;'>
                <li><strong>Обязательно!</strong> Откройте панель и нажмите Ctrl+F5</li>
                <li>Проверьте, что все изделия отображаются корректно</li>
                <li>Попробуйте добавить новое изделие</li>
                <li>Перезагрузите страницу - изделие должно остаться</li>
                <li><strong>Удалите все временные файлы:</strong>
                    <ul style='margin-top: 10px;'>
                        <li>fix_data.php</li>
                        <li>fix_data_v2.php</li>
                        <li>remove_duplicates.php (этот файл)</li>
                        <li>fix_permissions.sh</li>
                    </ul>
                </li>
            </ol>
        </div>
        
        <div class='success'>
            <strong>✅ Готово!</strong><br>
            Теперь ваша панель должна работать правильно. Не забудьте удалить временные файлы для безопасности!
        </div>
    </div>
</body>
</html>";
?>