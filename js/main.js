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

let arScene = null;
let flagSprite = null;

// ============================================
// ПЕРЕХОД МЕЖДУ СЦЕНАМИ
// ============================================
startButton.addEventListener('click', async () => {
    scene1.classList.add('hidden');
    scene2.classList.add('active');
    loadingOverlay.classList.remove('hidden');

    // Небольшая задержка для инициализации AR
    setTimeout(() => {
        arScene = document.querySelector('a-scene');
        
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
    flagSprite = document.getElementById('flagSprite');
    const marker = document.getElementById('markerVacnecov');

    // Обработка клика по флагу
    if (flagSprite) {
        flagSprite.addEventListener('click', (evt) => {
            evt.stopPropagation();
            openInfoPanel();
        });

        // Альтернативный способ клика через raycaster
        flagSprite.addEventListener('raycaster-intersected', () => {
            flagSprite.classList.add('hovered');
        });

        flagSprite.addEventListener('raycaster-intersected-cleared', () => {
            flagSprite.classList.remove('hovered');
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

    // Добавляем компонент для обработки кликов в A-Frame
    AFRAME.registerComponent('cursor-listener', {
        init: function () {
            this.el.addEventListener('click', function (evt) {
                openInfoPanel();
            });
        }
    });

    // Применяем компонент к флагу
    if (flagSprite) {
        flagSprite.setAttribute('cursor-listener', '');
    }
}

// ============================================
// УПРАВЛЕНИЕ ИНФОРМАЦИОННОЙ ПАНЕЛЬЮ
// ============================================
function openInfoPanel() {
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
// ОБРАБОТКА КЛИКОВ НА КНОПКИ В ПАНЕЛИ
// ============================================
// Удалено - кнопки убраны из интерфейса

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
// КОМПОНЕНТ A-FRAME ДЛЯ ОБРАБОТКИ КЛИКОВ
// ============================================
AFRAME.registerComponent('clickable', {
    init: function () {
        this.el.addEventListener('mousedown', (evt) => {
            console.log('Клик по объекту');
        });
    }
});

// ============================================
// ДОПОЛНИТЕЛЬНЫЙ RAYCASTER ДЛЯ МОБИЛЬНЫХ
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const sceneEl = document.querySelector('a-scene');
        if (sceneEl && sceneEl.hasLoaded) {
            setupMobileRaycaster();
        } else if (sceneEl) {
            sceneEl.addEventListener('loaded', setupMobileRaycaster);
        }
    }, 2000);
});

function setupMobileRaycaster() {
    const camera = document.querySelector('[camera]');
    const flag = document.getElementById('flagSprite');
    
    if (!camera || !flag) return;

    // Создаем raycaster для обнаружения кликов
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    document.addEventListener('touchstart', (event) => {
        if (event.touches.length > 0 && !infoPanel.classList.contains('active')) {
            const touch = event.touches[0];
            
            // Нормализуем координаты
            mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

            // Получаем камеру Three.js
            const threeCamera = camera.getObject3D('camera');
            if (!threeCamera) return;

            raycaster.setFromCamera(mouse, threeCamera);

            // Получаем объект Three.js флага
            const flagObject = flag.object3D;
            if (!flagObject) return;

            // Проверяем пересечение
            const intersects = raycaster.intersectObject(flagObject, true);

            if (intersects.length > 0) {
                console.log('Клик по флагу через raycaster!');
                openInfoPanel();
            }
        }
    }, false);
}

// ============================================
// ЛОГИРОВАНИЕ ДЛЯ ОТЛАДКИ
// ============================================
console.log('AR Project initialized');
console.log('Ready for AR experience');