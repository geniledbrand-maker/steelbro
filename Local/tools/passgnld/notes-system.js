/* ==================== NOTES SYSTEM ==================== */

// Глобальные переменные для заметок
let notesData = [];
let currentNoteId = null;
let isNotesLoaded = false;
let notesTagLibrary = new Map();
let notesTagColors = {};
let notesSavedColors = [];
let activeTagFilters = new Set();
let notesTagManagerState = {
    isOpen: false,
    selectedTag: null
};
let saveNotesDeferred = null;
const DEFAULT_TAG_COLOR_PALETTE = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#facc15', '#22c55e', '#2dd4bf', '#0ea5e9', '#3b82f6',
    '#14b8a6', '#f472b6'
];

const SAVE_DEBOUNCE_DELAY = 600;

function scheduleNotesSave(options = {}) {
    if (saveNotesDeferred) {
        clearTimeout(saveNotesDeferred);
    }
    const opts = { silent: true, reason: 'metadata', ...options };
    saveNotesDeferred = setTimeout(() => {
        saveNotesToServer(opts);
        saveNotesDeferred = null;
    }, SAVE_DEBOUNCE_DELAY);
}

function normalizeHexColor(color) {
    if (typeof color !== 'string' || color.trim() === '') {
        return '#6366f1';
    }
    let hex = color.trim();
    if (!hex.startsWith('#')) {
        hex = `#${hex}`;
    }
    if (hex.length === 4) {
        hex = '#' + hex.slice(1).split('').map(ch => ch + ch).join('');
    }
    if (hex.length !== 7) {
        return '#6366f1';
    }
    return hex.toLowerCase();
}

function hexToRgb(hex) {
    const normalized = normalizeHexColor(hex).replace('#', '');
    const intVal = parseInt(normalized, 16);
    return {
        r: (intVal >> 16) & 255,
        g: (intVal >> 8) & 255,
        b: intVal & 255
    };
}

