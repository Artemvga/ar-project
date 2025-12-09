// ============================================
// ИНИЦИАЛИЗАЦИЯ ПЕРЕМЕННЫХ
// ============================================
const scene1 = document.getElementById('scene1');
const scene2 = document.getElementById('scene2');
const startButton = document.getElementById('startButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const instruction = document.getElementById('instruction');
const infoPanel = document.getElementById('infoPanel');
const panelOverlay = document.getElementById('panelOverlay');
const closePanel = document.getElementById('closePanel');
const backButton = document.getElementById('backButton');

// ============================================
// ПЕРЕХОД МЕЖДУ СЦЕНАМИ
// ============================================
startButton.addEventListener('click', async () => {
    scene1.classList.add('hidden');
    scene2.classList.add('active');
    loadingOverlay.classList.remove('hidden');

    // Небольшая задержка для инициализации AR
    setTimeout(() => {
        const arScene = document.querySelector('a-scene');
        
        if (arScene) {
            // Ждем загрузки AR.js
            arScene.addEventListener('loaded', () => {
                initARInteractions();
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                }, 1000);
            });

            // Если сцена уже загружена
            if (arScene.hasLoaded) {
                initARInteractions();
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                }, 1000);
            }
        }
    }, 500);
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ AR ВЗАИМОДЕЙСТВИЙ
// ============================================
function initARInteractions() {
    const flagSprite = document.getElementById('flagSprite');
    const marker = document.getElementById('markerVacnecov');

    // Удаляем все старые обработчики
    if (flagSprite) {
        // Очищаем старые обработчики
        const newFlag = flagSprite.cloneNode(true);
        flagSprite.parentNode.replaceChild(newFlag, flagSprite);
        
        // Получаем обновленный элемент
        const updatedFlag = document.getElementById('flagSprite');
        
        // Добавляем простой обработчик клика
        updatedFlag.addEventListener('click', (evt) => {
            console.log('Клик по флагу!');
            evt.stopPropagation();
            openInfoPanel();
        });
        
        // Для мобильных устройств
        updatedFlag.addEventListener('touchstart', (evt) => {
            console.log('Тап по флагу!');
            evt.stopPropagation();
            openInfoPanel();
            evt.preventDefault();
        });
    }

    // Обработка видимости маркера
    if (marker) {
        marker.addEventListener('markerFound', () => {
            console.log('Маркер найден!');
            instruction.textContent = 'Нажмите на флаг';
        });

        marker.addEventListener('markerLost', () => {
            console.log('Маркер потерян');
            instruction.textContent = 'Наведите камеру на маркер';
            closeInfoPanel();
        });
    }

    // Устанавливаем режим взаимодействия
    setupRaycaster();
}

// ============================================
// НАСТРОЙКА RAYCASTER ДЛЯ ОБНАРУЖЕНИЯ КЛИКОВ
// ============================================
function setupRaycaster() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Создаем простой курсор для кликов
    const cursor = document.createElement('a-entity');
    cursor.setAttribute('cursor', 'rayOrigin: mouse');
    cursor.setAttribute('raycaster', 'objects: .clickable; far: 1000');
    
    const camera = document.querySelector('[camera]');
    if (camera) {
        camera.appendChild(cursor);
    }

    // Обработка кликов через raycaster
    scene.addEventListener('click', (evt) => {
        const intersectedEl = evt.detail.intersectedEl;
        if (intersectedEl && intersectedEl.classList.contains('clickable')) {
            console.log('Клик через raycaster');
            openInfoPanel();
        }
    });
}

// ============================================
// УПРАВЛЕНИЕ ИНФОРМАЦИОННОЙ ПАНЕЛЬЮ
// ============================================
function openInfoPanel() {
    console.log('Открытие панели');
    infoPanel.classList.add('active');
    panelOverlay.classList.add('active');
    instruction.classList.add('hidden');
    
    // Вибрация при открытии (если поддерживается)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function closeInfoPanel() {
    infoPanel.classList.remove('active');
    panelOverlay.classList.remove('active');
    instruction.classList.remove('hidden');
}

// Обработчики закрытия панели
closePanel.addEventListener('click', closeInfoPanel);
panelOverlay.addEventListener('click', closeInfoPanel);
backButton.addEventListener('click', closeInfoPanel);

// ============================================
// ПРЕДОТВРАЩЕНИЕ МАСШТАБИРОВАНИЯ НА iOS
// ============================================
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
});

// Фикс для двойного тапа на iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ============================================
console.log('AR Project initialized');
console.log('Ready for AR experience');