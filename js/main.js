let cameraStream = null;
let isFlagEnlarged = false;
let arScene = null;
let permissionRequested = false;

// Основная функция переключения на AR
function switchToAR() {
    console.log("Переключаемся на AR сцену");
    
    // Скрываем меню
    document.getElementById('scene-menu').classList.remove('active');
    
    // Показываем AR сцену
    document.getElementById('scene-ar').classList.add('active');
    
    // Показываем лоадер с запросом разрешения
    document.getElementById('ar-loader').classList.add('active');
    document.getElementById('ar-loader').innerHTML = "Запрашиваю разрешение на камеру...";
    
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
    
    // Сбрасываем флаг разрешения
    permissionRequested = false;
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
    requestCameraPermission()
        .then(stream => {
            console.log("Доступ к камере получен");
            cameraStream = stream;
            permissionRequested = true;
            
            // Скрываем лоадер
            document.getElementById('ar-loader').classList.remove('active');
            
            // Создаем AR сцену
            setupARScene();
            
            // Настраиваем клик на флаге
            setupFlagInteraction();
            
            // Обновляем подсказку
            updateHint("Камера активна. Наведите на маркер");
        })
        .catch(error => {
            console.error("Ошибка доступа к камере:", error);
            document.getElementById('ar-loader').classList.remove('active');
            
            // Определяем тип ошибки
            let errorMessage = "Не удалось получить доступ к камере";
            
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = "Доступ к камере запрещен. Разрешите доступ в настройках браузера.";
                showPermissionInstructions();
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage = "Камера не найдена. Убедитесь, что камера подключена и работает.";
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage = "Камера уже используется другим приложением. Закройте другие приложения, использующие камеру.";
            } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                errorMessage = "Требуемый тип камеры не найден. Используйте другую камеру.";
            } else if (error.name === 'SecurityError') {
                errorMessage = "Доступ к камере запрещен из соображений безопасности. Откройте сайт по HTTPS.";
            }
            
            showCameraError(errorMessage);
        });
}

// Функция запроса разрешения на камеру
function requestCameraPermission() {
    return new Promise((resolve, reject) => {
        // Сначала проверим текущее состояние разрешения
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'camera' })
                .then(permissionStatus => {
                    console.log("Текущий статус разрешения камеры:", permissionStatus.state);
                    
                    // Если уже разрешено, сразу запрашиваем камеру
                    if (permissionStatus.state === 'granted') {
                        console.log("Разрешение уже получено");
                        getUserMedia().then(resolve).catch(reject);
                    } 
                    // Если еще не решено, показываем запрос
                    else if (permissionStatus.state === 'prompt') {
                        console.log("Показываю запрос разрешения");
                        showPermissionRequest()
                            .then(() => getUserMedia().then(resolve).catch(reject))
                            .catch(reject);
                    }
                    // Если запрещено
                    else if (permissionStatus.state === 'denied') {
                        reject(new Error('PermissionDeniedError'));
                    }
                })
                .catch(() => {
                    // Если API permissions не поддерживается, сразу запрашиваем
                    console.log("API permissions не поддерживается, запрашиваю напрямую");
                    showPermissionRequest()
                        .then(() => getUserMedia().then(resolve).catch(reject))
                        .catch(reject);
                });
        } else {
            // Для браузеров без API permissions
            console.log("Прямой запрос камеры");
            showPermissionRequest()
                .then(() => getUserMedia().then(resolve).catch(reject))
                .catch(reject);
        }
    });
}

// Показать запрос разрешения
function showPermissionRequest() {
    return new Promise((resolve, reject) => {
        // Создаем модальное окно запроса разрешения
        const permissionModal = document.createElement('div');
        permissionModal.id = 'permission-modal';
        permissionModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            padding: 20px;
        `;
        
        permissionModal.innerHTML = `
            <div style="max-width: 400px;">
                <h2 style="color: #4cc9f0; margin-bottom: 20px;">📷 Разрешите доступ к камере</h2>
                <p style="margin-bottom: 20px; line-height: 1.5;">
                    Для работы AR необходимо разрешить доступ к камере вашего устройства.
                    Браузер запросит разрешение в следующем окне.
                </p>
                <p style="margin-bottom: 30px; color: #aaa; font-size: 0.9em;">
                    Разрешение необходимо только для отображения AR-контента.
                    Мы не сохраняем и не передаем видео с камеры.
                </p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="allow-camera" style="
                        background: #4cc9f0;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 25px;
                        font-size: 1.1em;
                        cursor: pointer;
                    ">Разрешить камеру</button>
                    <button id="deny-camera" style="
                        background: transparent;
                        color: #aaa;
                        border: 1px solid #aaa;
                        padding: 12px 30px;
                        border-radius: 25px;
                        font-size: 1.1em;
                        cursor: pointer;
                    ">Отказать</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(permissionModal);
        
        // Обработчики кнопок
        document.getElementById('allow-camera').onclick = () => {
            permissionModal.remove();
            resolve();
        };
        
        document.getElementById('deny-camera').onclick = () => {
            permissionModal.remove();
            reject(new Error('PermissionDeniedError'));
        };
        
        // Автоматическое закрытие через 30 секунд
        setTimeout(() => {
            if (document.getElementById('permission-modal')) {
                permissionModal.remove();
                reject(new Error('PermissionTimeoutError'));
            }
        }, 30000);
    });
}

