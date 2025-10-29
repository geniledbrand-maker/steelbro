// File: src/utils/regions.js
// Created: 2025-01-22
// Modified: 2025-01-22

/**
 * Regional Analysis Utility
 * Утилита для работы с региональными базами keys.so
 */

class RegionsAnalyzer {
    constructor() {
        this.regions = {
            'msk': {
                name: 'Яндекс: Москва',
                type: 'yandex',
                country: 'ru',
                city: 'Москва',
                population: 12600000,
                priority: 1
            },
            'gru': {
                name: 'Google: Москва',
                type: 'google',
                country: 'ru',
                city: 'Москва',
                population: 12600000,
                priority: 2
            },
            'zen': {
                name: 'Дзен',
                type: 'yandex',
                country: 'ru',
                city: 'Россия',
                population: 146000000,
                priority: 3
            },
            'gkv': {
                name: 'Google: Киев',
                type: 'google',
                country: 'ua',
                city: 'Киев',
                population: 3000000,
                priority: 4
            },
            'rnd': {
                name: 'Яндекс: Ростов-на-Дону',
                type: 'yandex',
                country: 'ru',
                city: 'Ростов-на-Дону',
                population: 1100000,
                priority: 5
            },
            'ekb': {
                name: 'Яндекс: Екатеринбург',
                type: 'yandex',
                country: 'ru',
                city: 'Екатеринбург',
                population: 1500000,
                priority: 6
            },
            'ufa': {
                name: 'Яндекс: Уфа',
                type: 'yandex',
                country: 'ru',
                city: 'Уфа',
                population: 1100000,
                priority: 7
            },
            'sar': {
                name: 'Яндекс: Саратов',
                type: 'yandex',
                country: 'ru',
                city: 'Саратов',
                population: 800000,
                priority: 8
            },
            'krr': {
                name: 'Яндекс: Краснодар',
                type: 'yandex',
                country: 'ru',
                city: 'Краснодар',
                population: 900000,
                priority: 9
            },
            'prm': {
                name: 'Яндекс: Пермь',
                type: 'yandex',
                country: 'ru',
                city: 'Пермь',
                population: 1000000,
                priority: 10
            },
            'sam': {
                name: 'Яндекс: Самара',
                type: 'yandex',
                country: 'ru',
                city: 'Самара',
                population: 1100000,
                priority: 11
            },
            'kry': {
                name: 'Яндекс: Красноярск',
                type: 'yandex',
                country: 'ru',
                city: 'Красноярск',
                population: 1000000,
                priority: 12
            },
            'oms': {
                name: 'Яндекс: Омск',
                type: 'yandex',
                country: 'ru',
                city: 'Омск',
                population: 1100000,
                priority: 13
            },
            'kzn': {
                name: 'Яндекс: Казань',
                type: 'yandex',
                country: 'ru',
                city: 'Казань',
                population: 1200000,
                priority: 14
            },
            'che': {
                name: 'Яндекс: Челябинск',
                type: 'yandex',
                country: 'ru',
                city: 'Челябинск',
                population: 1100000,
                priority: 15
            },
            'nsk': {
                name: 'Яндекс: Новосибирск',
                type: 'yandex',
                country: 'ru',
                city: 'Новосибирск',
                population: 1600000,
                priority: 16
            },
            'nnv': {
                name: 'Яндекс: Н. Новгород',
                type: 'yandex',
                country: 'ru',
                city: 'Нижний Новгород',
                population: 1200000,
                priority: 17
            },
            'vlg': {
                name: 'Яндекс: Волгоград',
                type: 'yandex',
                country: 'ru',
                city: 'Волгоград',
                population: 1000000,
                priority: 18
            },
            'vrn': {
                name: 'Яндекс: Воронеж',
                type: 'yandex',
                country: 'ru',
                city: 'Воронеж',
                population: 1000000,
                priority: 19
            },
            'spb': {
                name: 'Яндекс: Санкт-Петербург',
                type: 'yandex',
                country: 'ru',
                city: 'Санкт-Петербург',
                population: 5400000,
                priority: 20
            },
            'mns': {
                name: 'Яндекс: Минск',
                type: 'yandex',
                country: 'by',
                city: 'Минск',
                population: 2000000,
                priority: 21
            },
            'tmn': {
                name: 'Яндекс: Тюмень',
                type: 'yandex',
                country: 'ru',
                city: 'Тюмень',
                population: 800000,
                priority: 22
            },
            'gmns': {
                name: 'Google: Минск',
                type: 'google',
                country: 'by',
                city: 'Минск',
                population: 2000000,
                priority: 23
            },
            'tom': {
                name: 'Яндекс: Томск',
                type: 'yandex',
                country: 'ru',
                city: 'Томск',
                population: 500000,
                priority: 24
            },
            'gny': {
                name: 'Google: New York',
                type: 'google',
                country: 'us',
                city: 'New York',
                population: 20000000,
                priority: 25
            }
        };
    }

