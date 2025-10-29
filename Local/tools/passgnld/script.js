"use strict";

/* =============== Elements – common =============== */
const lengthSlider = document.getElementById('length');
const lengthValue  = document.getElementById('lengthValue');

// В верстке два блока вывода пароля
const passwordDisplayEmployee = document.getElementById('passwordEmployee');
const passwordDisplayService  = document.getElementById('passwordService');
function getPasswordDisplay() {
    return activeTab === 'service' ? passwordDisplayService : passwordDisplayEmployee;
}

const messageDiv        = document.getElementById('message');
const searchInput       = document.getElementById('searchInput');
const filterTagsDiv     = document.getElementById('filterTags');
const notepadArea       = document.getElementById('notepad');
const notepadMessageDiv = document.getElementById('notepadMessage');

/* =============== Tabs and containers =============== */
const tabButtons            = document.querySelectorAll('.tab-btn');
const employeeTab           = document.getElementById('employeeTab');
const serviceTab            = document.getElementById('serviceTab');
const noteTab               = document.getElementById('noteTab');
const employeePasswordsList = document.getElementById('employeePasswordsList');
const servicePasswordsList  = document.getElementById('servicePasswordsList');
const notesManagementPanel  = document.getElementById('notesManagementPanel');

/* =============== Employee form =============== */
const employeeEmailInput               = document.getElementById('employeeEmail');
const employeePhoneInput               = document.getElementById('employeePhone');
const employeeProjectDescriptionInput  = document.getElementById('employeeProjectDescription');
const employeePriceGroupInput          = document.getElementById('employeePriceGroupInput');
const selectedPriceGroupsDiv           = document.getElementById('selectedPriceGroups');
const addPriceGroupBtn                 = document.getElementById('addPriceGroupBtn');
const saveEmployeeBtn                  = document.getElementById('saveEmployeeBtn');

/* =============== Service form =============== */
const serviceDescriptionInput          = document.getElementById('serviceDescription');
const serviceEmailInput                = document.getElementById('serviceEmail');
const serviceUrlInput                  = document.getElementById('serviceUrl');
const serviceProjectDescriptionInput   = document.getElementById('serviceProjectDescription');
const serviceStartDateInput            = document.getElementById('serviceStartDate');
const serviceEndDateInput              = document.getElementById('serviceEndDate');
const servicePaymentInfoInput          = document.getElementById('servicePaymentInfo');
const saveServiceBtn                   = document.getElementById('saveBtn');
const serviceTagInput                  = document.getElementById('serviceTagInput');
const addServiceTagBtn                 = document.getElementById('addServiceTagBtn');
const selectedServiceTagsDiv           = document.getElementById('selectedServiceTags');

/* =============== Tag modal =============== */
const tagModal          = document.getElementById('tagModal');
const modalTagsList     = document.getElementById('modalTagsList');
const modalSearchInput  = document.getElementById('modalSearchInput');
const modalNewTagInput  = document.getElementById('modalNewTagInput');
const modalSelectedTags = document.getElementById('modalSelectedTags');
const modalCloseBtn     = document.getElementById('modalCloseBtn');
const createTagBtn      = document.getElementById('createTagBtn');
const modalSaveBtn      = document.getElementById('modalSaveBtn');
const modalCancelBtn    = document.getElementById('modalCancelBtn');

/* =============== Password generation controls =============== */
const manualPasswordCheckbox = document.getElementById('manualPasswordCheckbox'); // только «Сотрудники»
const manualPasswordInput    = document.getElementById('manualPasswordInput');    // контейнер поля
const manualPasswordField    = document.getElementById('manualPasswordField');    // само поле
const manualServicePasswordCheckbox = document.getElementById('manualServicePasswordCheckbox');
const manualServicePasswordInput    = document.getElementById('manualServicePasswordInput');
const manualServicePasswordField    = document.getElementById('manualServicePasswordField');

const generateBtn        = document.getElementById('generateBtn');
const copyBtn            = document.getElementById('copyBtn');
const uppercaseCheckbox  = document.getElementById('uppercase');
const lowercaseCheckbox  = document.getElementById('lowercase');
const numbersCheckbox    = document.getElementById('numbers');
const symbolsCheckbox    = document.getElementById('symbols');
const toggleSettingsBtn  = document.getElementById('toggleSettingsBtn');
const passwordControls   = document.getElementById('passwordControls');
const toggleIcon         = document.getElementById('toggleIcon');

/* =============== Notepad controls =============== */
const copyNotepadBtn = document.getElementById('copyNotepadBtn');
const clearNotepadBtn= document.getElementById('clearNotepadBtn');

/* =============== Constants =============== */
const PASSWORD_PREFIX = 'gnlds1';
const EXCLUDED_CHARS = '0Oo1Iilqg2Z5S8B|/\\,.\'\"';

