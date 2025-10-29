/**
 * Main Application - Инициализация и координация всех модулей
 * Файл: /assets/js/app.js
 */

class KeysSpyApp {
    constructor() {
        this.api = null;
        this.domainStorage = null;
        this.domainManager = null;
        this.domainUI = null;
        this.tabManager = null;
        this.exportManager = null;
        this.notificationManager = null;

        // Состояние приложения
        this.currentDomain = null;
        this.currentRegion = 'ekb';
        this.isInitialized = false;
        
        // Пагинация для модального окна ключевых слов
        this.keywordsPagination = {
            currentPage: 1,
            itemsPerPage: 50,
            totalItems: 0,
            totalPages: 0
        };
    }

    /**
     * Инициализация приложения
     */
    async init() {
        if (this.isInitialized) {
            console.warn('Приложение уже инициализировано');
            return;
        }

        try {
            // Инициализация модулей
            this.initializeModules();

            // Настройка обработчиков событий
            this.setupEventHandlers();

            // Устанавливаем начальное состояние API
            this.setInitialAPIStatus();

            // Загрузка сохранённых доменов
            this.domainManager.init();

            // Настройка формы поиска
            this.setupSearchForm();

            this.isInitialized = true;
            console.log('✅ Приложение инициализировано');
            
            // Делаем app доступным глобально для кнопок
            window.app = this;
        } catch (error) {
            console.error('Ошибка инициализации приложения:', error);
            this.showNotification('error', 'Ошибка инициализации приложения');
        }
    }

