let cameraStream = null;
let isFlagEnlarged = false;
let arScene = null;

// Основная функция переключения на AR
function switchToAR() {
    console.log("Переключаемся на AR сцену");
    
    // Скрываем меню
    document.getElementById('scene-menu').classList.remove('active');
    
    // Показываем AR сцену
    document.getElementById('scene-ar').classList.add('active');
    
    // Показываем лоадер
    document.getElementById('ar-loader').classList.add('active');
    
    // Ждем немного, чтобы DOM обновился
    setTimeout(() => {
        initializeARScene();
    }, 100);
}

// Возврат в меню
function switchToMenu() {
    console.log("Возвращаемся в меню");
    
    // Останавливаем камеру
    stopCamera();
    
    // Удаляем сцену
    if (arScene) {
        arScene.parentNode.removeChild(arScene);
        arScene = null;
    }
    
    // Скрываем AR сцену
    document.getElementById('scene-ar').classList.remove('active');
    
    // Показываем меню
    document.getElementById('scene-menu').classList.add('active');
    
    // Скрываем лоадер и ошибки
    document.getElementById('ar-loader').classList.remove('active');
    hideCameraError();
}

// Инициализация AR сцены
function initializeARScene() {
    console.log("Инициализация AR сцены");
    
    // Проверяем поддержку
    if (!checkARSupport()) {
        showCameraError("Ваш браузер не поддерживает AR");
        return;
    }
    
    // Запрашиваем доступ к камере
    requestCameraAccess()
        .then(stream => {
            console.log("Доступ к камере получен");
            cameraStream = stream;
            
            // Скрываем лоадер
            document.getElementById('ar-loader').classList.remove('active');
            
            // Создаем AR сцену
            setupARScene();
            
            // Настраиваем клик на флаге
            setupFlagInteraction();
        })
        .catch(error => {
            console.error("Ошибка доступа к камере:", error);
            document.getElementById('ar-loader').classList.remove('active');
            showCameraError("Разрешите доступ к камере в настройках браузера");
        });
}

// Проверка поддержки AR
function checkARSupport() {
    // Проверяем WebGL
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.error("WebGL не поддерживается");
        return false;
    }
    
    // Проверяем getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia не поддерживается");
        return false;
    }
    
    return true;
}

// Запрос доступа к камере
function requestCameraAccess() {
    return new Promise((resolve, reject) => {
        // Для iOS Safari нужны особые настройки
        const constraints = {
            audio: false,
            video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(resolve)
            .catch(error => {
                // Пробуем снова с более простыми настройками
                console.log("Пробуем упрощенные настройки камеры");
                const simpleConstraints = {
                    audio: false,
                    video: true
                };
                
                navigator.mediaDevices.getUserMedia(simpleConstraints)
                    .then(resolve)
                    .catch(reject);
            });
    });
}

// Создание AR сцены
function setupARScene() {
    // Убедимся, что старая сцена удалена
    const oldScene = document.getElementById('ar-scene');
    if (oldScene) {
        oldScene.parentNode.removeChild(oldScene);
    }
    
    // Создаем новую сцену
    const sceneHTML = `
        <a-scene 
            vr-mode-ui="enabled: false"
            embedded
            arjs='sourceType: webcam; 
                  debugUIEnabled: false;
                  detectionMode: mono_and_matrix; 
                  matrixCodeType: 3x3;'
            renderer="antialias: true; alpha: true;"
            id="ar-scene">
            
            <a-marker 
                id="marker"
                type="pattern" 
                url="assets/markers/MarkerVacnecov.patt"
                raycaster="objects: .clickable"
                cursor="fuse: false; rayOrigin: mouse;"
                emitevents="true">
                
                <a-image 
                    id="flag"
                    class="clickable"
                    src="assets/sprite/Flag.png"
                    position="0 0.5 0"
                    scale="0.25 0.25 0.25"
                    rotation="-90 0 0"
                    look-at="[camera]">
                </a-image>
            </a-marker>
            
            <a-entity camera></a-entity>
        </a-scene>
    `;
    
    // Добавляем сцену в контейнер
    document.getElementById('ar-container').innerHTML = sceneHTML;
    
    // Получаем ссылку на сцену
    arScene = document.getElementById('ar-scene');
    
    // Ждем загрузки сцены
    if (arScene) {
        arScene.addEventListener('loaded', () => {
            console.log("AR сцена загружена");
            updateHint("Наведите камеру на маркер");
        });
        
        arScene.addEventListener('error', (error) => {
            console.error("Ошибка AR сцены:", error);
            showCameraError("Ошибка загрузки AR");
        });
    }
}

// Настройка клика на флаге
function setupFlagInteraction() {
    // Используем делегирование событий
    document.addEventListener('click', function(event) {
        // Для A-Frame нужно использовать компонент raycaster
        const flag = document.getElementById('flag');
        if (flag) {
            // Проверяем, был ли клик в области флага (упрощенно)
            const scene = document.getElementById('ar-scene');
            if (scene && scene.contains(event.target)) {
                toggleFlagSize();
            }
        }
    });
    
    // Для мобильных устройств
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length === 1) {
            const flag = document.getElementById('flag');
            if (flag) {
                toggleFlagSize();
                event.preventDefault(); // Предотвращаем масштабирование
            }
        }
    });
}

