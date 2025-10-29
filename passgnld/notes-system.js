/* ==================== NOTES SYSTEM ==================== */

// Глобальные переменные для заметок
let notesData = [];
let currentNoteId = null;
let isNotesLoaded = false;

// Инициализация системы заметок
function initNotesSystem() {
    console.log('🚀 Инициализация системы заметок...');

    // Загружаем заметки при инициализации
    loadNotesFromServer();

    // Инициализируем Markdown toolbar
    initMarkdownToolbar();

    // Обработчики кнопок
    const newNoteBtn = document.querySelector('.notes-new-btn');
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', createNewNote);
    }

    const saveBtn = document.querySelector('.notes-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCurrentNote);
        console.log('✅ Кнопка сохранения подключена');
    }

    const deleteBtn = document.querySelector('.notes-delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteCurrentNote);
    }

    // Поиск
    const searchInput = document.querySelector('.notes-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterNotes(e.target.value);
        });
    }

    // Теги
    const addTagBtn = document.querySelector('.notes-add-tag-btn');
    if (addTagBtn) {
        addTagBtn.addEventListener('click', addTag);
    }

    const tagInput = document.querySelector('.notes-tags-input-group input');
    if (tagInput) {
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
    }

    // Live preview
    const markdownEditor = document.querySelector('.notes-markdown-editor');
    if (markdownEditor) {
        markdownEditor.addEventListener('input', updateMarkdownPreview);
    }

    console.log('✅ Система заметок инициализирована');
}

/* ==================== MARKDOWN TOOLBAR FUNCTIONS ==================== */

// Инициализация Markdown панели инструментов
function initMarkdownToolbar() {
    console.log('🎨 Инициализация Markdown toolbar...');

    // Добавляем обработчики на все кнопки
    const buttons = document.querySelectorAll('.markdown-toolbar-btn');

    if (buttons.length === 0) {
        console.warn('⚠️ Кнопки toolbar не найдены');
        return;
    }

    buttons.forEach(btn => {
        // Удаляем старые обработчики
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        // Добавляем новый обработчик
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = newBtn.dataset.action;
            if (action) {
                applyMarkdownFormat(action);
            }
        });
    });

    console.log(`✅ Markdown toolbar инициализирован (${buttons.length} кнопок)`);
}

// Применение Markdown форматирования
function applyMarkdownFormat(action) {
    const editor = document.querySelector('.notes-markdown-editor');
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const beforeText = editor.value.substring(0, start);
    const afterText = editor.value.substring(end);

    let newText = '';
    let cursorOffset = 0;

    switch (action) {
        case 'bold':
            newText = `**${selectedText || 'жирный текст'}**`;
            cursorOffset = selectedText ? newText.length : 2;
            break;

        case 'italic':
            newText = `*${selectedText || 'курсив'}*`;
            cursorOffset = selectedText ? newText.length : 1;
            break;

        case 'strikethrough':
            newText = `~~${selectedText || 'зачеркнутый'}~~`;
            cursorOffset = selectedText ? newText.length : 2;
            break;

        case 'heading1':
            newText = `# ${selectedText || 'Заголовок 1'}`;
            cursorOffset = newText.length;
            break;

        case 'heading2':
            newText = `## ${selectedText || 'Заголовок 2'}`;
            cursorOffset = newText.length;
            break;

        case 'heading3':
            newText = `### ${selectedText || 'Заголовок 3'}`;
            cursorOffset = newText.length;
            break;

        case 'code-inline':
            newText = `\`${selectedText || 'код'}\``;
            cursorOffset = selectedText ? newText.length : 1;
            break;

        case 'code-block':
            newText = `\`\`\`javascript\n${selectedText || '// ваш код здесь'}\n\`\`\``;
            cursorOffset = selectedText ? newText.length : 14;
            break;

        case 'quote':
            newText = `> ${selectedText || 'Цитата'}`;
            cursorOffset = newText.length;
            break;

        case 'list-ul':
            if (selectedText) {
                const lines = selectedText.split('\n');
                newText = lines.map(line => `- ${line}`).join('\n');
                cursorOffset = newText.length;
            } else {
                newText = '- Элемент списка\n- Элемент списка\n- Элемент списка';
                cursorOffset = newText.length;
            }
            break;

        case 'list-ol':
            if (selectedText) {
                const lines = selectedText.split('\n');
                newText = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
                cursorOffset = newText.length;
            } else {
                newText = '1. Первый пункт\n2. Второй пункт\n3. Третий пункт';
                cursorOffset = newText.length;
            }
            break;

        case 'link':
            newText = `[${selectedText || 'текст ссылки'}](https://example.com)`;
            cursorOffset = selectedText ? newText.length - 21 : 1;
            break;

        case 'image':
            newText = `![${selectedText || 'описание'}](https://example.com/image.jpg)`;
            cursorOffset = selectedText ? newText.length - 33 : 2;
            break;

        case 'table':
            newText = `| Заголовок 1 | Заголовок 2 | Заголовок 3 |\n|-------------|-------------|-------------|\n| Ячейка 1    | Ячейка 2    | Ячейка 3    |\n| Ячейка 4    | Ячейка 5    | Ячейка 6    |`;
            cursorOffset = newText.length;
            break;

        case 'hr':
            newText = '\n---\n';
            cursorOffset = newText.length;
            break;

        case 'task':
            newText = '- [ ] Задача не выполнена\n- [x] Задача выполнена';
            cursorOffset = newText.length;
            break;

        default:
            return;
    }

    // Вставляем новый текст
    editor.value = beforeText + newText + afterText;

    // Устанавливаем курсор
    const newCursorPos = start + cursorOffset;
    editor.setSelectionRange(newCursorPos, newCursorPos);
    editor.focus();

    // Обновляем preview
    updateMarkdownPreview();

    console.log(`✏️ Применено форматирование: ${action}`);
}

