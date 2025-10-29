"use strict";

/* ==================== NOTES SYSTEM ==================== */

// Кэш для элементов DOM - избегаем повторных запросов к DOM
const DOM = {
    newNoteBtn: document.getElementById('newNoteBtn'),
    notesSearchInput: document.getElementById('notesSearchInput'),
    notesList: document.getElementById('notesList'),
    notesEditorContainer: document.getElementById('notesEditorContainer'),
    notesEmptyEditor: document.getElementById('notesEmptyEditor'),
    noteTitle: document.getElementById('noteTitle'),
    notesContent: document.getElementById('noteContent'),
    notePreview: document.getElementById('notePreview'),
    saveNoteBtn: document.getElementById('saveNoteBtn'),
    deleteNoteBtn: document.getElementById('deleteNoteBtn'),
    togglePreviewBtn: document.getElementById('togglePreviewBtn'),
    noteTagInput: document.getElementById('noteTagInput'),
    addNoteTagBtn: document.getElementById('addNoteTagBtn'),
    noteTagsList: document.getElementById('noteTagsList'),
    notesEditorLayout: document.getElementById('notesEditorLayout'),
    notesPreviewPane: document.getElementById('notesPreviewPane'),
    markdownButtons: document.querySelectorAll('.markdown-toolbar-btn')
};

// Состояние приложения - объединяем все состояние в одно место
const State = {
    notes: [],
    currentNoteId: null,
    currentNoteTags: [],
    previewVisible: true,
    autoSaveTimeouts: {
        content: null,
        title: null
    },
    isSaving: false // Флаг для предотвращения одновременных сохранений
};

// Кэш рендеринга - предотвращает ненужные обновления DOM
const RenderCache = {
    notesList: '',
    tagsList: ''
};

// API-клиент с дебаунсингом запросов
const API = {
    // Дебаунсинг для избежания множественных сохранений
    saveDebounceTimeout: null,

    async loadNotes() {
        try {
            const response = await fetch('api.php?action=loadNotes', {
                cache: 'no-store', // Отключаем кэширование запроса
                headers: { 'X-Requested-With': 'XMLHttpRequest' } // Для идентификации XHR
            });

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            const result = await response.json();

            if (result.success) {
                return result.notes || [];
            } else {
                throw new Error(result.error || 'Unknown API error');
            }
        } catch (error) {
            console.error('API loadNotes error:', error);

            // Резервное использование localStorage
            const storedNotes = localStorage.getItem('notes');
            return storedNotes ? JSON.parse(storedNotes) : [];
        }
    },

    async saveNotes(notes) {
        // Дебаунсинг сохранений
        clearTimeout(this.saveDebounceTimeout);

        return new Promise((resolve) => {
            this.saveDebounceTimeout = setTimeout(async () => {
                try {
                    // Сначала сохраняем в localStorage для надежности
                    localStorage.setItem('notes', JSON.stringify(notes));

                    const response = await fetch('api.php?action=saveNotes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({ notes })
                    });

                    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

                    const result = await response.json();
                    if (!result.success) throw new Error(result.error || 'Unknown API error');

                    resolve(true);
                } catch (error) {
                    console.error('API saveNotes error:', error);
                    // localStorage уже обновлен выше
                    resolve(false);
                }
            }, 300); // 300ms дебаунсинг для сохранений
        });
    }
};

// Функции-утилиты
const Utils = {
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatNoteDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        if (diffDays < 7) return `${diffDays} дн назад`;

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    },

    // Обработка Markdown разметки
    processMarkdown(markdown) {
        if (!markdown || !markdown.trim()) return '';

        try {
            // Проверяем загрузку библиотек
            if (typeof marked === 'undefined') {
                return markdown.replace(/\n/g, '<br>');
            }

            // Конфигурируем marked для лучшей работы со списками
            marked.setOptions({
                gfm: true,
                breaks: true,
                smartLists: true,
                smartypants: true,
                headerIds: false // Отключаем автогенерацию ID для заголовков
            });

            const html = marked.parse(markdown);

            // Применяем подсветку кода, если доступна библиотека
            if (typeof hljs !== 'undefined' && html.includes('<pre><code')) {
                return html.replace(/<pre><code class="([^"]+)">([\s\S]*?)<\/code><\/pre>/g, (match, language, code) => {
                    try {
                        const highlighted = hljs.highlightAuto(code).value;
                        return `<pre><code class="${language}">${highlighted}</code></pre>`;
                    } catch (e) {
                        return match; // Возвращаем исходный код при ошибке
                    }
                });
            }

            return html;
        } catch (error) {
            console.error('Markdown processing error:', error);
            return `<p style="color: #ef4444;">Ошибка отображения Markdown: ${error.message}</p>`;
        }
    }
};

