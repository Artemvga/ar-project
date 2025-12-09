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

let arScene = null;
let flagSprite = null;

// ============================================
// ПЕРЕХОД МЕЖДУ СЦЕНАМИ
// ============================================
startButton.addEventListener('click', () => {
    scene1.classList.add('hidden');
    scene2.classList.add('active');
    loadingOverlay.classList.remove('hidden');

    // Отложим инициализацию, чтобы A-Frame успел создать сцену
    setTimeout(() => {
        arScene = document.querySelector('a-scene');
        if (arScene) {
            if (arScene.hasLoaded) {
                initARInteractions();
                hideLoading();
            } else {
                arScene.addEventListener('loaded', () => {
                    initARInteractions();
                    hideLoading();
                });
            }
        }
    }, 600);
});

function hideLoading() {
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
    }, 800);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ AR ВЗАИМОДЕЙСТВИЙ
// ============================================
function initARInteractions() {
    flagSprite = document.getElementById('flagSprite');
    const marker = document.getElementById('markerVacnecov');

    // Клик по флагу — только через A-Frame событие
    if (flagSprite) {
        flagSprite.addEventListener('click', (evt) => {
            evt.stopPropagation();
            openInfoPanel();
        });
    }

    // Обработка появления/исчезновения маркера
    if (marker) {
        marker.addEventListener('markerFound', () => {
            instruction.textContent = 'Нажмите на флаг';
        });

        marker.addEventListener('markerLost', () => {
            instruction.textContent = 'Наведите камеру на маркер';
            closeInfoPanel();
        });
    }
}

// ============================================
// УПРАВЛЕНИЕ ИНФОРМАЦИОННОЙ ПАНЕЛЬЮ
// ============================================
function openInfoPanel() {
    infoPanel.classList.add('active');
    panelOverlay.classList.add('active');
    instruction.classList.add('hidden');

    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function closeInfoPanel() {
    infoPanel.classList.remove('active');
    panelOverlay.classList.remove('active');
    instruction.classList.remove('hidden');
}

// Обработчики закрытия
closePanel.addEventListener('click', closeInfoPanel);
panelOverlay.addEventListener('click', closeInfoPanel);

// ============================================
// ЗАПРЕТ ЖЕСТОВ МАСШТАБИРОВАНИЯ НА iOS
// ============================================
['gesturestart', 'gesturechange', 'gestureend'].forEach(event => {
    document.addEventListener(event, e => e.preventDefault());
});

// Фикс двойного тапа
let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// ============================================
// ЛОГ
// ============================================
console.log('AR Project v1.0.2 initialized');