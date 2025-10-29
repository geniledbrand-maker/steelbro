<?php
/**
 * API для работы с JSON файлами доменов
 * Файл: /data/domains_api.php
 * Создан: 2025-01-20
 * Модифицирован: 2025-01-20
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Пути к файлам
$domainsFile = __DIR__ . '/output/domains.json';
$tagColorsFile = __DIR__ . '/output/tag_colors.json';
$savedColorsFile = __DIR__ . '/output/saved_colors.json';

// Функция для чтения JSON файла
function readJsonFile($filePath, $default = []) {
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        if ($content !== false) {
            $data = json_decode($content, true);
            return $data !== null ? $data : $default;
        }
    }
    return $default;
}

// Функция для записи JSON файла
function writeJsonFile($filePath, $data) {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        return false;
    }
    
    // Создаем директорию если не существует
    $dir = dirname($filePath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    return file_put_contents($filePath, $json) !== false;
}

// Функция для логирования
function logAction($action, $data = null) {
    $logFile = __DIR__ . '/output/actions.log';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $action";
    if ($data !== null) {
        $logEntry .= " - " . json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    $logEntry .= "\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

// Получаем метод и действие
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'GET':
            switch ($action) {
                case 'domains':
                    $domains = readJsonFile($domainsFile, []);
                    echo json_encode([
                        'success' => true,
                        'data' => $domains,
                        'count' => count($domains)
                    ], JSON_UNESCAPED_UNICODE);
                    break;
                    
                case 'tag_colors':
                    $tagColors = readJsonFile($tagColorsFile, []);
                    echo json_encode([
                        'success' => true,
                        'data' => $tagColors
                    ], JSON_UNESCAPED_UNICODE);
                    break;
                    
                case 'saved_colors':
                    $savedColors = readJsonFile($savedColorsFile, []);
                    echo json_encode([
                        'success' => true,
                        'data' => $savedColors
                    ], JSON_UNESCAPED_UNICODE);
                    break;
                    
                case 'all':
                    $domains = readJsonFile($domainsFile, []);
                    $tagColors = readJsonFile($tagColorsFile, []);
                    $savedColors = readJsonFile($savedColorsFile, []);
                    echo json_encode([
                        'success' => true,
                        'data' => [
                            'domains' => $domains,
                            'tagColors' => $tagColors,
                            'savedColors' => $savedColors
                        ]
                    ], JSON_UNESCAPED_UNICODE);
                    break;
                    
                default:
                    throw new Exception('Неизвестное действие');
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if ($input === null) {
                throw new Exception('Неверный JSON');
            }
            
            switch ($action) {
                case 'save_domains':
                    if (!isset($input['domains'])) {
                        throw new Exception('Отсутствуют данные доменов');
                    }
                    
                    $success = writeJsonFile($domainsFile, $input['domains']);
                    if ($success) {
                        logAction('SAVE_DOMAINS', ['count' => count($input['domains'])]);
                        echo json_encode(['success' => true, 'message' => 'Домены сохранены']);
                    } else {
                        throw new Exception('Ошибка сохранения доменов');
                    }
                    break;
                    
                case 'save_tag_colors':
                    if (!isset($input['tagColors'])) {
                        throw new Exception('Отсутствуют данные цветов тегов');
                    }
                    
                    $success = writeJsonFile($tagColorsFile, $input['tagColors']);
                    if ($success) {
                        logAction('SAVE_TAG_COLORS', ['count' => count($input['tagColors'])]);
                        echo json_encode(['success' => true, 'message' => 'Цвета тегов сохранены']);
                    } else {
                        throw new Exception('Ошибка сохранения цветов тегов');
                    }
                    break;
                    
                case 'save_saved_colors':
                    if (!isset($input['savedColors'])) {
                        throw new Exception('Отсутствуют данные сохраненных цветов');
                    }
                    
                    $success = writeJsonFile($savedColorsFile, $input['savedColors']);
                    if ($success) {
                        logAction('SAVE_SAVED_COLORS', ['count' => count($input['savedColors'])]);
                        echo json_encode(['success' => true, 'message' => 'Сохраненные цвета сохранены']);
                    } else {
                        throw new Exception('Ошибка сохранения сохраненных цветов');
                    }
                    break;
                    
                case 'save_all':
                    $domains = $input['domains'] ?? [];
                    $tagColors = $input['tagColors'] ?? [];
                    $savedColors = $input['savedColors'] ?? [];
                    
                    $domainsSuccess = writeJsonFile($domainsFile, $domains);
                    $tagColorsSuccess = writeJsonFile($tagColorsFile, $tagColors);
                    $savedColorsSuccess = writeJsonFile($savedColorsFile, $savedColors);
                    
                    if ($domainsSuccess && $tagColorsSuccess && $savedColorsSuccess) {
                        logAction('SAVE_ALL', [
                            'domains' => count($domains),
                            'tagColors' => count($tagColors),
                            'savedColors' => count($savedColors)
                        ]);
                        echo json_encode(['success' => true, 'message' => 'Все данные сохранены']);
                    } else {
                        throw new Exception('Ошибка сохранения данных');
                    }
                    break;
                    
                default:
                    throw new Exception('Неизвестное действие');
            }
            break;
            
        default:
            throw new Exception('Неподдерживаемый метод');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

// End of file: /data/domains_api.php
// Last modified: 2025-01-20
?>