/* =============== State =============== */
let passwords = [];
let allTags = new Set();
let activeFilterTags = [];
let currentEmployeePriceGroups = [];
let currentServiceTags = [];
let editingPasswordId = null;
let editingTags = [];
let activeTab = 'employee'; // 'employee', 'service' или 'note'

/* =============== Collapse helpers (без глобальной переменной) =============== */
function setSettingsCollapsed(isCollapsed) {
    if (!passwordControls || !toggleSettingsBtn) return;
    passwordControls.classList.toggle('collapsed', isCollapsed);
    toggleSettingsBtn.classList.toggle('collapsed', isCollapsed);
}
function isSettingsCollapsed() {
    return passwordControls?.classList.contains('collapsed');
}

/* =============== INIT =============== */

/* =============== Data migration для старых записей =============== */
async function migrateOldPasswords() {
    let migrated = false;

    passwords = passwords.map(p => {
        // Если нет category, определяем её автоматически
        if (!p.category) {
            migrated = true;
            // Если есть phone - это сотрудник, иначе сервис
            p.category = p.phone ? 'employee' : 'service';
            console.log(`Migrated password ${p.id} to category: ${p.category}`);
        }

        // Если нет date, но есть createdAt
        if (!p.date && p.createdAt) {
            migrated = true;
            const date = new Date(p.createdAt);
            p.date = date.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            console.log(`Added date field to password ${p.id}`);
        }

        // Если нет createdAt
        if (!p.createdAt) {
            migrated = true;
            p.createdAt = new Date(p.id || Date.now()).toISOString();
            console.log(`Added createdAt field to password ${p.id}`);
        }

        // Если у employee нет description, создаем из email
        if (p.category === 'employee' && !p.description && p.email) {
            migrated = true;
            p.description = p.email.split('@')[0].replace(/\./g, ' ').split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            console.log(`Added description to employee ${p.id}: ${p.description}`);
        }

        return p;
    });

    // Если были миграции, сохраняем
    if (migrated) {
        console.log('Migration completed, saving passwords...');
        await savePasswords();
    }
}

/* =============== INIT =============== */
async function init() {
    await loadPasswords();
    await migrateOldPasswords(); // ДОБАВЛЕНО: автоматическая миграция старых данных
    await loadNotepad();
    renderPasswords();
    updateTagFilterUI();

    // Стартуем со свернутыми настройками
    setSettingsCollapsed(true);

    if (window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'note' || tabParam === 'service' || tabParam === 'employee') {
            switchTab(tabParam);
        }
    }

    console.log('Script loaded successfully');
}


/* =============== Toggle settings =============== */
function togglePasswordSettings() {
    setSettingsCollapsed(!isSettingsCollapsed());
}

/* =============== Password generation =============== */
function generatePassword() {
    const length = parseInt(lengthSlider.value, 10);
    let charset = '';

    if (activeTab === 'employee' && manualPasswordCheckbox?.checked) {
        manualPasswordCheckbox.checked = false;
        toggleManualPassword('employee');
    }

    if (activeTab === 'service' && manualServicePasswordCheckbox?.checked) {
        manualServicePasswordCheckbox.checked = false;
        toggleManualPassword('service');
    }

    if (uppercaseCheckbox.checked) charset += 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('').filter(c => !EXCLUDED_CHARS.includes(c)).join('');
    if (lowercaseCheckbox.checked) charset += 'abcdefhjkmnprstuvwxyz'.split('').filter(c => !EXCLUDED_CHARS.includes(c)).join('');
    if (numbersCheckbox.checked)   charset += '34679'.split('').filter(c => !EXCLUDED_CHARS.includes(c)).join('');
    if (symbolsCheckbox.checked)   charset += '!@#$%^&*()_+-=[]{};<>?'.split('').filter(c => !EXCLUDED_CHARS.includes(c)).join('');

    if (!charset) { showMessage('Выберите хотя бы один тип символов', 'error'); return; }

    let password = PASSWORD_PREFIX;
    for (let i = 0; i < length - PASSWORD_PREFIX.length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    const el = getPasswordDisplay();
    if (!el) { showMessage('Не найден блок для пароля', 'error'); return; }
    el.textContent = password;
    el.classList.remove('hidden');
}

function getActivePasswordValue() {
    if (activeTab === 'employee') {
        if (manualPasswordCheckbox?.checked) {
            return (manualPasswordField?.value || '').trim();
        }
        return (passwordDisplayEmployee?.textContent || '').trim();
    }

    if (activeTab === 'service') {
        if (manualServicePasswordCheckbox?.checked) {
            return (manualServicePasswordField?.value || '').trim();
        }
        return (passwordDisplayService?.textContent || '').trim();
    }

    return '';
}

function copyPassword() {
    const text = getActivePasswordValue();

    if (!text) { showMessage('Нет пароля для копирования', 'error'); return; }

    navigator.clipboard.writeText(text)
        .then(() => showMessage('Пароль скопирован', 'success'))
        .catch(() => showMessage('Ошибка копирования', 'error'));
}

/* =============== Tabs =============== */
function switchTab(tab) {
    if (tab !== 'employee' && tab !== 'service' && tab !== 'note') return;
    activeTab = tab;

    tabButtons.forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
    });

    // Показываем/скрываем контент вкладок
    employeeTab.classList.toggle('hidden', tab !== 'employee');
    serviceTab.classList.toggle('hidden', tab !== 'service');
    noteTab.classList.toggle('hidden', tab !== 'note');

    // Показываем/скрываем списки паролей
    employeePasswordsList.classList.toggle('hidden', tab !== 'employee');
    servicePasswordsList.classList.toggle('hidden', tab !== 'service');
    notesManagementPanel?.classList.toggle('hidden', tab !== 'note');

    // Фильтры тегов только для сервисов
    filterTagsDiv.classList.toggle('hidden', tab !== 'service');

    // Генератор паролей и заголовок скрываем на вкладке Note
    const passwordGenerator = document.getElementById('passwordGenerator');
    const mainContainer = document.querySelector('.container');
    const h1 = mainContainer?.querySelector('h1');

    if (passwordGenerator) {
        passwordGenerator.style.display = tab === 'note' ? 'none' : 'block';
    }
    if (h1) {
        h1.classList.toggle('hidden', tab === 'note');
    }

    // Скрываем второй контейнер (Сохранённые пароли) на вкладке Note
    // Добавляем класс для полноэкранного режима заметок
    const mainContainerEl = document.querySelector('.main-container');
    if (mainContainerEl) {
        mainContainerEl.classList.toggle('notes-active', tab === 'note');
    }

    const secondaryHeading = document.querySelectorAll('.container h1')[1];
    if (secondaryHeading) {
        secondaryHeading.textContent = tab === 'note' ? 'Заметки — экспорт и управление' : 'Сохранённые пароли';
    }

    // Рендерим пароли только для employee и service
    if (tab !== 'note') {
        renderPasswords();
    }
}