    /**
     * Получить информацию о регионе
     * @param {string} regionCode - Код региона
     * @returns {Object|null}
     */
    getRegionInfo(regionCode) {
        return this.regions[regionCode] || null;
    }

    /**
     * Получить все регионы
     * @returns {Object}
     */
    getAllRegions() {
        return this.regions;
    }

    /**
     * Получить регионы по типу поисковика
     * @param {string} type - Тип поисковика ('yandex', 'google')
     * @returns {Object}
     */
    getRegionsByType(type) {
        const filtered = {};
        Object.entries(this.regions).forEach(([code, info]) => {
            if (info.type === type) {
                filtered[code] = info;
            }
        });
        return filtered;
    }

    /**
     * Получить регионы по стране
     * @param {string} country - Код страны ('ru', 'ua', 'by', 'us')
     * @returns {Object}
     */
    getRegionsByCountry(country) {
        const filtered = {};
        Object.entries(this.regions).forEach(([code, info]) => {
            if (info.country === country) {
                filtered[code] = info;
            }
        });
        return filtered;
    }

    /**
     * Получить рекомендуемые регионы для домена
     * @param {string} domain - Домен
     * @returns {Array}
     */
    getRecommendedRegions(domain) {
        const recommendations = [];
        
        // Анализируем домен
        const domainLower = domain.toLowerCase();
        
        // Определяем страну по домену
        let country = 'ru'; // по умолчанию
        if (domainLower.includes('.ua')) country = 'ua';
        else if (domainLower.includes('.by')) country = 'by';
        else if (domainLower.includes('.com') || domainLower.includes('.us')) country = 'us';
        
        // Получаем регионы для страны
        const countryRegions = this.getRegionsByCountry(country);
        
        // Сортируем по приоритету
        const sortedRegions = Object.entries(countryRegions)
            .sort(([,a], [,b]) => a.priority - b.priority)
            .slice(0, 5); // топ-5 регионов
        
        sortedRegions.forEach(([code, info]) => {
            recommendations.push({
                code: code,
                name: info.name,
                city: info.city,
                type: info.type,
                priority: info.priority,
                reason: this.getRecommendationReason(code, domain)
            });
        });
        
        return recommendations;
    }

    /**
     * Получить причину рекомендации региона
     * @param {string} regionCode - Код региона
     * @param {string} domain - Домен
     * @returns {string}
     */
    getRecommendationReason(regionCode, domain) {
        const region = this.regions[regionCode];
        if (!region) return 'Неизвестный регион';
        
        const reasons = {
            'msk': 'Столица России, максимальный трафик',
            'spb': 'Второй по величине город России',
            'ekb': 'Крупный промышленный центр',
            'gru': 'Google Москва - международный трафик',
            'zen': 'Общероссийский охват Дзен'
        };
        
        return reasons[regionCode] || `Региональный охват ${region.city}`;
    }

    /**
     * Анализ конкурентов по регионам
     * @param {string} domain - Домен
     * @param {Array} keywords - Ключевые слова
     * @param {Array} regions - Список регионов для анализа
     * @returns {Promise<Object>}
     */
    async analyzeCompetitorsByRegions(domain, keywords, regions = ['msk', 'spb', 'ekb']) {
        const results = {
            domain: domain,
            keywords: keywords,
            regions: {},
            summary: {
                totalCompetitors: 0,
                uniqueCompetitors: new Set(),
                topRegions: []
            }
        };
        
        // Анализируем каждый регион
        for (const regionCode of regions) {
            try {
                console.log(`🔍 Анализируем регион ${regionCode}...`);
                
                // Здесь должен быть вызов API для анализа конкурентов
                // Пока что возвращаем заглушку
                const regionResult = await this.analyzeRegionCompetitors(domain, keywords, regionCode);
                
                results.regions[regionCode] = regionResult;
                
                // Обновляем сводку
                if (regionResult.competitors) {
                    results.summary.totalCompetitors += regionResult.competitors.length;
                    regionResult.competitors.forEach(comp => {
                        results.summary.uniqueCompetitors.add(comp.domain);
                    });
                }
                
            } catch (error) {
                console.error(`❌ Ошибка анализа региона ${regionCode}:`, error);
                results.regions[regionCode] = {
                    error: error.message,
                    competitors: []
                };
            }
        }
        
        // Анализируем топ регионы
        results.summary.topRegions = this.analyzeTopRegions(results.regions);
        
        return results;
    }

