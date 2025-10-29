<?php
/**
 * API для панели Analyticssb
 * Поддерживает сохранение, загрузку, удаление и восстановление изделий.
 * Формат файла: dashboard_data.json
 * --------------------------------------
 * Методы:
 *  GET     — получить все данные
 *  POST    — сохранить/восстановить изделия
 *  DELETE  — удалить изделие (в корзину)
 *  OPTIONS — preflight для CORS
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$dataFile = __DIR__ . '/dashboard_data.json';

/**
 * Безопасный ответ JSON
 */
function sendJson($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Грузим текущее состояние данных
 */
function loadData($dataFile)
{
    if (!file_exists($dataFile)) {
        return [
            'selected_products' => [],
            'custom_products' => [],
            'deleted_products' => [],
            'last_updated' => date('Y-m-d H:i')
        ];
    }

    $json = json_decode(file_get_contents($dataFile), true);
    if (!is_array($json)) $json = [];

    // Гарантируем наличие всех ключей
    foreach (['selected_products', 'custom_products', 'deleted_products'] as $key) {
        if (!isset($json[$key]) || !is_array($json[$key])) {
            $json[$key] = [];
        }
    }

    if (empty($json['last_updated'])) {
        $json['last_updated'] = date('Y-m-d H:i');
    }

    return $json;
}

/**
 * Сохраняем файл с меткой времени
 */
function saveData($dataFile, $data)
{
    $data['last_updated'] = date('Y-m-d H:i');

    // Создаем резервную копию если файл существует
    if (file_exists($dataFile)) {
        $backupFile = $dataFile . '.backup';
        copy($dataFile, $backupFile);
    }

    $result = file_put_contents($dataFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    if ($result === false) {
        sendJson(['success' => false, 'error' => 'Не удалось сохранить данные'], 500);
    }

    return $data['last_updated'];
}

/**
 * Preflight для CORS
 */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = loadData($dataFile);

// ====================================================
// GET — получение данных
// ====================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    sendJson($data);
}

// ====================================================
// POST — сохранение или восстановление
// ====================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendJson(['success' => false, 'error' => 'Некорректный JSON'], 400);
    }

    // === 🔥 ПОСТОЯННОЕ УДАЛЕНИЕ ОДНОГО ИЗДЕЛИЯ ИЗ КОРЗИНЫ ===
    if (isset($input['permanent_delete_single'])) {
        $name_to_delete = $input['permanent_delete_single'];

        error_log("Удаление из корзины: " . $name_to_delete); // Отладка

        // Считаем сколько было
        $deleted_before = count($data['deleted_products']);

        // Удаляем изделие из deleted_products
        $data['deleted_products'] = array_values(array_filter(
            $data['deleted_products'],
            function($product) use ($name_to_delete) {
                return $product['name'] !== $name_to_delete;
            }
        ));

        $deleted_after = count($data['deleted_products']);
        $removed = $deleted_before - $deleted_after;

        error_log("Было: $deleted_before, Стало: $deleted_after, Удалено: $removed"); // Отладка

        // Сохраняем
        $timestamp = saveData($dataFile, $data);

        sendJson([
            'success' => true,
            'message' => 'Изделие удалено навсегда',
            'removed_count' => $removed,
            'timestamp' => $timestamp
        ]);
    }

    // === КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ===
    // Обновляем выбранные изделия (это главное!)
    if (isset($input['selected_products'])) {
        $data['selected_products'] = $input['selected_products'];
    }

    // Сохраняем пользовательские изделия
    if (isset($input['custom_products'])) {
        $data['custom_products'] = $input['custom_products'];
    }

    // === Добавление нового пользовательского изделия ===
    if (isset($input['add_custom_product'])) {
        $newProduct = $input['add_custom_product'];

        // Проверяем обязательные поля
        if (empty($newProduct['name'])) {
            sendJson(['success' => false, 'error' => 'Не указано название изделия'], 400);
        }

        // Проверяем, не существует ли уже такое изделие
        $exists = false;
        foreach ($data['custom_products'] as $p) {
            if ($p['name'] === $newProduct['name']) {
                $exists = true;
                break;
            }
        }

        if ($exists) {
            sendJson(['success' => false, 'error' => 'Изделие с таким названием уже существует'], 400);
        }

// Добавляем новое изделие
        $data['custom_products'][] = $newProduct;


    // === Восстановление удалённого изделия ===
    if (isset($input['restore_product'])) {
        $restoreName = $input['restore_product'];
        $restored = null;

        foreach ($data['deleted_products'] as $i => $p) {
            if ($p['name'] === $restoreName) {
                $restored = $p;
                unset($data['deleted_products'][$i]);
                break;
            }
        }

        if ($restored) {
            $data['deleted_products'] = array_values($data['deleted_products']);
            $data['custom_products'][] = $restored;

            // ВАЖНО: Также добавляем в selected_products!
            if (!in_array($restored['name'], $data['selected_products'])) {
            }
        } else {
            sendJson(['success' => false, 'error' => 'Не найдено изделие для восстановления'], 404);
        }
    }

    $timestamp = saveData($dataFile, $data);
    sendJson([
        'success' => true,
        'timestamp' => $timestamp,
        'message' => 'Данные успешно сохранены'
    ]);
}

// ====================================================
// DELETE — удаление изделия
// ====================================================
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = trim($input['name'] ?? '');

    if ($name === '') {
        sendJson(['success' => false, 'error' => 'Не указано имя изделия'], 400);
    }

    $found = false;
    $deleted = null;

    // 1️⃣ Ищем в custom_products
    foreach ($data['custom_products'] as $i => $product) {
        if ($product['name'] === $name) {
            $deleted = $product;
            unset($data['custom_products'][$i]);
            $found = true;
            break;
        }
    }

    // 2️⃣ Если не найдено — добавим базовую структуру
    if (!$found) {
        $deleted = [
            'name' => $name,
            'complexity' => '',
            'margin' => '',
            'demand' => '',
            'time' => ''
        ];
    }

    // 3️⃣ ВАЖНО: Удаляем также из selected_products!
    $data['selected_products'] = array_filter($data['selected_products'], function($prodName) use ($name) {
        return $prodName !== $name;
    });
    $data['selected_products'] = array_values($data['selected_products']);

    // Добавляем в удалённые
    $data['deleted_products'][] = $deleted;
    $data['custom_products'] = array_values($data['custom_products']);
    $data['deleted_products'] = array_values($data['deleted_products']);

    $timestamp = saveData($dataFile, $data);
    sendJson([
        'success' => true,
        'message' => 'Изделие удалено (в корзину)',
        'timestamp' => $timestamp
    ]);
}

// ====================================================
// Если запрос не распознан
// ====================================================
sendJson(['success' => false, 'error' => 'Неподдерживаемый метод'], 405);