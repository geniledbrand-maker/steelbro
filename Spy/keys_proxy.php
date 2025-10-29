<?php
/**
 * Keys.so API Proxy
 * Файл: keys_proxy.php
 *
 * Поведение:
 * - При наличии токена KEYSO_TOKEN проксирует запросы на https://api.keys.so
 * - При отсутствии токена — возвращает валидные заглушки (mock) для разработки
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Получаем данные запроса
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Поддержка GET запросов с параметром endpoint
$endpoint = $_GET['endpoint'] ?? '';
if ($endpoint) {
    // GET запрос - обрабатываем напрямую
    $domain = $_GET['domain'] ?? '';
    $base = $_GET['base'] ?? 'msk';
    $perPage = $_GET['per_page'] ?? 100;
    
    // Загружаем токен
    $token = getenv('KEYSO_TOKEN');
    if (!$token) {
        $envPath = __DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'keys.env';
        if (file_exists($envPath)) {
            $env = parse_ini_file($envPath, false, INI_SCANNER_RAW);
            if (isset($env['KEYSO_TOKEN'])) {
                $token = trim($env['KEYSO_TOKEN']);
            }
        }
    }
    
    if ($token) {
        // Проксируем запрос к API
        forwardApiGet($endpoint, [
            'domain' => $domain,
            'base' => $base,
            'per_page' => $perPage
        ], $token);
    } else {
        // Возвращаем заглушку
        handleGetRequest($endpoint, $domain, $base, $perPage);
    }
    exit;
}

// Отладочная информация
error_log('Keys Proxy Debug - Input: ' . $input);
error_log('Keys Proxy Debug - Decoded data: ' . print_r($data, true));

// Если нет данных POST, возвращаем ошибку
if (!$data) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Нет данных запроса',
        'debug' => [
            'input' => $input,
            'method' => $_SERVER['REQUEST_METHOD']
        ]
    ]);
    exit;
}

$action = $data['action'] ?? '';

// Загружаем токен из окружения или из файла Spy/config/keys.env (KEYSO_TOKEN=...)
$token = getenv('KEYSO_TOKEN');
if (!$token) {
    $envPath = __DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'keys.env';
    if (file_exists($envPath)) {
        $env = parse_ini_file($envPath, false, INI_SCANNER_RAW);
        if (isset($env['KEYSO_TOKEN'])) {
            $token = trim($env['KEYSO_TOKEN']);
        }
    }
}

// Хелпер: проксирование GET-запроса на api.keys.so
function forwardApiGet(string $endpoint, array $query, string $token)
{
    $baseUrl = 'https://api.keys.so';
    $qs = http_build_query($query);
    $url = rtrim($baseUrl, '/') . $endpoint . ($qs ? ('?' . $qs) : '');

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'X-Keyso-TOKEN: ' . $token,
        ],
    ]);

    $body = curl_exec($ch);
    $err = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($err) {
        http_response_code(502);
        echo json_encode(['success' => false, 'error' => 'Curl error: ' . $err]);
        return;
    }

    if ($code < 200 || $code >= 300) {
        http_response_code($code ?: 500);
        echo json_encode(['success' => false, 'error' => 'Upstream HTTP ' . $code, 'raw' => $body]);
        return;
    }

    // Возвращаем как есть
    header('Content-Type: application/json; charset=utf-8');
    echo $body;
}

// Обработка различных действий
switch ($action) {
    case 'check_api':
        if ($token) {
            // Минимальная проверка доступности: дергаем domain_dashboard для well-known домена
            forwardApiGet('/report/simple/domain_dashboard', [
                'base' => 'msk',
                'domain' => 'yandex.ru'
            ], $token);
        } else {
            handleCheckAPI(); // mock
        }
        break;

    case 'get_domain_dashboard':
        if ($token) {
            $domain = $data['domain'] ?? '';
            $base = $data['region'] ?? 'msk';
            forwardApiGet('/report/simple/domain_dashboard', [
                'base' => $base,
                'domain' => $domain,
            ], $token);
        } else {
            handleGetDomainDashboard($data); // mock
        }
        break;

    case 'get_organic_keywords':
        if ($token) {
            $domain = $data['domain'] ?? '';
            $base = $data['region'] ?? 'msk';
            $perPage = $data['per_page'] ?? 100;
            forwardApiGet('/report/simple/organic/keywords', [
                'base' => $base,
                'domain' => $domain,
                'per_page' => $perPage,
            ], $token);
        } else {
            handleGetOrganicKeywords($data); // mock
        }
        break;

    case 'get_site_pages':
        if ($token) {
            $domain = $data['domain'] ?? '';
            $base = $data['region'] ?? 'msk';
            $perPage = $data['per_page'] ?? 100;
            forwardApiGet('/report/simple/organic/sitepages', [
                'base' => $base,
                'domain' => $domain,
                'per_page' => $perPage,
            ], $token);
        } else {
            handleGetSitePages($data); // mock
        }
        break;

    case 'get_context_ads':
        if ($token) {
            $domain = $data['domain'] ?? '';
            $base = $data['region'] ?? 'msk';
            $perPage = $data['per_page'] ?? 50;
            forwardApiGet('/report/simple/context/ads/', [
                'base' => $base,
                'domain' => $domain,
                'per_page' => $perPage,
            ], $token);
        } else {
            handleGetContextAds($data); // mock
        }
        break;

    case 'get_competitors':
        if ($token) {
            $domain = $data['domain'] ?? '';
            $base = $data['region'] ?? 'msk';
            $perPage = $data['per_page'] ?? 50;
            forwardApiGet('/report/simple/organic/concurents', [
                'base' => $base,
                'domain' => $domain,
                'per_page' => $perPage,
            ], $token);
        } else {
            handleGetCompetitors($data); // mock
        }
        break;

    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Неизвестное действие: ' . $action
        ]);
}

/**
 * Проверка API статуса
 */
