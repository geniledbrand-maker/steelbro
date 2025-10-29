/**
 * TabManager - Управление вкладками и загрузкой данных
 * Файл: /classes/Shared/TabManager.js
 */

class TabManager {
    constructor() {
        this.tabs = {
            overview: { loaded: false, handler: null },
            organic: { loaded: false, handler: null },
            links: { loaded: false, handler: null },
            advertising: { loaded: false, handler: null },
            keywords: { loaded: false, handler: null },
            pages: { loaded: false, handler: null },
            ads: { loaded: false, handler: null },
            competitors: { loaded: false, handler: null }
        };
        this.activeTab = 'overview';
        this.currentDomain = null;
        this.currentRegion = 'ekb';
        this.eventHandlers = {};
    }

    /**
     * Инициализация менеджера вкладок
     */
    init() {
        this.setupTabButtons();
    }

    /**
     * Настройка обработчиков для кнопок вкладок
     */
    setupTabButtons() {
        const tabButtons = document.querySelectorAll('.tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = button.getAttribute('data-tab');
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
    }

    /**
     * Регистрация обработчика для вкладки
     * @param {string} tabName
     * @param {Function} handler
     */
    registerTabHandler(tabName, handler) {
        if (this.tabs[tabName]) {
            this.tabs[tabName].handler = handler;
        } else {
            console.warn(`Вкладка ${tabName} не существует`);
        }
    }

    /**
     * Переключение на другую вкладку
     * @param {string} tabName
     */
    switchTab(tabName) {
        if (!this.tabs[tabName]) {
            console.warn(`Вкладка ${tabName} не существует`);
            return;
        }

        // Скрываем все вкладки
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Убираем активный класс со всех кнопок
        document.querySelectorAll('.tab').forEach(button => {
            button.classList.remove('active');
        });

        // Активируем нужную вкладку
        const contentSection = document.getElementById(tabName);
        if (contentSection) {
            contentSection.classList.add('active');
        }

        // Активируем кнопку
        const activeButton = document.querySelector(`.tab[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        this.activeTab = tabName;

        // Загрузка данных при первом открытии
        if (!this.tabs[tabName].loaded && this.currentDomain && tabName !== 'overview') {
            this.loadTabData(tabName);
        }

        this.emit('tabSwitched', { tabName, loaded: this.tabs[tabName].loaded });
    }

    /**
     * Загрузка данных для вкладки
     * @param {string} tabName
     */
    async loadTabData(tabName) {
        if (!this.currentDomain) {
            console.warn('Домен не выбран');
            return;
        }

        const tab = this.tabs[tabName];
        if (!tab.handler) {
            console.warn(`Обработчик для вкладки ${tabName} не зарегистрирован`);
            return;
        }

        const contentDiv = document.getElementById(tabName + 'Content');
        if (contentDiv) {
            contentDiv.innerHTML = '<div class="loading">⏳ Загрузка данных...</div>';
        }

        this.emit('tabLoadStart', tabName);

        try {
            await tab.handler(this.currentDomain, this.currentRegion);
            tab.loaded = true;
            this.emit('tabLoadSuccess', tabName);
        } catch (error) {
            console.error(`Ошибка загрузки данных для ${tabName}:`, error);
            if (contentDiv) {
                contentDiv.innerHTML = `<div class="error">Ошибка загрузки: ${error.message}</div>`;
            }
            this.emit('tabLoadError', { tabName, error });
        }
    }

    /**
     * Загрузка всех вкладок
     */
    async loadAllTabs() {
        const tabsToLoad = Object.keys(this.tabs).filter(
            tabName => !this.tabs[tabName].loaded && tabName !== 'overview'
        );

        for (const tabName of tabsToLoad) {
            await this.loadTabData(tabName);
        }

        this.emit('allTabsLoaded');
    }

    /**
     * Установка текущего домена
     * @param {string} domain
     * @param {string} region
     */
    setCurrentDomain(domain, region = 'ekb') {
        this.currentDomain = domain;
        this.currentRegion = region;
        this.resetLoadedState();
    }

    /**
     * Сброс состояния загрузки всех вкладок
     */
    resetLoadedState() {
        Object.keys(this.tabs).forEach(tabName => {
            this.tabs[tabName].loaded = false;
        });
    }

    /**
     * Получение текущей активной вкладки
     * @returns {string}
     */
    getActiveTab() {
        return this.activeTab;
    }

    /**
     * Проверка загружена ли вкладка
     * @param {string} tabName
     * @returns {boolean}
     */
    isTabLoaded(tabName) {
        return this.tabs[tabName] ? this.tabs[tabName].loaded : false;
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
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabManager;
}