    /**
     * Анализ конкурентов для конкретного региона
     * @param {string} domain - Домен
     * @param {Array} keywords - Ключевые слова
     * @param {string} regionCode - Код региона
     * @returns {Promise<Object>}
     */
    async analyzeRegionCompetitors(domain, keywords, regionCode) {
        // Заглушка для демонстрации
        // В реальном приложении здесь должен быть вызов API
        return {
            region: this.regions[regionCode],
            competitors: [
                {
                    domain: 'competitor1.ru',
                    traffic: Math.floor(Math.random() * 1000),
                    keywords: Math.floor(Math.random() * 100),
                    top1: Math.floor(Math.random() * 10),
                    top3: Math.floor(Math.random() * 20),
                    top10: Math.floor(Math.random() * 50)
                },
                {
                    domain: 'competitor2.ru',
                    traffic: Math.floor(Math.random() * 1000),
                    keywords: Math.floor(Math.random() * 100),
                    top1: Math.floor(Math.random() * 10),
                    top3: Math.floor(Math.random() * 20),
                    top10: Math.floor(Math.random() * 50)
                }
            ],
            analysis: {
                totalCompetitors: 2,
                avgTraffic: 500,
                avgKeywords: 50
            }
        };
    }

    /**
     * Анализ топ регионов
     * @param {Object} regionsData - Данные по регионам
     * @returns {Array}
     */
    analyzeTopRegions(regionsData) {
        const regionStats = [];
        
        Object.entries(regionsData).forEach(([regionCode, data]) => {
            if (data.competitors && data.competitors.length > 0) {
                const totalTraffic = data.competitors.reduce((sum, comp) => sum + comp.traffic, 0);
                const totalKeywords = data.competitors.reduce((sum, comp) => sum + comp.keywords, 0);
                
                regionStats.push({
                    region: regionCode,
                    name: this.regions[regionCode].name,
                    competitors: data.competitors.length,
                    totalTraffic: totalTraffic,
                    totalKeywords: totalKeywords,
                    score: data.competitors.length * 0.4 + (totalTraffic / 100) * 0.3 + (totalKeywords / 10) * 0.3
                });
            }
        });
        
        return regionStats.sort((a, b) => b.score - a.score);
    }

    /**
     * Создание отчета по регионам
     * @param {Object} analysisData - Данные анализа
     * @returns {Object}
     */
    createRegionalReport(analysisData) {
        const report = {
            domain: analysisData.domain,
            keywords: analysisData.keywords,
            summary: {
                totalRegions: Object.keys(analysisData.regions).length,
                totalCompetitors: analysisData.summary.totalCompetitors,
                uniqueCompetitors: analysisData.summary.uniqueCompetitors.size,
                topRegions: analysisData.summary.topRegions.slice(0, 3)
            },
            recommendations: this.generateRecommendations(analysisData),
            regionalBreakdown: this.createRegionalBreakdown(analysisData.regions)
        };
        
        return report;
    }

    /**
     * Генерация рекомендаций
     * @param {Object} analysisData - Данные анализа
     * @returns {Array}
     */
    generateRecommendations(analysisData) {
        const recommendations = [];
        
        // Анализируем топ регионы
        const topRegions = analysisData.summary.topRegions.slice(0, 3);
        
        topRegions.forEach((region, index) => {
            recommendations.push({
                type: 'region',
                priority: index + 1,
                region: region.region,
                name: region.name,
                reason: `Высокая конкуренция (${region.competitors} конкурентов)`,
                action: 'Сосредоточиться на этом регионе'
            });
        });
        
        return recommendations;
    }

    /**
     * Создание разбивки по регионам
     * @param {Object} regionsData - Данные по регионам
     * @returns {Object}
     */
    createRegionalBreakdown(regionsData) {
        const breakdown = {};
        
        Object.entries(regionsData).forEach(([regionCode, data]) => {
            if (data.competitors && data.competitors.length > 0) {
                breakdown[regionCode] = {
                    name: this.regions[regionCode].name,
                    competitors: data.competitors.length,
                    topCompetitors: data.competitors
                        .sort((a, b) => b.traffic - a.traffic)
                        .slice(0, 3)
                };
            }
        });
        
        return breakdown;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegionsAnalyzer;
} else {
    window.RegionsAnalyzer = RegionsAnalyzer;
}

// End of file: src/utils/regions.js
// Last modified: 2025-01-22