/* =============== Service tags =============== */
function addServiceTag() {
    const value = serviceTagInput.value.trim();
    if (!value) return;
    if (!currentServiceTags.includes(value)) {
        currentServiceTags.push(value);
        allTags.add(value);
        renderServiceTags();
        serviceTagInput.value = '';
    }
}
function removeServiceTag(tag) {
    currentServiceTags = currentServiceTags.filter(t => t !== tag);
    renderServiceTags();
}
function renderServiceTags() {
    if (currentServiceTags.length === 0) {
        selectedServiceTagsDiv.innerHTML = '<span class="placeholder">Теги не выбраны</span>';
        return;
    }
    selectedServiceTagsDiv.innerHTML = currentServiceTags.map(tag => `
    <span class="price-chip">
      ${escapeHtml(tag)}
      <button onclick="removeServiceTag('${escapeHtml(tag).replace(/'/g, "\\'")}')">×</button>
    </span>
  `).join('');
}

/* =============== Employee price groups =============== */
function addPriceGroup() {
    const value = employeePriceGroupInput.value.trim();
    if (!value) return;
    if (!currentEmployeePriceGroups.includes(value)) {
        currentEmployeePriceGroups.push(value);
        renderPriceGroups();
        employeePriceGroupInput.value = '';
    }
}
function removePriceGroup(group) {
    currentEmployeePriceGroups = currentEmployeePriceGroups.filter(g => g !== group);
    renderPriceGroups();
}
function renderPriceGroups() {
    if (currentEmployeePriceGroups.length === 0) {
        selectedPriceGroupsDiv.innerHTML = '<span class="placeholder">Группы не выбраны</span>';
        return;
    }
    selectedPriceGroupsDiv.innerHTML = currentEmployeePriceGroups.map(group => `
    <span class="price-chip">
      ${escapeHtml(group)}
      <button onclick="removePriceGroup('${escapeHtml(group)}')" aria-label="Удалить">×</button>
    </span>
  `).join('');
}