// Получить доступ к камере (техническая функция)
function getUserMedia() {
    return new Promise((resolve, reject) => {
        // Оптимальные настройки для камеры
        const constraints = {
            audio: false,
            video: {
                facingMode: { ideal: 'environment' }, // Предпочитаем заднюю камеру
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                frameRate: { ideal: 30, max: 60 }
            }
        };
        
        // Для iOS нужно добавить дополнительные параметры
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (isIOS) {
            constraints.video = {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            };
        }
        
        console.log("Запрашиваю камеру с параметрами:", constraints);
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log("Камера успешно подключена");
                resolve(stream);
            })
            .catch(error => {
                console.error("Ошибка getUserMedia:", error);
                
                // Пробуем упрощенные настройки
                if (error.name === 'OverconstrainedError') {
                    console.log("Пробую упрощенные настройки камеры");
                    const simpleConstraints = {
                        audio: false,
                        video: true // Просто true, браузер сам выберет
                    };
                    
                    navigator.mediaDevices.getUserMedia(simpleConstraints)
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(error);
                }
            });
    });
}

// Показать инструкции по разрешению
function showPermissionInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'permission-instructions';
    instructions.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        padding: 20px;
    `;
    
    const browser = detectBrowser();
    let instructionsHTML = '';
    
    if (browser === 'safari') {
        instructionsHTML = `
            <div style="max-width: 400px;">
                <h2 style="color: #4cc9f0; margin-bottom: 20px;">📱 Для Safari на iOS</h2>
                <ol style="text-align: left; line-height: 1.6; margin-bottom: 30px;">
                    <li>Нажмите на кнопку "AA" в адресной строке Safari</li>
                    <li>Выберите "Настройки для этого сайта"</li>
                    <li>Найдите пункт "Камера"</li>
                    <li>Выберите "Разрешить" или "Спросить"</li>
                    <li>Обновите страницу</li>
                </ol>
            </div>
        `;
    } else if (browser === 'chrome-mobile') {
        instructionsHTML = `
            <div style="max-width: 400px;">
                <h2 style="color: #4cc9f0; margin-bottom: 20px;">📱 Для Chrome на Android</h2>
                <ol style="text-align: left; line-height: 1.6; margin-bottom: 30px;">
                    <li>Нажмите на иконку 🔒 в адресной строке</li>
                    <li>Найдите пункт "Камера"</li>
                    <li>Выберите "Разрешить"</li>
                    <li>Обновите страницу</li>
                </ol>
            </div>
        `;
    } else {
        instructionsHTML = `
            <div style="max-width: 400px;">
                <h2 style="color: #4cc9f0; margin-bottom: 20px;">🔧 Настройки разрешений</h2>
                <p style="margin-bottom: 20px; line-height: 1.5;">
                    Чтобы разрешить доступ к камере:
                </p>
                <ol style="text-align: left; line-height: 1.6; margin-bottom: 30px;">
                    <li>Найдите иконку камеры или замка в адресной строке</li>
                    <li>Нажмите на неё, чтобы открыть настройки сайта</li>
                    <li>Найдите настройки камеры и выберите "Разрешить"</li>
                    <li>Обновите страницу и попробуйте снова</li>
                </ol>
            </div>
        `;
    }
    
    instructionsHTML += `
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="retry-camera" style="
                background: #4cc9f0;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                cursor: pointer;
            ">Повторить</button>
            <button id="back-to-menu" style="
                background: transparent;
                color: #aaa;
                border: 1px solid #aaa;
                padding: 12px 30px;
                border-radius: 25px;
                cursor: pointer;
            ">Вернуться в меню</button>
        </div>
    `;
    
    instructions.innerHTML = instructionsHTML;
    document.body.appendChild(instructions);
    
    // Обработчики кнопок
    document.getElementById('retry-camera').onclick = () => {
        instructions.remove();
        setTimeout(switchToAR, 100);
    };
    
    document.getElementById('back-to-menu').onclick = () => {
        instructions.remove();
        switchToMenu();
    };
}

// Определить браузер
function detectBrowser() {
    const ua = navigator.userAgent;
    
    if (/iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua)) {
        return 'safari';
    } else if (/Android/.test(ua) && /Chrome/.test(ua)) {
        return 'chrome-mobile';
    } else if (/Chrome/.test(ua)) {
        return 'chrome';
    } else if (/Firefox/.test(ua)) {
        return 'firefox';
    }
    
    return 'other';
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

// Остальные функции оставляем без изменений (но они должны быть в файле)
// setupARScene(), setupFlagInteraction(), toggleFlagSize(), stopCamera(), etc.

// ... [остальные функции из предыдущего кода остаются без изменений] ...

// Проверка при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("Страница загружена");
    
    // Добавляем сообщение в меню о необходимости камеры
    const menuDescription = document.querySelector('.description');
    if (menuDescription) {
        menuDescription.innerHTML += '<br><small style="color: #4cc9f0; font-size: 0.9em;">Требуется доступ к камере</small>';
    }
    
    // Обработка закрытия/обновления страницы
    window.addEventListener('beforeunload', stopCamera);
    window.addEventListener('pagehide', stopCamera);
});

// Экспорт функций для кнопок
window.switchToAR = switchToAR;
window.switchToMenu = switchToMenu;