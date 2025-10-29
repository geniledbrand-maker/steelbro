// ============================================
// ПРИМЕР ПРАВИЛЬНОГО ДОБАВЛЕНИЯ ИЗДЕЛИЯ
// ============================================

/**
 * Функция для добавления нового пользовательского изделия
 */
async function addCustomProduct(productData) {
    try {
        const response = await fetch('save_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                add_custom_product: {
                    name: productData.name,
                    complexity: productData.complexity || '',
                    margin: productData.margin || '',
                    demand: productData.demand || '',
                    time: productData.time || ''
                }
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Изделие успешно добавлено!');
            // Перезагружаем данные
            await loadDashboardData();
            return true;
        } else {
            console.error('❌ Ошибка:', result.error);
            alert('Ошибка: ' + result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка сети:', error);
        alert('Ошибка сохранения: ' + error.message);
        return false;
    }
}

/**
 * Функция для сохранения ВСЕХ выбранных изделий
 * ВАЖНО: При любом изменении нужно сохранять ВСЕ selected_products!
 */
async function saveAllSelectedProducts(selectedProducts, customProducts) {
    try {
        const response = await fetch('save_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                selected_products: selectedProducts,  // Массив имен выбранных изделий
                custom_products: customProducts       // Массив объектов пользовательских изделий
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Данные сохранены!', result.timestamp);
            return true;
        } else {
            console.error('❌ Ошибка:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка сети:', error);
        return false;
    }
}

/**
 * Функция загрузки данных
 */
async function loadDashboardData() {
    try {
        const response = await fetch('save_data.php');
        const data = await response.json();

        console.log('📊 Загружено данных:');
        console.log('- Выбранных изделий:', data.selected_products.length);
        console.log('- Пользовательских изделий:', data.custom_products.length);
        console.log('- Удалённых изделий:', data.deleted_products.length);

        return data;
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        return null;
    }
}

/**
 * Функция удаления изделия
 */
async function deleteProduct(productName) {
    try {
        const response = await fetch('save_data.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: productName
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Изделие удалено:', productName);
            await loadDashboardData();
            return true;
        } else {
            console.error('❌ Ошибка:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка сети:', error);
        return false;
    }
}

/**
 * Функция восстановления изделия
 */
async function restoreProduct(productName) {
    try {
        const response = await fetch('save_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                restore_product: productName
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Изделие восстановлено:', productName);
            await loadDashboardData();
            return true;
        } else {
            console.error('❌ Ошибка:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка сети:', error);
        return false;
    }
}

// ============================================
// ПРИМЕР ИСПОЛЬЗОВАНИЯ
// ============================================

// Пример 1: Добавление нового изделия
async function exampleAddProduct() {
    await addCustomProduct({
        name: 'Новое изделие',
        complexity: 'Средняя',
        margin: 'Высокая',
        demand: 'Высокий',
        time: '3-5 дней'
    });
}

// Пример 2: Сохранение изменений в выборе изделий
async function exampleSaveSelection() {
    // Получаем текущие данные
    const data = await loadDashboardData();

    // Добавляем новое изделие в выбранные
    if (!data.selected_products.includes('Новое изделие')) {
        data.selected_products.push('Новое изделие');
    }

    // Сохраняем
    await saveAllSelectedProducts(data.selected_products, data.custom_products);
}

// ============================================
// ДИАГНОСТИКА
// ============================================

/**
 * Функция для проверки состояния данных
 */
async function diagnosticCheck() {
    console.log('🔍 ДИАГНОСТИКА ДАННЫХ');
    console.log('='.repeat(50));

    const data = await loadDashboardData();

    if (!data) {
        console.error('❌ Не удалось загрузить данные!');
        return;
    }

    console.log('📋 ВЫБРАННЫЕ ИЗДЕЛИЯ (selected_products):');
    data.selected_products.forEach((name, i) => {
        console.log(`  ${i + 1}. ${name}`);
    });

    console.log('\n🔧 ПОЛЬЗОВАТЕЛЬСКИЕ ИЗДЕЛИЯ (custom_products):');
    data.custom_products.forEach((product, i) => {
        console.log(`  ${i + 1}. ${product.name}`);
        console.log(`     - Сложность: ${product.complexity}`);
        console.log(`     - Маржа: ${product.margin}`);
        console.log(`     - Спрос: ${product.demand}`);
    });

    console.log('\n🗑️ УДАЛЁННЫЕ ИЗДЕЛИЯ (deleted_products):');
    data.deleted_products.forEach((product, i) => {
        console.log(`  ${i + 1}. ${product.name}`);
    });

    console.log('\n⏰ Последнее обновление:', data.last_updated);
    console.log('='.repeat(50));

    // Проверка на несоответствия
    console.log('\n⚠️ ПРОВЕРКА ЦЕЛОСТНОСТИ:');

    const customNames = data.custom_products.map(p => p.name);
    const missingInSelected = customNames.filter(name => !data.selected_products.includes(name));

    if (missingInSelected.length > 0) {
        console.warn('⚠️ Эти изделия есть в custom_products, но отсутствуют в selected_products:');
        missingInSelected.forEach(name => console.warn(`   - ${name}`));
        console.log('\n💡 РЕШЕНИЕ: Добавьте эти изделия в selected_products!');
    } else {
        console.log('✅ Все пользовательские изделия присутствуют в выбранных!');
    }
}

// Запуск диагностики при загрузке страницы
// diagnosticCheck();