/* =============== Save password (employee/service) =============== */
async function saveEmployeePassword() {
    const email = employeeEmailInput.value.trim();
    const phone = employeePhoneInput.value.trim();
    const projectDescription = employeeProjectDescriptionInput.value.trim();

    if (!email || !phone || !projectDescription) { showMessage('Заполните обязательные поля (Email, Телефон, Описание)', 'error'); return; }

    const manualEmployeeValue = manualPasswordField ? manualPasswordField.value.trim() : '';
    const password = manualPasswordCheckbox?.checked
        ? manualEmployeeValue
        : ((passwordDisplayEmployee ? passwordDisplayEmployee.textContent : '') || '').trim();

    if (!password) { showMessage('Сначала создайте или введите пароль', 'error'); return; }

    const now = new Date();
    const existingPassword = editingPasswordId ? passwords.find(p => p.id === editingPasswordId) : null;

    // Извлекаем имя из email для description
    const description = email.split('@')[0].replace(/\./g, ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const passwordData = {
        id: editingPasswordId || Date.now(),
        category: 'employee',
        description: description,
        password,
        email,
        phone,
        projectDescription,
        priceGroups: [...currentEmployeePriceGroups],
        tags: existingPassword?.tags || [],
        date: now.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + (editingPasswordId ? ' (изменено)' : ''),
        createdAt: existingPassword?.createdAt || now.toISOString()
    };

    if (editingPasswordId) {
        passwords = passwords.map(p => p.id === editingPasswordId ? passwordData : p);
        showMessage('Пароль обновлён', 'success');
    } else {
        passwords.push(passwordData);
        showMessage('Пароль сохранён', 'success');
    }

    await savePasswords();
    clearEmployeeForm();
    renderPasswords();
}

async function saveServicePassword() {
    const description = serviceDescriptionInput.value.trim();
    if (!description) { showMessage('Заполните название сервиса', 'error'); return; }

    const manualServiceValue = manualServicePasswordField ? manualServicePasswordField.value.trim() : '';
    const password = manualServicePasswordCheckbox?.checked
        ? manualServiceValue
        : ((passwordDisplayService ? passwordDisplayService.textContent : '') || '').trim();
    if (!password) { showMessage('Сначала создайте или введите пароль', 'error'); return; }

    const email = serviceEmailInput.value.trim();
    const url = serviceUrlInput.value.trim();
    const projectDescription = serviceProjectDescriptionInput.value.trim();
    const startDate = serviceStartDateInput.value;
    const endDate   = serviceEndDateInput.value;
    const paymentInfo = servicePaymentInfoInput.value.trim();

    const now = new Date();
    const existingPassword = editingPasswordId ? passwords.find(p => p.id === editingPasswordId) : null;

    const passwordData = {
        id: editingPasswordId || Date.now(),
        category: 'service',
        password,
        description,
        email,
        url,
        projectDescription,
        startDate,
        endDate,
        paymentInfo,
        tags: [...currentServiceTags],
        date: now.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + (editingPasswordId ? ' (изменено)' : ''),
        createdAt: existingPassword?.createdAt || now.toISOString()
    };

    if (editingPasswordId) {
        passwords = passwords.map(p => p.id === editingPasswordId ? passwordData : p);
        showMessage('Пароль обновлён', 'success');
    } else {
        passwords.push(passwordData);
        showMessage('Пароль сохранён', 'success');
    }

    currentServiceTags.forEach(tag => allTags.add(tag));

    await savePasswords();
    clearServiceForm();
    renderPasswords();
    updateTagFilterUI();
}

/* =============== Modal final save for service (редактирование) =============== */
async function finalSaveServicePassword() {
    const description = serviceDescriptionInput.value.trim();
    const email = serviceEmailInput.value.trim();
    const url   = serviceUrlInput.value.trim();
    const projectDescription = serviceProjectDescriptionInput.value.trim();
    const startDate = serviceStartDateInput.value;
    const endDate   = serviceEndDateInput.value;
    const paymentInfo = servicePaymentInfoInput.value.trim();
    const manualServiceValue = manualServicePasswordField ? manualServicePasswordField.value.trim() : '';
    const password = manualServicePasswordCheckbox?.checked
        ? manualServiceValue
        : ((passwordDisplayService ? passwordDisplayService.textContent : '') || '').trim();
    if (!password) { showMessage('Сначала создайте или введите пароль', 'error'); return; }

    const now = new Date();
    const existingPassword = passwords.find(p => p.id === editingPasswordId);

    const passwordData = {
        id: editingPasswordId,
        category: 'service',
        password,
        description,
        email,
        url,
        projectDescription,
        startDate,
        endDate,
        paymentInfo,
        tags: [...editingTags],
        date: now.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' (изменено)',
        createdAt: existingPassword?.createdAt || now.toISOString()
    };

    const idx = passwords.findIndex(p => p.id === editingPasswordId);
    if (idx !== -1) {
        passwords[idx] = passwordData;
        showMessage('Пароль обновлён', 'success');
    } else {
        passwords.push(passwordData);
        showMessage('Пароль сохранён', 'success');
    }

    editingTags.forEach(tag => allTags.add(tag));

    await savePasswords();
    clearServiceForm();
    renderPasswords();
    updateTagFilterUI();
}
/* =============== Clear forms =============== */
function clearEmployeeForm() {
    employeeEmailInput.value = '';
    employeePhoneInput.value = '';
    employeeProjectDescriptionInput.value = '';
    employeePriceGroupInput.value = '';
    currentEmployeePriceGroups = [];
    renderPriceGroups();
    editingPasswordId = null;
    resetPasswordDisplay();
}

function clearServiceForm() {
    serviceDescriptionInput.value = '';
    serviceEmailInput.value = '';
    serviceUrlInput.value = '';
    serviceProjectDescriptionInput.value = '';
    serviceStartDateInput.value = '';
    serviceEndDateInput.value = '';
    servicePaymentInfoInput.value = '';
    serviceTagInput.value = '';
    editingPasswordId = null;
    editingTags = [];
    currentServiceTags = [];
    renderServiceTags();
    resetPasswordDisplay();
}

function resetPasswordDisplay() {
    if (passwordDisplayEmployee) {
        passwordDisplayEmployee.textContent = '';
        passwordDisplayEmployee.classList.add('hidden');
    }
    if (passwordDisplayService)  {
        passwordDisplayService.textContent  = '';
        passwordDisplayService.classList.add('hidden');
    }
    if (manualPasswordField) manualPasswordField.value = '';
    if (manualServicePasswordField) manualServicePasswordField.value = '';

    if (manualPasswordCheckbox) {
        manualPasswordCheckbox.checked = false;
        toggleManualPassword('employee');
    } else if (manualPasswordInput) {
        manualPasswordInput.classList.remove('active');
    }

    if (manualServicePasswordCheckbox) {
        manualServicePasswordCheckbox.checked = false;
        toggleManualPassword('service');
    } else if (manualServicePasswordInput) {
        manualServicePasswordInput.classList.remove('active');
    }
}

/* =============== Tag modal =============== */
function openTagModal() {
    tagModal.style.display = 'flex';
    modalSearchInput.value = '';
    renderModalTags();
    updateModalSelectedTags();
}
function closeTagModal() {
    tagModal.style.display = 'none';
    modalSearchInput.value = '';
    modalNewTagInput.value = '';
}
function renderModalTags() {
    const searchTerm = modalSearchInput.value.toLowerCase();
    const availableTags = Array.from(allTags).filter(tag =>
        tag.toLowerCase().includes(searchTerm) && !editingTags.includes(tag)
    );

    if (availableTags.length === 0 && allTags.size === 0) {
        modalTagsList.innerHTML = '<p style="color: #9ca3af; text-align: center; font-size: 13px;">Нет доступных тегов. Создайте новый!</p>';
        return;
    }
    if (availableTags.length === 0 && allTags.size > 0) {
        modalTagsList.innerHTML = '<p style="color: #9ca3af; text-align: center; font-size: 13px;">Все теги уже выбраны</p>';
        return;
    }
    modalTagsList.innerHTML = availableTags.map(tag => `
    <div class="modal-tag-item" onclick="toggleTag('${escapeHtml(tag).replace(/'/g, "\\'")}')">
      <span class="modal-tag-name">${escapeHtml(tag)}</span>
    </div>
  `).join('');
}
function updateModalSelectedTags() {
    if (editingTags.length === 0) {
        modalSelectedTags.innerHTML = '<span style="color: #9ca3af; font-size: 12px;">Теги не выбраны</span>';
        return;
    }
    modalSelectedTags.innerHTML = editingTags.map(tag => `
    <span class="tag">
      ${escapeHtml(tag)}
      <span class="tag-remove" onclick="removeTagFromEditing('${escapeHtml(tag).replace(/'/g, "\\'")}')">×</span>
    </span>
  `).join('');
}
function toggleTag(tag) {
    if (!editingTags.includes(tag)) editingTags.push(tag);
    renderModalTags();
    updateModalSelectedTags();
}
function removeTagFromEditing(tag) {
    editingTags = editingTags.filter(t => t !== tag);
    renderModalTags();
    updateModalSelectedTags();
}
function createNewTag() {
    const tagName = modalNewTagInput.value.trim();
    if (!tagName) return;
    if (!allTags.has(tagName)) {
        allTags.add(tagName);
        editingTags.push(tagName);
        modalNewTagInput.value = '';
        renderModalTags();
        updateModalSelectedTags();
    } else if (!editingTags.includes(tagName)) {
        editingTags.push(tagName);
        modalNewTagInput.value = '';
        renderModalTags();
        updateModalSelectedTags();
    }
}

/* =============== Render passwords =============== */
function renderPasswords() {
    const searchTerm = (searchInput?.value || '').toLowerCase();
    const category = activeTab;

    let filtered = passwords.filter(p => p.category === category);

    if (searchTerm) {
        filtered = filtered.filter(p => {
            const searchableText = [
                p.password, p.email, p.phone, p.description, p.projectDescription,
                p.url, p.paymentInfo, ...(p.tags || []), ...(p.priceGroups || [])
            ].filter(Boolean).join(' ').toLowerCase();
            return searchableText.includes(searchTerm);
        });
    }

    if (category === 'service' && activeFilterTags.length > 0) {
        filtered = filtered.filter(p => activeFilterTags.some(tag => p.tags?.includes(tag)));
    }

    // Сортируем: новые пароли вверху (по убыванию id или createdAt)
    filtered.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.id).getTime();
        const timeB = new Date(b.createdAt || b.id).getTime();
        return timeB - timeA; // От новых к старым
    });

    const container = category === 'employee' ? employeePasswordsList : servicePasswordsList;

    if (filtered.length === 0) {
        const emptyMessage = searchTerm || activeFilterTags.length > 0
            ? 'Ничего не найдено'
            : `Паролей ${category === 'employee' ? 'сотрудников' : 'сервисов'} пока нет`;
        container.innerHTML = `
      <div class="empty-state">
        <svg fill="#9ca3af" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c-1.1 0-2-2-2-2zm0 16H5V5h14v14z"/>
          <path d="M7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
        </svg>
        <p>${escapeHtml(emptyMessage)}</p>
      </div>`;
        return;
    }

    container.innerHTML = filtered.map(p => p.category === 'employee'
        ? renderEmployeePassword(p)
        : renderServicePassword(p)
    ).join('');
}