function rgbToHex(r, g, b) {
    const toHex = (value) => {
        const v = Math.max(0, Math.min(255, Math.round(value)));
        return v.toString(16).padStart(2, '0');
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function adjustColor(hex, percent) {
    const { r, g, b } = hexToRgb(hex);
    const amount = percent / 100;
    const adjustChannel = (channel) => {
        if (amount === 0) {
            return channel;
        }
        const target = amount > 0 ? 255 : 0;
        return channel + (target - channel) * Math.abs(amount);
    };
    return rgbToHex(
        adjustChannel(r),
        adjustChannel(g),
        adjustChannel(b)
    );
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return rgbToHex(255 * f(0), 255 * f(8), 255 * f(4));
}

function generateColorFromString(value) {
    let hash = 0;
    const str = String(value || '');
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return hslToHex(hue, 65, 55);
}

function getReadableTextColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    // W3C recommended formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#111827' : '#ffffff';
}

function getTagColor(tag) {
    const key = (tag || '').trim();
    if (!key) {
        return '#6366f1';
    }
    if (!notesTagColors[key]) {
        notesTagColors[key] = generateColorFromString(key);
    }
    return normalizeHexColor(notesTagColors[key]);
}

function setTagColor(tag, color, options = {}) {
    const key = (tag || '').trim();
    if (!key) {
        return;
    }
    const normalized = normalizeHexColor(color);
    if (notesTagColors[key] === normalized) {
        return;
    }
    notesTagColors[key] = normalized;
    rebuildTagLibrary();
    renderTagManager();
    if (options.immediateSave) {
        saveNotesToServer({ silent: true, reason: 'tag-color-change' });
    } else {
        scheduleNotesSave({ reason: 'tag-color-change' });
    }
}

function addSavedColor(color) {
    const normalized = normalizeHexColor(color);
    if (!notesSavedColors.includes(normalized)) {
        notesSavedColors.push(normalized);
        if (notesSavedColors.length > 24) {
            notesSavedColors = notesSavedColors.slice(-24);
        }
        renderSavedColorChips();
        scheduleNotesSave({ reason: 'save-color' });
    }
}

function removeSavedColor(index) {
    if (index >= 0 && index < notesSavedColors.length) {
        notesSavedColors.splice(index, 1);
        renderSavedColorChips();
        scheduleNotesSave({ reason: 'remove-color' });
    }
}

function clearSavedColors() {
    if (notesSavedColors.length === 0) {
        return;
    }
    notesSavedColors = [];
    renderSavedColorChips();
    scheduleNotesSave({ reason: 'clear-colors' });
}

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

    // РџРѕРёСЃРє
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

    const tagsLibraryContainer = document.getElementById('notesTagsLibrary');
    if (tagsLibraryContainer && !tagsLibraryContainer.dataset.bound) {
        tagsLibraryContainer.addEventListener('click', (event) => {
            const tagButton = event.target.closest('.notes-library-tag');
            if (!tagButton) {
                return;
            }
            const tagValue = tagButton.getAttribute('data-library-tag');
            if (!tagValue) {
                return;
            }

            if (event.target.classList.contains('notes-library-tag-remove')) {
                removeTagFromLibrary(tagValue);
            } else {
                toggleTagFromLibrary(tagValue);
            }
        });
        tagsLibraryContainer.dataset.bound = 'true';
    }

    const manageTagsBtn = document.getElementById('notesManageTagsBtn');
    if (manageTagsBtn && !manageTagsBtn.dataset.bound) {
        manageTagsBtn.addEventListener('click', () => openTagManager());
        manageTagsBtn.dataset.bound = 'true';
    }

    const clearFiltersBtn = document.getElementById('notesClearFiltersBtn');
    if (clearFiltersBtn && !clearFiltersBtn.dataset.bound) {
        clearFiltersBtn.addEventListener('click', () => {
            if (activeTagFilters.size > 0) {
                activeTagFilters.clear();
                renderNotesList();
                renderTagFilters();
            }
        });
        clearFiltersBtn.dataset.bound = 'true';
    }

    const filterContainer = document.getElementById('notesFilterTags');
    if (filterContainer && !filterContainer.dataset.bound) {
        filterContainer.addEventListener('click', (event) => {
            const chip = event.target.closest('[data-filter-tag]');
            if (!chip) {
                return;
            }
            const tag = chip.getAttribute('data-filter-tag');
            toggleTagFilter(tag);
        });
        filterContainer.dataset.bound = 'true';
    }

    bindTagManagerEvents();

    rebuildTagLibrary();
    renderTagFilters();
    renderSavedColorChips();

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
            newText = `*${selectedText || 'РєСѓСЂСЃРёРІ'}*`;
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
            newText = `\`${selectedText || 'РєРѕРґ'}\``;
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
        const response = await fetch('api.php?action=loadNotes', {
            cache: 'no-store'
        });
        const data = await response.json();

        if (data.success) {
            const receivedNotes = Array.isArray(data.notes) ? data.notes : (Array.isArray(data) ? data : []);
            notesData = receivedNotes || [];

            const receivedTagColors = data.tagColors && typeof data.tagColors === 'object' ? data.tagColors : {};
            notesTagColors = {};
            Object.keys(receivedTagColors).forEach((tag) => {
                notesTagColors[tag] = normalizeHexColor(receivedTagColors[tag]);
            });

            const receivedSavedColors = Array.isArray(data.savedColors) ? data.savedColors : [];
            notesSavedColors = receivedSavedColors.map((color) => normalizeHexColor(color));

            console.log(`✅ Загружено заметок: ${notesData.length}`);
            console.log('📁 Файл:', data.file || 'не задан');
            console.log('🎨 Теги с цветами:', Object.keys(notesTagColors).length);

            renderNotesList();
            rebuildTagLibrary();
            renderTagFilters();
            renderSavedColorChips();
            renderTagManager();

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
async function saveNotesToServer(options = {}) {
    const { silent = false, reason = 'manual' } = options;
    try {
        if (!silent) {
            console.log('💾 Сохранение заметок на сервер...');
        }
        console.log('📝 Причина сохранения:', reason);

        const normalizedTagColors = {};
        Object.keys(notesTagColors).forEach((tag) => {
            normalizedTagColors[tag] = normalizeHexColor(notesTagColors[tag]);
        });

        const normalizedSavedColors = notesSavedColors.map((color) => normalizeHexColor(color));

        const payload = {
            notes: notesData,
            tagColors: normalizedTagColors,
            savedColors: normalizedSavedColors
        };

        if (!silent) {
            console.log('📊 Данные для сохранения:', payload);
        }

        const response = await fetch('api.php?action=saveNotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Заметки успешно сохранены');
            console.log('📊 Сохранено записей:', data.saved);
            console.log('📁 Файл:', data.file);

            if (data.tagColors && typeof data.tagColors === 'object') {
                notesTagColors = {};
                Object.keys(data.tagColors).forEach((tag) => {
                    notesTagColors[tag] = normalizeHexColor(data.tagColors[tag]);
                });
            }

            if (Array.isArray(data.savedColors)) {
                notesSavedColors = data.savedColors.map((color) => normalizeHexColor(color));
            }

            if (!silent) {
                showNotification('Заметка сохранена успешно! ✓', 'success');
            }
            return true;
        } else {
            console.error('❌ Ошибка сохранения:', data.error);
            if (!silent) {
                showNotification('Ошибка сохранения: ' + data.error, 'error');
            }
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка при сохранении заметок:', error);
        if (!silent) {
            showNotification('Ошибка подключения к серверу', 'error');
        }
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

    const activeFiltersArray = Array.from(activeTagFilters);
    const hasFilters = activeFiltersArray.length > 0;
    const filteredNotes = hasFilters
        ? notesData.filter(note => {
            const noteTags = new Set(note.tags || []);
            return activeFiltersArray.every(tag => noteTags.has(tag));
        })
        : notesData;

    if (filteredNotes.length === 0) {
        notesList.innerHTML = `
            <div class="notes-empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <p>${hasFilters ? 'Под подходящий фильтр не попадает ни одна заметка' : 'Заметок пока нет'}</p>
                <small>${hasFilters ? 'Попробуйте изменить фильтр по тегам' : 'Создайте первую заметку'}</small>
            </div>
        `;
        return;
    }

    notesList.innerHTML = filteredNotes.map(note => {
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
                    <span>${note.content.length} СЃРёРј.</span>
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

    console.log('📋 Список заметок обновлен:', filteredNotes.length, 'из', notesData.length);
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
    rebuildTagLibrary();

    console.log('🏷️ Добавлен тег:', tagValue);
}

// Удаление тега
function removeTag(tag) {
    if (!currentNoteId) return;

    const note = notesData.find(n => n.id === currentNoteId);
    if (!note) return;

    note.tags = note.tags.filter(t => t !== tag);
    renderTags(note.tags);
    rebuildTagLibrary();

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
            <span class="note-tag-remove" onclick="removeTag('${escapeHtml(tag)}')">Г—</span>
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
function escapeAttribute(value) {
    return escapeHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function rebuildTagLibrary() {
    const library = new Map();

    notesData.forEach((note) => {
        (note.tags || []).forEach((tag) => {
            const trimmed = (tag || '').trim();
            if (!trimmed) {
                return;
            }
            const entry = library.get(trimmed) || { count: 0, color: getTagColor(trimmed) };
            entry.count += 1;
            library.set(trimmed, entry);
        });
    });

    Object.keys(notesTagColors).forEach((tag) => {
        if (!library.has(tag)) {
            library.set(tag, { count: 0, color: getTagColor(tag) });
        }
    });

    notesTagLibrary = library;

    renderAvailableTags();
    renderTagFilters();
}

function renderAvailableTags() {
    const libraryContainer = document.getElementById('notesTagsLibrary');
    if (!libraryContainer) {
        return;
    }

    if (notesTagLibrary.size === 0) {
        libraryContainer.innerHTML = '<span class="notes-tags-placeholder">Сохранённых тегов пока нет</span>';
        return;
    }

    const currentNote = currentNoteId ? notesData.find(n => n.id === currentNoteId) : null;
    const currentTags = currentNote ? new Set(currentNote.tags || []) : new Set();

    const sortedTags = Array.from(notesTagLibrary.entries())
        .sort((a, b) => a[0].localeCompare(b[0], 'ru'));

    const items = sortedTags.map(([tag, info]) => {
        const label = escapeHtml(tag);
        const dataValue = escapeAttribute(tag);
        const color = getTagColor(tag);
        const count = info && typeof info.count === 'number' ? info.count : 0;
        const isActive = currentTags.has(tag);
        const isFilterActive = activeTagFilters.has(tag);
        const backgroundStart = adjustColor(color, 35);
        const backgroundEnd = adjustColor(color, -5);
        const borderColor = adjustColor(color, -25);
        const textColor = getReadableTextColor(backgroundEnd);
        const filterIndicator = isFilterActive
            ? '<span class="notes-library-tag-dot" title="Фильтр по тегу активен"></span>'
            : '';

        return '' +
            '<button type="button" class="notes-library-tag ' + (isActive ? 'active' : '') + '" data-library-tag="' + dataValue + '"' +
            ' style="background: linear-gradient(135deg, ' + backgroundStart + ' 0%, ' + backgroundEnd + ' 100%); border-color: ' + borderColor + '; color: ' + textColor + ';">' +
                '<span class="notes-library-tag-color" style="background:' + color + ';"></span>' +
                '<span class="notes-library-tag-label">' + label + '</span>' +
                '<span class="notes-library-tag-count">' + count + '</span>' +
                filterIndicator +
                '<span class="notes-library-tag-remove" title="Удалить тег из всех заметок">×</span>' +
            '</button>';
    });

    libraryContainer.innerHTML = items.join('');
}

function renderTagFilters() {
    const filterContainer = document.getElementById('notesFilterTags');
    if (!filterContainer) {
        return;
    }

    if (notesTagLibrary.size === 0) {
        filterContainer.innerHTML = '<span class="notes-filter-placeholder">Сохранённых тегов пока нет</span>';
        return;
    }

    const sortedTags = Array.from(notesTagLibrary.keys()).sort((a, b) => a.localeCompare(b, 'ru'));
    if (sortedTags.length === 0) {
        filterContainer.innerHTML = '<span class="notes-filter-placeholder">Сохранённых тегов пока нет</span>';
        return;
    }

    const chips = sortedTags.map((tag) => {
        const isActive = activeTagFilters.has(tag);
        const color = getTagColor(tag);
        const base = isActive ? adjustColor(color, -5) : adjustColor(color, 30);
        const border = adjustColor(color, -25);
        const textColor = getReadableTextColor(base);
        return '' +
            '<button type="button" class="notes-filter-chip' + (isActive ? ' active' : '') + '" data-filter-tag="' + escapeAttribute(tag) + '"' +
            ' style="background:' + base + '; border-color:' + border + '; color:' + textColor + ';">' +
                '<span class="notes-filter-chip-label">' + escapeHtml(tag) + '</span>' +
                (isActive ? '<span class="notes-filter-chip-remove">×</span>' : '') +
            '</button>';
    });

    filterContainer.innerHTML = chips.join('');
}

function toggleTagFilter(tag) {
    if (!tag) {
        return;
    }
    if (activeTagFilters.has(tag)) {
        activeTagFilters.delete(tag);
    } else {
        activeTagFilters.add(tag);
    }
    renderTagFilters();
    renderNotesList();
}

function renderSavedColorChips() {
    const savedContainer = document.getElementById('notesSavedColorsList');
    if (!savedContainer) {
        return;
    }

    const uniqueDefaults = DEFAULT_TAG_COLOR_PALETTE
        .map((color) => normalizeHexColor(color))
        .filter((color, index, arr) => arr.indexOf(color) === index && !notesSavedColors.includes(color));

    const customChips = notesSavedColors.map((color, index) => {
        const normalized = normalizeHexColor(color);
        const textColor = getReadableTextColor(normalized);
        return '' +
            '<button type="button" class="notes-saved-color-chip custom" data-apply-color="' + normalized + '" style="background:' + normalized + '; color:' + textColor + ';">' +
                '<span class="notes-saved-color-label">' + normalized.toUpperCase() + '</span>' +
                '<span class="notes-saved-color-remove" data-remove-color="' + index + '" title="Удалить цвет">×</span>' +
            '</button>';
    });

    const defaultChips = uniqueDefaults.map((color) => {
        const textColor = getReadableTextColor(color);
        return '' +
            '<button type="button" class="notes-saved-color-chip default" data-apply-color="' + color + '" style="background:' + color + '; color:' + textColor + ';">' +
                '<span class="notes-saved-color-label">' + color.toUpperCase() + '</span>' +
            '</button>';
    });

    const sections = [];

    if (customChips.length > 0) {
        sections.push('<div class="notes-saved-color-section-title">Мои цвета</div>');
        sections.push(customChips.join(''));
    } else {
        sections.push('<div class="notes-saved-color-placeholder">Сохранённых цветов пока нет</div>');
    }

    if (defaultChips.length > 0) {
        sections.push('<div class="notes-saved-color-section-title">Быстрый выбор</div>');
        sections.push(defaultChips.join(''));
    }

    savedContainer.innerHTML = sections.join('');
}

function bindTagManagerEvents() {
    const modal = document.getElementById('notesTagManagerModal');
    if (!modal || modal.dataset.bound) {
        return;
    }

    const closeBtn = modal.querySelector('[data-notes-tag-manager-close]');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTagManager);
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeTagManager();
        }
    });

    const addTagInput = document.getElementById('notesNewTagInput');
    const addTagBtn = document.getElementById('notesNewTagAddBtn');
    const addTagForm = document.getElementById('notesCreateTagForm');

    const handleCreateTag = () => {
        const value = (addTagInput?.value || '').trim();
        if (!value) {
            showNotification('Введите название тега', 'warning');
            return;
        }
        if (createTag(value)) {
            if (addTagInput) {
                addTagInput.value = '';
            }
        }
    };

    if (addTagForm && !addTagForm.dataset.bound) {
        addTagForm.addEventListener('submit', (event) => {
            event.preventDefault();
            handleCreateTag();
        });
        addTagForm.dataset.bound = 'true';
    } else if (addTagBtn && !addTagBtn.dataset.bound) {
        addTagBtn.addEventListener('click', handleCreateTag);
        addTagBtn.dataset.bound = 'true';
    }

    if (addTagInput && !addTagInput.dataset.bound) {
        addTagInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleCreateTag();
            }
        });
        addTagInput.dataset.bound = 'true';
    }

    const savedColorsList = document.getElementById('notesSavedColorsList');
    if (savedColorsList && !savedColorsList.dataset.bound) {
        savedColorsList.addEventListener('click', (event) => {
            const removeBtn = event.target.closest('[data-remove-color]');
            if (removeBtn) {
                const index = parseInt(removeBtn.getAttribute('data-remove-color'), 10);
                removeSavedColor(index);
                return;
            }

            const applyBtn = event.target.closest('[data-apply-color]');
            if (applyBtn) {
                const color = applyBtn.getAttribute('data-apply-color');
                if (notesTagManagerState.selectedTag) {
                    setTagColor(notesTagManagerState.selectedTag, color);
                    renderTagManager();
                } else {
                    addSavedColor(color);
                }
            }
        });
        savedColorsList.dataset.bound = 'true';
    }

    const addColorBtn = document.getElementById('notesSaveColorBtn');
    const addColorInput = document.getElementById('notesSaveColorInput');
    if (addColorBtn && !addColorBtn.dataset.bound) {
        addColorBtn.addEventListener('click', () => {
            const value = (addColorInput?.value || '').trim();
            if (!value) {
                showNotification('Выберите цвет для сохранения', 'warning');
                return;
            }
            addSavedColor(value);
        });
        addColorBtn.dataset.bound = 'true';
    }

    const clearColorsBtn = document.getElementById('notesClearSavedColorsBtn');
    if (clearColorsBtn && !clearColorsBtn.dataset.bound) {
        clearColorsBtn.addEventListener('click', () => {
            if (notesSavedColors.length === 0) {
                showNotification('Сохранённых цветов нет', 'info');
                return;
            }
            if (confirm('Очистить список сохранённых цветов?')) {
                clearSavedColors();
            }
        });
        clearColorsBtn.dataset.bound = 'true';
    }

    const managerList = document.getElementById('notesTagManagerList');
    if (managerList && !managerList.dataset.bound) {
        managerList.addEventListener('click', (event) => {
            const removeBtn = event.target.closest('[data-tag-remove]');
            if (removeBtn) {
                const tag = removeBtn.getAttribute('data-tag-remove');
                removeTagFromLibrary(tag);
                renderTagManager();
                return;
            }

            const row = event.target.closest('.notes-tag-manager-row');
            if (row) {
                const tag = row.getAttribute('data-manager-tag');
                if (tag) {
                    notesTagManagerState.selectedTag = tag;
                    renderTagManager();
                }
            }
        });

        managerList.addEventListener('input', (event) => {
            const colorInput = event.target.closest('[data-tag-color-input]');
            if (colorInput) {
                const tag = colorInput.getAttribute('data-tag-color-input');
                notesTagManagerState.selectedTag = tag;
                setTagColor(tag, colorInput.value);
            }
        });

        managerList.dataset.bound = 'true';
    }

    modal.dataset.bound = 'true';
}

