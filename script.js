// Глобальные переменные
let currentScreen = 1;
let userData = null;
let events = [];
let reports = [];
let chatMessages = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем сохраненные данные
    loadUserData();
    loadEvents();
    loadReports();
    loadChatMessages();
    
    // Инициализируем обработчики событий
    initializeEventListeners();
    
    // Показываем первый экран
    showScreen(1);
});

// Навигация между экранами
function showScreen(screenNumber) {
    // Проверяем доступ к экранам
    if (screenNumber > 4 && !userData) {
        alert('Необходимо пройти регистрацию для доступа к этой функции');
        return;
    }
    
    // Скрываем текущий экран
    const currentScreenElement = document.getElementById(`screen${currentScreen}`);
    if (currentScreenElement) {
        currentScreenElement.classList.remove('active');
        currentScreenElement.classList.add('prev');
    }
    
    // Показываем новый экран
    const newScreenElement = document.getElementById(`screen${screenNumber}`);
    if (newScreenElement) {
        newScreenElement.classList.remove('prev');
        newScreenElement.classList.add('active');
        currentScreen = screenNumber;
        
        // Обновляем данные на экране кабинета
        if (screenNumber === 4) {
            updateProfileInfo();
            updateChatMessages();
        }
    }
}

// Инициализация обработчиков событий
function initializeEventListeners() {
    // Регистрация
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
    
    // Загрузка аватара
    const avatarInput = document.getElementById('avatar');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
    
    // Создание мероприятия
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventCreation);
    }
    
    // Загрузка фото мероприятия
    const eventPhotoInput = document.getElementById('eventPhoto');
    if (eventPhotoInput) {
        eventPhotoInput.addEventListener('change', handleEventPhotoUpload);
    }
    
    // Создание отчёта
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportCreation);
    }
    
    // Загрузка фото отчёта
    const reportPhotosInput = document.getElementById('reportPhotos');
    if (reportPhotosInput) {
        reportPhotosInput.addEventListener('change', handleReportPhotosUpload);
    }
    
    // Валидация интересов
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
    interestCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', validateInterests);
    });
    
    // Валидация правил
    const rulesCheckbox = document.getElementById('rulesAccepted');
    if (rulesCheckbox) {
        rulesCheckbox.addEventListener('change', validateRules);
    }
}

// Обработка регистрации
function handleRegistration(e) {
    e.preventDefault();
    
    // Получаем данные формы
    const formData = new FormData(e.target);
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const city = document.getElementById('city').value.trim();
    const organization = document.getElementById('organization').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    
    // Проверяем обязательные поля
    if (!firstName || !lastName || !city || !organization || !whatsapp) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Проверяем интересы
    const selectedInterests = Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value);
    if (selectedInterests.length === 0) {
        alert('Пожалуйста, выберите минимум один интерес');
        return;
    }
    
    // Проверяем согласие с правилами
    const rulesAccepted = document.getElementById('rulesAccepted').checked;
    if (!rulesAccepted) {
        alert('Необходимо согласиться с правилами');
        return;
    }
    
    // Сохраняем данные пользователя
    userData = {
        firstName,
        lastName,
        city,
        organization,
        whatsapp,
        interests: selectedInterests,
        avatar: document.getElementById('avatarPreview').innerHTML,
        registrationDate: new Date().toISOString()
    };
    
    // Сохраняем в localStorage
    saveUserData();
    
    // Переходим в кабинет
    showScreen(4);
    
    // Добавляем сообщение в чат
    addChatMessage('system', 'Новый пользователь зарегистрировался!', 'Добро пожаловать в сообщество волонтёров!');
}

// Обработка загрузки аватара
function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('avatarPreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Аватар">`;
        };
        reader.readAsDataURL(file);
    }
}

// Обработка создания мероприятия
function handleEventCreation(e) {
    e.preventDefault();
    
    const eventData = {
        id: Date.now(),
        title: document.getElementById('eventTitle').value.trim(),
        description: document.getElementById('eventDescription').value.trim(),
        dateTime: document.getElementById('eventDateTime').value,
        address: document.getElementById('eventAddress').value.trim(),
        photo: document.getElementById('eventPhotoPreview').innerHTML,
        organizer: userData ? `${userData.firstName} ${userData.lastName}` : 'Аноним',
        city: userData ? userData.city : '',
        createdAt: new Date().toISOString()
    };
    
    // Проверяем обязательные поля
    if (!eventData.title || !eventData.description || !eventData.dateTime || !eventData.address) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Добавляем мероприятие
    events.push(eventData);
    saveEvents();
    
    // Добавляем сообщение в чат
    addChatMessage('event', eventData.title, `Новое мероприятие: ${eventData.description}. Дата: ${formatDateTime(eventData.dateTime)}. Адрес: ${eventData.address}`);
    
    // Очищаем форму
    e.target.reset();
    document.getElementById('eventPhotoPreview').innerHTML = '';
    
    // Переходим в кабинет
    showScreen(4);
}

// Обработка загрузки фото мероприятия
function handleEventPhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('eventPhotoPreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Фото мероприятия">`;
        };
        reader.readAsDataURL(file);
    }
}

// Обработка создания отчёта
function handleReportCreation(e) {
    e.preventDefault();
    
    const reportData = {
        id: Date.now(),
        title: document.getElementById('reportTitle').value.trim(),
        description: document.getElementById('reportDescription').value.trim(),
        participants: document.getElementById('participants').value.trim(),
        photos: document.getElementById('reportPhotosPreview').innerHTML,
        author: userData ? `${userData.firstName} ${userData.lastName}` : 'Аноним',
        createdAt: new Date().toISOString()
    };
    
    // Проверяем обязательные поля
    if (!reportData.title || !reportData.description) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Добавляем отчёт
    reports.push(reportData);
    saveReports();
    
    // Добавляем сообщение в чат
    addChatMessage('report', reportData.title, `Отчёт о мероприятии: ${reportData.description}${reportData.participants ? '. Участники: ' + reportData.participants : ''}`);
    
    // Очищаем форму
    e.target.reset();
    document.getElementById('reportPhotosPreview').innerHTML = '';
    
    // Переходим в кабинет
    showScreen(4);
}