function renderEmployeePassword(p) {
    const priceGroupsHtml = p.priceGroups?.length
        ? p.priceGroups.map(g => `<span class="tag-small">${escapeHtml(g)}</span>`).join('')
        : '<span style="color: #9ca3af; font-size: 12px;">Нет групп</span>';

    return `
    <div class="password-item">
      <div class="password-item-header">
        <div>
          <div class="password-item-title">${escapeHtml(p.email)}</div>
          <div class="password-item-email">Телефон: ${escapeHtml(p.phone)}</div>
          <div class="password-item-date">${formatDate(p.createdAt)}</div>
        </div>
      </div>
      <div class="password-item-value">${escapeHtml(p.password)}</div>
      <div style="margin-bottom: 8px;">
        <strong style="font-size: 12px; color: #6b7280;">Описание:</strong>
        <div style="font-size: 12px; color: #374151; margin-top: 4px;">${escapeHtml(p.projectDescription)}</div>
      </div>
      ${p.priceGroups?.length ? `
        <div style="margin-bottom: 8px;">
          <strong style="font-size: 12px; color: #6b7280;">Группы цен:</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">${priceGroupsHtml}</div>
        </div>` : ''}
      <div class="password-item-actions">
        <button onclick="copyPasswordById(${p.id})" class="copy-btn">Копировать пароль</button>
        <button onclick="editPassword(${p.id})" class="edit-btn">Редактировать</button>
        <button onclick="deletePassword(${p.id})" class="delete-btn">Удалить</button>
      </div>
    </div>`;
}

