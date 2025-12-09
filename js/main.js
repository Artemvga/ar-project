// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let cameraStream = null;
let isFlagEnlarged = false;
let arScene = null;
let markerFound = false;

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

// Переключение на AR сцену
function switchToAR() {
    console.log("Переключение на AR сцену");
    
    // Скрыть меню
    document.getElementById('scene-menu').classList.remove('active');
    
    // Показать AR сцену
    document.getElementById('scene-ar').classList.add('active');
    
    // Показать лоадер
    document.getElementById('ar-loader').classList.add('active');
    updateLoaderText("Подготовка AR...");
    
    // Инициализировать AR
    initializeAR();
}

// Возврат в меню
function switchToMenu() {
    console.log("Возврат в меню");
    
    // Остановить камеру
    stopCamera();
    
    // Удалить AR сцену
    const container = document.getElementById('ar-container');
    if (container) {
        container.innerHTML = '';
    }
    
    // Скрыть AR сцену
    document.getElementById('scene-ar').classList.remove('active');
    
    // Показать меню
    document.getElementById('scene-menu').classList.add('active');
    
    // Скрыть лоадер
    document.getElementById('ar-loader').classList.remove('active');
    
    // Сброс состояния
    isFlagEnlarged = false;
    markerFound = false;
}

// Инициализация AR
function initializeAR() {
    console.log("Инициализация AR");
    
    // Проверить поддержку
    if (!checkARSupport()) {
        showError("Ваш браузер не поддерживает AR. Пожалуйста, используйте Chrome или Safari на мобильном устройстве.");
        return;
    }
    
    // Запросить разрешение на камеру
    requestCameraPermission()
        .then(() => {
            // Создать AR сцену
            createARScene();
        })
        .catch(error => {
            console.error("Ошибка доступа к камере:", error);
            showError("Не удалось получить доступ к камере. Разрешите доступ в настройках браузера.");
        });
}

// ========== ПРОВЕРКА ПОДДЕРЖКИ ==========

// Проверка поддержки AR
function checkARSupport() {
    console.log("Проверка поддержки AR");
    
    // Проверить WebGL
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.error("WebGL не поддерживается");
        return false;
    }
    
    // Проверить getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia не поддерживается");
        return false;
    }
    
    // Проверить A-Frame
    if (typeof AFRAME === 'undefined') {
        console.error("A-Frame не загружен");
        return false;
    }
    
    console.log("AR поддерживается");
    return true;
}

// ========== РАБОТА С КАМЕРОЙ ==========

// Запрос разрешения на камеру
function requestCameraPermission() {
    return new Promise((resolve, reject) => {
        updateLoaderText("Запрос доступа к камере...");
        
        // Создать модальное окно
        createCameraPermissionModal(resolve, reject);
    });
}

