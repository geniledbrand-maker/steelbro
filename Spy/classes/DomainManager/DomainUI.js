/**
 * DomainUI - Управление интерфейсом доменов
 * Файл: /classes/DomainManager/DomainUI.js
 * Требует: DomainStorage.js, DomainManager.js
 */

class DomainUI {
    constructor() {
        this.eventHandlers = {};
        this.currentTags = [];
        this.editingDomainId = null;
        
        this.setupEventListeners();
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработчики для модального окна
        this.setupModalEventListeners();
        
        // Обработчики для импорта/экспорта
        this.setupImportExportListeners();
    }

    /**
     * Настройка обработчиков модального окна
     */
    setupModalEventListeners() {
        // Закрытие модального окна по клику вне его
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('domainModal');
            if (e.target === modal) {
                this.hideDomainModal();
            }
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideDomainModal();
            }
        });
    }

    /**
     * Настройка обработчиков импорта/экспорта
     */
    setupImportExportListeners() {
        // Обработчик для файла импорта
        const importInput = document.getElementById('importFileInput');
        if (importInput) {
            importInput.addEventListener('change', (e) => this.handleImportFile(e));
        }
    }

    /**
     * Регистрация обработчика событий
     * @param {string} event
     * @param {Function} handler
     */
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    /**
     * Вызов обработчиков событий
     * @param {string} event
     * @param {*} data
     */
    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }


    /**
     * Обновление счётчика доменов
     * @param {number} count
     */
    updateCounter(count) {
        const counter = document.getElementById('domainCounter');
        if (counter) {
            counter.textContent = count;
        }
    }

    /**
     * Показ модального окна для добавления/редактирования домена
     * @param {Object|null} domain
     */
    showDomainModal(domain = null) {
        const modal = document.getElementById('domainModal');
        const title = document.getElementById('modalTitle');
        const domainInput = document.getElementById('modalDomainInput');
        const descriptionInput = document.getElementById('modalDescriptionInput');

        if (!modal || !title || !domainInput || !descriptionInput) {
            console.error('Элементы модального окна не найдены');
            return;
        }

        this.editingDomainId = domain ? domain.id : null;
        this.currentTags = domain ? [...(domain.tags || [])] : [];

        title.textContent = domain ? 'Редактировать домен' : 'Добавить домен';
        domainInput.value = domain ? domain.domain : '';
        descriptionInput.value = domain ? (domain.description || '') : '';

        // Загружаем цвета тегов перед рендерингом
        this.emit('getAllTags');
        
        this.renderModalTags();
        modal.classList.add('active');

        // Фокус на поле ввода домена
        setTimeout(() => domainInput.focus(), 100);
    }

    /**
     * Скрытие модального окна
     */
    hideDomainModal() {
        const modal = document.getElementById('domainModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.editingDomainId = null;
        this.currentTags = [];
    }

    /**
     * Отрисовка тегов в модальном окне
     */
    renderModalTags() {
        const container = document.getElementById('tagsContainer');
        if (!container) return;

        const currentInput = document.getElementById('tagsInput');
        const inputValue = currentInput ? currentInput.value : '';

        // Получаем все уникальные теги из всех доменов
        const allTags = this.getAllUniqueTags();
        const availableTags = allTags.filter(tag => !this.currentTags.includes(tag));

        container.innerHTML = this.currentTags.map(tag => {
            const tagColor = this.getTagColor(tag);
            const style = tagColor ? `style="background: ${tagColor};"` : '';
            return `
                <span class="tag-item" ${style}>
                    ${this.escapeHtml(tag)}
                    <button class="tag-remove" onclick="domainUI.removeTag('${this.escapeHtml(tag)}')">×</button>
                </span>
            `;
        }).join('') + `
            <input type="text" class="tags-input" id="tagsInput" 
                   placeholder="Введите тег и нажмите Enter" value="${this.escapeHtml(inputValue)}">
            ${availableTags.length > 0 ? `
                <div class="available-tags">
                    <div class="available-tags-label">Доступные теги:</div>
                    ${availableTags.map(tag => {
                        const tagColor = this.getTagColor(tag);
                        const style = tagColor ? `style="background: ${tagColor};"` : '';
                        return `
                            <span class="available-tag" ${style} onclick="domainUI.addTagToEditing('${this.escapeHtml(tag)}')" title="Добавить тег">
                                ${this.escapeHtml(tag)}
                                <button class="available-tag-remove" onclick="event.stopPropagation(); domainUI.removeAvailableTag('${this.escapeHtml(tag)}')" title="Удалить тег из всех доменов">×</button>
                            </span>
                        `;
                    }).join('')}
                </div>
            ` : ''}
        `;

        // Настройка обработчика для ввода тегов
        const newInput = document.getElementById('tagsInput');
        if (newInput) {
            newInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const tag = e.target.value.trim();
                    if (tag && !this.currentTags.includes(tag)) {
                        this.currentTags.push(tag);
                        this.renderModalTags();
                    }
                }
            });
        }
    }

    /**
     * Получение всех уникальных тегов из всех доменов
     * @returns {Array}
     */
    getAllUniqueTags() {
        // Этот метод должен быть вызван из DomainManager
        this.emit('getAllTags');
        return this.allUniqueTags || [];
    }

    /**
     * Принудительное обновление списка уникальных тегов
     */
    refreshAllUniqueTags() {
        this.emit('getAllTags');
    }

    /**
     * Установка всех уникальных тегов
     * @param {Array} tags
     */
    setAllUniqueTags(tags) {
        this.allUniqueTags = tags;
    }

    /**
     * Удаление тега
     * @param {string} tag
     */
    removeTag(tag) {
        this.currentTags = this.currentTags.filter(t => t !== tag);
        this.renderModalTags();
    }

    /**
     * Рендеринг тегов в модальном окне (новый метод)
     */
    renderModalTagsNew() {
        console.log('DomainUI.renderModalTagsNew() - рендерим теги в модальном окне');
        
        // Получаем все уникальные теги
        this.emit('getAllTags');
        
        // Небольшая задержка для получения данных
        setTimeout(() => {
            const allTags = this.allUniqueTags || [];
            console.log('DomainUI.renderModalTagsNew() - получено уникальных тегов:', allTags.length);
            
            // Фильтруем теги, исключая уже добавленные
            const availableTags = allTags.filter(tag => !this.currentTags.includes(tag));
            console.log('DomainUI.renderModalTagsNew() - доступных тегов:', availableTags.length);
            
            // Рендерим текущие теги
            this.renderCurrentTags();
            
            // Рендерим доступные теги
            this.renderAvailableTags(availableTags);
        }, 100);
    }

    /**
     * Рендеринг текущих тегов
     */
    renderCurrentTags() {
        const container = document.getElementById('currentTags');
        if (!container) return;

        if (this.currentTags.length === 0) {
            container.innerHTML = '<div class="no-tags">Теги не добавлены</div>';
            return;
        }

        container.innerHTML = this.currentTags.map(tag => {
            const tagColor = this.getTagColor(tag);
            const style = tagColor ? `style="background: ${tagColor};"` : '';
            return `
                <span class="tag" ${style} onclick="event.stopPropagation(); window.domainUI.removeTag('${this.escapeHtml(tag)}')" title="Удалить тег: ${this.escapeHtml(tag)}">
                    ${this.escapeHtml(tag)}
                    <button class="tag-remove" onclick="event.stopPropagation(); window.domainUI.removeTag('${this.escapeHtml(tag)}')" title="Удалить тег">×</button>
                </span>
            `;
        }).join('');
    }

    /**
     * Рендеринг доступных тегов
     * @param {Array} availableTags
     */
    renderAvailableTags(availableTags) {
        const container = document.getElementById('availableTags');
        if (!container) return;

        if (availableTags.length === 0) {
            container.innerHTML = '<div class="no-available-tags">Нет доступных тегов</div>';
            return;
        }

        container.innerHTML = availableTags.map(tag => {
            const tagColor = this.getTagColor(tag);
            const style = tagColor ? `style="background: ${tagColor};"` : '';
            return `
                <span class="available-tag" ${style} onclick="domainUI.addTagToEditing('${this.escapeHtml(tag)}')" title="Добавить тег: ${this.escapeHtml(tag)}">
                    ${this.escapeHtml(tag)}
                    <button class="available-tag-remove" onclick="event.stopPropagation(); domainUI.removeAvailableTag('${this.escapeHtml(tag)}')" title="Удалить тег из всех доменов">×</button>
                </span>
            `;
        }).join('');
    }

    /**
     * Обработка выбора домена
     * @param {string} domainId
     */
    selectDomain(domainId) {
        console.log('DomainUI.selectDomain() - клик по домену ID:', domainId);
        this.emit('domainSelect', domainId);
    }

    /**
     * Обработка редактирования домена
     * @param {string} domainId
     */
    editDomain(domainId) {
        this.emit('domainEdit', domainId);
    }

    /**
     * Обработка удаления домена
     * @param {string} domainId
     */
    deleteDomain(domainId) {
        this.emit('domainDelete', domainId);
    }

    /**
     * Обработка добавления домена
     */
    addDomain() {
        this.emit('domainAdd');
    }

    /**
     * Фильтрация доменов по тегу
     * @param {string} tag
     */
    filterByTag(tag) {
        console.log('DomainUI.filterByTag() - фильтруем по тегу:', tag);
        this.emit('filterByTag', tag);
    }

    /**
     * Добавление тега к редактируемому домену
     * @param {string} tag
     */
    addTagToEditing(tag) {
        if (this.editingDomainId !== null && !this.currentTags.includes(tag)) {
            this.currentTags.push(tag);
            this.renderModalTags();
        }
    }

    /**
     * Добавление нового тега из поля ввода
     * @param {string} tagName
     */
    addNewTag(tagName) {
        if (!tagName || tagName.trim() === '') return;
        
        const tag = tagName.trim();
        console.log('DomainUI.addNewTag() - добавляем новый тег:', tag);
        
        if (!this.currentTags.includes(tag)) {
            this.currentTags.push(tag);
            this.renderModalTags();
            
            // Очищаем поле ввода
            const tagInput = document.getElementById('modalTagInput');
            if (tagInput) {
                tagInput.value = '';
            }
        }
    }

    /**
     * Обработка нажатия клавиш в поле ввода тегов
     * @param {KeyboardEvent} event
     */
    handleTagInputKeypress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const tagInput = event.target;
            const tagName = tagInput.value.trim();
            
            if (tagName) {
                this.addNewTag(tagName);
            }
        }
    }

    /**
     * Удаление доступного тега из всех доменов
     * @param {string} tag
     */
    removeAvailableTag(tag) {
        console.log('DomainUI.removeAvailableTag() - показываем модальное окно для удаления тега:', tag);
        this.showConfirmDeleteTagModal({
            tag: tag,
            type: 'fromAllDomains'
        });
    }

    /**
     * Удаление тега из конкретного домена
     * @param {string} domainId
     * @param {string} tag
     */
    removeTagFromDomain(domainId, tag) {
        console.log('DomainUI.removeTagFromDomain() - показываем модальное окно для удаления тега:', { domainId, tag });
        
        // Получаем информацию о домене
        this.emit('getDomainInfo', domainId);
        
        this.showConfirmDeleteTagModal({
            tag: tag,
            type: 'fromDomain',
            domainId: domainId,
            domainName: 'Загрузка...' // Будет обновлено после получения данных
        });
    }

    /**
     * Сохранение домена
     */
    saveDomain() {
        const domainInput = document.getElementById('modalDomainInput');
        const descriptionInput = document.getElementById('modalDescriptionInput');

        if (!domainInput || !descriptionInput) {
            console.error('Поля формы не найдены');
            return;
        }

        const domain = domainInput.value.trim().replace(/^https?:\/\//, '');
        const description = descriptionInput.value.trim();

        if (!domain) {
            this.emit('notification', { type: 'error', message: 'Введите домен' });
            return;
        }

        const data = {
            id: this.editingDomainId,
            domain: domain,
            description: description,
            tags: [...this.currentTags]
        };

        this.emit('domainSave', data);
    }

    /**
     * Экспорт доменов
     */
    exportDomains() {
        this.emit('domainsExport');
    }

    /**
     * Импорт доменов
     */
    importDomains() {
        const importInput = document.getElementById('importFileInput');
        if (importInput) {
            importInput.click();
        }
    }

    /**
     * Обработка импорта файла
     * @param {Event} event
     */
    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const fileData = e.target.result;
                this.emit('domainsImport', fileData);
            } catch (error) {
                this.emit('notification', { type: 'error', message: 'Ошибка чтения файла: ' + error.message });
            }
        };
        reader.readAsText(file);
        
        // Очистка input для возможности повторного выбора того же файла
        event.target.value = '';
    }

    /**
     * Экранирование HTML
     * @param {string} text
     * @returns {string}
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Рендеринг списка доменов
     * @param {Array} domains - Список доменов
     * @param {string} selectedId - ID выбранного домена
     */
    renderDomainList(domains, selectedId = null) {
        console.log('DomainUI.renderDomainList() - получено доменов:', domains?.length || 0);
        console.log('DomainUI.renderDomainList() - домены:', domains);
        
        const container = document.getElementById('domainList');
        if (!container) {
            console.error('Контейнер domainList не найден');
            return;
        }
        
        console.log('DomainUI.renderDomainList() - контейнер найден:', container);
        console.log('DomainUI.renderDomainList() - текущий HTML:', container.innerHTML);

        if (!domains || domains.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>У вас пока нет сохранённых доменов</p>
                    <p style="font-size: 12px; margin-top: 10px;">Добавьте домены конкурентов для быстрого доступа</p>
                </div>
            `;
            return;
        }

        const html = domains.map(domain => {
            // Отладочная информация для тегов
            console.log(`Отображение домена ${domain.domain}:`, {
                tags: domain.tags,
                tagsLength: domain.tags ? domain.tags.length : 0,
                tagsType: typeof domain.tags
            });
            
            return `
                <div class="domain-card ${selectedId === domain.id ? 'selected' : ''}" 
                     onclick="window.domainUI.selectDomain('${domain.id}')">
                    <div class="domain-info">
                        <div class="domain-name">${this.escapeHtml(domain.domain)}</div>
                        ${domain.description ? `<div class="domain-description">${this.escapeHtml(domain.description)}</div>` : ''}
                        ${domain.tags && Array.isArray(domain.tags) && domain.tags.length > 0 ? `
                <div class="domain-tags">
                    ${domain.tags.map(tag => {
                        const tagColor = this.getTagColor(tag);
                        const style = tagColor ? `style="background: ${tagColor};"` : '';
                        return `
                            <span class="tag" ${style} onclick="event.stopPropagation(); window.domainUI.filterByTag('${this.escapeHtml(tag)}')" title="Фильтровать по тегу: ${this.escapeHtml(tag)}">
                                ${this.escapeHtml(tag)}
                                <button class="tag-remove-from-domain" onclick="event.stopPropagation(); window.domainUI.removeTagFromDomain('${domain.id}', '${this.escapeHtml(tag)}')" title="Удалить тег из домена">×</button>
                            </span>
                        `;
                    }).join('')}
                </div>
                        ` : ''}
                    </div>
                    <div class="domain-actions">
                        <button class="icon-btn edit" onclick="event.stopPropagation(); window.domainUI.editDomain('${domain.id}')" title="Редактировать">
                            ✏️
                        </button>
                        <button class="icon-btn delete" onclick="event.stopPropagation(); window.domainUI.deleteDomain('${domain.id}')" title="Удалить">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        console.log('DomainUI.renderDomainList() - HTML установлен:', container.innerHTML);
    }

    /**
     * Обновление счетчика доменов
     * @param {number} count
     */
    updateCounter(count) {
        console.log('DomainUI.updateCounter() - обновляем счетчик на:', count);
        const counter = document.getElementById('domainCounter');
        if (counter) {
            counter.textContent = count;
            console.log('DomainUI.updateCounter() - счетчик обновлен');
        } else {
            console.error('DomainUI.updateCounter() - счетчик не найден');
        }
    }

    /**
     * Инициализация UI
     */
    init() {
        // Привязка глобальных функций для совместимости с HTML
        window.openAddDomainModal = () => this.addDomain();
        window.closeDomainModal = () => this.hideDomainModal();
        window.saveDomain = () => this.saveDomain();
        window.exportDomains = () => this.exportDomains();
        window.importDomains = () => this.importDomains();
        window.showAllDomains = () => this.showAllDomains();
        window.showTagsManagement = () => this.showTagsManagement();
        window.hideTagsManagementModal = () => this.hideTagsManagementModal();
        window.hideTagColorPalette = () => this.hideTagColorPalette();
        window.domainUI = this;

        // Настройка обработчика кнопки управления тегами
        this.setupTagsManagementButton();
        
        // Настройка обработчиков для иконок действий
        this.setupActionIcons();
        
        // Настройка обработчика поля ввода тегов
        this.setupTagInputHandler();
        
        // Настройка поиска доменов
        this.setupDomainSearch();

        console.log('DomainUI initialized');
    }


    /**
     * Показать все домены (сброс фильтрации)
     */
    showAllDomains() {
        console.log('DomainUI.showAllDomains() - сбрасываем фильтрацию');
        this.emit('showAllDomains');
    }


    /**
     * Настройка обработчика кнопки управления тегами
     */
    setupTagsManagementButton() {
        const manageTagsBtn = document.getElementById('manageTagsBtn');
        if (manageTagsBtn) {
            manageTagsBtn.addEventListener('click', () => this.showTagsManagement());
            console.log('DomainUI.setupTagsManagementButton() - обработчик кнопки управления тегами настроен');
        } else {
            console.warn('DomainUI.setupTagsManagementButton() - кнопка управления тегами не найдена');
        }
    }

    /**
     * Настройка обработчиков для иконок действий
     */
    setupActionIcons() {
        // Экспорт доменов
        const exportBtn = document.getElementById('exportDomainsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportDomains());
        }

        // Импорт доменов
        const importBtn = document.getElementById('importDomainsBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importDomains());
        }

        // Управление тегами
        const tagsBtn = document.getElementById('manageTagsBtn');
        if (tagsBtn) {
            tagsBtn.addEventListener('click', () => this.showTagsManagement());
        }

        // Показать все домены
        const showAllBtn = document.getElementById('showAllDomainsBtn');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => this.showAllDomains());
        }

        // Загрузить домены по умолчанию
        const loadDefaultBtn = document.getElementById('loadDefaultDomainsBtn');
        if (loadDefaultBtn) {
            loadDefaultBtn.addEventListener('click', () => this.loadDefaultDomains());
        }

        // Синхронизировать данные
        const syncBtn = document.getElementById('syncDataBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncData());
        }
    }

    /**
     * Загрузка доменов по умолчанию
     */
    async loadDefaultDomains() {
        try {
            console.log('🏠 Загружаем домены по умолчанию...');
            
            const response = await fetch('./data/default_domains.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const defaultDomains = await response.json();
            if (!Array.isArray(defaultDomains)) {
                throw new Error('Неверный формат данных');
            }
            
            // Эмитируем событие для загрузки доменов
            this.emit('loadDefaultDomains', defaultDomains);
            
            console.log('✅ Домены по умолчанию загружены:', defaultDomains.length);
        } catch (error) {
            console.error('❌ Ошибка загрузки доменов по умолчанию:', error);
            this.emit('notification', { 
                type: 'error', 
                message: 'Ошибка загрузки доменов по умолчанию: ' + error.message 
            });
        }
    }

    /**
     * Синхронизация данных
     */
    syncData() {
        try {
            console.log('🔄 Синхронизируем данные...');
            
            // Эмитируем событие для синхронизации
            this.emit('syncData');
            
            console.log('✅ Синхронизация запущена');
        } catch (error) {
            console.error('❌ Ошибка синхронизации:', error);
            this.emit('notification', { 
                type: 'error', 
                message: 'Ошибка синхронизации: ' + error.message 
            });
        }
    }

    /**
     * Настройка обработчика поля ввода тегов
     */
    setupTagInputHandler() {
        const tagInput = document.getElementById('modalTagInput');
        if (tagInput) {
            tagInput.addEventListener('keypress', (e) => this.handleTagInputKeypress(e));
            console.log('DomainUI.setupTagInputHandler() - обработчик поля ввода тегов настроен');
        } else {
            console.warn('DomainUI.setupTagInputHandler() - поле ввода тегов не найдено');
        }
    }

    /**
     * Показ модального окна управления тегами
     */
    showTagsManagement() {
        console.log('DomainUI.showTagsManagement() - показываем модальное окно управления тегами');
        
        const modal = document.getElementById('tagsManagementModal');
        if (!modal) {
            console.error('Модальное окно управления тегами не найдено');
            return;
        }

        // Загружаем все теги
        this.loadAllTags();
        
        // Настраиваем обработчики
        this.setupTagsManagementHandlers();
        
        // Показываем модальное окно
        modal.classList.add('active');
    }

    /**
     * Скрытие модального окна управления тегами
     */
    hideTagsManagementModal() {
        const modal = document.getElementById('tagsManagementModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Загрузка всех тегов в модальное окно
     */
    loadAllTags() {
        const container = document.getElementById('allTagsContainer');
        if (!container) return;

        // Получаем все уникальные теги
        this.emit('getAllTags');
        
        // Небольшая задержка для получения данных
        setTimeout(() => {
            this.renderAllTags();
        }, 100);
    }

    /**
     * Отрисовка всех тегов в модальном окне
     */
    renderAllTags() {
        const container = document.getElementById('allTagsContainer');
        if (!container) return;

        // Принудительно получаем свежие данные
        this.emit('getAllTags');
        
        // Небольшая задержка для получения данных
        setTimeout(() => {
            const allTags = this.allUniqueTags || [];
            
            if (allTags.length === 0) {
                container.innerHTML = '<div class="empty-tags-message">Теги не найдены</div>';
                return;
            }

            container.innerHTML = allTags.map(tag => {
                const tagColor = this.getTagColor(tag);
                const style = tagColor ? `style="background: ${tagColor};"` : '';
                return `
                    <span class="tag-item" ${style} onclick="domainUI.editTag('${this.escapeHtml(tag)}')" title="Кликните для изменения цвета">
                        ${this.escapeHtml(tag)}
                        <button class="tag-remove" onclick="event.stopPropagation(); domainUI.deleteTagFromManagement('${this.escapeHtml(tag)}')" title="Удалить тег">×</button>
                    </span>
                `;
            }).join('');
        }, 100);
    }

    /**
     * Настройка обработчиков в модальном окне управления тегами
     */
    setupTagsManagementHandlers() {
        const createTagBtn = document.getElementById('createTagBtn');
        const newTagInput = document.getElementById('newTagInput');

        if (createTagBtn) {
            createTagBtn.onclick = () => this.createNewTag();
        }

        if (newTagInput) {
            newTagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.createNewTag();
                }
            });
        }
    }

    /**
     * Создание нового тега
     */
    createNewTag() {
        const input = document.getElementById('newTagInput');
        if (!input) return;

        const tagName = input.value.trim();
        if (!tagName) {
            this.emit('notification', { type: 'error', message: 'Введите название тега' });
            return;
        }

        console.log('DomainUI.createNewTag() - создаем новый тег:', tagName);
        this.emit('createTag', tagName);
        
        // Очищаем поле ввода
        input.value = '';
        
        // Обновляем отображение тегов после создания
        setTimeout(() => {
            this.renderAllTags();
        }, 200);
    }

    /**
     * Удаление тега из модального окна управления
     * @param {string} tag
     */
    deleteTagFromManagement(tag) {
        console.log('DomainUI.deleteTagFromManagement() - удаляем тег:', tag);
        this.showConfirmDeleteTagModal({
            tag: tag,
            type: 'fromAllDomains'
        });
    }

    /**
     * Редактирование тега (показ палитры цветов)
     * @param {string} tag
     */
    editTag(tag) {
        console.log('DomainUI.editTag() - редактируем тег:', tag);
        this.showTagColorPalette(tag);
    }

    /**
     * Показ палитры цветов для тега
     * @param {string} tag
     */
    showTagColorPalette(tag) {
        const palette = document.getElementById('tagColorPalette');
        if (!palette) {
            console.error('Палитра цветов не найдена');
            return;
        }

        // Сохраняем текущий редактируемый тег
        this.editingTag = tag;

        // Показываем палитру
        palette.style.display = 'block';

        // Настраиваем обработчики
        this.setupColorPaletteHandlers();

        // Устанавливаем текущий цвет тега
        this.setCurrentTagColor(tag);
    }

    /**
     * Скрытие палитры цветов
     */
    hideTagColorPalette() {
        const palette = document.getElementById('tagColorPalette');
        if (palette) {
            palette.style.display = 'none';
        }
        this.editingTag = null;
    }

    /**
     * Настройка обработчиков палитры цветов
     */
    setupColorPaletteHandlers() {
        // Обработчики для предустановленных цветов
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.onclick = () => this.selectPresetColor(option);
        });

        // Обработчик для своего цвета
        const applyCustomBtn = document.getElementById('applyCustomColor');
        if (applyCustomBtn) {
            applyCustomBtn.onclick = () => this.applyCustomColor();
        }

        // Обработчик для сохранения своего цвета
        const saveCustomBtn = document.getElementById('saveCustomColor');
        if (saveCustomBtn) {
            saveCustomBtn.onclick = () => this.saveCustomColor();
        }

        // Обработчик для очистки сохраненных цветов
        const clearSavedBtn = document.getElementById('clearSavedColors');
        if (clearSavedBtn) {
            clearSavedBtn.onclick = () => this.clearSavedColors();
        }

        // Загружаем сохраненные цвета
        this.loadSavedColors();
    }

    /**
     * Выбор предустановленного цвета
     * @param {HTMLElement} option
     */
    selectPresetColor(option) {
        // Убираем выделение с других цветов
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Выделяем выбранный цвет
        option.classList.add('selected');

        // Применяем цвет к тегу
        const color = option.dataset.color;
        this.applyTagColor(this.editingTag, color);
    }

    /**
     * Применение своего цвета
     */
    applyCustomColor() {
        const colorInput = document.getElementById('customTagColor');
        if (!colorInput) return;

        const color = colorInput.value;
        this.applyTagColor(this.editingTag, color);
    }

    /**
     * Применение цвета к тегу
     * @param {string} tag
     * @param {string} color
     */
    applyTagColor(tag, color) {
        console.log('DomainUI.applyTagColor() - применяем цвет к тегу:', { tag, color });
        this.emit('updateTagColor', { tag, color });
        this.hideTagColorPalette();
    }

    /**
     * Установка текущего цвета тега
     * @param {string} tag
     */
    setCurrentTagColor(tag) {
        // Получаем текущий цвет тега из данных
        this.emit('getTagColor', tag);
    }

    /**
     * Получение цвета тега
     * @param {string} tag
     * @returns {string}
     */
    getTagColor(tag) {
        return this.tagColors && this.tagColors[tag] ? this.tagColors[tag] : null;
    }

    /**
     * Установка цветов тегов
     * @param {Object} colors
     */
    setTagColors(colors) {
        this.tagColors = colors;
    }

    /**
     * Сохранение пользовательского цвета
     */
    saveCustomColor() {
        const colorInput = document.getElementById('customTagColor');
        if (!colorInput) return;

        const color = colorInput.value;
        console.log('DomainUI.saveCustomColor() - сохраняем цвет:', color);
        
        this.emit('saveCustomColor', color);
        this.loadSavedColors();
        
        this.emit('notification', { 
            type: 'success', 
            message: 'Цвет сохранен в палитру' 
        });
    }

    /**
     * Загрузка сохраненных цветов
     */
    loadSavedColors() {
        this.emit('getSavedColors');
    }

    /**
     * Отображение сохраненных цветов
     * @param {Array} colors
     */
    renderSavedColors(colors) {
        const container = document.getElementById('savedColorsContainer');
        if (!container) return;

        if (!colors || colors.length === 0) {
            container.innerHTML = '<div class="empty-saved-colors">Сохраненные цвета не найдены</div>';
            return;
        }

        container.innerHTML = colors.map((color, index) => `
            <div class="saved-color-option" data-color="${color}" style="background: ${color};" title="Кликните для применения">
                <button class="remove-saved-color" onclick="event.stopPropagation(); domainUI.removeSavedColor(${index})" title="Удалить цвет">×</button>
            </div>
        `).join('');

        // Добавляем обработчики для сохраненных цветов
        const savedColorOptions = container.querySelectorAll('.saved-color-option');
        savedColorOptions.forEach(option => {
            option.onclick = () => this.selectSavedColor(option);
        });
    }

    /**
     * Выбор сохраненного цвета
     * @param {HTMLElement} option
     */
    selectSavedColor(option) {
        // Убираем выделение с других цветов
        document.querySelectorAll('.color-option, .saved-color-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Выделяем выбранный цвет
        option.classList.add('selected');

        // Применяем цвет к тегу
        const color = option.dataset.color;
        this.applyTagColor(this.editingTag, color);
    }

    /**
     * Удаление сохраненного цвета
     * @param {number} index
     */
    removeSavedColor(index) {
        console.log('DomainUI.removeSavedColor() - удаляем сохраненный цвет:', index);
        this.emit('removeSavedColor', index);
        this.loadSavedColors();
    }

    /**
     * Очистка всех сохраненных цветов
     */
    clearSavedColors() {
        if (confirm('Вы уверены, что хотите удалить все сохраненные цвета?')) {
            console.log('DomainUI.clearSavedColors() - очищаем все сохраненные цвета');
            this.emit('clearSavedColors');
            this.loadSavedColors();
            
            this.emit('notification', { 
                type: 'info', 
                message: 'Все сохраненные цвета удалены' 
            });
        }
    }

    /**
     * Показ модального окна подтверждения удаления тега
     * @param {Object} data - { tag, type, domainId?, domainName? }
     */
    showConfirmDeleteTagModal(data) {
        const modal = document.getElementById('confirmDeleteTagModal');
        const title = document.getElementById('confirmDeleteTagTitle');
        const message = document.getElementById('confirmDeleteTagMessage');
        const details = document.getElementById('confirmDeleteTagDetails');
        const confirmBtn = document.getElementById('confirmDeleteTagBtn');

        if (!modal || !title || !message || !details || !confirmBtn) {
            console.error('Элементы модального окна подтверждения не найдены');
            return;
        }

        // Сохраняем данные для обработки
        this.pendingDeleteData = data;

        // Настраиваем заголовок и сообщение
        if (data.type === 'fromAllDomains') {
            title.textContent = 'Удалить тег из всех доменов';
            message.textContent = `Вы уверены, что хотите удалить тег "${data.tag}" из всех доменов?`;
        } else if (data.type === 'fromDomain') {
            title.textContent = 'Удалить тег из домена';
            message.textContent = `Вы уверены, что хотите удалить тег "${data.tag}" из домена "${data.domainName}"?`;
        }

        // Настраиваем детали
        details.innerHTML = `
            <div class="tag-preview">${this.escapeHtml(data.tag)}</div>
            ${data.type === 'fromAllDomains' ? this.generateAllDomainsDetails(data.tag) : ''}
        `;

        // Настраиваем кнопку подтверждения
        confirmBtn.textContent = '🗑️ УДАЛИТЬ ТЕГ';
        confirmBtn.onclick = () => this.confirmDeleteTag();

        // Показываем модальное окно
        modal.classList.add('active');
    }

    /**
     * Генерация деталей для удаления из всех доменов
     * @param {string} tag
     * @returns {string}
     */
    generateAllDomainsDetails(tag) {
        // Этот метод будет вызван из DomainManager с данными
        this.emit('getDomainsWithTag', tag);
        return '<div class="domain-list">Загрузка доменов с этим тегом...</div>';
    }

    /**
     * Установка деталей доменов с тегом
     * @param {Array} domains
     * @param {string} tag
     */
    setDomainsWithTagDetails(domains, tag) {
        const details = document.getElementById('confirmDeleteTagDetails');
        if (!details) return;

        const domainsHtml = domains.map(domain => `
            <div class="domain-item">
                <div>
                    <div class="domain-name">${this.escapeHtml(domain.domain)}</div>
                    ${domain.description ? `<div class="domain-description">${this.escapeHtml(domain.description)}</div>` : ''}
                </div>
            </div>
        `).join('');

        details.innerHTML = `
            <div class="tag-preview">${this.escapeHtml(tag)}</div>
            <div class="domain-list">
                <strong>Будет удален из ${domains.length} доменов:</strong>
                ${domainsHtml}
            </div>
        `;
    }

    /**
     * Скрытие модального окна подтверждения
     */
    hideConfirmDeleteTagModal() {
        const modal = document.getElementById('confirmDeleteTagModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.pendingDeleteData = null;
    }

    /**
     * Подтверждение удаления тега
     */
    confirmDeleteTag() {
        if (!this.pendingDeleteData) return;

        const data = this.pendingDeleteData;
        
        if (data.type === 'fromAllDomains') {
            this.emit('removeAvailableTag', data.tag);
        } else if (data.type === 'fromDomain') {
            this.emit('removeTagFromDomain', { domainId: data.domainId, tag: data.tag });
        }

        this.hideConfirmDeleteTagModal();
        
        // Обновляем модальное окно после удаления
        setTimeout(() => {
            this.refreshModalTags();
        }, 200);
    }

    /**
     * Обновление имени домена в модальном окне
     * @param {string} domainName
     */
    updateDomainNameInModal(domainName) {
        if (!this.pendingDeleteData) return;
        
        this.pendingDeleteData.domainName = domainName;
        
        const message = document.getElementById('confirmDeleteTagMessage');
        if (message) {
            message.textContent = `Вы уверены, что хотите удалить тег "${this.pendingDeleteData.tag}" из домена "${domainName}"?`;
        }
    }

    /**
     * Обновление тегов в модальном окне после удаления
     */
    refreshModalTags() {
        // Проверяем, открыто ли модальное окно редактирования домена
        const domainModal = document.getElementById('domainModal');
        if (domainModal && domainModal.classList.contains('active')) {
            console.log('DomainUI.refreshModalTags() - обновляем теги в модальном окне');
            // Принудительно обновляем список уникальных тегов
            this.emit('getAllTags');
            // Небольшая задержка, чтобы данные успели обновиться
            setTimeout(() => {
                this.renderModalTags();
            }, 100);
        }
    }

    /**
     * Настройка поиска доменов
     */
    setupDomainSearch() {
        const searchInput = document.getElementById('domainSearchInput');
        const clearBtn = document.getElementById('searchClearBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleDomainSearch(e));
            console.log('DomainUI.setupDomainSearch() - обработчик поиска настроен');
        } else {
            console.warn('DomainUI.setupDomainSearch() - поле поиска не найдено');
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearDomainSearch());
            console.log('DomainUI.setupDomainSearch() - обработчик сброса настроен');
        } else {
            console.warn('DomainUI.setupDomainSearch() - кнопка сброса не найдена');
        }
    }

    /**
     * Обработка поиска доменов
     * @param {Event} event
     */
    handleDomainSearch(event) {
        const searchTerm = event.target.value.trim().toLowerCase();
        const clearBtn = document.getElementById('searchClearBtn');
        
        console.log('DomainUI.handleDomainSearch() - поиск по:', searchTerm);
        
        // Показываем/скрываем кнопку сброса
        if (clearBtn) {
            if (searchTerm === '') {
                clearBtn.classList.remove('show');
            } else {
                clearBtn.classList.add('show');
            }
        }
        
        if (searchTerm === '') {
            // Если поиск пустой, показываем все домены
            this.emit('showAllDomains');
        } else {
            // Создаем варианты поиска с транслитерацией
            const searchVariants = this.createSearchVariants(searchTerm);
            console.log('DomainUI.handleDomainSearch() - варианты поиска:', searchVariants);
            
            // Фильтруем домены по поисковому запросу
            this.emit('searchDomains', searchVariants);
        }
    }

    /**
     * Создание вариантов поиска с транслитерацией
     * @param {string} searchTerm
     * @returns {Array}
     */
    createSearchVariants(searchTerm) {
        const variants = [searchTerm];
        
        // Добавляем транслитерацию русских букв в английские
        const transliterated = this.transliterateRuToEn(searchTerm);
        if (transliterated !== searchTerm) {
            variants.push(transliterated);
        }
        
        // Добавляем транслитерацию английских букв в русские
        const transliteratedBack = this.transliterateEnToRu(searchTerm);
        if (transliteratedBack !== searchTerm) {
            variants.push(transliteratedBack);
        }
        
        // Добавляем конвертацию раскладки клавиатуры
        const keyboardLayout = this.convertKeyboardLayout(searchTerm);
        if (keyboardLayout !== searchTerm) {
            variants.push(keyboardLayout);
        }
        
        // Убираем дубликаты
        return [...new Set(variants)];
    }

    /**
     * Транслитерация русских букв в английские
     * @param {string} text
     * @returns {string}
     */
    transliterateRuToEn(text) {
        const ruToEn = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        
        return text.split('').map(char => ruToEn[char] || char).join('');
    }

    /**
     * Транслитерация английских букв в русские
     * @param {string} text
     * @returns {string}
     */
    transliterateEnToRu(text) {
        const enToRu = {
            'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е', 'yo': 'ё',
            'zh': 'ж', 'z': 'з', 'i': 'и', 'y': 'й', 'k': 'к', 'l': 'л', 'm': 'м',
            'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у',
            'f': 'ф', 'h': 'х', 'ts': 'ц', 'ch': 'ч', 'sh': 'ш', 'sch': 'щ',
            'yu': 'ю', 'ya': 'я'
        };
        
        let result = text;
        
        // Сначала заменяем двухбуквенные сочетания
        Object.keys(enToRu).forEach(key => {
            if (key.length === 2) {
                result = result.replace(new RegExp(key, 'g'), enToRu[key]);
            }
        });
        
        // Затем однобуквенные
        Object.keys(enToRu).forEach(key => {
            if (key.length === 1) {
                result = result.replace(new RegExp(key, 'g'), enToRu[key]);
            }
        });
        
        return result;
    }

    /**
     * Конвертация раскладки клавиатуры (русская ↔ английская)
     * @param {string} text
     * @returns {string}
     */
    convertKeyboardLayout(text) {
        const ruToEnLayout = {
            'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p',
            'х': '[', 'ъ': ']', 'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k',
            'д': 'l', 'ж': ';', 'э': "'", 'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm',
            'б': ',', 'ю': '.', 'ё': '`', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
            '8': '8', '9': '9', '0': '0', '-': '-', '=': '=', '№': '#'
        };
        
        const enToRuLayout = {
            'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з',
            '[': 'х', ']': 'ъ', 'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л',
            'l': 'д', ';': 'ж', "'": 'э', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь',
            ',': 'б', '.': 'ю', '`': 'ё', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
            '8': '8', '9': '9', '0': '0', '-': '-', '=': '=', '#': '№'
        };
        
        let result = '';
        
        for (let char of text) {
            const lowerChar = char.toLowerCase();
            
            // Проверяем, русская ли это буква
            if (ruToEnLayout[lowerChar]) {
                result += ruToEnLayout[lowerChar];
            }
            // Проверяем, английская ли это буква
            else if (enToRuLayout[lowerChar]) {
                result += enToRuLayout[lowerChar];
            }
            // Если не нашли соответствие, оставляем как есть
            else {
                result += char;
            }
        }
        
        return result;
    }

    /**
     * Очистка поиска доменов
     */
    clearDomainSearch() {
        const searchInput = document.getElementById('domainSearchInput');
        const clearBtn = document.getElementById('searchClearBtn');
        
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        
        if (clearBtn) {
            clearBtn.classList.remove('show');
        }
        
        // Показываем все домены
        this.emit('showAllDomains');
        
        console.log('DomainUI.clearDomainSearch() - поиск очищен');
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        this.eventHandlers = {};
        this.currentTags = [];
        this.editingDomainId = null;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainUI;
}
