<?php
/**
 * Keys.so API Proxy (root)
 * - Accepts GET with ?endpoint=/path and other params
 * - Forwards to https://api.keys.so with X-Keyso-TOKEN header
 * - Token is read from env KEYSO_TOKEN or Spy/config/keys.env (KEYSO_TOKEN=...)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Токен Keys.so (захардкожен по требованию)
$token = '68f901d59104e7.54090033d9642a220c8fc82cc162e7d83cc8b57a';

$endpoint = $_GET['endpoint'] ?? '';
if ($endpoint === '') {
    http_response_code(400);
    echo json_encode([
        'error' => 'Endpoint is required',
        'message' => 'Параметр endpoint обязателен'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Build upstream URL
$baseUrl = 'https://api.keys.so';
$params = $_GET;
unset($params['endpoint']);

$url = rtrim($baseUrl, '/') . $endpoint;
if (!empty($params)) {
    $url .= (strpos($url, '?') === false ? '?' : '&') . http_build_query($params);
}

// Simple local rate limit: 10 req / 10 sec
$rlFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'keys_so_rate_limit.json';
$now = time();
$requests = [];
if (file_exists($rlFile)) {
    $data = json_decode(@file_get_contents($rlFile), true);
    if ($data && isset($data['requests'])) {
        foreach ($data['requests'] as $ts) {
            if (($now - (int)$ts) < 10) { $requests[] = (int)$ts; }
        }
    }
}
if (count($requests) >= 10) {
    http_response_code(429);
    echo json_encode([
        'error' => 'Too Many Requests',
        'message' => 'Превышен лимит запросов (10 запросов в 10 секунд)'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
$requests[] = $now;
@file_put_contents($rlFile, json_encode(['requests' => $requests]));

// Perform request
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
    CURLOPT_HTTPHEADER => array_values(array_filter([
        $token ? ('X-Keyso-TOKEN: ' . $token) : null,
        'Accept: application/json',
        'Accept-Language: ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent: steelbro-keys-proxy/1.0'
    ])),
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
$curlNo   = curl_errno($ch);
curl_close($ch);

if ($curlNo !== 0) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Connection error',
        'message' => 'Ошибка соединения с API Keys.so',
        'details' => $curlErr
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// If no token present, hint clearly
if (!$token && ($httpCode === 401 || $httpCode === 403)) {
    http_response_code(401);
    echo json_encode([
        'error' => 'Unauthorized',
        'message' => 'Токен Keys.so не найден. Укажите KEYSO_TOKEN в Spy/config/keys.env или как переменную окружения.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code($httpCode ?: 500);
echo $response ?: json_encode([
    'error' => 'Empty response from upstream',
    'http_code' => $httpCode,
    'url' => $url
], JSON_UNESCAPED_UNICODE);