function handleCheckAPI() {
    echo json_encode([
        'success' => true,
        'message' => 'API работает (заглушка)',
        'status' => 'active',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Получение дашборда домена
 */
function handleGetDomainDashboard($data) {
    $domain = $data['domain'] ?? 'example.com';
    $region = $data['region'] ?? 'msk';
    
    // Генерируем тестовые данные
    $response = [
        'success' => true,
        'data' => [
            'domain' => $domain,
            'region' => $region,
            'it10' => rand(5, 50),      // Топ-10 позиций
            'it50' => rand(20, 200),    // Топ-50 позиций
            'vis' => rand(1000, 50000), // Видимость
            'adscnt' => rand(3, 15),    // Количество рекламных объявлений
            'adkeyscnt' => rand(10, 100), // Количество рекламных ключевых слов
            'adcost' => rand(50000, 500000), // Стоимость рекламы
            'keys' => generateTestKeywords(10)
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response);
}

/**
 * Получение органических ключевых слов
 */
function handleGetOrganicKeywords($data) {
    $domain = $data['domain'] ?? 'example.com';
    $region = $data['region'] ?? 'msk';
    
    $response = [
        'success' => true,
        'data' => generateTestKeywords(50),
        'total' => 50,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response);
}

/**
 * Получение страниц сайта
 */
function handleGetSitePages($data) {
    $domain = $data['domain'] ?? 'example.com';
    $region = $data['region'] ?? 'msk';
    
    $pages = [];
    for ($i = 1; $i <= 20; $i++) {
        $pages[] = [
            'url' => "https://{$domain}/page-{$i}",
            'title' => "Страница {$i} - {$domain}",
            'keywords' => rand(5, 50),
            'traffic' => rand(100, 5000),
            'position' => rand(1, 100)
        ];
    }
    
    $response = [
        'success' => true,
        'data' => $pages,
        'total' => 20,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response);
}

/**
 * Получение контекстной рекламы
 */
function handleGetContextAds($data) {
    $domain = $data['domain'] ?? 'example.com';
    $region = $data['region'] ?? 'msk';
    
    $ads = [];
    for ($i = 1; $i <= 15; $i++) {
        $ads[] = [
            'title' => "Рекламное объявление {$i}",
            'description' => "Описание рекламного объявления для {$domain}",
            'url' => "https://advertiser-{$i}.com",
            'position' => rand(1, 10),
            'cost' => rand(1000, 50000)
        ];
    }
    
    $response = [
        'success' => true,
        'data' => $ads,
        'total' => 15,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response);
}

/**
 * Получение конкурентов
 */
function handleGetCompetitors($data) {
    $domain = $data['domain'] ?? 'example.com';
    $region = $data['region'] ?? 'msk';
    
    $competitors = [];
    $competitorDomains = ['competitor1.com', 'competitor2.ru', 'competitor3.net', 'competitor4.org', 'competitor5.biz'];
    
    foreach ($competitorDomains as $compDomain) {
        $competitors[] = [
            'domain' => $compDomain,
            'common_keywords' => rand(10, 100),
            'traffic' => rand(1000, 50000),
            'position_overlap' => rand(20, 80)
        ];
    }
    
    $response = [
        'success' => true,
        'data' => $competitors,
        'total' => count($competitors),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response);
}

/**
 * Генерация тестовых ключевых слов
 */
function generateTestKeywords($count) {
    $keywords = [
        'купить', 'продать', 'заказать', 'доставка', 'цена', 'скидка', 'акция',
        'каталог', 'товар', 'услуга', 'консультация', 'поддержка', 'гарантия',
        'отзывы', 'рейтинг', 'качество', 'быстро', 'дешево', 'надежно'
    ];
    
    $result = [];
    for ($i = 0; $i < $count; $i++) {
        $keyword = $keywords[array_rand($keywords)] . ' ' . ($i + 1);
        $result[] = [
            'word' => $keyword,
            'ws' => rand(100, 5000),      // Частота поиска
            'wsk' => rand(50, 3000),      // Частота с ключевым словом
            'pos' => rand(1, 100),        // Позиция
            'url' => 'https://example.com/page-' . ($i + 1)
        ];
    }
    
    return $result;
}

/**
 * Обработка GET запросов (заглушки)
 */
function handleGetRequest($endpoint, $domain, $base, $perPage) {
    switch ($endpoint) {
        case '/report/simple/domain_dashboard':
            handleGetDomainDashboard(['domain' => $domain, 'region' => $base]);
            break;
        case '/report/simple/organic/keywords':
            handleGetOrganicKeywords(['domain' => $domain, 'region' => $base, 'per_page' => $perPage]);
            break;
        case '/report/simple/organic/sitepages':
            handleGetSitePages(['domain' => $domain, 'region' => $base, 'per_page' => $perPage]);
            break;
        case '/report/simple/context/ads':
            handleGetContextAds(['domain' => $domain, 'region' => $base, 'per_page' => $perPage]);
            break;
        case '/report/simple/organic/concurents':
            handleGetCompetitors(['domain' => $domain, 'region' => $base, 'per_page' => $perPage]);
            break;
        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Неизвестный endpoint: ' . $endpoint
            ]);
    }
}
?>