function renderServicePassword(p) {
    const tagsHtml = p.tags?.length
        ? p.tags.map(t => `<span class="tag-small">${escapeHtml(t)}</span>`).join(' ')
        : '';

    return `
    <div class="password-item">
      <div class="password-item-header">
        <div>
          <div class="password-item-title">${escapeHtml(p.description)}</div>
          ${p.email ? `<div class="password-item-email">${escapeHtml(p.email)}</div>` : ''}
          <div class="password-item-date">${formatDate(p.createdAt)}</div>
        </div>
      </div>
      ${tagsHtml ? `<div class="password-item-tags">${tagsHtml}</div>` : ''}
      <div class="password-item-value">${escapeHtml(p.password)}</div>
      ${p.url ? `
        <div style="margin-bottom: 8px;">
          <strong style="font-size: 12px; color: #6b7280;">URL:</strong>
          <div style="font-size: 12px; margin-top: 4px;">
            <a href="${escapeHtml(p.url)}" target="_blank" style="color: #2563eb; text-decoration: none;">${escapeHtml(p.url)}</a>
          </div>
        </div>` : ''}
      ${p.projectDescription ? `
        <div style="margin-bottom: 8px;">
          <strong style="font-size: 12px; color: #6b7280;">Описание:</strong>
          <div style="font-size: 12px; color: #374151; margin-top: 4px;">${escapeHtml(p.projectDescription)}</div>
        </div>` : ''}
      ${p.startDate || p.endDate ? `
        <div style="margin-bottom: 8px;">
          <strong style="font-size: 12px; color: #6b7280;">Период:</strong>
          <div style="font-size: 12px; color: #374151; margin-top: 4px;">${p.startDate || '—'} — ${p.endDate || '—'}</div>
        </div>` : ''}
      ${p.paymentInfo ? `
        <div style="margin-bottom: 8px;">
          <strong style="font-size: 12px; color: #6b7280;">Оплата:</strong>
          <div style="font-size: 12px; color: #374151; margin-top: 4px;">${escapeHtml(p.paymentInfo)}</div>
        </div>` : ''}
      <div class="password-item-actions">
        <button onclick="copyPasswordById(${p.id})" class="copy-btn">Копировать пароль</button>
        <button onclick="editPassword(${p.id})" class="edit-btn">Редактировать</button>
        <button onclick="deletePassword(${p.id})" class="delete-btn">Удалить</button>
      </div>
    </div>`;
}

