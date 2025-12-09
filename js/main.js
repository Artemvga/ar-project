// Основные переменные
let cameraStream = null;
let isFlagEnlarged = false;

// Переключение на AR сцену
function switchToAR() {
    // Скрыть меню, показать AR
    document.getElementById('scene-menu').classList.remove('active');
    document.getElementById('scene-ar').classList.add('active');
    
    // Запустить AR сцену
    startARScene();
}

// Переключение на меню
function switchToMenu() {
    // Остановить камеру
    stopCamera();
    
    // Скрыть AR, показать меню
    document.getElementById('scene-ar').classList.remove('active');
    document.getElementById('scene-menu').classList.add('active');
    
    // Сбросить состояние флага
    resetFlag();
}

// Запуск AR сцены
function startARScene() {
    // Запросить доступ к камере
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        })
        .then(function(stream) {
            cameraStream = stream;
            console.log('Доступ к камере разрешен');
            setupFlagInteraction();
        })
        .catch(function(error) {
            console.error('Ошибка доступа к камере:', error);
            alert('Для работы AR разрешите доступ к камере');
            switchToMenu();
        });
    } else {
        alert('Ваш браузер не поддерживает доступ к камере');
        switchToMenu();
    }
}

// Настройка взаимодействия с флагом
function setupFlagInteraction() {
    const scene = document.getElementById('ar-scene');
    
    if (!scene) return;
    
    // Обработчик клика по сцене
    scene.addEventListener('click', function(event) {
        // Проверяем, был ли клик по флагу
        const clickedElement = event.detail.intersection?.object?.el;
        
        if (clickedElement && clickedElement.id === 'flag-element') {
            toggleFlagSize();
        }
    });
    
    // Обработчик касания для мобильных
    scene.addEventListener('touchstart', function(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            
            // Имитируем клик в месте касания
            const clickEvent = new MouseEvent('click', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            
            scene.dispatchEvent(clickEvent);
            event.preventDefault();
        }
    });
}

// Переключение размера флага
function toggleFlagSize() {
    const flag = document.getElementById('flag-element');
    
    if (!flag) return;
    
    if (!isFlagEnlarged) {
        // Увеличить в 2 раза
        flag.setAttribute('scale', '0.6 0.6 0.6');
        isFlagEnlarged = true;
        console.log('Флаг увеличен');
    } else {
        // Вернуть исходный размер
        flag.setAttribute('scale', '0.3 0.3 0.3');
        isFlagEnlarged = false;
        console.log('Флаг уменьшен');
    }
}

// Сброс флага к исходному состоянию
function resetFlag() {
    const flag = document.getElementById('flag-element');
    
    if (flag) {
        flag.setAttribute('scale', '0.3 0.3 0.3');
        isFlagEnlarged = false;
    }
}

// Остановка камеры
function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

// Проверка поддержки при загрузке
window.addEventListener('DOMContentLoaded', function() {
    // Проверка WebGL
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
        alert('Ваш браузер не поддерживает WebGL. Обновите браузер.');
    }
    
    // Проверка iOS/Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
        console.log('iOS Safari обнаружен');
        // Добавляем класс для специфических стилей iOS
        document.body.classList.add('ios-safari');
    }
});

// Остановка камеры при закрытии страницы
window.addEventListener('beforeunload', function() {
    stopCamera();
});

// Экспорт функций для кнопок
window.switchToAR = switchToAR;
window.switchToMenu = switchToMenu;