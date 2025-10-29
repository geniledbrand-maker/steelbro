<?php
/**
 * Keys.so API Proxy с расширенной диагностикой
 */

// Включаем отображение ошибок для диагностики
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Не выводим в HTML
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Настройки ===
$apiKey = '68f901d59104e7.54090033d9642a220c8fc82cc162e7d83cc8b57a';
$baseUrl = 'https://api.keys.so';

// Путь к файлу логов (создайте директорию logs в корне)
$logFile = __DIR__ . '/logs/keys_proxy.log';

// Функция логирования
function logDebug($message, $data = null) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message";
    if ($data !== null) {
        $logMessage .= "\n" . print_r($data, true);
    }
    $logMessage .= "\n---\n";
    @file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// === Входные параметры ===
$endpoint = $_GET['endpoint'] ?? $_POST['endpoint'] ?? '';

logDebug('Новый запрос', [
    'endpoint' => $endpoint,
    'GET' => $_GET,
    'POST' => $_POST,
    'method' => $_SERVER['REQUEST_METHOD']
]);

if ($endpoint === '') {
    http_response_code(400);
    $error = [
        'error' => 'Endpoint is required',
        'message' => 'Параметр endpoint обязателен'
    ];
    logDebug('Ошибка: endpoint не указан');
    echo json_encode($error, JSON_UNESCAPED_UNICODE);
    exit;
}

// Собираем параметры
$params = array_merge($_GET, $_POST);
unset($params['endpoint']);

// Формируем URL
$url = $baseUrl . $endpoint;
if (!empty($params)) {
    $url .= (strpos($url, '?') === false ? '?' : '&') . http_build_query($params);
}

logDebug('Отправка запроса к Keys.so', [
    'full_url' => $url,
    'params' => $params
]);

// === Запрос к Keys.so ===
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_HTTPHEADER => [
        'X-Keyso-TOKEN: ' . $apiKey,
        'Accept: application/json',
        'User-Agent: zhar-svet-keys-proxy/1.0'
    ],
    CURLOPT_VERBOSE => false
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
$curlNo   = curl_errno($ch);
$curlInfo = curl_getinfo($ch);
curl_close($ch);

logDebug('Ответ от Keys.so', [
    'http_code' => $httpCode,
    'curl_error' => $curlErr,
    'curl_errno' => $curlNo,
    'response_length' => strlen($response),
    'response_preview' => substr($response, 0, 500)
]);

// Проверка ошибок соединения
if ($curlNo !== 0) {
    http_response_code(500);
    $error = [
        'error' => 'Connection error',
        'details' => $curlErr,
        'errno' => $curlNo
    ];
    logDebug('CURL ошибка', $error);
    echo json_encode($error, JSON_UNESCAPED_UNICODE);
    exit;
}

// Попытка декодировать JSON для валидации
$jsonData = json_decode($response, true);
if ($jsonData === null && json_last_error() !== JSON_ERROR_NONE) {
    logDebug('Ошибка парсинга JSON', [
        'json_error' => json_last_error_msg(),
        'raw_response' => $response
    ]);
}

// Проверка на ошибки авторизации
if ($httpCode === 401 || $httpCode === 403) {
    logDebug('ОШИБКА АВТОРИЗАЦИИ! Проверьте API ключ');
}

// Возвращаем ответ клиенту
http_response_code($httpCode);
echo $response ?: json_encode([
    'error' => 'Empty response from upstream',
    'http_code' => $httpCode,
    'url' => $baseUrl . $endpoint
], JSON_UNESCAPED_UNICODE);