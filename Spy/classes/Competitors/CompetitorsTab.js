/**
 * CompetitorsTab - Вкладка конкурентов
 * Файл: /classes/Competitors/CompetitorsTab.js
 * Требует: Utils, API, ExportManager
 */

class CompetitorsTab {
    constructor(data = []) {
        this.containerId = 'competitorsContent';
        this.data = data;
        this.filteredData = [...data];
        this.isLoaded = false;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchQuery = '';
        this.eventHandlers = {};
        
        this.setupSearchDebounce();
    }

    /**
     * Настройка дебаунса для поиска
     */
    setupSearchDebounce() {
        this.debouncedSearch = Utils.debounce((query) => {
            this.filterData(query);
        }, 300);
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
     * Рендеринг вкладки
     * @param {Array} data - Данные для отображения
     */
    render(data = null) {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Контейнер ${this.containerId} не найден`);
            return;
        }

        if (data) {
            this.data = data;
            this.filteredData = [...data];
            this.isLoaded = true;
        }

        if (!this.isLoaded) {
            container.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>⏳ Загрузка конкурентов...</p>
                </div>
            `;
            return;
        }

        if (!this.data || this.data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>🥊 Конкуренты</h3>
                    <p>Нет данных о конкурентах</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="tab-header">
                <h2>🥊 Конкуренты</h2>
                <div class="tab-controls">
                    <div class="search-box">
                        <input type="text" id="competitorsSearch" placeholder="Поиск по конкурентам..." value="${this.searchQuery}">
                        <span class="search-icon">🔍</span>
                    </div>
                    <div class="results-count">
                        Показано: <span id="competitorsCount">${this.filteredData.length}</span> из ${this.data.length}
                    </div>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="sortable" data-column="domain">Домен</th>
                            <th class="sortable" data-column="vis">Трафик</th>
                            <th class="sortable" data-column="keys">Ключевых слов</th>
                            <th class="sortable" data-column="it1">Топ 1</th>
                            <th class="sortable" data-column="it3">Топ 3</th>
                            <th class="sortable" data-column="it10">Топ 10</th>
                            <th class="sortable" data-column="common_keys">Общих ключевых слов</th>
                        </tr>
                    </thead>
                    <tbody id="competitorsTableBody">
                        ${this.renderTableRows()}
                    </tbody>
                </table>
            </div>

            <div class="tab-footer">
                <button class="btn secondary" onclick="app.exportData('competitors')">
                    📊 Экспорт в CSV
                </button>
            </div>
        `;

        container.innerHTML = html;
        this.setupEventListeners();
    }

    /**
     * Рендеринг строк таблицы
     */
    renderTableRows() {
        return this.filteredData.map(competitor => `
            <tr>
                <td class="domain-cell">
                    <a href="https://${competitor.name}" target="_blank" rel="noopener">
                        ${competitor.name}
                    </a>
                </td>
                <td class="metric">${Utils.formatNumber(competitor.vis || 0)}</td>
                <td class="metric">${competitor.keys ? competitor.keys.length : 0}</td>
                <td class="metric">${competitor.it1 || 0}</td>
                <td class="metric">${competitor.it3 || 0}</td>
                <td class="metric">${competitor.it10 || 0}</td>
                <td class="metric">${competitor.common_keys || 0}</td>
            </tr>
        `).join('');
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Поиск
        const searchInput = document.getElementById('competitorsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.debouncedSearch(this.searchQuery);
            });
        }

        // Сортировка
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const column = e.target.getAttribute('data-column');
                this.sortData(column);
            });
        });
    }

    /**
     * Фильтрация данных
     * @param {string} query
     */
    filterData(query) {
        if (!query.trim()) {
            this.filteredData = [...this.data];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredData = this.data.filter(competitor => 
                (competitor.name && competitor.name.toLowerCase().includes(lowerQuery))
            );
        }

        this.updateTable();
        this.updateCount();
    }

    /**
     * Сортировка данных
     * @param {string} column
     */
    sortData(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredData.sort((a, b) => {
            let aVal = a[column] || 0;
            let bVal = b[column] || 0;

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.updateTable();
    }

    /**
     * Обновление таблицы
     */
    updateTable() {
        const tbody = document.getElementById('competitorsTableBody');
        if (tbody) {
            tbody.innerHTML = this.renderTableRows();
        }
    }

    /**
     * Обновление счетчика
     */
    updateCount() {
        const countElement = document.getElementById('competitorsCount');
        if (countElement) {
            countElement.textContent = this.filteredData.length;
        }
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        this.data = [];
        this.filteredData = [];
        this.isLoaded = false;
        this.eventHandlers = {};
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompetitorsTab;
}