// Загрузка заметок с сервера
async function loadNotesFromServer() {
    try {
        console.log('📥 Загрузка заметок с сервера...');
        const response = await fetch('api.php?action=loadNotes');
        const data = await response.json();

        if (data.success) {
            notesData = data.notes || [];
            console.log(`✅ Загружено заметок: ${notesData.length}`);
            console.log('📁 Файл:', data.file);
            renderNotesList();
            isNotesLoaded = true;
        } else {
            console.error('❌ Ошибка загрузки:', data.error);
            showNotification('Ошибка загрузки заметок: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка при загрузке заметок:', error);
        showNotification('Ошибка подключения к серверу', 'error');
    }
}

// Сохранение заметок на сервер
async function saveNotesToServer() {
    try {
        console.log('💾 Сохранение заметок на сервер...');
        console.log('📊 Данные для сохранения:', notesData);

        const response = await fetch('api.php?action=saveNotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notes: notesData })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Заметки успешно сохранены');
            console.log('📊 Сохранено записей:', data.saved);
            console.log('📁 Файл:', data.file);
            showNotification('Заметка сохранена успешно! ✓', 'success');
            return true;
        } else {
            console.error('❌ Ошибка сохранения:', data.error);
            showNotification('Ошибка сохранения: ' + data.error, 'error');
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка при сохранении заметок:', error);
        showNotification('Ошибка подключения к серверу', 'error');
        return false;
    }
}

// Создание новой заметки
function createNewNote() {
    const newNote = {
        id: Date.now(),
        title: 'Новая заметка',
        content: '',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    notesData.unshift(newNote);
    renderNotesList();
    openNote(newNote.id);

    // Фокус на заголовок
    setTimeout(() => {
        const titleInput = document.querySelector('.notes-title-input');
        if (titleInput) {
            titleInput.select();
        }

        // ВАЖНО: Инициализируем toolbar для новой заметки
        initMarkdownToolbar();
    }, 100);

    console.log('✨ Создана новая заметка:', newNote.id);
}

// Сохранение текущей заметки
async function saveCurrentNote() {
    if (!currentNoteId) {
        showNotification('Нет открытой заметки для сохранения', 'warning');
        return;
    }

    const note = notesData.find(n => n.id === currentNoteId);
    if (!note) {
        showNotification('Заметка не найдена', 'error');
        return;
    }

    // Получаем данные из формы
    const titleInput = document.querySelector('.notes-title-input');
    const contentInput = document.querySelector('.notes-markdown-editor');

    if (titleInput) {
        note.title = titleInput.value.trim() || 'Без названия';
    }

    if (contentInput) {
        note.content = contentInput.value;
    }

    note.updatedAt = new Date().toISOString();

    console.log('💾 Сохранение заметки:', {
        id: note.id,
        title: note.title,
        contentLength: note.content.length,
        tags: note.tags
    });

    // Сохраняем на сервер
    const saved = await saveNotesToServer();

    if (saved) {
        // Обновляем список
        renderNotesList();

        // Выделяем сохраненную заметку
        highlightNote(currentNoteId);
    }
}

// Удаление заметки
async function deleteCurrentNote() {
    if (!currentNoteId) {
        showNotification('Нет открытой заметки для удаления', 'warning');
        return;
    }

    const note = notesData.find(n => n.id === currentNoteId);
    if (!note) return;

    if (confirm(`Удалить заметку "${note.title}"?`)) {
        notesData = notesData.filter(n => n.id !== currentNoteId);

        // Сохраняем изменения
        await saveNotesToServer();

        // Обновляем UI
        renderNotesList();
        closeEditor();

        showNotification('Заметка удалена', 'success');
        console.log('🗑️ Заметка удалена:', currentNoteId);
    }
}

// Открытие заметки
function openNote(noteId) {
    const note = notesData.find(n => n.id === noteId);
    if (!note) return;

    currentNoteId = noteId;

    // Показываем редактор
    const editorContainer = document.querySelector('.notes-editor-container');
    const emptyEditor = document.querySelector('.notes-empty-editor');

    if (editorContainer) {
        editorContainer.classList.remove('hidden');
    }
    if (emptyEditor) {
        emptyEditor.classList.add('hidden');
    }

    // Заполняем данные
    const titleInput = document.querySelector('.notes-title-input');
    const contentInput = document.querySelector('.notes-markdown-editor');

    if (titleInput) {
        titleInput.value = note.title;
    }

    if (contentInput) {
        contentInput.value = note.content;
        updateMarkdownPreview();
    }

    // Отображаем теги
    renderTags(note.tags);

    // Подсветка активной заметки в списке
    highlightNote(noteId);

    // ВАЖНО: Реинициализируем toolbar если его еще нет
    if (!document.querySelector('.markdown-toolbar')?.hasChildNodes()) {
        setTimeout(() => initMarkdownToolbar(), 100);
    }

    console.log('📖 Открыта заметка:', note.title);
}

// Подсветка активной заметки
function highlightNote(noteId) {
    document.querySelectorAll('.note-item').forEach(item => {
        if (parseInt(item.dataset.noteId) === noteId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Закрытие редактора
function closeEditor() {
    currentNoteId = null;

    const editorContainer = document.querySelector('.notes-editor-container');
    const emptyEditor = document.querySelector('.notes-empty-editor');

    if (editorContainer) {
        editorContainer.classList.add('hidden');
    }
    if (emptyEditor) {
        emptyEditor.classList.remove('hidden');
    }

    // Убираем подсветку
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Отрисовка списка заметок
function renderNotesList() {
    const notesList = document.querySelector('.notes-list');
    if (!notesList) return;

    if (notesData.length === 0) {
        notesList.innerHTML = `
            <div class="notes-empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <p>Заметок пока нет</p>
                <small>Создайте первую заметку</small>
            </div>
        `;
        return;
    }

    notesList.innerHTML = notesData.map(note => {
        const preview = note.content.substring(0, 100).replace(/[#*`\n]/g, ' ').trim();
        const date = new Date(note.updatedAt).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        return `
            <div class="note-item ${note.id === currentNoteId ? 'active' : ''}" 
                 data-note-id="${note.id}"
                 onclick="openNote(${note.id})">
                <div class="note-item-title">${escapeHtml(note.title)}</div>
                <div class="note-item-preview">${escapeHtml(preview) || '(пусто)'}</div>
                <div class="note-item-meta">
                    <span>${date}</span>
                    <span>${note.content.length} сим.</span>
                </div>
                ${note.tags.length > 0 ? `
                    <div class="note-item-tags">
                        ${note.tags.map(tag => `
                            <span class="note-item-tag">${escapeHtml(tag)}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    console.log('📋 Список заметок обновлен:', notesData.length);
}

// Добавление тега
function addTag() {
    if (!currentNoteId) return;

    const note = notesData.find(n => n.id === currentNoteId);
    if (!note) return;

    const tagInput = document.querySelector('.notes-tags-input-group input');
    if (!tagInput) return;

    const tagValue = tagInput.value.trim();
    if (!tagValue) return;

    if (note.tags.includes(tagValue)) {
        showNotification('Такой тег уже существует', 'warning');
        return;
    }

    note.tags.push(tagValue);
    renderTags(note.tags);
    tagInput.value = '';

    console.log('🏷️ Добавлен тег:', tagValue);
}

// Удаление тега
function removeTag(tag) {
    if (!currentNoteId) return;

    const note = notesData.find(n => n.id === currentNoteId);
    if (!note) return;

    note.tags = note.tags.filter(t => t !== tag);
    renderTags(note.tags);

    console.log('🗑️ Удален тег:', tag);
}

// Отрисовка тегов
function renderTags(tags) {
    const tagsList = document.querySelector('.notes-tags-list');
    if (!tagsList) return;

    if (tags.length === 0) {
        tagsList.innerHTML = '<span class="notes-tags-placeholder">Теги не добавлены</span>';
        return;
    }

    tagsList.innerHTML = tags.map(tag => `
        <span class="note-tag">
            ${escapeHtml(tag)}
            <span class="note-tag-remove" onclick="removeTag('${escapeHtml(tag)}')">×</span>
        </span>
    `).join('');
}

// Фильтрация заметок
function filterNotes(searchQuery) {
    const query = searchQuery.toLowerCase().trim();

    document.querySelectorAll('.note-item').forEach(item => {
        const noteId = parseInt(item.dataset.noteId);
        const note = notesData.find(n => n.id === noteId);

        if (!note) return;

        const searchIn = [
            note.title,
            note.content,
            ...note.tags
        ].join(' ').toLowerCase();

        if (searchIn.includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Обновление preview Markdown
function updateMarkdownPreview() {
    const editor = document.querySelector('.notes-markdown-editor');
    const preview = document.querySelector('.notes-preview-content');

    if (!editor || !preview) return;

    const content = editor.value;

    if (!content.trim()) {
        preview.innerHTML = '<div class="notes-preview-placeholder">Начните писать...</div>';
        return;
    }

    // Используем marked.js для рендера
    if (typeof marked !== 'undefined') {
        try {
            // Настройка marked
            marked.setOptions({
                breaks: true,
                gfm: true,
                sanitize: false
            });

            const html = marked.parse(content);
            preview.innerHTML = html;

            // Подсветка кода если есть highlight.js
            if (typeof hljs !== 'undefined') {
                preview.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        } catch (error) {
            console.error('Ошибка рендера Markdown:', error);
            preview.innerHTML = '<div class="notes-preview-placeholder">Ошибка рендера</div>';
        }
    } else {
        // Fallback без marked.js - простая замена
        const html = content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
        preview.innerHTML = html;
    }
}

// Уведомления
function showNotification(message, type = 'info') {
    // Создаем контейнер для уведомлений если его нет
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    notification.style.cssText = `
        background: ${colors[type] || colors.info};
        color: white;
        padding: 14px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    container.appendChild(notification);

    // Автоудаление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, 3000);
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM загружен, проверяем вкладку Note...');

    // Проверяем, активна ли вкладка Note
    const noteTab = document.querySelector('[data-tab="note"]');
    if (noteTab && noteTab.classList.contains('active')) {
        console.log('✅ Вкладка Note активна, инициализируем систему');
        initNotesSystem();
    }
});

// Инициализация при переключении на вкладку Note
document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab="note"]');
    if (tab) {
        console.log('🔄 Переключение на вкладку Note');
        setTimeout(() => {
            if (!isNotesLoaded) {
                initNotesSystem();
            }
        }, 100);
    }
});

// Добавляем стили для анимаций уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

console.log('✅ notes-system.js загружен');