    /**
     * Инициализация всех модулей
     */
    initializeModules() {
        // API
        this.api = new KeysAPI('keys_proxy.php');

        // Domain Management
        this.domainStorage = new DomainStorage();
        this.domainUI = new DomainUI();
        this.domainManager = new DomainManager(this.domainStorage, this.domainUI);

        // Инициализируем UI, чтобы глобальные обработчики были доступны в HTML
        // Это необходимо для кликов по сохранённым доменам (window.domainUI.selectDomain)
        if (typeof this.domainUI.init === 'function') {
            this.domainUI.init();
        }

        // Tab Management
        this.tabManager = new TabManager();
        this.tabManager.init();
        
        // Регистрируем обработчик для вкладки обзора
        this.tabManager.registerTabHandler('overview', (domain, region) => {
            // Вкладка обзора уже загружается в handleSearch
            return Promise.resolve();
        });
        
        // Инициализируем вкладку обзора с пустым состоянием
        const overviewContent = document.getElementById('overviewContent');
        if (overviewContent) {
            overviewContent.innerHTML = '<div class="empty-state"><p>Выберите домен и нажмите "Анализировать" для загрузки данных</p></div>';
        }

        // Export
        this.exportManager = new ExportManager();

        // Notifications
        this.notificationManager = new NotificationManager();
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventHandlers() {
        // События от DomainManager
        this.domainManager.on('domainSelected', (domain) => {
            this.handleDomainSelection(domain);
        });

        this.domainManager.on('notification', (data) => {
            this.showNotification(data.type, data.message);
        });

        // События от TabManager
        this.tabManager.on('tabLoadStart', (tabName) => {
            console.log(`Загрузка вкладки: ${tabName}`);
        });

        this.tabManager.on('tabLoadSuccess', (tabName) => {
            console.log(`Вкладка загружена: ${tabName}`);
        });

        this.tabManager.on('tabLoadError', (data) => {
            this.showNotification('error', `Ошибка загрузки ${data.tabName}`);
        });

        this.tabManager.on('allTabsLoaded', () => {
            this.showNotification('success', 'Все данные загружены');
        });

        // Регистрация обработчиков для вкладок
        this.registerTabHandlers();
    }

    /**
     * Регистрация обработчиков для каждой вкладки
     */
    registerTabHandlers() {
        // Overview
        this.tabManager.registerTabHandler('overview', async (domain, region) => {
            const data = await this.api.getDomainDashboard(domain, region);
            const overviewTab = new OverviewTab();
            overviewTab.render(data);
        });

        // Keywords
        this.tabManager.registerTabHandler('keywords', async (domain, region) => {
            const response = await this.api.getOrganicKeywords(domain, region);
            console.log('Данные ключевых слов:', response);
            // API возвращает данные в response.data
            this.exportManager.setData('keywords', response.data);
            const keywordsTab = new KeywordsTab();
            keywordsTab.render(response.data);
        });

        // Pages
        this.tabManager.registerTabHandler('pages', async (domain, region) => {
            const response = await this.api.getSitePages(domain, region);
            console.log('Данные страниц:', response);
            // API возвращает данные в response.data
            this.exportManager.setData('pages', response.data);
            const pagesTab = new PagesTab();
            pagesTab.render(response.data);
        });

        // Ads
        this.tabManager.registerTabHandler('ads', async (domain, region) => {
            const response = await this.api.getContextAds(domain, region);
            console.log('Данные рекламы:', response);
            // API возвращает данные в response.data
            this.exportManager.setData('ads', response.data);
            const adsTab = new AdsTab(response.data);
            adsTab.render();
        });

        // Organic
        this.tabManager.registerTabHandler('organic', async (domain, region) => {
            const data = await this.api.getDomainDashboard(domain, region);
            this.renderOrganicMetrics(data);
        });

        // Links
        this.tabManager.registerTabHandler('links', async (domain, region) => {
            const data = await this.api.getDomainDashboard(domain, region);
            this.renderLinksMetrics(data);
        });

        // Advertising
        this.tabManager.registerTabHandler('advertising', async (domain, region) => {
            const data = await this.api.getDomainDashboard(domain, region);
            this.renderAdvertisingMetrics(data);
        });

        // Competitors
        this.tabManager.registerTabHandler('competitors', async (domain, region) => {
            const response = await this.api.getCompetitors(domain, region);
            console.log('Данные конкурентов:', response);
            // API возвращает данные в response.data, а не response
            this.exportManager.setData('competitors', response.data);
            const competitorsTab = new CompetitorsTab();
            competitorsTab.render(response.data);
        });
    }

    /**
     * Установка начального состояния API
     */
    setInitialAPIStatus() {
        const indicator = document.getElementById('apiIndicator');
        const statusText = document.getElementById('apiStatusText');

        if (indicator) indicator.className = 'api-indicator unknown';
        if (statusText) statusText.textContent = 'API статус';
    }

    /**
     * Проверка доступности API
     */
    async checkAPI() {
        const indicator = document.getElementById('apiIndicator');
        const statusText = document.getElementById('apiStatusText');

        if (indicator) indicator.className = 'api-indicator checking';
        if (statusText) statusText.textContent = 'Проверка...';

        try {
            const isAvailable = await this.api.checkAPIStatus();

            if (isAvailable) {
                if (indicator) indicator.className = 'api-indicator success';
                if (statusText) statusText.textContent = 'API работает';
            } else {
                throw new Error('API недоступен');
            }
        } catch (error) {
            if (indicator) indicator.className = 'api-indicator error';
            if (statusText) statusText.textContent = 'API не работает';
            console.error('Ошибка проверки API:', error);
        }
    }

    /**
     * Настройка формы поиска
     */
    setupSearchForm() {
        const form = document.getElementById('searchForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSearch();
        });

        // Кнопка проверки API
        const checkBtn = document.querySelector('.api-check-btn');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkAPI());
        }

        // Кнопка анализа по всем городам
        const analyzeAllBtn = document.getElementById('analyzeAllCitiesBtn');
        if (analyzeAllBtn) {
            analyzeAllBtn.addEventListener('click', () => this.handleAnalyzeAllCities());
        }
    }

    /**
     * Обработка анализа по всем городам
     */
    async handleAnalyzeAllCities() {
        const domainInput = document.getElementById('domainInput');
        const analyzeAllBtn = document.getElementById('analyzeAllCitiesBtn');

        if (!domainInput) return;

        const domain = domainInput.value.trim().replace(/^https?:\/\//, '');

        if (!domain) {
            this.showNotification('error', 'Введите домен');
            return;
        }

        this.currentDomain = domain;

        // Блокируем кнопку
        if (analyzeAllBtn) {
            analyzeAllBtn.disabled = true;
            analyzeAllBtn.textContent = '⏳ Анализируем...';
        }

        // Список всех городов
        const cities = [
            { code: 'ekb', name: 'Екатеринбург' },
            { code: 'msk', name: 'Москва' },
            { code: 'nsk', name: 'Новосибирск' },
            { code: 'kzn', name: 'Казань' },
            { code: 'tyumen', name: 'Тюмень' },
            { code: 'perm', name: 'Пермь' },
            { code: 'chelyabinsk', name: 'Челябинск' }
        ];

        const results = [];
        let completed = 0;

        try {
            this.showNotification('info', `Начинаем анализ по ${cities.length} городам...`);

            // Анализируем каждый город
            for (const city of cities) {
                try {
                    console.log(`Анализируем ${domain} в ${city.name}...`);
                    const data = await this.api.getDomainDashboard(domain, city.code);
                    results.push({
                        city: city.name,
                        code: city.code,
                        data: data,
                        success: true
                    });
                } catch (error) {
                    console.error(`Ошибка анализа в ${city.name}:`, error);
                    results.push({
                        city: city.name,
                        code: city.code,
                        data: null,
                        success: false,
                        error: error.message
                    });
                }
                
                completed++;
                const progress = Math.round((completed / cities.length) * 100);
                
                if (analyzeAllBtn) {
                    analyzeAllBtn.textContent = `⏳ ${progress}%`;
                }
            }

            // Показываем результаты
            this.showMultiCityResults(results);
            this.showNotification('success', `Анализ завершен! Обработано ${completed} городов`);

        } catch (error) {
            console.error('Ошибка анализа по всем городам:', error);
            this.showNotification('error', 'Ошибка анализа по всем городам: ' + error.message);
        } finally {
            if (analyzeAllBtn) {
                analyzeAllBtn.disabled = false;
                analyzeAllBtn.textContent = '🌍 Все города';
            }
        }
    }

    /**
     * Показ результатов анализа по всем городам
     * @param {Array} results
     */
    showMultiCityResults(results) {
        const overviewContent = document.getElementById('overviewContent');
        if (!overviewContent) return;

        const successfulResults = results.filter(r => r.success);
        const failedResults = results.filter(r => !r.success);

        let html = `
            <div class="multi-city-results">
                <div class="results-header">
                    <h2>🌍 Результаты анализа по всем городам</h2>
                    <div class="results-summary">
                        <span class="success-count">✅ Успешно: ${successfulResults.length}</span>
                        <span class="failed-count">❌ Ошибки: ${failedResults.length}</span>
                    </div>
                </div>
        `;

        if (successfulResults.length > 0) {
            html += `
                <div class="cities-comparison">
                    <h3>📊 Сравнение по городам</h3>
                    <div class="comparison-table-container">
                        <table class="comparison-table">
                            <thead>
                                <tr>
                                    <th>Город</th>
                                    <th>Топ-10</th>
                                    <th>Топ-50</th>
                                    <th>Видимость</th>
                                    <th>Объявления</th>
                                    <th>Бюджет (₽)</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            successfulResults.forEach(result => {
                const data = result.data;
                html += `
                    <tr>
                        <td class="city-name">${result.city}</td>
                        <td class="metric">${data.it10 || 0}</td>
                        <td class="metric">${data.it50 || 0}</td>
                        <td class="metric">${data.vis || 0}</td>
                        <td class="metric">${data.adscnt || 0}</td>
                        <td class="metric">${data.adcost || 0}</td>
                    </tr>
                `;
            });

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        if (failedResults.length > 0) {
            html += `
                <div class="failed-results">
                    <h3>❌ Ошибки анализа</h3>
                    <ul class="error-list">
            `;
            
            failedResults.forEach(result => {
                html += `<li><strong>${result.city}:</strong> ${result.error}</li>`;
            });
            
            html += `
                    </ul>
                </div>
            `;
        }

        html += `
                <div class="results-actions">
                    <button class="export-results-btn" onclick="app.exportMultiCityResults()">📊 Экспорт результатов</button>
                    <button class="analyze-single-btn" onclick="app.analyzeSingleCity()">🔍 Анализ одного города</button>
                </div>
            </div>
        `;

        overviewContent.innerHTML = html;
    }

    /**
     * Экспорт результатов анализа по всем городам
     */
    exportMultiCityResults() {
        // Здесь можно добавить экспорт в CSV или JSON
        this.showNotification('info', 'Функция экспорта будет добавлена');
    }

    /**
     * Переключение на анализ одного города
     */
    analyzeSingleCity() {
        // Переключаемся на обычный режим анализа
        const regionSelect = document.getElementById('regionSelect');
        if (regionSelect) {
            regionSelect.value = 'ekb'; // По умолчанию Екатеринбург
        }
        this.showNotification('info', 'Переключено на анализ одного города');
    }

    /**
     * Обработка поиска/анализа домена
     */
    async handleSearch() {
        const domainInput = document.getElementById('domainInput');
        const regionSelect = document.getElementById('regionSelect');
        const analyzeBtn = document.getElementById('analyzeBtn');

        if (!domainInput || !regionSelect) return;

        const domain = domainInput.value.trim().replace(/^https?:\/\//, '');
        const region = regionSelect.value;

        if (!domain) {
            this.showNotification('error', 'Введите домен');
            return;
        }

        this.currentDomain = domain;
        this.currentRegion = region;

        // Обновляем состояние в TabManager
        this.tabManager.setCurrentDomain(domain, region);

        // Блокируем кнопку
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Анализируем...';
        }

        try {
            // Загружаем обзор
            const data = await this.api.getDomainDashboard(domain, region);
            
            // Создаем или обновляем вкладку обзора
            if (!this.tabManager.tabs.overview.handler) {
                if (typeof OverviewTab !== 'undefined') {
                    this.tabManager.tabs.overview.handler = new OverviewTab();
                } else {
                    console.error('OverviewTab не загружен');
                    throw new Error('OverviewTab не загружен');
                }
            }
            
            // Обновляем данные и рендерим
            try {
                if (this.tabManager.tabs.overview.handler) {
                    // Прямо устанавливаем данные и вызываем render
                    this.tabManager.tabs.overview.handler.data = data;
                    this.tabManager.tabs.overview.handler.isLoaded = true;
                    this.tabManager.tabs.overview.handler.render(data);
                } else {
                    throw new Error('OverviewTab handler не инициализирован');
                }
            } catch (renderError) {
                console.error('Ошибка рендеринга OverviewTab:', renderError);
                // Fallback: создаем простой HTML
                const overviewContent = document.getElementById('overviewContent');
                if (overviewContent) {
                    overviewContent.innerHTML = `
                        <div class="overview-content">
                            <div class="stats-grid">
                                <div class="stat-card stat-card-success">
                                    <div class="stat-icon">🏆</div>
                                    <div class="stat-content">
                                        <h3 class="stat-value">${data.it10 || 0}</h3>
                                        <p class="stat-title">Позиций в топ-10</p>
                                    </div>
                                </div>
                                <div class="stat-card stat-card-info">
                                    <div class="stat-icon">📊</div>
                                    <div class="stat-content">
                                        <h3 class="stat-value">${data.it50 || 0}</h3>
                                        <p class="stat-title">Позиций в топ-50</p>
                                    </div>
                                </div>
                                <div class="stat-card stat-card-primary">
                                    <div class="stat-icon">👁️</div>
                                    <div class="stat-content">
                                        <h3 class="stat-value">${data.vis || 0}</h3>
                                        <p class="stat-title">Видимость</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
            this.tabManager.tabs.overview.loaded = true;
            
            this.showNotification('success', 'Данные загружены');
        } catch (error) {
            console.error('Ошибка анализа:', error);
            this.showNotification('error', 'Ошибка загрузки данных: ' + error.message);
        } finally {
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = 'Анализировать';
            }
        }
    }

    /**
     * Обработка выбора домена из сохранённых
     * @param {Object} domain
     */
    handleDomainSelection(domain) {
        const domainInput = document.getElementById('domainInput');
        if (domainInput) {
            domainInput.value = domain.domain;
        }

        this.currentDomain = domain.domain;
        
        // Показываем уведомление о том, что нужно нажать "Анализировать"
        this.showNotification('info', 'Домен выбран. Нажмите "Анализировать" для запуска анализа.');
    }

    /**
     * Показ уведомления
     * @param {string} type - 'success', 'error', 'info'
     * @param {string} message
     */
    showNotification(type, message) {
        if (this.notificationManager) {
            this.notificationManager.show(type, message);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Загрузка всех данных для текущего домена
     */
    async loadAllData() {
        if (!this.currentDomain) {
            this.showNotification('error', 'Домен не выбран');
            return;
        }

        try {
            await this.tabManager.loadAllTabs();
        } catch (error) {
            console.error('Ошибка загрузки всех данных:', error);
            this.showNotification('error', 'Ошибка загрузки данных');
        }
    }

    /**
     * Рендеринг метрик органического поиска
     * @param {Object} data
     */
    renderOrganicMetrics(data) {
        const contentDiv = document.getElementById('organicContent');
        if (!contentDiv) return;

        const html = `
            <h2>🌱 Органический поиск</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${data.vis || 0}</h3>
                    <p>Трафик с поиска</p>
                </div>
                <div class="stat-card">
                    <h3>${data.it50 || 0}</h3>
                    <p>Страниц в выдаче</p>
                </div>
                <div class="stat-card">
                    <h3>${data.vis ? Math.round(data.vis / (data.it50 || 1)) : 0}</h3>
                    <p>Трафик на страницу</p>
                </div>
                <div class="stat-card">
                    <h3>${data.keys ? data.keys.length : 0}</h3>
                    <p>Запросов на страницу</p>
                </div>
                <div class="stat-card">
                    <h3>${data.it10 ? Math.round((data.it10 / (data.it50 || 1)) * 100) : 0}%</h3>
                    <p>Результативность</p>
                </div>
            </div>

            <h3>📊 Позиции в поиске:</h3>
            <div class="stats-grid">
                <div class="stat-card clickable" onclick="app.showKeywordsModal('top1', ${data.it1 || 0})">
                    <h3>${data.it1 || 0}</h3>
                    <p>В топ 1</p>
                </div>
                <div class="stat-card clickable" onclick="app.showKeywordsModal('top3', ${data.it3 || 0})">
                    <h3>${data.it3 || 0}</h3>
                    <p>В топ 3</p>
                </div>
                <div class="stat-card clickable" onclick="app.showKeywordsModal('top5', ${data.it5 || 0})">
                    <h3>${data.it5 || 0}</h3>
                    <p>В топ 5</p>
                </div>
                <div class="stat-card clickable" onclick="app.showKeywordsModal('top10', ${data.it10 || 0})">
                    <h3>${data.it10 || 0}</h3>
                    <p>В топ 10</p>
                </div>
                <div class="stat-card clickable" onclick="app.showKeywordsModal('top50', ${data.it50 || 0})">
                    <h3>${data.it50 || 0}</h3>
                    <p>В топ 50</p>
                </div>
                <div class="stat-card clickable" onclick="app.showKeywordsModal('all', ${data.total_queries || 0})">
                    <h3>${data.total_queries || 0}</h3>
                    <p>Все запросы</p>
                </div>
            </div>
        `;
        
        contentDiv.innerHTML = html;
    }

    /**
     * Рендеринг метрик ссылок
     * @param {Object} data
     */
    renderLinksMetrics(data) {
        const contentDiv = document.getElementById('linksContent');
        if (!contentDiv) return;

        const html = `
            <h2>🔗 Ссылки</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${data.incoming_links || 0}</h3>
                    <p>Входящие ссылки</p>
                </div>
                <div class="stat-card">
                    <h3>${data.outgoing_links || 0}</h3>
                    <p>Исходящие ссылки</p>
                </div>
                <div class="stat-card">
                    <h3>${data.dr || 0}</h3>
                    <p>DR (Domain Rating)</p>
                </div>
                <div class="stat-card">
                    <h3>${data.referring_domains || 0}</h3>
                    <p>Ссылающиеся домены</p>
                </div>
                <div class="stat-card">
                    <h3>${data.outgoing_domains || 0}</h3>
                    <p>Исходящие домены</p>
                </div>
                <div class="stat-card">
                    <h3>${data.links_by_ip || 0}</h3>
                    <p>Ссылки по IP</p>
                </div>
                <div class="stat-card">
                    <h3>${data.anchors || 0}</h3>
                    <p>Анкоров</p>
                </div>
            </div>

            <div class="info" style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                <h4>💡 Анализ ссылочной массы:</h4>
                <ul>
                    <li><strong>Качество ссылок:</strong> ${data.dr > 50 ? 'Высокое' : data.dr > 20 ? 'Среднее' : 'Низкое'}</li>
                    <li><strong>Разнообразие:</strong> ${data.referring_domains > 100 ? 'Хорошее' : 'Требует улучшения'}</li>
                    <li><strong>Анкорное разнообразие:</strong> ${data.anchors > 50 ? 'Отличное' : 'Нужно больше'}</li>
                </ul>
            </div>
        `;
        
        contentDiv.innerHTML = html;
    }

    /**
     * Рендеринг метрик рекламы
     * @param {Object} data
     */
    renderAdvertisingMetrics(data) {
        const contentDiv = document.getElementById('advertisingContent');
        if (!contentDiv) return;

        const html = `
            <h2>💰 Контекстная реклама</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${data.adcost || 0} ₽</h3>
                    <p>Прогноз бюджета</p>
                </div>
                <div class="stat-card">
                    <h3>${data.adscnt || 0}</h3>
                    <p>Объявлений в контексте</p>
                </div>
                <div class="stat-card">
                    <h3>${data.adkeyscnt || 0}</h3>
                    <p>Запросов в контексте</p>
                </div>
                <div class="stat-card">
                    <h3>${data.adscnt && data.adkeyscnt ? Math.round(data.adkeyscnt / data.adscnt) : 0}</h3>
                    <p>Запросов на объявление</p>
                </div>
                <div class="stat-card">
                    <h3>${data.rsya_ads || 0}</h3>
                    <p>Объявления РСЯ</p>
                </div>
            </div>

            ${data.ads && data.ads.length > 0 ? `
                <h3>📋 Примеры рекламных объявлений:</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr><th>Заголовок</th><th>Текст</th><th>Запросов</th></tr>
                        </thead>
                        <tbody>
                            ${data.ads.slice(0, 5).map(ad => `
                                <tr>
                                    <td class="keyword">${ad.header || '-'}</td>
                                    <td>${ad.txt || '-'}</td>
                                    <td class="metric">${ad.keyscnt || 0}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}

            <div class="info" style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px;">
                <h4>💡 Анализ рекламной активности:</h4>
                <ul>
                    <li><strong>Бюджет:</strong> ${data.adcost > 100000 ? 'Высокий' : data.adcost > 10000 ? 'Средний' : 'Низкий'}</li>
                    <li><strong>Активность:</strong> ${data.adscnt > 50 ? 'Очень активная' : data.adscnt > 10 ? 'Активная' : 'Слабая'}</li>
                    <li><strong>Охват:</strong> ${data.adkeyscnt > 1000 ? 'Широкий' : 'Узкий'}</li>
                </ul>
            </div>
        `;
        
        contentDiv.innerHTML = html;
    }

    /**
     * Обработка выбора домена из сохранённых
     * @param {Object} domain
     */
    handleDomainSelection(domain) {
        console.log('App.handleDomainSelection() - получен домен:', domain);
        
        // Подставляем домен в поисковую строку
        const domainInput = document.getElementById('domainInput');
        if (domainInput) {
            domainInput.value = domain.domain;
            console.log('App.handleDomainSelection() - домен подставлен в поле:', domain.domain);
        } else {
            console.error('App.handleDomainSelection() - поле domainInput не найдено');
        }

        // Автоматически запускаем анализ
        this.loadAllData(domain.domain, this.currentRegion);
        
        // Показываем уведомление
        this.showNotification('success', `Выбран домен: ${domain.domain}`);
    }

    /**
     * Показ модального окна с ключевыми словами по позициям
     * @param {string} positionType - 'top1', 'top3', 'top5', 'top10', 'top50'
     * @param {number} count - количество запросов
     */
    async showKeywordsModal(positionType, count) {
        if (count === 0) {
            this.showNotification('info', 'Нет запросов в данной позиции');
            return;
        }

        console.log(`Показываем модальное окно для ${positionType}, количество: ${count}`);

        // Сохраняем данные для повтора
        this.lastKeywordsRequest = { positionType, count };

        // Создаем модальное окно если его нет
        this.createKeywordsModal();

        // Показываем загрузку
        this.showKeywordsModalContent('loading', 'Загружаем данные...');

        try {
            // Получаем данные ключевых слов (максимум 500 по API)
            const response = await this.api.getOrganicKeywords(this.currentDomain, this.currentRegion, 500);
            console.log('Ответ API ключевых слов:', response);
            // API возвращает данные в response.data
            const keywords = response.data || [];

            // Фильтруем ключевые слова по позиции
            const filteredKeywords = this.filterKeywordsByPosition(keywords, positionType);

            // Показываем таблицу
            this.showKeywordsModalContent('table', {
                positionType,
                count,
                keywords: filteredKeywords
            });

        } catch (error) {
            console.error('Ошибка загрузки ключевых слов:', error);
            
            // Определяем тип ошибки и показываем соответствующее сообщение
            let errorMessage = 'Ошибка загрузки данных';
            
            if (error.message.includes('400')) {
                errorMessage = 'Некорректный запрос. Проверьте правильность домена.';
            } else if (error.message.includes('401')) {
                errorMessage = 'Ошибка авторизации. Проверьте API ключ.';
            } else if (error.message.includes('403')) {
                errorMessage = 'Доступ запрещен. Недостаточно прав для запроса.';
            } else if (error.message.includes('404')) {
                errorMessage = 'Данные не найдены для данного домена.';
            } else if (error.message.includes('429')) {
                errorMessage = 'Превышен лимит запросов. Попробуйте позже.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Ошибка сервера. Попробуйте позже.';
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
            } else {
                errorMessage = 'Ошибка загрузки данных: ' + error.message;
            }
            
            this.showKeywordsModalContent('error', errorMessage);
        }
    }

    /**
     * Фильтрация ключевых слов по позиции
     * @param {Array} keywords
     * @param {string} positionType
     * @returns {Array}
     */
    filterKeywordsByPosition(keywords, positionType) {
        console.log('Фильтруем ключевые слова:', { keywords, positionType });
        
        const positionMap = {
            'top1': 1,
            'top3': 3,
            'top5': 5,
            'top10': 10,
            'top50': 50,
            'all': 999999 // Для показа всех запросов
        };

        const maxPosition = positionMap[positionType];
        console.log('Максимальная позиция:', maxPosition);
        
        const filtered = keywords.filter(keyword => {
            console.log('Ключевое слово:', keyword);
            // API возвращает позицию в поле 'pos', а не 'position'
            const position = parseInt(keyword.pos) || 999;
            console.log('Позиция ключевого слова:', position);
            return position <= maxPosition;
        });
        
        console.log('Отфильтрованные ключевые слова:', filtered);
        return filtered;
    }

    /**
     * Создание модального окна для ключевых слов
     */
    createKeywordsModal() {
        // Проверяем, есть ли уже модальное окно
        let modal = document.getElementById('keywordsModal');
        if (modal) {
            modal.classList.add('active');
            return;
        }

        // Создаем модальное окно
        modal = document.createElement('div');
        modal.id = 'keywordsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content keywords-modal">
                <div class="modal-header">
                    <h3 id="keywordsModalTitle">Ключевые слова</h3>
                    <button class="close-modal" onclick="app.hideKeywordsModal()">×</button>
                </div>
                <div class="modal-body" id="keywordsModalBody">
                    <!-- Контент будет загружен динамически -->
                </div>
                <div class="modal-footer" id="keywordsModalFooter">
                    <button class="modal-btn secondary" onclick="app.hideKeywordsModal()">Закрыть</button>
                    <button class="modal-btn primary" id="exportKeywordsBtn" onclick="app.exportKeywordsToJSON()">Экспорт в JSON</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideKeywordsModal();
            }
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.hideKeywordsModal();
            }
        });

        modal.classList.add('active');
    }

    /**
     * Показ контента в модальном окне ключевых слов
     * @param {string} type - 'loading', 'table', 'error'
     * @param {*} data
     */
    showKeywordsModalContent(type, data) {
        const title = document.getElementById('keywordsModalTitle');
        const body = document.getElementById('keywordsModalBody');
        const footer = document.getElementById('keywordsModalFooter');

        if (!title || !body || !footer) return;

        switch (type) {
            case 'loading':
                title.textContent = 'Загрузка...';
                body.innerHTML = '<div class="loading-spinner">⏳ Загружаем данные...</div>';
                footer.style.display = 'none';
                break;

            case 'table':
                const positionNames = {
                    'top1': 'В топ 1',
                    'top3': 'В топ 3',
                    'top5': 'В топ 5',
                    'top10': 'В топ 10',
                    'top50': 'В топ 50',
                    'all': 'Все запросы'
                };

                title.textContent = `${positionNames[data.positionType]} (${data.count} запросов)`;
                
                // Сохраняем данные для экспорта
                this.currentKeywordsData = data.keywords;
                
                // Настраиваем пагинацию
                this.keywordsPagination.totalItems = data.keywords.length;
                this.keywordsPagination.totalPages = Math.ceil(data.keywords.length / this.keywordsPagination.itemsPerPage);
                this.keywordsPagination.currentPage = 1;

                if (data.keywords.length === 0) {
                    body.innerHTML = '<div class="empty-state">Нет данных для отображения</div>';
                } else {
                    // Получаем данные для текущей страницы
                    const paginatedData = this.getPaginatedKeywords(data.keywords);
                    body.innerHTML = `
                        <div class="table-container">
                            <table class="keywords-table">
                                <thead>
                                    <tr>
                                        <th>Запрос</th>
                                        <th class="sortable" data-sort="position">
                                            Позиция 
                                            <span class="sort-indicator">↕</span>
                                        </th>
                                        <th class="sortable" data-sort="frequency">
                                            Частота 
                                            <span class="sort-indicator">↕</span>
                                        </th>
                                        <th>URL</th>
                                    </tr>
                                </thead>
                                <tbody id="keywordsTableBody">
                                    ${paginatedData.map(keyword => {
                                        console.log('Ключевое слово для таблицы:', keyword);
                                        return `
                                        <tr>
                                            <td class="keyword-cell">${this.escapeHtml(keyword.word || keyword.keyword || keyword.query || '')}</td>
                                            <td class="position-cell">${keyword.pos || keyword.position || '-'}</td>
                                            <td class="frequency-cell">${keyword.ws || keyword.wsk || keyword.frequency || keyword.volume || keyword.cnt || keyword.count || '-'}</td>
                                            <td class="url-cell">
                                                <a href="${keyword.url || '#'}" target="_blank" class="url-link">
                                                    ${this.truncateUrl(keyword.url || '')}
                                                </a>
                                            </td>
                                        </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                        ${this.generatePaginationHTML()}
                    `;
                }
                footer.style.display = 'flex';
                
                // Добавляем обработчики сортировки
                this.addSortHandlers();
                
                // Добавляем обработчики пагинации
                this.addPaginationHandlers();
                break;

            case 'error':
                title.textContent = 'Ошибка';
                body.innerHTML = `<div class="error-message">❌ ${data}</div>`;
                footer.innerHTML = `
                    <button class="modal-btn secondary" onclick="app.hideKeywordsModal()">Закрыть</button>
                    <button class="modal-btn primary" onclick="app.retryKeywordsLoad()">Повторить</button>
                `;
                footer.style.display = 'flex';
                break;
        }
    }

    /**
     * Скрытие модального окна ключевых слов
     */
    hideKeywordsModal() {
        const modal = document.getElementById('keywordsModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentKeywordsData = null;
        this.lastKeywordsRequest = null; // Очищаем данные для повтора
    }

    /**
     * Повторная попытка загрузки ключевых слов
     */
    async retryKeywordsLoad() {
        if (!this.lastKeywordsRequest) {
            this.showNotification('error', 'Нет данных для повтора');
            return;
        }

        const { positionType, count } = this.lastKeywordsRequest;
        
        // Показываем загрузку
        this.showKeywordsModalContent('loading', 'Повторная загрузка...');

        try {
            // Получаем данные ключевых слов (максимум 500 по API)
            const response = await this.api.getOrganicKeywords(this.currentDomain, this.currentRegion, 500);
            console.log('Ответ API ключевых слов (retry):', response);
            // API возвращает данные в response.data
            const keywords = response.data || [];

            // Фильтруем ключевые слова по позиции
            const filteredKeywords = this.filterKeywordsByPosition(keywords, positionType);

            // Показываем таблицу
            this.showKeywordsModalContent('table', {
                positionType,
                count,
                keywords: filteredKeywords
            });

        } catch (error) {
            console.error('Ошибка повторной загрузки ключевых слов:', error);
            
            // Определяем тип ошибки и показываем соответствующее сообщение
            let errorMessage = 'Ошибка загрузки данных';
            
            if (error.message.includes('400')) {
                errorMessage = 'Некорректный запрос. Проверьте правильность домена.';
            } else if (error.message.includes('401')) {
                errorMessage = 'Ошибка авторизации. Проверьте API ключ.';
            } else if (error.message.includes('403')) {
                errorMessage = 'Доступ запрещен. Недостаточно прав для запроса.';
            } else if (error.message.includes('404')) {
                errorMessage = 'Данные не найдены для данного домена.';
            } else if (error.message.includes('429')) {
                errorMessage = 'Превышен лимит запросов. Попробуйте позже.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Ошибка сервера. Попробуйте позже.';
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
            } else {
                errorMessage = 'Ошибка загрузки данных: ' + error.message;
            }
            
            this.showKeywordsModalContent('error', errorMessage);
        }
    }

    /**
     * Экспорт ключевых слов в JSON
     */
    exportKeywordsToJSON() {
        if (!this.currentKeywordsData || this.currentKeywordsData.length === 0) {
            this.showNotification('error', 'Нет данных для экспорта');
            return;
        }

        const exportData = {
            metadata: {
                domain: this.currentDomain,
                region: this.currentRegion,
                exportDate: new Date().toISOString(),
                totalKeywords: this.currentKeywordsData.length
            },
            keywords: this.currentKeywordsData
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `${this.currentDomain}_keywords_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);

        this.showNotification('success', `Экспортировано ${this.currentKeywordsData.length} ключевых слов`);
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
     * Обрезка URL для отображения
     * @param {string} url
     * @returns {string}
     */
    truncateUrl(url) {
        if (!url) return '';
        if (url.length <= 50) return url;
        return url.substring(0, 47) + '...';
    }

    /**
     * Экспорт данных
     * @param {string} dataType
     */
    exportData(dataType) {
        const success = this.exportManager.exportToCSV(dataType, `${this.currentDomain}_${dataType}.csv`);

        if (success) {
            this.showNotification('success', 'Данные экспортированы');
        } else {
            this.showNotification('error', 'Сначала загрузите данные');
        }
    }

    /**
     * Добавление обработчиков сортировки
     */
    addSortHandlers() {
        const sortableHeaders = document.querySelectorAll('#keywordsModal th.sortable');
        
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortField = header.dataset.sort;
                this.sortKeywordsTable(sortField);
            });
        });
    }

    /**
     * Сортировка таблицы ключевых слов
     * @param {string} field - поле для сортировки
     */
    sortKeywordsTable(field) {
        const tbody = document.getElementById('keywordsTableBody');
        if (!tbody) return;

        const rows = Array.from(tbody.querySelectorAll('tr'));
        const currentSort = this.currentSort || {};
        
        // Определяем направление сортировки
        let direction = 'asc';
        if (currentSort.field === field && currentSort.direction === 'asc') {
            direction = 'desc';
        }
        
        // Сортируем строки
        rows.sort((a, b) => {
            const aValue = this.getCellValue(a, field);
            const bValue = this.getCellValue(b, field);
            
            let comparison = 0;
            
            if (field === 'position' || field === 'frequency') {
                // Числовая сортировка
                const aNum = parseFloat(aValue) || 0;
                const bNum = parseFloat(bValue) || 0;
                comparison = aNum - bNum;
            } else {
                // Текстовая сортировка
                comparison = aValue.localeCompare(bValue);
            }
            
            return direction === 'desc' ? -comparison : comparison;
        });
        
        // Обновляем таблицу
        rows.forEach(row => tbody.appendChild(row));
        
        // Обновляем индикаторы сортировки
        this.updateSortIndicators(field, direction);
        
        // Сохраняем текущую сортировку
        this.currentSort = { field, direction };
    }

    /**
     * Получение значения ячейки для сортировки
     * @param {HTMLElement} row - строка таблицы
     * @param {string} field - поле
     * @returns {string|number}
     */
    getCellValue(row, field) {
        const cells = row.querySelectorAll('td');
        
        switch (field) {
            case 'position':
                return cells[1].textContent.trim();
            case 'frequency':
                return cells[2].textContent.trim();
            default:
                return '';
        }
    }

    /**
     * Обновление индикаторов сортировки
     * @param {string} field - поле сортировки
     * @param {string} direction - направление
     */
    updateSortIndicators(field, direction) {
        // Сбрасываем все индикаторы
        document.querySelectorAll('#keywordsModal .sort-indicator').forEach(indicator => {
            indicator.textContent = '↕';
        });
        
        // Устанавливаем индикатор для текущего поля
        const currentHeader = document.querySelector(`#keywordsModal th[data-sort="${field}"] .sort-indicator`);
        if (currentHeader) {
            currentHeader.textContent = direction === 'asc' ? '↑' : '↓';
        }
    }

    /**
     * Получение пагинированных данных
     * @param {Array} keywords - все ключевые слова
     * @returns {Array}
     */
    getPaginatedKeywords(keywords) {
        const start = (this.keywordsPagination.currentPage - 1) * this.keywordsPagination.itemsPerPage;
        const end = start + this.keywordsPagination.itemsPerPage;
        return keywords.slice(start, end);
    }

    /**
     * Генерация HTML для пагинации
     * @returns {string}
     */
    generatePaginationHTML() {
        if (this.keywordsPagination.totalPages <= 1) {
            return '';
        }

        const { currentPage, totalPages, totalItems } = this.keywordsPagination;
        const startItem = (currentPage - 1) * this.keywordsPagination.itemsPerPage + 1;
        const endItem = Math.min(currentPage * this.keywordsPagination.itemsPerPage, totalItems);

        let paginationHTML = `
            <div class="modal-pagination">
                <button class="modal-pagination-btn" onclick="app.goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>
                    « Первая
                </button>
                <button class="modal-pagination-btn" onclick="app.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                    ‹ Предыдущая
                </button>
        `;

        // Показываем номера страниц
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="modal-pagination-btn ${i === currentPage ? 'active' : ''}" onclick="app.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        paginationHTML += `
                <button class="modal-pagination-btn" onclick="app.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                    Следующая ›
                </button>
                <button class="modal-pagination-btn" onclick="app.goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
                    Последняя »
                </button>
                <div class="modal-pagination-info">
                    Показано ${startItem}-${endItem} из ${totalItems}
                </div>
            </div>
        `;

        return paginationHTML;
    }

    /**
     * Переход на страницу
     * @param {number} page - номер страницы
     */
    goToPage(page) {
        if (page < 1 || page > this.keywordsPagination.totalPages) {
            return;
        }

        this.keywordsPagination.currentPage = page;
        
        // Обновляем таблицу
        const tableBody = document.getElementById('keywordsTableBody');
        if (tableBody && this.currentKeywordsData) {
            const paginatedData = this.getPaginatedKeywords(this.currentKeywordsData);
            
            tableBody.innerHTML = paginatedData.map(keyword => {
                return `
                <tr>
                    <td class="keyword-cell">${this.escapeHtml(keyword.word || keyword.keyword || keyword.query || '')}</td>
                    <td class="position-cell">${keyword.pos || keyword.position || '-'}</td>
                    <td class="frequency-cell">${keyword.ws || keyword.wsk || keyword.frequency || keyword.volume || keyword.cnt || keyword.count || '-'}</td>
                    <td class="url-cell">
                        <a href="${keyword.url || '#'}" target="_blank" class="url-link">
                            ${this.truncateUrl(keyword.url || '')}
                        </a>
                    </td>
                </tr>
                `;
            }).join('');
        }

        // Обновляем пагинацию
        const paginationContainer = document.querySelector('.modal-pagination');
        if (paginationContainer) {
            paginationContainer.outerHTML = this.generatePaginationHTML();
            this.addPaginationHandlers();
        }
    }

    /**
     * Добавление обработчиков пагинации
     */
    addPaginationHandlers() {
        // Обработчики уже добавлены через onclick в HTML
        // Здесь можно добавить дополнительные обработчики если нужно
    }
}

// Глобальная инициализация при загрузке страницы
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new KeysSpyApp();
    app.init();
});

// Экспорт для использования в консоли
if (typeof window !== 'undefined') {
    window.KeysSpyApp = app;
}