/* =============== Password actions =============== */
function copyPasswordById(id) {
    const password = passwords.find(p => p.id === id);
    if (!password) return;
    navigator.clipboard.writeText(password.password).then(() => showMessage('Пароль скопирован', 'success'));
}
function editPassword(id) {
    const p = passwords.find(x => x.id === id);
    if (!p) return;

    editingPasswordId = id;

    if (p.category === 'employee') {
        switchTab('employee');
        if (passwordDisplayEmployee) {
            passwordDisplayEmployee.textContent = p.password;
            passwordDisplayEmployee.classList.remove('hidden');
        }
        if (manualPasswordCheckbox) {
            manualPasswordCheckbox.checked = false;
            toggleManualPassword('employee');
        }
        if (manualPasswordField) {
            manualPasswordField.value = '';
        }
        employeeEmailInput.value = p.email;
        employeePhoneInput.value = p.phone;
        employeeProjectDescriptionInput.value = p.projectDescription;
        currentEmployeePriceGroups = [...(p.priceGroups || [])];
        renderPriceGroups();
    } else {
        switchTab('service');
        if (passwordDisplayService) {
            passwordDisplayService.textContent = p.password;
            passwordDisplayService.classList.remove('hidden');
        }
        if (manualServicePasswordCheckbox) {
            manualServicePasswordCheckbox.checked = false;
            toggleManualPassword('service');
        }
        if (manualServicePasswordField) {
            manualServicePasswordField.value = '';
        }
        serviceDescriptionInput.value = p.description;
        serviceEmailInput.value = p.email || '';
        serviceUrlInput.value = p.url || '';
        serviceProjectDescriptionInput.value = p.projectDescription || '';
        serviceStartDateInput.value = p.startDate || '';
        serviceEndDateInput.value   = p.endDate || '';
        servicePaymentInfoInput.value = p.paymentInfo || '';
        currentServiceTags = [...(p.tags || [])];
        renderServiceTags();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showMessage('Редактирование пароля', 'info');
}
async function deletePassword(id) {
    if (!confirm('Удалить этот пароль?')) return;
    passwords = passwords.filter(p => p.id !== id);
    await savePasswords();
    renderPasswords();
    showMessage('Пароль удалён', 'success');
}

/* =============== Tag filters (Service) =============== */
function updateTagFilterUI() {
    if (activeTab !== 'service') return;

    const serviceTags = new Set();
    passwords.filter(p => p.category === 'service').forEach(p => p.tags?.forEach(t => serviceTags.add(t)));

    if (serviceTags.size === 0) { filterTagsDiv.innerHTML = ''; return; }

    filterTagsDiv.innerHTML = `
    <div style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">Фильтр по тегам:</div>
    <div class="tags-list">
      ${Array.from(serviceTags).map(tag => {
        const isActive = activeFilterTags.includes(tag);
        return `
          <span class="filter-tag ${isActive ? 'active' : ''}" onclick="toggleFilterTag('${escapeHtml(tag)}')">
            ${escapeHtml(tag)}
          </span>`;
    }).join('')}
      ${activeFilterTags.length > 0 ? '<button onclick="clearFilterTags()" class="manage-tags-btn" style="background: #ef4444;">Сбросить</button>' : ''}
    </div>`;
}
function toggleFilterTag(tag) {
    if (activeFilterTags.includes(tag)) activeFilterTags = activeFilterTags.filter(t => t !== tag);
    else activeFilterTags.push(tag);
    updateTagFilterUI();
    renderPasswords();
}
function clearFilterTags() {
    activeFilterTags = [];
    updateTagFilterUI();
    renderPasswords();
}

/* =============== Notepad (PHP API) =============== */
async function saveNotepad() {
    if (!notepadArea) return;
    try {
        const response = await fetch('api.php?action=saveNotepad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            body: JSON.stringify({ notepad: notepadArea.value })
        });
        const result = await response.json();
        if (!result.success) console.error('Ошибка сохранения блокнота:', result.error);
    } catch (e) { console.error('Ошибка сохранения блокнота:', e); }
}
async function loadNotepad() {
    if (!notepadArea) return;
    try {
        const response = await fetch('api.php?action=loadNotepad', {
            cache: 'no-store'
        });
        const result = await response.json();
        if (result.success) notepadArea.value = result.notepad || '';
        else console.error('Ошибка загрузки блокнота:', result.error);
    } catch (e) { console.error('Ошибка загрузки блокнота:', e); }
}
function copyNotepad() {
    if (!notepadArea) return;
    if (!notepadArea.value) { showNotepadMessage('Блокнот пуст', 'error'); return; }
    navigator.clipboard.writeText(notepadArea.value).then(() => showNotepadMessage('Скопировано', 'success'));
}
async function clearNotepad() {
    if (!notepadArea) return;
    if (!confirm('Очистить блокнот?')) return;
    notepadArea.value = '';
    await saveNotepad();
    showNotepadMessage('Блокнот очищен', 'success');
}

