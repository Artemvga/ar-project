// ============================================
// ИНИЦИАЛИЗАЦИЯ ПЕРЕМЕННЫХ
// ============================================
const scene1 = document.getElementById('scene1');
const scene2 = document.getElementById('scene2');
const startButton = document.getElementById('startButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const instruction = document.getElementById('instruction');

let arScene = null;

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
    const marker = document.getElementById('markerVacnecov');

    // Обработка видимости маркера
    if (marker) {
        marker.addEventListener('markerFound', () => {
            console.log('Маркер найден! Флаг отображается');
            instruction.textContent = 'Маркер найден!';
        });

        marker.addEventListener('markerLost', () => {
            console.log('Маркер потерян');
            instruction.textContent = 'Наведите камеру на маркер';
        });
    }
}

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
// ЛОГИРОВАНИЕ ДЛЯ ОТЛАДКИ
// ============================================
console.log('AR Project initialized');
console.log('Ready for AR experience - Simple Flag Display');