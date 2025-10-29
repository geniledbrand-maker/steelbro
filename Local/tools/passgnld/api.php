<?php
/**
 * API для управления паролями, блокнотом и заметками
 * Обновленная версия с подробным логированием
 */

header('Content-Type: application/json; charset=utf-8');

// Включаем отображение ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 0); // Не показываем на экране, только в логе

// Файлы для хранения данных
$dataDir = __DIR__ . '/data';
$passwordsFile = $dataDir . '/passwords.json';
$notepadFile = $dataDir . '/notepad.txt';
$notesFile = $dataDir . '/notes.json';
$logFile = $dataDir . '/api-log.txt';

// Функция логирования
function writeLog($message) {
    global $logFile, $dataDir;

    if (!file_exists($dataDir)) {
        mkdir($dataDir, 0777, true);
    }

    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// Создаем директорию data если её нет
if (!file_exists($dataDir)) {
    writeLog("Создание директории data");
    if (mkdir($dataDir, 0777, true)) {
        writeLog("✓ Директория data создана успешно");
    } else {
        writeLog("✗ ОШИБКА: Не удалось создать директорию data");
    }
}

// Проверяем права на запись
if (!is_writable($dataDir)) {
    writeLog("✗ ОШИБКА: Нет прав на запись в директорию: {$dataDir}");
    echo json_encode([
        'success' => false,
        'error' => 'Directory not writable: ' . $dataDir,
        'permissions' => substr(sprintf('%o', fileperms($dataDir)), -4)
    ]);
    exit;
}

// Получаем действие
$action = $_GET['action'] ?? '';
writeLog("=== Запрос: {$action} ===");

// Обработка различных действий
switch ($action) {
    case 'save':
        // Сохранение паролей
        writeLog("Сохранение паролей");
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['passwords'])) {
            $result = file_put_contents(
                $passwordsFile,
                json_encode($data['passwords'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            );

            if ($result !== false) {
                writeLog("✓ Пароли сохранены: {$result} байт");
                echo json_encode(['success' => true, 'bytes' => $result]);
            } else {
                writeLog("✗ ОШИБКА при сохранении паролей");
                echo json_encode(['success' => false, 'error' => 'Failed to write file']);
            }
        } else {
            writeLog("✗ Нет данных паролей в запросе");
            echo json_encode(['success' => false, 'error' => 'No passwords data']);
        }
        break;

    case 'load':
        // Загрузка паролей
        writeLog("Загрузка паролей");
        if (file_exists($passwordsFile)) {
            $passwords = json_decode(file_get_contents($passwordsFile), true);
            writeLog("✓ Загружено паролей: " . count($passwords));
            echo json_encode(['success' => true, 'passwords' => $passwords]);
        } else {
            writeLog("! Файл паролей не существует, возврат пустого массива");
            echo json_encode(['success' => true, 'passwords' => []]);
        }
        break;

    case 'saveNotepad':
        // Сохранение блокнота
        writeLog("Сохранение блокнота");
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['notepad'])) {
            $result = file_put_contents($notepadFile, $data['notepad']);

            if ($result !== false) {
                writeLog("✓ Блокнот сохранен: {$result} байт");
                echo json_encode(['success' => true, 'bytes' => $result]);
            } else {
                writeLog("✗ ОШИБКА при сохранении блокнота");
                echo json_encode(['success' => false, 'error' => 'Failed to write file']);
            }
        } else {
            writeLog("✗ Нет данных блокнота в запросе");
            echo json_encode(['success' => false, 'error' => 'No notepad data']);
        }
        break;

    case 'loadNotepad':
        // Загрузка блокнота
        writeLog("Загрузка блокнота");
        if (file_exists($notepadFile)) {
            $notepad = file_get_contents($notepadFile);
            writeLog("✓ Блокнот загружен: " . strlen($notepad) . " символов");
            echo json_encode(['success' => true, 'notepad' => $notepad]);
        } else {
            writeLog("! Файл блокнота не существует, возврат пустой строки");
            echo json_encode(['success' => true, 'notepad' => '']);
        }
        break;

    case 'saveNotes':
        // Сохранение заметок и метаданных тегов
        writeLog("=== СОХРАНЕНИЕ ЗАМЕТОК ===");

        $rawInput = file_get_contents('php://input');
        writeLog("Получено данных: " . strlen($rawInput) . " байт");

        $data = json_decode($rawInput, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $error = json_last_error_msg();
            writeLog("✖ Ошибка парсинга JSON: {$error}");
            echo json_encode(['success' => false, 'error' => 'JSON parse error: ' . $error]);
            break;
        }

        if (!isset($data['notes'])) {
            writeLog("✖ Нет поля 'notes' в запросе");
            writeLog("Структура запроса: " . print_r(array_keys($data), true));
            echo json_encode(['success' => false, 'error' => 'No notes data']);
            break;
        }

        $notes = is_array($data['notes']) ? $data['notes'] : [];
        $notesCount = count($notes);
        writeLog("Получено заметок для сохранения: {$notesCount}");

        $tagColors = [];
        if (isset($data['tagColors']) && is_array($data['tagColors'])) {
            foreach ($data['tagColors'] as $tagName => $colorValue) {
                if (is_string($tagName) && is_string($colorValue) && $tagName !== '') {
                    $tagColors[$tagName] = $colorValue;
                }
            }
        }
        writeLog("Цветов тегов: " . count($tagColors));

        $savedColors = [];
        if (isset($data['savedColors']) && is_array($data['savedColors'])) {
            foreach ($data['savedColors'] as $colorValue) {
                if (is_string($colorValue) && $colorValue !== '') {
                    $savedColors[] = $colorValue;
                }
            }
        }
        writeLog("Сохранённых цветов: " . count($savedColors));

        if (!is_writable($dataDir)) {
            $perms = substr(sprintf('%o', fileperms($dataDir)), -4);
            writeLog("✖ Ошибка: Нет прав на запись в директорию");
            writeLog("Права директории: {$perms}");
            echo json_encode([
                'success' => false,
                'error' => 'Directory not writable: ' . $dataDir,
                'permissions' => $perms
            ]);
            break;
        }

        $payload = [
            'notes' => $notes,
            'tagColors' => (object) $tagColors,
            'savedColors' => array_values($savedColors)
        ];

        $jsonData = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($jsonData === false) {
            $error = json_last_error_msg();
            writeLog("✖ Ошибка создания JSON: {$error}");
            echo json_encode(['success' => false, 'error' => 'JSON encode error: ' . $error]);
            break;
        }

        writeLog("JSON создан: " . strlen($jsonData) . " байт");

        $result = file_put_contents($notesFile, $jsonData);

        if ($result === false) {
            $error = error_get_last();
            writeLog("✖ Ошибка записи файла");
            writeLog("Последняя ошибка PHP: " . print_r($error, true));
            echo json_encode([
                'success' => false,
                'error' => 'Failed to write file',
                'php_error' => $error
            ]);
            break;
        }

        writeLog("✔✔✔ ЗАМЕТКИ УСПЕШНО СОХРАНЕНЫ ✔✔✔");
        writeLog("Записано байт: {$result}");
        writeLog("Путь к файлу: {$notesFile}");
        writeLog("Права файла: " . substr(sprintf('%o', fileperms($notesFile)), -4));

        if (file_exists($notesFile)) {
            $fileSize = filesize($notesFile);
            $fileContent = file_get_contents($notesFile);
            $readPayload = json_decode($fileContent, true);

            $readCount = 0;
            if (is_array($readPayload)) {
                if (isset($readPayload['notes']) && is_array($readPayload['notes'])) {
                    $readCount = count($readPayload['notes']);
                } elseif (array_keys($readPayload) === range(0, count($readPayload) - 1)) {
                    $readCount = count($readPayload);
                }
            }

            writeLog("Проверка: файл существует, размер: {$fileSize}");
            writeLog("Проверка: прочитано заметок: {$readCount}");
        }

        echo json_encode([
            'success' => true,
            'saved' => $notesCount,
            'bytes' => $result,
            'file' => $notesFile,
            'timestamp' => date('Y-m-d H:i:s'),
            'tagColors' => $tagColors,
            'savedColors' => $savedColors
        ]);
        break;

    case 'loadNotes':
        // Загрузка заметок с учётом метаданных
        writeLog("=== ЗАГРУЗКА ЗАМЕТОК ===");
        writeLog("Путь к файлу: {$notesFile}");

        $notes = [];
        $tagColors = [];
        $savedColors = [];

        if (file_exists($notesFile)) {
            writeLog("Файл существует");
            $fileSize = filesize($notesFile);
            writeLog("Размер файла: {$fileSize} байт");

            $content = file_get_contents($notesFile);

            if ($content === false) {
                writeLog("✖ Ошибка чтения файла");
                echo json_encode(['success' => false, 'error' => 'Failed to read file']);
                break;
            }

            writeLog("Файл прочитан: " . strlen($content) . " символов");

            $decoded = json_decode($content, true);

            if ($decoded === null && strlen($content) > 0) {
                $error = json_last_error_msg();
                writeLog("✖ Ошибка парсинга JSON: {$error}");
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON in file: ' . $error
                ]);
                break;
            }

            if (is_array($decoded)) {
                if (isset($decoded['notes']) && is_array($decoded['notes'])) {
                    $notes = $decoded['notes'];
                    if (isset($decoded['tagColors']) && is_array($decoded['tagColors'])) {
                        $tagColors = $decoded['tagColors'];
                    }
                    if (isset($decoded['savedColors']) && is_array($decoded['savedColors'])) {
                        $savedColors = $decoded['savedColors'];
                    }
                } elseif (array_keys($decoded) === range(0, count($decoded) - 1)) {
                    $notes = $decoded;
                }
            }

            $notesCount = count($notes);
            writeLog("Загружено заметок: {$notesCount}");
        } else {
            writeLog("! Файл не существует, возврат пустого массива");
        }

        echo json_encode([
            'success' => true,
            'notes' => $notes,
            'count' => count($notes),
            'file' => $notesFile,
            'file_size' => isset($fileSize) ? $fileSize : 0,
            'exists' => file_exists($notesFile),
            'tagColors' => $tagColors,
            'savedColors' => $savedColors
        ]);
        break;

            }



            writeLog("Р¤Р°Р№Р» РїСЂРѕС‡РёС‚Р°РЅ: " . strlen() . " СЃРёРјРІРѕР»РѕРІ");



             = json_decode(, true);



            if ( === null && strlen() > 0) {

                 = json_last_error_msg();

                writeLog("вњ— РћРЁРР‘РљРђ РїР°СЂСЃРёРЅРіР° JSON: {}");

                echo json_encode([

                    'success' => false,

                    'error' => 'Invalid JSON in file: ' . 

                ]);

                break;

            }



            if (is_array()) {

                if (isset(['notes']) && is_array(['notes'])) {

                     = ['notes'];

                    if (isset(['tagColors']) && is_array(['tagColors'])) {

                         = ['tagColors'];

                    }

                    if (isset(['savedColors']) && is_array(['savedColors'])) {

                         = ['savedColors'];

                    }

                } elseif (array_keys() === range(0, count() - 1)) {

                    // Р¤РѕСЂРјР°С‚ СЃС‚Р°СЂРѕР¹ РІРµСЂСЃРёРё (РїСЂРѕСЃС‚Рѕ РјР°СЃСЃРёРІ Р·Р°РјРµС‚РѕРє)

                     = ;

                }

            }



             = count();

            writeLog("Р—Р°РіСЂСѓР¶РµРЅРѕ Р·Р°РјРµС‚РѕРє: {}");

        } else {

            writeLog("! Р¤Р°Р№Р» РЅРµ СЃСѓС‰РµСЃС‚РІСѓРµС‚, РІРѕР·РІСЂР°С‚ РїСѓСЃС‚РѕРіРѕ РјР°СЃСЃРёРІР°");

        }



        echo json_encode([

            'success' => true,

            'notes' => ,

            'count' => count(),

            'file' => ,

            'file_size' => isset() ?  : 0,

            'exists' => file_exists(),

            'tagColors' => ,

            'savedColors' => 

        ]);

        break;
            }

            writeLog("Файл прочитан: " . strlen($content) . " символов");

            $notes = json_decode($content, true);

            if ($notes === null && strlen($content) > 0) {
                $error = json_last_error_msg();
                writeLog("✗ ОШИБКА парсинга JSON: {$error}");
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON in file: ' . $error
                ]);
                break;
            }

            $notesCount = count($notes);
            writeLog("✓ Загружено заметок: {$notesCount}");

            echo json_encode([
                'success' => true,
                'notes' => $notes,
                'count' => $notesCount,
                'file' => $notesFile,
                'file_size' => $fileSize
            ]);
        } else {
            writeLog("! Файл не существует, возврат пустого массива");
            echo json_encode([
                'success' => true,
                'notes' => [],
                'file' => $notesFile,
                'exists' => false
            ]);
        }
        break;

    default:
        writeLog("✗ Неизвестное действие: {$action}");
        echo json_encode(['success' => false, 'error' => 'Unknown action: ' . $action]);
        break;
}

writeLog("=== Конец запроса ===\n");
?>