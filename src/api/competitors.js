// File: src/api/competitors.js
// Created: 2025-01-22
// Modified: 2025-01-22

/**
 * Competitors Analysis API
 * Оптимизированная система для работы с конкурентами через keys.so API
 */

class CompetitorsAPI {
    constructor() {
        this.baseUrl = 'keys_proxy.php';
        this.regions = {
            'msk': 'Яндекс: Москва',
            'gru': 'Google: Москва', 
            'zen': 'Дзен',
            'gkv': 'Google: Киев',
            'rnd': 'Яндекс: Ростов-на-Дону',
            'ekb': 'Яндекс: Екатеринбург',
            'ufa': 'Яндекс: Уфа',
            'sar': 'Яндекс: Саратов',
            'krr': 'Яндекс: Краснодар',
            'prm': 'Яндекс: Пермь',
            'sam': 'Яндекс: Самара',
            'kry': 'Яндекс: Красноярск',
            'oms': 'Яндекс: Омск',
            'kzn': 'Яндекс: Казань',
            'che': 'Яндекс: Челябинск',
            'nsk': 'Яндекс: Новосибирск',
            'nnv': 'Яндекс: Н. Новгород',
            'vlg': 'Яндекс: Волгоград',
            'vrn': 'Яндекс: Воронеж',
            'spb': 'Яндекс: Санкт-Петербург',
            'mns': 'Яндекс: Минск',
            'tmn': 'Яндекс: Тюмень',
            'gmns': 'Google: Минск',
            'tom': 'Яндекс: Томск',
            'gny': 'Google: New York'
        };
    }

    /**
     * Получить конкурентов по ключевым словам
     * @param {string[]} keywords - Массив ключевых слов
     * @param {string} region - Регион (по умолчанию 'ekb')
     * @param {number} page - Страница
     * @param {number} perPage - Записей на странице
     * @returns {Promise<Object>}
     */
    async getCompetitorsByKeywords(keywords, region = 'ekb', page = 1, perPage = 50) {
        try {
            console.log('🔍 Анализ конкурентов по ключевым словам:', keywords);
            
            const response = await fetch(`${this.baseUrl}?endpoint=/tools/check-top-concurents-domains&base=${region}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    list: keywords,
                    page: page,
                    perPage: perPage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📊 Данные конкурентов получены:', data);
            
            return {
                success: true,
                data: data,
                region: this.regions[region] || region,
                keywords: keywords
            };

        } catch (error) {
            console.error('❌ Ошибка получения конкурентов:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Получить страницы конкурентов
     * @param {string[]} keywords - Массив ключевых слов
     * @param {string} region - Регион
     * @param {number} page - Страница
     * @param {number} perPage - Записей на странице
     * @returns {Promise<Object>}
     */
    async getCompetitorPages(keywords, region = 'ekb', page = 1, perPage = 50) {
        try {
            console.log('🔍 Анализ страниц конкурентов:', keywords);
            
            const response = await fetch(`${this.baseUrl}?endpoint=/tools/check-top-concurents-urls&base=${region}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    list: keywords,
                    page: page,
                    perPage: perPage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📊 Страницы конкурентов получены:', data);
            
            return {
                success: true,
                data: data,
                region: this.regions[region] || region,
                keywords: keywords
            };

        } catch (error) {
            console.error('❌ Ошибка получения страниц конкурентов:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Анализ конкурентов для домена
     * @param {string} domain - Домен для анализа
     * @param {string[]} keywords - Ключевые слова
     * @param {string} region - Регион
     * @returns {Promise<Object>}
     */
    async analyzeDomainCompetitors(domain, keywords, region = 'ekb') {
        try {
            console.log(`🎯 Анализ конкурентов для ${domain} в регионе ${region}`);
            
            // Получаем конкурентов по ключевым словам
            const competitorsResult = await this.getCompetitorsByKeywords(keywords, region);
            const pagesResult = await this.getCompetitorPages(keywords, region);
            
            if (!competitorsResult.success || !pagesResult.success) {
                throw new Error('Не удалось получить данные конкурентов');
            }

            // Анализируем данные
            const analysis = this.analyzeCompetitorData(competitorsResult.data, pagesResult.data, domain);
            
            return {
                success: true,
                domain: domain,
                region: this.regions[region] || region,
                keywords: keywords,
                competitors: competitorsResult.data,
                pages: pagesResult.data,
                analysis: analysis
            };

        } catch (error) {
            console.error('❌ Ошибка анализа конкурентов:', error);
            return {
                success: false,
                error: error.message,
                domain: domain
            };
        }
    }

    /**
     * Анализ данных конкурентов
     * @param {Object} competitorsData - Данные конкурентов
     * @param {Object} pagesData - Данные страниц
     * @param {string} targetDomain - Целевой домен
     * @returns {Object}
     */
    analyzeCompetitorData(competitorsData, pagesData, targetDomain) {
        const analysis = {
            totalCompetitors: competitorsData.total || 0,
            totalPages: pagesData.total || 0,
            topCompetitors: [],
            threats: [],
            opportunities: []
        };

        // Анализ конкурентов
        if (competitorsData.data && Array.isArray(competitorsData.data)) {
            competitorsData.data.forEach(competitor => {
                if (competitor.domain && competitor.domain !== targetDomain) {
                    analysis.topCompetitors.push({
                        domain: competitor.domain,
                        traffic: competitor.traffic || 0,
                        keywords: competitor.keywords || 0,
                        positions: {
                            top1: competitor.top1 || 0,
                            top3: competitor.top3 || 0,
                            top10: competitor.top10 || 0
                        },
                        commonKeywords: competitor.common_keywords || 0
                    });
                }
            });
        }

        // Сортируем по количеству общих ключевых слов
        analysis.topCompetitors.sort((a, b) => b.commonKeywords - a.commonKeywords);

        // Определяем угрозы и возможности
        analysis.topCompetitors.forEach(competitor => {
            if (competitor.commonKeywords > 10) {
                analysis.threats.push({
                    domain: competitor.domain,
                    reason: `Высокое пересечение ключевых слов (${competitor.commonKeywords})`,
                    severity: competitor.commonKeywords > 50 ? 'high' : 'medium'
                });
            }
            
            if (competitor.positions.top1 > 0) {
                analysis.opportunities.push({
                    domain: competitor.domain,
                    reason: `Есть позиции в ТОП-1 (${competitor.positions.top1})`,
                    potential: 'high'
                });
            }
        });

        return analysis;
    }

    /**
     * Получить список доступных регионов
     * @returns {Object}
     */
    getAvailableRegions() {
        return this.regions;
    }

    /**
     * Экспорт данных в CSV
     * @param {Object} data - Данные для экспорта
     * @returns {string}
     */
    exportToCSV(data) {
        if (!data || !data.topCompetitors) {
            return '';
        }

        const headers = ['Домен', 'Трафик', 'Ключевые слова', 'ТОП-1', 'ТОП-3', 'ТОП-10', 'Общие ключевые слова'];
        const rows = data.topCompetitors.map(competitor => [
            competitor.domain,
            competitor.traffic,
            competitor.keywords,
            competitor.positions.top1,
            competitor.positions.top3,
            competitor.positions.top10,
            competitor.commonKeywords
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return csvContent;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompetitorsAPI;
} else {
    window.CompetitorsAPI = CompetitorsAPI;
}

// End of file: src/api/competitors.js
// Last modified: 2025-01-22
