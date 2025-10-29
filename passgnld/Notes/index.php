<?php
// Установка заголовка для правильной кодировки
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Система заметок</title>

    <!-- Оптимизированная загрузка стилей -->
    <style>
        /* Базовые стили для работы системы заметок - встроенные для ускорения загрузки */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background: #f5f7fa; min-height: 100vh; padding: 16px; }
        .app-container { max-width: 1600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 30px; min-height: calc(100vh - 40px); }
        .app-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
        .app-title { display: flex; align-items: center; gap: 12px; }
        .app-title h1 { font-size: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .app-title span { font-size: 32px; }
        .hidden { display: none; }
    </style>

    <!-- Асинхронная загрузка CSS для заметок -->
    <link rel="stylesheet" href="notes-system.css">

    <!-- Асинхронная загрузка библиотек -->
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <script defer src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
<div class="app-container">
    <header class="app-header">
        <div class="app-title">
            <span>📝</span>
            <h1>Система заметок</h1>
        </div>
        <div>
            <a href="../" class="back-link">Вернуться к генератору паролей</a>
        </div>
    </header>

    <div class="notes-content" id="noteTab">
        <!-- Header с кнопками управления -->
        <div class="notes-header">
            <button id="newNoteBtn" class="notes-new-btn">
                <span>✨</span> Новая заметка
            </button>
            <div class="notes-search-container">
                <input
                        type="text"
                        id="notesSearchInput"
                        class="notes-search-input"
                        placeholder="🔍 Поиск по заметкам..."
                >
            </div>
        </div>

        <!-- Layout с боковой панелью -->
        <div class="notes-layout">
            <!-- Боковая панель со списком заметок -->
            <aside class="notes-sidebar">
                <div id="notesList" class="notes-list">
                    <!-- Заметки будут добавлены через JS -->
                </div>
            </aside>

            <!-- Пустое состояние редактора -->
            <div id="notesEmptyEditor" class="notes-empty-editor">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3>Выберите заметку или создайте новую</h3>
                <p>Нажмите "✨ Новая заметка" чтобы начать</p>
            </div>

            <!-- Контейнер редактора -->
            <div id="notesEditorContainer" class="notes-editor-container hidden">
                <!-- Заголовок редактора -->
                <div class="notes-editor-header">
                    <input
                            type="text"
                            id="noteTitle"
                            class="notes-title-input"
                            placeholder="Название заметки..."
                    >
                    <div class="notes-editor-actions">
                        <button id="saveNoteBtn" class="notes-action-btn notes-save-btn" title="Сохранить">
                            <span>💾</span>
                        </button>
                        <button id="togglePreviewBtn" class="notes-action-btn" title="Переключить превью">
                            <span>👁️</span>
                        </button>
                        <button id="deleteNoteBtn" class="notes-action-btn notes-delete-btn" title="Удалить">
                            <span>🗑️</span>
                        </button>
                    </div>
                </div>

                <!-- Секция тегов -->
                <div class="notes-tags-section">
                    <div class="notes-tags-input-group">
                        <input
                                type="text"
                                id="noteTagInput"
                                placeholder="Добавить тег..."
                        >
                        <button id="addNoteTagBtn" class="notes-add-tag-btn">+</button>
                    </div>
                    <div id="noteTagsList" class="notes-tags-list">
                        <span class="notes-tags-placeholder">Теги не добавлены</span>
                    </div>
                </div>

                <!-- Layout редактора и превью -->
                <div id="notesEditorLayout" class="notes-editor-layout">
                    <!-- Панель редактора -->
                    <div class="notes-editor-pane">
                        <div class="notes-editor-pane-header">
                            <div class="markdown-toolbar">
                                <button class="markdown-toolbar-btn bold" data-markdown="**текст**" title="Жирный (Ctrl+B)">
                                    <strong>B</strong>
                                </button>
                                <button class="markdown-toolbar-btn italic" data-markdown="*текст*" title="Курсив (Ctrl+I)">
                                    <em>I</em>
                                </button>
                                <span class="markdown-toolbar-separator"></span>
                                <button class="markdown-toolbar-btn" data-markdown="# " title="Заголовок 1">
                                    H1
                                </button>
                                <button class="markdown-toolbar-btn" data-markdown="## " title="Заголовок 2">
                                    H2
                                </button>
                                <button class="markdown-toolbar-btn" data-markdown="### " title="Заголовок 3">
                                    H3
                                </button>
                                <span class="markdown-toolbar-separator"></span>
                                <button class="markdown-toolbar-btn" data-markdown="- " title="Список">
                                    •••
                                </button>
                                <button class="markdown-toolbar-btn" data-markdown="1. " title="Нумерованный список">
                                    1.
                                </button>
                                <button class="markdown-toolbar-btn" data-markdown="> " title="Цитата">
                                    "
                                </button>
                                <span class="markdown-toolbar-separator"></span>
                                <button class="markdown-toolbar-btn code" data-markdown="`код`" title="Код в строке">
                                    &lt;/&gt;
                                </button>
                                <button class="markdown-toolbar-btn" data-markdown="```\nкод\n```" title="Блок кода">
                                    { }
                                </button>
                                <button class="markdown-toolbar-btn" data-markdown="[текст](url)" title="Ссылка">
                                    🔗
                                </button>
                            </div>
                        </div>
                        <textarea
                                id="noteContent"
                                class="notes-markdown-editor"
                                placeholder="Начните писать... Поддерживается Markdown форматирование"
                        ></textarea>
                    </div>

                    <!-- Панель превью -->
                    <div id="notesPreviewPane" class="notes-preview-pane">
                        <div class="notes-editor-pane-header">
                            Предпросмотр
                        </div>
                        <div id="notePreview" class="notes-preview-content">
                            <p class="notes-preview-placeholder">Предпросмотр появится здесь...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // Настройка Marked.js при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                gfm: true,
                breaks: true,
                smartLists: true,
                smartypants: true
            });
        }
    });
</script>

<!-- Оптимизированная загрузка JavaScript -->
<script src="notes-system.js"></script>
</body>
</html>