function openTagManager(initialTag = null) {
    const modal = document.getElementById('notesTagManagerModal');
    if (!modal) {
        return;
    }
    notesTagManagerState.isOpen = true;
    if (initialTag) {
        notesTagManagerState.selectedTag = initialTag;
    }
    modal.classList.add('active');
    document.documentElement.classList.add('notes-modal-open');
    renderTagManager();
}

function closeTagManager() {
    const modal = document.getElementById('notesTagManagerModal');
    if (!modal) {
        return;
    }
    notesTagManagerState.isOpen = false;
    modal.classList.remove('active');
    document.documentElement.classList.remove('notes-modal-open');
}

function renderTagManager() {
    const list = document.getElementById('notesTagManagerList');
    if (!list) {
        return;
    }

    renderSavedColorChips();

    const entries = Array.from(notesTagLibrary.entries()).sort((a, b) => a[0].localeCompare(b[0], 'ru'));

    if (entries.length === 0) {
        notesTagManagerState.selectedTag = null;
        list.innerHTML = '<div class="notes-tag-manager-empty">Сохранённых тегов пока нет. Создайте новый тег.</div>';
        return;
    }

    if (!notesTagManagerState.selectedTag || !entries.find(([tag]) => tag === notesTagManagerState.selectedTag)) {
        notesTagManagerState.selectedTag = entries[0][0];
    }

    const rows = entries.map(([tag, info]) => {
        const color = getTagColor(tag);
        const textColor = getReadableTextColor(color);
        const count = info && typeof info.count === 'number' ? info.count : 0;
        const isSelected = notesTagManagerState.selectedTag === tag;

        return '' +
            '<div class="notes-tag-manager-row' + (isSelected ? ' selected' : '') + '" data-manager-tag="' + escapeAttribute(tag) + '">' +
                '<div class="notes-tag-manager-row-main">' +
                    '<span class="notes-tag-manager-chip" style="background:' + color + '; color:' + textColor + ';">' + escapeHtml(tag) + '</span>' +
                    '<span class="notes-tag-manager-count" title="Заметок с этим тегом">' + count + '</span>' +
                '</div>' +
                '<div class="notes-tag-manager-row-actions">' +
                    '<label class="notes-tag-manager-color-picker" title="Выбрать цвет для тега">' +
                        '<input type="color" value="' + color + '" data-tag-color-input="' + escapeAttribute(tag) + '">' +
                        '<span>Цвет</span>' +
                    '</label>' +
                    '<button type="button" class="notes-tag-manager-remove" data-tag-remove="' + escapeAttribute(tag) + '">Удалить</button>' +
                '</div>' +
            '</div>';
    });

    list.innerHTML = rows.join('');
}