// Модуль управления заметками
const NotesManager = {
    async init() {
        try {
            // Загружаем заметки
            State.notes = await API.loadNotes();

            // Настраиваем интерфейс
            this.setupEventListeners();
            this.renderNotesList();

            // Отображаем превью
            this.updatePreview();

            console.log('Notes system: initialized successfully with', State.notes.length, 'notes');
        } catch (error) {
            console.error('Notes system initialization error:', error);
        }
    },

    setupEventListeners() {
        // Основные кнопки
        DOM.newNoteBtn?.addEventListener('click', () => this.createNewNote());
        DOM.saveNoteBtn?.addEventListener('click', () => this.saveCurrentNote());
        DOM.deleteNoteBtn?.addEventListener('click', () => this.deleteCurrentNote());
        DOM.togglePreviewBtn?.addEventListener('click', () => this.togglePreview());

        // Поиск
        DOM.notesSearchInput?.addEventListener('input', () => this.renderNotesList());

        // Управление тегами
        DOM.addNoteTagBtn?.addEventListener('click', () => this.addTag());
        DOM.noteTagInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTag();
        });

        // Автосохранение контента
        if (DOM.notesContent) {
            DOM.notesContent.addEventListener('input', () => {
                clearTimeout(State.autoSaveTimeouts.content);
                State.autoSaveTimeouts.content = setTimeout(() => {
                    this.saveCurrentNote();
                }, 1000);

                // Обновляем превью при вводе
                this.updatePreview();
            });
        }

        // Автосохранение заголовка
        if (DOM.noteTitle) {
            DOM.noteTitle.addEventListener('input', () => {
                clearTimeout(State.autoSaveTimeouts.title);
                State.autoSaveTimeouts.title = setTimeout(() => {
                    this.saveCurrentNote();
                }, 1000);
            });
        }

        // Обработка кнопок форматирования Markdown
        DOM.markdownButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const markdown = btn.getAttribute('data-markdown');
                if (markdown) this.insertMarkdown(markdown);
            });
        });
    },

    async createNewNote() {
        const newNote = {
            id: Date.now(),
            title: 'Новая заметка',
            content: '',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Добавляем в начало массива
        State.notes.unshift(newNote);
        State.currentNoteId = newNote.id;
        State.currentNoteTags = [];

        // Сохраняем сразу для предотвращения потери данных
        await API.saveNotes(State.notes);

        // Обновляем интерфейс
        this.renderNotesList();
        this.openNoteEditor(newNote.id);

        // Фокус на заголовок
        if (DOM.noteTitle) {
            DOM.noteTitle.focus();
            DOM.noteTitle.select();
        }
    },

    openNoteEditor(noteId) {
        const note = State.notes.find(n => n.id === noteId);
        if (!note) return;

        // Обновляем состояние
        State.currentNoteId = noteId;
        State.currentNoteTags = [...(note.tags || [])];

        // Показываем редактор
        DOM.notesEditorContainer?.classList.remove('hidden');
        DOM.notesEmptyEditor?.classList.add('hidden');

        // Заполняем данные
        if (DOM.noteTitle) DOM.noteTitle.value = note.title || '';
        if (DOM.notesContent) DOM.notesContent.value = note.content || '';

        // Обновляем интерфейс
        this.renderTagsList();
        this.updatePreview();
        this.renderNotesList(); // Обновляем активный элемент списка
    },

    async saveCurrentNote() {
        // Проверки
        if (!State.currentNoteId || State.isSaving) return;

        // Блокируем повторные сохранения
        State.isSaving = true;

        try {
            const note = State.notes.find(n => n.id === State.currentNoteId);
            if (!note) throw new Error(`Note not found: ${State.currentNoteId}`);

            // Обновляем данные
            note.title = DOM.noteTitle?.value?.trim() || 'Без названия';
            note.content = DOM.notesContent?.value || '';
            note.tags = [...State.currentNoteTags];
            note.updatedAt = new Date().toISOString();

            // Сохраняем
            await API.saveNotes(State.notes);

            // Обновляем интерфейс
            this.renderNotesList();

            // Визуальная обратная связь
            if (DOM.saveNoteBtn) {
                const originalText = DOM.saveNoteBtn.innerHTML;
                DOM.saveNoteBtn.innerHTML = '<span>✓</span>';
                setTimeout(() => {
                    DOM.saveNoteBtn.innerHTML = originalText;
                }, 1000);
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            // Разблокируем сохранение
            State.isSaving = false;
        }
    },

    async deleteCurrentNote() {
        if (!State.currentNoteId) return;
        if (!confirm('Удалить эту заметку?')) return;

        // Удаляем заметку
        State.notes = State.notes.filter(n => n.id !== State.currentNoteId);

        // Сохраняем изменения
        await API.saveNotes(State.notes);

        // Сбрасываем состояние
        State.currentNoteId = null;
        State.currentNoteTags = [];

        // Обновляем интерфейс
        DOM.notesEditorContainer?.classList.add('hidden');
        DOM.notesEmptyEditor?.classList.remove('hidden');
        this.renderNotesList();
    },

    togglePreview() {
        State.previewVisible = !State.previewVisible;

        // Обновляем интерфейс
        if (DOM.notesEditorLayout) {
            DOM.notesEditorLayout.classList.toggle('preview-hidden', !State.previewVisible);
        }

        if (DOM.togglePreviewBtn) {
            DOM.togglePreviewBtn.innerHTML = State.previewVisible ? '<span>👁️</span>' : '<span>📝</span>';
            DOM.togglePreviewBtn.title = State.previewVisible ? 'Скрыть предпросмотр' : 'Показать предпросмотр';
        }
    },

    updatePreview() {
        if (!DOM.notePreview || !DOM.notesContent) return;

        const markdown = DOM.notesContent.value || '';

        // Для пустой заметки
        if (!markdown.trim()) {
            DOM.notePreview.innerHTML = '<p class="notes-preview-placeholder">Предпросмотр появится здесь...</p>';
            return;
        }

        // Используем оптимизированную функцию обработки Markdown
        DOM.notePreview.innerHTML = Utils.processMarkdown(markdown);

        // Подсветка кода
        if (typeof hljs !== 'undefined') {
            DOM.notePreview.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    },

    addTag() {
        if (!DOM.noteTagInput) return;

        const tag = DOM.noteTagInput.value.trim();
        if (!tag) return;

        // Добавляем тег, если его еще нет
        if (!State.currentNoteTags.includes(tag)) {
            State.currentNoteTags.push(tag);
            this.renderTagsList();
            DOM.noteTagInput.value = '';
        }
    },

    removeTag(tag) {
        State.currentNoteTags = State.currentNoteTags.filter(t => t !== tag);
        this.renderTagsList();
    },

    renderTagsList() {
        if (!DOM.noteTagsList) return;

        const html = State.currentNoteTags.length
            ? State.currentNoteTags.map(tag => `
                <span class="note-tag">
                    ${Utils.escapeHtml(tag)}
                    <span class="note-tag-remove" onclick="notesSystem.removeTag('${Utils.escapeHtml(tag)}')">×</span>
                </span>
            `).join('')
            : '<span class="notes-tags-placeholder">Теги не добавлены</span>';

        // Обновляем DOM только если изменилось содержимое
        if (RenderCache.tagsList !== html) {
            DOM.noteTagsList.innerHTML = html;
            RenderCache.tagsList = html;
        }
    },

    renderNotesList() {
        if (!DOM.notesList) return;

        const searchQuery = DOM.notesSearchInput?.value.toLowerCase() || '';

        // Фильтруем заметки
        let filteredNotes = State.notes.filter(note => {
            const titleMatch = (note.title || '').toLowerCase().includes(searchQuery);
            const contentMatch = (note.content || '').toLowerCase().includes(searchQuery);
            const tagsMatch = (note.tags || []).some(tag => tag.toLowerCase().includes(searchQuery));

            return titleMatch || contentMatch || tagsMatch;
        });

        // Генерируем HTML
        let html;

        if (filteredNotes.length === 0) {
            html = `
                <div class="notes-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <p>${searchQuery ? 'Ничего не найдено' : 'Нет заметок'}</p>
                    <small>${searchQuery ? 'Попробуйте другой запрос' : 'Создайте первую заметку'}</small>
                </div>
            `;
        } else {
            // Сортируем заметки: новые вверху
            filteredNotes.sort((a, b) => {
                return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
            });

            html = filteredNotes.map(note => {
                const preview = (note.content || '').substring(0, 60).replace(/[#*_`]/g, '') || 'Пустая заметка';
                const date = Utils.formatNoteDate(note.updatedAt || note.createdAt);
                const isActive = note.id === State.currentNoteId;
                const tags = note.tags || [];

                return `
                    <div class="note-item ${isActive ? 'active' : ''}" onclick="notesSystem.openNoteEditor(${note.id})">
                        <div class="note-item-title">${Utils.escapeHtml(note.title || '')}</div>
                        <div class="note-item-preview">${Utils.escapeHtml(preview)}</div>
                        ${tags.length > 0 ? `
                            <div class="note-item-tags">
                                ${tags.map(tag => `<span class="note-item-tag">${Utils.escapeHtml(tag)}</span>`).join('')}
                            </div>
                        ` : ''}
                        <div class="note-item-meta">
                            <span>${date}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Обновляем DOM только если изменилось содержимое
        if (RenderCache.notesList !== html) {
            DOM.notesList.innerHTML = html;
            RenderCache.notesList = html;
        }
    },

    insertMarkdown(markdown) {
        if (!DOM.notesContent) return;

        const start = DOM.notesContent.selectionStart;
        const end = DOM.notesContent.selectionEnd;
        const text = DOM.notesContent.value || '';
        const selectedText = text.substring(start, end);

        let replacement = '';

        // Особая обработка разных типов markdown
        if (markdown.includes('текст') && selectedText) {
            // Замена плейсхолдера на выделенный текст
            replacement = markdown.replace('текст', selectedText);
        } else if (markdown.includes('\n') && selectedText) {
            // Блоки кода
            replacement = markdown.replace('код', selectedText);
        } else if (markdown === '# ' || markdown === '## ' || markdown === '### ' ||
            markdown === '- ' || markdown === '1. ' || markdown === '> ') {
            // Заголовки, списки и цитаты - вставляем в начало строки
            const beforeCursor = text.substring(0, start);
            const afterCursor = text.substring(end);

            const lastNewLine = beforeCursor.lastIndexOf('\n');
            const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;

            const newText = beforeCursor.substring(0, lineStart) +
                markdown +
                beforeCursor.substring(lineStart) +
                afterCursor;

            DOM.notesContent.value = newText;
            DOM.notesContent.selectionStart = DOM.notesContent.selectionEnd = start + markdown.length;
            DOM.notesContent.focus();
            this.updatePreview();
            return;
        } else {
            replacement = markdown;
        }

        // Вставка текста
        DOM.notesContent.value = text.substring(0, start) + replacement + text.substring(end);

        // Установка курсора
        if (replacement.includes('текст') && !selectedText) {
            const textPos = replacement.indexOf('текст');
            DOM.notesContent.selectionStart = start + textPos;
            DOM.notesContent.selectionEnd = start + textPos + 5; // длина слова "текст"
        } else if (replacement.includes('код') && !selectedText) {
            const codePos = replacement.indexOf('код');
            DOM.notesContent.selectionStart = start + codePos;
            DOM.notesContent.selectionEnd = start + codePos + 3; // длина слова "код"
        } else if (replacement.includes('url') && !selectedText) {
            const urlPos = replacement.indexOf('url');
            DOM.notesContent.selectionStart = start + urlPos;
            DOM.notesContent.selectionEnd = start + urlPos + 3; // длина слова "url"
        } else {
            DOM.notesContent.selectionStart = DOM.notesContent.selectionEnd = start + replacement.length;
        }

        DOM.notesContent.focus();
        this.updatePreview();
    }
};

// Создаем глобальный объект для inline-обработчиков
const notesSystem = {
    openNoteEditor: (id) => NotesManager.openNoteEditor(id),
    removeTag: (tag) => NotesManager.removeTag(tag),
    // Другие методы, которые нужны в HTML
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Notes system: DOM loaded');
    NotesManager.init();

    // Устанавливаем window-обработчики для поддержки существующего кода
    window.openNoteEditor = notesSystem.openNoteEditor;
    window.removeNoteTag = notesSystem.removeTag;
});