// Увеличение/уменьшение флага
function toggleFlagSize() {
    const flag = document.getElementById('flag');
    if (!flag) return;
    
    if (!isFlagEnlarged) {
        // Увеличиваем в 2 раза
        flag.setAttribute('scale', '0.5 0.5 0.5');
        isFlagEnlarged = true;
        updateHint("Флаг увеличен. Нажмите для уменьшения");
        console.log("Флаг увеличен");
    } else {
        // Возвращаем исходный размер
        flag.setAttribute('scale', '0.25 0.25 0.25');
        isFlagEnlarged = false;
        updateHint("Флаг уменьшен. Нажмите для увеличения");
        console.log("Флаг уменьшен");
    }
    
    // Через 3 секунды возвращаем обычную подсказку
    setTimeout(() => {
        if (document.getElementById('scene-ar').classList.contains('active')) {
            updateHint("Наведите на маркер MarkerVacnecov");
        }
    }, 3000);
}

// Остановка камеры
function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
            track.stop();
        });
        cameraStream = null;
    }
}

// Обновление подсказки
function updateHint(message) {
    const hint = document.getElementById('ar-hint');
    if (hint) {
        hint.textContent = message;
    }
}

// Показать ошибку камеры
function showCameraError(message) {
    // Создаем или находим элемент ошибки
    let errorEl = document.getElementById('camera-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'camera-error';
        errorEl.className = 'camera-error';
        document.getElementById('scene-ar').appendChild(errorEl);
        
        // Добавляем кнопку закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'OK';
        closeBtn.style.cssText = `
            margin-top: 10px;
            padding: 8px 20px;
            background: white;
            color: #ff3232;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => {
            errorEl.classList.remove('active');
            switchToMenu();
        };
        errorEl.appendChild(document.createElement('br'));
        errorEl.appendChild(closeBtn);
    }
    
    errorEl.innerHTML = message;
    errorEl.classList.add('active');
}

// Скрыть ошибку камеры
function hideCameraError() {
    const errorEl = document.getElementById('camera-error');
    if (errorEl) {
        errorEl.classList.remove('active');
    }
}

// Проверка при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("Страница загружена");
    
    // Проверяем, на мобильном ли мы устройстве
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isMobile && isSafari) {
        console.log("iOS Safari обнаружен");
        // Для iOS Safari могут потребоваться особые разрешения
    }
    
    // Обработка закрытия/обновления страницы
    window.addEventListener('beforeunload', stopCamera);
    window.addEventListener('pagehide', stopCamera);
});

// Экспорт функций для кнопок
window.switchToAR = switchToAR;
window.switchToMenu = switchToMenu;