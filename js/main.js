let cameraStream = null;
let isFlagEnlarged = false;

// Переключение сцен
function switchToAR() {
    document.getElementById('scene-menu').classList.remove('active');
    document.getElementById('scene-ar').classList.add('active');
    startCamera();
}

function switchToMenu() {
    document.getElementById('scene-ar').classList.remove('active');
    document.getElementById('scene-menu').classList.add('active');
    stopCamera();
    resetFlag();
}

// Работа с камерой
function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        })
        .then(function(stream) {
            cameraStream = stream;
            setupFlagClick();
        })
        .catch(function(error) {
            alert('Разрешите доступ к камере');
            switchToMenu();
        });
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

// Работа с флагом
function setupFlagClick() {
    const scene = document.getElementById('ar-scene');
    
    scene.addEventListener('click', function(event) {
        const clicked = event.detail.intersection?.object?.el;
        if (clicked && clicked.id === 'flag') {
            toggleFlagSize();
        }
    });
    
    // Для мобильных
    scene.addEventListener('touchstart', function(event) {
        if (event.touches.length === 1) {
            const flag = document.getElementById('flag');
            if (flag) toggleFlagSize();
        }
    });
}

function toggleFlagSize() {
    const flag = document.getElementById('flag');
    if (!flag) return;
    
    if (!isFlagEnlarged) {
        flag.setAttribute('scale', '0.5 0.5 0.5');
        isFlagEnlarged = true;
    } else {
        flag.setAttribute('scale', '0.25 0.25 0.25');
        isFlagEnlarged = false;
    }
}

function resetFlag() {
    const flag = document.getElementById('flag');
    if (flag) {
        flag.setAttribute('scale', '0.25 0.25 0.25');
        isFlagEnlarged = false;
    }
}

// Экспорт
window.switchToAR = switchToAR;
window.switchToMenu = switchToMenu;

// Очистка при закрытии
window.addEventListener('beforeunload', stopCamera);