function createTag(tagName) {
    const trimmed = (tagName || '').trim();
    if (!trimmed) {
        return false;
    }

    if (notesTagLibrary.has(trimmed)) {
        showNotification('Такой тег уже существует', 'info');
        notesTagManagerState.selectedTag = trimmed;
        renderTagManager();
        return false;
    }

    const color = getTagColor(trimmed);
    notesTagColors[trimmed] = color;
    notesTagLibrary.set(trimmed, { count: 0, color });
    activeTagFilters.delete(trimmed);

    showNotification('Тег "' + trimmed + '" создан', 'success');
    notesTagManagerState.selectedTag = trimmed;
    renderAvailableTags();
    renderTagFilters();
    renderTagManager();
    scheduleNotesSave({ reason: 'create-tag' });
    return true;
}

function toggleTagFromLibrary(tag) {
    if (!currentNoteId) {
        showNotification('Сначала выберите заметку, чтобы добавить тег', 'warning');
        return;
    }

    const note = notesData.find(n => n.id === currentNoteId);
    if (!note) {
        return;
    }

    if (note.tags.includes(tag)) {
        note.tags = note.tags.filter(t => t !== tag);
        showNotification('Тег "' + tag + '" удалён из заметки', 'info');
    } else {
        note.tags.push(tag);
        showNotification('Тег "' + tag + '" добавлен к заметке', 'success');
    }

    renderTags(note.tags);
    rebuildTagLibrary();
    notesTagManagerState.selectedTag = tag;
    renderTagManager();
}

function removeTagFromLibrary(tag) {
    if (!confirm('Удалить тег "' + tag + '" из всех заметок?')) {
        return;
    }

    let affected = false;

    notesData.forEach(note => {
        if (note.tags.includes(tag)) {
            note.tags = note.tags.filter(t => t !== tag);
            if (note.id === currentNoteId) {
                renderTags(note.tags);
            }
            affected = true;
        }
    });

    const hadMetadata = Boolean(notesTagColors[tag]);
    delete notesTagColors[tag];
    activeTagFilters.delete(tag);

    rebuildTagLibrary();
    renderNotesList();
    highlightNote(currentNoteId);
    renderTagManager();
    renderTagFilters();

    if (affected || hadMetadata) {
        showNotification('Тег удалён. Не забудьте сохранить изменения', 'warning');
        scheduleNotesSave({ reason: 'remove-tag' });
    }
}

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