// Обработка загрузки фото отчёта
function handleReportPhotosUpload(e) {
    const files = Array.from(e.target.files).slice(0, 6); // Максимум 6 фото
    const preview = document.getElementById('reportPhotosPreview');
    preview.innerHTML = '';
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Фото отчёта';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// Валидация интересов
function validateInterests() {
    const selectedInterests = Array.from(document.querySelectorAll('input[name="interests"]:checked'));
    const submitButton = document.querySelector('#registrationForm button[type="submit"]');
    
    if (selectedInterests.length > 0) {
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
    } else {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
    }
}

// Валидация правил
function validateRules() {
    const rulesAccepted = document.getElementById('rulesAccepted').checked;
    const submitButton = document.querySelector('#registrationForm button[type="submit"]');
    
    if (rulesAccepted) {
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
    } else {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
    }
}

// Обновление информации профиля
function updateProfileInfo() {
    if (!userData) return;
    
    const profileInfo = document.getElementById('profileInfo');
    if (profileInfo) {
        profileInfo.innerHTML = `
            <div class="profile-item">
                <span class="profile-label">Имя:</span>
                <span class="profile-value">${userData.firstName}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Фамилия:</span>
                <span class="profile-value">${userData.lastName}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Город:</span>
                <span class="profile-value">${userData.city}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Организация:</span>
                <span class="profile-value">${userData.organization}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">WhatsApp:</span>
                <span class="profile-value">${userData.whatsapp}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">Интересы:</span>
                <span class="profile-value">${userData.interests.map(interest => getInterestName(interest)).join(', ')}</span>
            </div>
        `;
    }
}

// Получение названия интереса
function getInterestName(value) {
    const names = {
        'animals': 'Животные',
        'ecology': 'Экология',
        'health': 'ЗОЖ',
        'culture': 'Культура'
    };
    return names[value] || value;
}

// Обновление сообщений чата
function updateChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        
        // Показываем последние 10 сообщений
        const recentMessages = chatMessages.slice(-10);
        
        recentMessages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';
            
            let icon = '';
            switch (message.type) {
                case 'event':
                    icon = '📅';
                    break;
                case 'report':
                    icon = '📝';
                    break;
                case 'system':
                    icon = '🎉';
                    break;
                default:
                    icon = '💬';
            }
            
            messageElement.innerHTML = `
                <h4>${icon} ${message.title}</h4>
                <p>${message.content}</p>
                <div class="timestamp">${formatDateTime(message.timestamp)}</div>
            `;
            
            chatMessages.appendChild(messageElement);
        });
    }
}

// Добавление сообщения в чат
function addChatMessage(type, title, content) {
    const message = {
        type,
        title,
        content,
        timestamp: new Date().toISOString()
    };
    
    chatMessages.push(message);
    saveChatMessages();
    updateChatMessages();
}

// Показ списка мероприятий
function showEventsList() {
    const modal = document.getElementById('eventsModal');
    const eventsList = document.getElementById('eventsList');
    
    if (eventsList) {
        eventsList.innerHTML = '';
        
        if (events.length === 0) {
            eventsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Пока нет доступных мероприятий</p>';
        } else {
            events.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                eventElement.innerHTML = `
                    <h4>${event.title}</h4>
                    <p>${event.description}</p>
                    <p><strong>Организатор:</strong> ${event.organizer}</p>
                    <p><strong>Город:</strong> ${event.city}</p>
                    <div class="event-date">📅 ${formatDateTime(event.dateTime)}</div>
                    <p><strong>Адрес:</strong> ${event.address}</p>
                `;
                eventsList.appendChild(eventElement);
            });
        }
    }
    
    modal.style.display = 'block';
}

// Закрытие модального окна
function closeEventsModal() {
    const modal = document.getElementById('eventsModal');
    modal.style.display = 'none';
}

// Форматирование даты и времени
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Сохранение данных в localStorage
function saveUserData() {
    if (userData) {
        localStorage.setItem('volunteerUserData', JSON.stringify(userData));
    }
}

function saveEvents() {
    localStorage.setItem('volunteerEvents', JSON.stringify(events));
}

function saveReports() {
    localStorage.setItem('volunteerReports', JSON.stringify(reports));
}

function saveChatMessages() {
    localStorage.setItem('volunteerChatMessages', JSON.stringify(chatMessages));
}

// Загрузка данных из localStorage
function loadUserData() {
    const saved = localStorage.getItem('volunteerUserData');
    if (saved) {
        userData = JSON.parse(saved);
    }
}

function loadEvents() {
    const saved = localStorage.getItem('volunteerEvents');
    if (saved) {
        events = JSON.parse(saved);
    }
}

function loadReports() {
    const saved = localStorage.getItem('volunteerReports');
    if (saved) {
        reports = JSON.parse(saved);
    }
}

function loadChatMessages() {
    const saved = localStorage.getItem('volunteerChatMessages');
    if (saved) {
        chatMessages = JSON.parse(saved);
    }
}

// Закрытие модального окна по клику вне его
window.addEventListener('click', function(event) {
    const modal = document.getElementById('eventsModal');
    if (event.target === modal) {
        closeEventsModal();
    }
});

// Обработка клавиши Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEventsModal();
    }
});