/* =============== Storage (PHP API) =============== */
async function savePasswords() {
    try {
        const response = await fetch('api.php?action=save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            body: JSON.stringify({ passwords })
        });
        const result = await response.json();
        if (!result.success) {
            console.error('Ошибка сохранения:', result.error);
            showMessage('Ошибка сохранения данных', 'error');
        }
    } catch (e) {
        console.error('Ошибка сохранения:', e);
        showMessage('Ошибка связи с сервером', 'error');
    }
}
async function loadPasswords() {
    try {
        const response = await fetch('api.php?action=load', {
            cache: 'no-store'
        });
        const result = await response.json();
        if (result.success) {
            passwords = result.passwords || [];
            allTags.clear();
            passwords.forEach(p => p.tags?.forEach(t => allTags.add(t)));
        } else {
            console.error('Ошибка загрузки:', result.error);
            showMessage('Ошибка загрузки данных', 'error');
        }
    } catch (e) {
        console.error('Ошибка загрузки:', e);
        showMessage('Ошибка связи с сервером', 'error');
    }
}

/* =============== Utilities =============== */
function showMessage(text, type = 'info') {
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = 'message';
    messageDiv.style.display = 'block';
    messageDiv.style.color = (type === 'error') ? '#ef4444' : (type === 'success') ? '#10b981' : '#6b7280';
    setTimeout(() => { messageDiv.style.display = 'none'; }, 3000);
}
function showNotepadMessage(text, type = 'info') {
    if (!notepadMessageDiv) return;
    notepadMessageDiv.textContent = text;
    notepadMessageDiv.className = 'message';
    notepadMessageDiv.style.display = 'block';
    notepadMessageDiv.style.color = (type === 'error') ? '#ef4444' : (type === 'success') ? '#10b981' : '#6b7280';
    setTimeout(() => { notepadMessageDiv.style.display = 'none'; }, 3000);
}
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* =============== Manual password toggle =============== */
function toggleManualPassword(category) {
    if (category === 'employee') {
        const display = passwordDisplayEmployee;
        if (!manualPasswordInput || !display || !manualPasswordCheckbox) return;

        if (manualPasswordCheckbox.checked) {
            manualPasswordInput.classList.add('active');
            display.classList.add('hidden');
            manualPasswordField && manualPasswordField.focus();
        } else {
            manualPasswordInput.classList.remove('active');
            if ((display.textContent || '').trim()) display.classList.remove('hidden');
            else display.classList.add('hidden');
        }
        return;
    }

    if (category === 'service') {
        const display = passwordDisplayService;
        if (!manualServicePasswordInput || !display || !manualServicePasswordCheckbox) return;

        if (manualServicePasswordCheckbox.checked) {
            manualServicePasswordInput.classList.add('active');
            display.classList.add('hidden');
            manualServicePasswordField && manualServicePasswordField.focus();
        } else {
            manualServicePasswordInput.classList.remove('active');
            if ((display.textContent || '').trim()) display.classList.remove('hidden');
            else display.classList.add('hidden');
        }
    }
}

/* =============== Event listeners =============== */
lengthSlider.addEventListener('input', () => { lengthValue.textContent = lengthSlider.value; });
searchInput.addEventListener('input', renderPasswords);
tabButtons.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

let notepadSaveTimeout;
if (notepadArea) {
    notepadArea.addEventListener('input', () => {
        clearTimeout(notepadSaveTimeout);
        notepadSaveTimeout = setTimeout(saveNotepad, 1000);
    });
}

manualPasswordCheckbox?.addEventListener('change', () => toggleManualPassword('employee'));
manualServicePasswordCheckbox?.addEventListener('change', () => toggleManualPassword('service'));

generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyPassword);
toggleSettingsBtn.addEventListener('click', togglePasswordSettings);

addPriceGroupBtn.addEventListener('click', addPriceGroup);
employeePriceGroupInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addPriceGroup(); });
saveEmployeeBtn.addEventListener('click', saveEmployeePassword);

addServiceTagBtn.addEventListener('click', addServiceTag);
serviceTagInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addServiceTag(); });
saveServiceBtn.addEventListener('click', saveServicePassword);

modalCloseBtn.addEventListener('click', closeTagModal);
modalCancelBtn.addEventListener('click', closeTagModal);
modalSaveBtn.addEventListener('click', () => { finalSaveServicePassword(); closeTagModal(); });
modalSearchInput.addEventListener('input', renderModalTags);
createTagBtn.addEventListener('click', createNewTag);
modalNewTagInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') createNewTag(); });

if (copyNotepadBtn) copyNotepadBtn.addEventListener('click', copyNotepad);
if (clearNotepadBtn) clearNotepadBtn.addEventListener('click', clearNotepad);

tagModal.addEventListener('click', (e) => { if (e.target === tagModal) closeTagModal(); });

// Глобальные для inline-обработчиков
window.removePriceGroup       = removePriceGroup;
window.removeServiceTag       = removeServiceTag;
window.toggleTag              = toggleTag;
window.removeTagFromEditing   = removeTagFromEditing;
window.copyPasswordById       = copyPasswordById;
window.editPassword           = editPassword;
window.deletePassword         = deletePassword;
window.toggleFilterTag        = toggleFilterTag;
window.clearFilterTags        = clearFilterTags;

/* =============== Boot =============== */
document.addEventListener('DOMContentLoaded', init);
