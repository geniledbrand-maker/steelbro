/**
 * KeywordsTab - Вкладка ключевых слов
 * Файл: /classes/Keywords/KeywordsTab.js
 * Требует: Utils, API, ExportManager
 */

class KeywordsTab {
    constructor() {
        this.containerId = 'keywordsContent';
        this.data = [];
        this.filteredData = [];
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
            container.innerHTML = this.generateLoadingHTML();
            return;
        }

        container.innerHTML = this.generateHTML();
        this.attachEventListeners();
    }

    /**
     * Генерация HTML для загрузки
     * @returns {string}
     */
    generateLoadingHTML() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>⏳ Загрузка ключевых слов...</p>
            </div>
        `;
    }

    /**
     * Генерация HTML
     * @returns {string}
     */
    generateHTML() {
        if (!this.data.length) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🔑</div>
                    <h3>Нет данных о ключевых словах</h3>
                    <p>Загрузите данные для анализа домена</p>
                </div>
            `;
        }

        const controls = this.generateControls();
        const table = this.generateTable();
        const pagination = this.generatePagination();

        return `
            <div class="keywords-content">
                ${controls}
                ${table}
                ${pagination}
            </div>
        `;
    }

    /**
     * Генерация элементов управления
     * @returns {string}
     */
    generateControls() {
        return `
            <div class="table-controls">
                <div class="search-container">
                    <input type="text" 
                           id="keywordsSearch" 
                           class="search-input" 
                           placeholder="Поиск по ключевым словам..."
                           value="${typeof Utils !== 'undefined' ? Utils.escapeHtml(this.searchQuery) : this.searchQuery}">
                    <button class="search-clear" id="clearSearch" title="Очистить поиск">×</button>
                </div>
                
                <div class="controls-right">
                    <div class="results-info">
                        <span id="resultsCount">${this.filteredData.length}</span> из <span id="totalCount">${this.data.length}</span>
                    </div>
                    
                    <button class="export-btn" id="exportKeywordsBtn">
                        <span class="btn-icon">📥</span>
                        Экспорт CSV
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Генерация таблицы
     * @returns {string}
     */
    generateTable() {
        if (!this.filteredData.length) {
            return `
                <div class="no-results">
                    <p>По вашему запросу ничего не найдено</p>
                </div>
            `;
        }

        return `
            <div class="table-container">
                <table class="keywords-table">
                    <thead>
                        <tr>
                            <th class="sortable" data-column="word">
                                Запрос
                                <span class="sort-indicator" data-column="word"></span>
                            </th>
                            <th class="sortable" data-column="ws">
                                Частотность
                                <span class="sort-indicator" data-column="ws"></span>
                            </th>
                            <th class="sortable" data-column="wsk">
                                [!Частотность]
                                <span class="sort-indicator" data-column="wsk"></span>
                            </th>
                            <th class="sortable" data-column="pos">
                                Позиция
                                <span class="sort-indicator" data-column="pos"></span>
                            </th>
                            <th class="sortable" data-column="url">
                                URL
                                <span class="sort-indicator" data-column="url"></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredData.map(keyword => this.generateTableRow(keyword)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Генерация строки таблицы
     * @param {Object} keyword
     * @returns {string}
     */
    generateTableRow(keyword) {
        return `
            <tr>
                <td class="keyword-cell">
                    <span class="keyword" title="${typeof Utils !== 'undefined' ? Utils.escapeHtml(keyword.word) : keyword.word}">
                        ${typeof Utils !== 'undefined' ? Utils.escapeHtml(keyword.word) : keyword.word}
                    </span>
                </td>
                <td class="metric-cell">
                    <span class="metric">${typeof Utils !== 'undefined' ? Utils.formatNumber(keyword.ws || 0) : (keyword.ws || 0).toLocaleString()}</span>
                </td>
                <td class="metric-cell">
                    <span class="metric">${typeof Utils !== 'undefined' ? Utils.formatNumber(keyword.wsk || 0) : (keyword.wsk || 0).toLocaleString()}</span>
                </td>
                <td class="position-cell">
                    <span class="pos-badge ${typeof Utils !== 'undefined' ? Utils.getPositionBadgeClass(keyword.pos) : this.getPositionBadgeClass(keyword.pos)}">
                        ${keyword.pos || '-'}
                    </span>
                </td>
                <td class="url-cell">
                    <span class="url" title="${typeof Utils !== 'undefined' ? Utils.escapeHtml(keyword.url || '') : keyword.url || ''}">
                        ${this.truncateUrl(keyword.url)}
                    </span>
                </td>
            </tr>
        `;
    }

    /**
     * Генерация пагинации
     * @returns {string}
     */
    generatePagination() {
        // Для простоты показываем все результаты без пагинации
        // В будущем можно добавить пагинацию для больших объемов данных
        return '';
    }

    /**
     * Получение класса для позиции в поиске
     * @param {number} position
     * @returns {string}
     */
    getPositionBadgeClass(position) {
        if (typeof position !== 'number') return 'pos-top50';
        if (position <= 3) return 'pos-top3';
        if (position <= 10) return 'pos-top10';
        return 'pos-top50';
    }

    /**
     * Обрезка URL для отображения
     * @param {string} url
     * @param {number} maxLength
     * @returns {string}
     */
    truncateUrl(url, maxLength = 60) {
        if (!url) return '-';
        
        if (url.length <= maxLength) {
            return typeof Utils !== 'undefined' ? Utils.escapeHtml(url) : url;
        }
        
        const truncated = url.substring(0, maxLength - 3) + '...';
        return typeof Utils !== 'undefined' ? Utils.escapeHtml(truncated) : truncated;
    }

    /**
     * Прикрепление обработчиков событий
     */
    attachEventListeners() {
        // Поиск
        const searchInput = document.getElementById('keywordsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.debouncedSearch(this.searchQuery);
            });
        }

        // Очистка поиска
        const clearBtn = document.getElementById('clearSearch');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.searchQuery = '';
                searchInput.value = '';
                this.filterData('');
            });
        }

        // Сортировка
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const column = e.currentTarget.dataset.column;
                this.sort(column);
            });
        });

        // Экспорт
        const exportBtn = document.getElementById('exportKeywordsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToCSV();
            });
        }

        // Клик по ключевому слову
        const keywordCells = document.querySelectorAll('.keyword-cell');
        keywordCells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const keyword = e.target.textContent.trim();
                this.handleKeywordClick(keyword);
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
            this.filteredData = this.data.filter(keyword => 
                keyword.word.toLowerCase().includes(lowerQuery) ||
                (keyword.url && keyword.url.toLowerCase().includes(lowerQuery))
            );
        }

        this.updateResultsCount();
        this.render();
    }

    /**
     * Сортировка данных
     * @param {string} column
     */
    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredData = typeof Utils !== 'undefined' ? Utils.sortBy(this.filteredData, column, this.sortDirection) : this.sortBy(this.filteredData, column, this.sortDirection);
        this.updateSortIndicators();
        this.render();
    }

    /**
     * Сортировка массива объектов по ключу
     * @param {Array} array
     * @param {string} key
     * @param {string} direction
     * @returns {Array}
     */
    sortBy(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Обновление индикаторов сортировки
     */
    updateSortIndicators() {
        const indicators = document.querySelectorAll('.sort-indicator');
        indicators.forEach(indicator => {
            const column = indicator.dataset.column;
            if (column === this.sortColumn) {
                indicator.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
                indicator.style.opacity = '1';
            } else {
                indicator.textContent = '↕';
                indicator.style.opacity = '0.3';
            }
        });
    }

    /**
     * Обновление счетчика результатов
     */
    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        const totalCount = document.getElementById('totalCount');
        
        if (resultsCount) resultsCount.textContent = this.filteredData.length;
        if (totalCount) totalCount.textContent = this.data.length;
    }

    /**
     * Обработка клика по ключевому слову
     * @param {string} keyword
     */
    handleKeywordClick(keyword) {
        this.emit('keywordClick', keyword);
    }

    /**
     * Экспорт в CSV
     */
    exportToCSV() {
        if (!this.filteredData.length) {
            this.emit('notification', { type: 'error', message: 'Нет данных для экспорта' });
            return;
        }

        const headers = ['Запрос', 'Частотность', '[!Частотность]', 'Позиция', 'URL'];
        const filename = `keywords_${new Date().toISOString().split('T')[0]}.csv`;
        
        if (typeof Utils !== 'undefined') {
            Utils.downloadCSV(this.filteredData, filename, headers);
        } else {
            this.downloadCSV(this.filteredData, filename, headers);
        }
        
        this.emit('notification', { 
            type: 'success', 
            message: `Экспортировано ${this.filteredData.length} ключевых слов` 
        });
    }

    /**
     * Обновление данных
     * @param {Array} data
     */
    updateData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.isLoaded = true;
        this.searchQuery = '';
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.render();
    }

    /**
     * Сброс состояния
     */
    reset() {
        this.data = [];
        this.filteredData = [];
        this.isLoaded = false;
        this.searchQuery = '';
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.render();
    }

    /**
     * Получение текущих данных
     * @returns {Array}
     */
    getData() {
        return this.data;
    }

    /**
     * Получение отфильтрованных данных
     * @returns {Array}
     */
    getFilteredData() {
        return this.filteredData;
    }

    /**
     * Проверка, загружены ли данные
     * @returns {boolean}
     */
    isDataLoaded() {
        return this.isLoaded;
    }

    /**
     * Получение статистики
     * @returns {Object}
     */
    getStats() {
        if (!this.data.length) {
            return {
                total: 0,
                filtered: 0,
                top10: 0,
                top50: 0,
                avgPosition: 0,
                avgFrequency: 0
            };
        }

        const top10 = this.data.filter(k => k.pos && k.pos <= 10).length;
        const top50 = this.data.filter(k => k.pos && k.pos <= 50).length;
        const avgPosition = this.data.reduce((sum, k) => sum + (k.pos || 0), 0) / this.data.length;
        const avgFrequency = this.data.reduce((sum, k) => sum + (k.ws || 0), 0) / this.data.length;

        return {
            total: this.data.length,
            filtered: this.filteredData.length,
            top10,
            top50,
            avgPosition: Math.round(avgPosition * 100) / 100,
            avgFrequency: Math.round(avgFrequency * 100) / 100
        };
    }

    /**
     * Скачивание CSV файла
     * @param {Array} data
     * @param {string} filename
     * @param {Array} headers
     */
    downloadCSV(data, filename, headers = null) {
        if (!Array.isArray(data) || data.length === 0) {
            console.error('Нет данных для экспорта в CSV');
            return;
        }

        let csv = '';
        
        // Заголовки
        if (headers) {
            csv += headers.map(h => `"${h}"`).join(',') + '\n';
        } else {
            const firstRow = data[0];
            csv += Object.keys(firstRow).map(key => `"${key}"`).join(',') + '\n';
        }

        // Данные
        data.forEach(row => {
            const values = headers ? 
                headers.map(h => row[h] || '') : 
                Object.values(row);
            
            csv += values.map(value => {
                const str = String(value || '');
                return `"${str.replace(/"/g, '""')}"`;
            }).join(',') + '\n';
        });

        // Добавляем BOM для корректного отображения кириллицы в Excel
        const content = '\uFEFF' + csv;
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        this.data = [];
        this.filteredData = [];
        this.isLoaded = false;
        this.searchQuery = '';
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.eventHandlers = {};
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeywordsTab;
}