// Создание модального окна разрешения камеры
function createCameraPermissionModal(resolve, reject) {
    const modalHTML = `
        <div id="camera-permission-modal">
            <div class="permission-modal-content">
                <h2 class="permission-title">📷 Доступ к камере</h2>
                <p class="permission-text">
                    Для работы AR необходимо разрешить доступ к камере вашего устройства.
                    После нажатия "Разрешить" браузер запросит подтверждение.
                </p>
                <div class="permission-buttons">
                    <button class="permission-btn allow" id="allow-camera-btn">
                        Разрешить камеру
                    </button>
                    <button class="permission-btn deny" id="deny-camera-btn">
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Добавить модальное окно
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Обработчики кнопок
    document.getElementById('allow-camera-btn').onclick = () => {
        removePermissionModal();
        requestCameraAccess().then(resolve).catch(reject);
    };
    
    document.getElementById('deny-camera-btn').onclick = () => {
        removePermissionModal();
        reject(new Error('Пользователь отказал в доступе к камере'));
    };
}

// Удалить модальное окно разрешения
function removePermissionModal() {
    const modal = document.getElementById('camera-permission-modal');
    if (modal) {
        modal.remove();
    }
}

// Запрос доступа к камере
function requestCameraAccess() {
    return new Promise((resolve, reject) => {
        updateLoaderText("Подключение к камере...");
        
        // Настройки камеры
        const constraints = {
            audio: false,
            video: {
                facingMode: { ideal: 'environment' }, // Задняя камера
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        // Для iOS нужны особые настройки
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (isIOS) {
            constraints.video = {
                facingMode: { ideal: 'environment' }
            };
        }
        
        // Запросить камеру
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log("Камера подключена");
                cameraStream = stream;
                resolve();
            })
            .catch(error => {
                console.error("Ошибка getUserMedia:", error);
                
                // Попробовать упрощенные настройки
                updateLoaderText("Повторная попытка подключения...");
                
                const simpleConstraints = {
                    audio: false,
                    video: true
                };
                
                navigator.mediaDevices.getUserMedia(simpleConstraints)
                    .then(stream => {
                        cameraStream = stream;
                        resolve();
                    })
                    .catch(reject);
            });
    });
}

// Остановка камеры
function stopCamera() {
    if (cameraStream) {
        console.log("Остановка камеры");
        cameraStream.getTracks().forEach(track => {
            track.stop();
        });
        cameraStream = null;
    }
}

// ========== СОЗДАНИЕ AR СЦЕНЫ ==========

// Создание AR сцены
function createARScene() {
    console.log("Создание AR сцены");
    updateLoaderText("Создание AR сцены...");
    
    const container = document.getElementById('ar-container');
    
    // HTML для A-Frame сцены
    const sceneHTML = `
        <a-scene
            vr-mode-ui="enabled: false"
            loading-screen="enabled: false"
            embedded
            arjs="sourceType: webcam; 
                  trackingMethod: best; 
                  debugUIEnabled: false;
                  detectionMode: mono_and_matrix;
                  matrixCodeType: 3x3;"
            renderer="antialias: true; 
                      alpha: true; 
                      logarithmicDepthBuffer: true;"
        >
            <a-assets>
                <img id="flag-img" src="assets/sprite/Flag.png" crossorigin="anonymous">
            </a-assets>
            
            <a-marker
                id="marker"
                type="pattern"
                preset="custom"
                url="assets/markers/MarkerVacnecov.patt"
                emitevents="true"
                cursor="rayOrigin: mouse"
                raycaster="objects: .clickable"
            >
                <a-image
                    id="flag"
                    class="clickable"
                    src="#flag-img"
                    scale="0.25 0.25 0.25"
                    position="0 0.5 0"
                    rotation="-90 0 0"
                ></a-image>
            </a-marker>
            
            <a-entity camera></a-entity>
        </a-scene>
    `;
    
    // Вставить сцену
    container.innerHTML = sceneHTML;
    
    // Получить ссылку на сцену
    arScene = container.querySelector('a-scene');
    
    // Настроить обработчики событий после загрузки сцены
    arScene.addEventListener('loaded', () => {
        console.log("AR сцена загружена");
        setupEventListeners();
        document.getElementById('ar-loader').classList.remove('active');
        updateHint("Наведите камеру на маркер MarkerVacnecov");
    });
    
    // Обработка ошибок сцены
    arScene.addEventListener('error', (error) => {
        console.error("Ошибка AR сцены:", error);
        showError("Ошибка загрузки AR сцены. Пожалуйста, обновите страницу.");
    });
}

// ========== НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ==========

// Настройка обработчиков событий
function setupEventListeners() {
    console.log("Настройка обработчиков событий");
    
    // Обработчик для маркера
    const marker = document.getElementById('marker');
    if (marker) {
        marker.addEventListener('markerFound', () => {
            console.log("Маркер найден!");
            markerFound = true;
            updateHint("Маркер найден! Нажмите на флаг для увеличения");
        });
        
        marker.addEventListener('markerLost', () => {
            console.log("Маркер потерян");
            markerFound = false;
            updateHint("Наведите на маркер MarkerVacnecov");
        });
    }
    
    // Обработчик клика на флаге
    document.addEventListener('click', function(event) {
        if (!markerFound) return;
        
        // Проверить, был ли клик по флагу
        const flag = document.getElementById('flag');
        if (flag) {
            // Для A-Frame нужно использовать raycasting, но для простоты будем считать,
            // что любой клик при найденном маркере - это клик по флагу
            toggleFlagSize();
        }
    });
    
    // Обработчик касаний для мобильных
    document.addEventListener('touchstart', function(event) {
        if (!markerFound || event.touches.length !== 1) return;
        
        // Предотвратить масштабирование
        event.preventDefault();
        
        const flag = document.getElementById('flag');
        if (flag) {
            toggleFlagSize();
        }
    });
}

// Увеличение/уменьшение флага
function toggleFlagSize() {
    const flag = document.getElementById('flag');
    if (!flag) return;
    
    if (!isFlagEnlarged) {
        // Увеличить в 2 раза
        flag.setAttribute('scale', '0.5 0.5 0.5');
        isFlagEnlarged = true;
        updateHint("Флаг увеличен! Нажмите ещё раз для уменьшения");
        console.log("Флаг увеличен в 2 раза");
    } else {
        // Вернуть исходный размер
        flag.setAttribute('scale', '0.25 0.25 0.25');
        isFlagEnlarged = false;
        updateHint("Флаг уменьшен. Нажмите для увеличения");
        console.log("Флаг уменьшен до исходного размера");
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

// Обновление текста лоадера
function updateLoaderText(text) {
    const loaderText = document.getElementById('loader-text');
    if (loaderText) {
        loaderText.textContent = text;
    }
}

// Обновление подсказки
function updateHint(message) {
    const hint = document.getElementById('ar-hint');
    if (hint) {
        hint.textContent = message;
        
        // Анимация появления
        hint.style.opacity = '0';
        setTimeout(() => {
            hint.style.opacity = '1';
            hint.style.transition = 'opacity 0.3s ease';
        }, 50);
    }
}

// Показать ошибку
function showError(message) {
    // Скрыть лоадер
    document.getElementById('ar-loader').classList.remove('active');
    
    // Показать alert с ошибкой
    alert(message);
    
    // Вернуться в меню
    setTimeout(switchToMenu, 100);
}

// ========== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ==========

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("Страница загружена");
    
    // Определить устройство
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log("Мобильное устройство обнаружено");
        
        if (isSafari) {
            console.log("Браузер: Safari на iOS");
            // Добавить предупреждение для Safari
            const description = document.querySelector('.description');
            if (description) {
                description.innerHTML += '<br><small style="color: #4cc9f0;">Для Safari: разрешите камеру в настройках сайта</small>';
            }
        }
    }
    
    // Обработка закрытия страницы
    window.addEventListener('beforeunload', stopCamera);
    window.addEventListener('pagehide', stopCamera);
});

// ========== ЭКСПОРТ ФУНКЦИЙ ==========

// Экспорт функций для кнопок
window.switchToAR = switchToAR;
window.switchToMenu = switchToMenu;