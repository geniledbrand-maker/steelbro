<?php
/**
 * Скрипт для ПОЛНОЙ очистки корзины (deleted_products)
 * Версия 4.0 - удаляет ВСЁ из deleted_products
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🧹 Полная очистка корзины</h1>";
echo "<style>
body{font-family:system-ui;padding:20px;line-height:1.8;max-width:900px;}
ul{background:#f5f5f5;padding:15px;border-radius:8px;margin:10px 0;}
.success{color:#10b981;font-weight:bold;}
.error{color:#ef4444;font-weight:bold;}
.warning{color:#f59e0b;font-weight:bold;}
h2{margin-top:30px;border-bottom:2px solid #e5e7eb;padding-bottom:10px;}
.btn{background:#3b82f6;color:white;padding:12px 24px;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600;text-decoration:none;display:inline-block;}
.btn:hover{background:#2563eb;}
.btn-danger{background:#ef4444;}
.btn-danger:hover{background:#dc2626;}
</style>";

// ========== ПРАВИЛЬНОЕ ИМЯ ФАЙЛА ==========
$data_file = 'dashboard_data.json';

echo "<h2>🔍 Шаг 1: Поиск файла данных</h2>";

if (!file_exists($data_file)) {
    die("<p class='error'>❌ Файл $data_file не найден!</p>");
}

echo "<p class='success'>✅ Найден файл: <strong>$data_file</strong></p>";

// ========== ШАГ 2: ЧТЕНИЕ ДАННЫХ ==========
echo "<h2>📖 Шаг 2: Чтение данных</h2>";

$json_content = file_get_contents($data_file);
$data = json_decode($json_content, true);

if (!$data) {
    die("<p class='error'>❌ Ошибка чтения JSON!</p>");
}

echo "<p class='success'>✅ Данные успешно загружены</p>";

// ========== ШАГ 3: РЕЗЕРВНАЯ КОПИЯ ==========
echo "<h2>💾 Шаг 3: Создание резервной копии</h2>";

$backup_file = "dashboard_data_backup_" . date('Y-m-d_H-i-s') . ".json";
file_put_contents($backup_file, $json_content);
echo "<p class='success'>✅ Создана резервная копия: <strong>$backup_file</strong></p>";

// ========== ШАГ 4: АНАЛИЗ ==========
echo "<h2>📊 Шаг 4: Анализ корзины (deleted_products)</h2>";

$deleted_before = count($data['deleted_products'] ?? []);

echo "<p>В корзине находится: <strong class='warning'>$deleted_before</strong> изделий</p>";

if ($deleted_before === 0) {
    echo "<p class='success'>✨ Корзина уже пуста!</p>";
    echo "<br><a href='index.html' class='btn'>← Вернуться на панель</a>";
    exit;
}

// Показываем что будет удалено
echo "<h3>🗑️ Изделия, которые будут удалены:</h3>";
echo "<ol style='background:white;padding:20px;border-radius:8px;'>";
foreach ($data['deleted_products'] as $p) {
    echo "<li><strong>" . htmlspecialchars($p['name']) . "</strong> ";
    echo "(" . ($p['complexity'] ?? '—') . ", ";
    echo ($p['margin'] ?? '—') . ", ";
    echo ($p['demand'] ?? '—') . ")</li>";
}
echo "</ol>";

// ========== ПОДТВЕРЖДЕНИЕ ==========
if (!isset($_GET['confirm'])) {
    echo "<div style='margin:30px 0;padding:20px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;'>";
    echo "<p style='margin:0 0 15px 0;font-size:18px;font-weight:bold;'>⚠️ ВНИМАНИЕ!</p>";
    echo "<p style='margin:0 0 15px 0;'>Вы собираетесь удалить <strong>$deleted_before изделий</strong> из корзины НАВСЕГДА.</p>";
    echo "<p style='margin:0;'>Это действие нельзя отменить!</p>";
    echo "</div>";

    echo "<div style='display:flex;gap:12px;'>";
    echo "<a href='?confirm=yes' class='btn btn-danger'>🗑️ Да, удалить всё навсегда</a>";
    echo "<a href='index.html' class='btn'>← Отмена</a>";
    echo "</div>";
    exit;
}

// ========== ШАГ 5: ОЧИСТКА ==========
echo "<h2>🧹 Шаг 5: Очистка корзины</h2>";

// Также очищаем мусор из custom_products
$trash_names = ['1', '5', '7', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

$custom_before = count($data['custom_products'] ?? []);

// Удаляем мусор из custom_products
$data['custom_products'] = array_values(array_filter($data['custom_products'] ?? [], function($p) use ($trash_names) {
    return !in_array($p['name'], $trash_names);
}));

// ПОЛНОСТЬЮ ОЧИЩАЕМ deleted_products
$data['deleted_products'] = [];

// Удаляем дубликаты из custom_products
$unique = [];
$seen = [];
foreach ($data['custom_products'] as $p) {
    if (!in_array($p['name'], $seen)) {
        $unique[] = $p;
        $seen[] = $p['name'];
    }
}
$data['custom_products'] = array_values($unique);

// Очищаем selected_products от мусора
$all_names = array_column($data['custom_products'], 'name');
$data['selected_products'] = array_values(array_filter($data['selected_products'] ?? [], function($name) use ($all_names, $trash_names) {
    return !in_array($name, $trash_names) && (in_array($name, $all_names) || is_numeric($name));
}));

echo "<p class='success'>✅ Корзина полностью очищена</p>";
echo "<p class='success'>✅ Мусорные изделия удалены из custom_products</p>";
echo "<p class='success'>✅ Дубликаты удалены</p>";

// ========== ШАГ 6: СОХРАНЕНИЕ ==========
echo "<h2>💾 Шаг 6: Сохранение изменений</h2>";

$result = file_put_contents($data_file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($result === false) {
    die("<p class='error'>❌ Ошибка сохранения файла!</p>");
}

echo "<p class='success'>✅ Изменения успешно сохранены в: <strong>$data_file</strong></p>";

// ========== ШАГ 7: РЕЗУЛЬТАТ ==========
echo "<h2>✅ Шаг 7: Итоговый результат</h2>";

$custom_after = count($data['custom_products']);
$deleted_after = count($data['deleted_products']);

$custom_removed = $custom_before - $custom_after;
$deleted_removed = $deleted_before - $deleted_after;

echo "<ul>";
echo "<li><strong>Custom Products:</strong> $custom_after шт. ";
if ($custom_removed > 0) {
    echo "<span style='color:#ef4444;'>(удалено: $custom_removed)</span>";
}
echo "</li>";

echo "<li><strong>Deleted Products (корзина):</strong> $deleted_after шт. ";
echo "<span class='success'>(удалено: $deleted_removed) ✨ КОРЗИНА ПУСТА!</span>";
echo "</li>";
echo "</ul>";

$total_removed = $custom_removed + $deleted_removed;
echo "<p style='font-size:18px;color:#10b981;font-weight:bold;'>🎉 Всего удалено записей: $total_removed</p>";

// Показываем оставшиеся изделия
echo "<h3>📋 Оставшиеся пользовательские изделия ($custom_after шт.):</h3>";
if (empty($data['custom_products'])) {
    echo "<p>Нет пользовательских изделий</p>";
} else {
    echo "<ol style='background:white;padding:20px;border-radius:8px;'>";
    foreach ($data['custom_products'] as $p) {
        echo "<li><strong>" . htmlspecialchars($p['name']) . "</strong> — ";
        echo "Сложность: " . ($p['complexity'] ?? '—') . ", ";
        echo "Маржа: " . ($p['margin'] ?? '—') . ", ";
        echo "Спрос: " . ($p['demand'] ?? '—');
        echo "</li>";
    }
    echo "</ol>";
}

// ========== ФИНАЛ ==========
echo "<hr style='margin:40px 0;'>";
echo "<div style='background:#10b981;color:white;padding:20px;border-radius:12px;text-align:center;'>";
echo "<h2 style='margin:0;border:none;color:white;'>🎉 Корзина полностью очищена!</h2>";
echo "</div>";

echo "<div style='margin-top:30px;'>";
echo "<h3>📝 Следующие шаги:</h3>";
echo "<ol style='font-size:16px;line-height:2;'>";
echo "<li>Перейдите на <strong>панель управления</strong></li>";
echo "<li>Нажмите <strong>Ctrl+Shift+R</strong> (полная перезагрузка)</li>";
echo "<li>Откройте вкладку <strong>\"Удалённые изделия\"</strong></li>";
echo "<li>Убедитесь, что корзина пуста ✅</li>";
echo "</ol>";
echo "</div>";

echo "<div style='text-align:center;margin-top:30px;'>";
echo "<a href='index.html' class='btn'>← Вернуться на панель</a>";
echo "</div>";

echo "<div style='margin-top:30px;padding:15px;background:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;'>";
echo "<p style='margin:0;'><strong>💡 Совет:</strong> Файл резервной копии (<code>$backup_file</code>) сохранён на сервере. Если что-то пошло не так, вы можете восстановить данные из него.</p>";
echo "</div>";
?>