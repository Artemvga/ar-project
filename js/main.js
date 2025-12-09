// ============================================
// ПЕРЕМЕННЫЕ
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

let cameraEntity = null;
let flagObject = null;

// ============================================
// СТАРТ AR
// ============================================
startButton.addEventListener('click', () => {
    scene1.classList.add('hidden');
    scene2.classList.add('active');
    loadingOverlay.classList.remove('hidden');

    setTimeout(initAR, 600);
});

function initAR() {
    const sceneEl = document.querySelector('a-scene');

    const onLoaded = () => {
        cameraEntity = document.querySelector('[camera]');
        flagObject = document.getElementById('flagSprite')?.object3D;

        setupMarkerEvents();
        setupMobileRaycaster();

        setTimeout(() => loadingOverlay.classList.add('hidden'), 800);
    };

    if (sceneEl.hasLoaded) {
        onLoaded();
    } else {
        sceneEl.addEventListener('loaded', onLoaded);
    }
}

// ============================================
// СОБЫТИЯ МАРКЕРА
// ============================================
function setupMarkerEvents() {
    const marker = document.getElementById('markerVacnecov');

    marker.addEventListener('markerFound', () => {
        instruction.textContent = 'Нажмите на флаг';
    });

    marker.addEventListener('markerLost', () => {
        instruction.textContent = 'Наведите камеру на маркер';
        closeInfoPanel();
    });
}

// ============================================
// КЛИК ПО ФЛАГА — РАБОТАЕТ НА ВСЕХ ТЕЛЕФОНАХ
// ============================================
function setupMobileRaycaster() {
    if (!cameraEntity || !flagObject) return;

    const raycaster = new THREE.Raycaster();
    const touchPos = new THREE.Vector2();

    const onTouch = (e) => {
        if (infoPanel.classList.contains('active')) return;

        const touch = e.touches[0];
        touchPos.x = (touch.clientX / window.innerWidth) * 2 - 1;
        touchPos.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        const camera = cameraEntity.getObject3D('camera');
        if (!camera) return;

        raycaster.setFromCamera(touchPos, camera);

        const intersects = raycaster.intersectObject(flagObject, true);
        if (intersects.length > 0) return;

        openInfoPanel();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    document.addEventListener('touchstart', onTouch, { passive: true });
}

// ============================================
// ПАНЕЛЬ
// ============================================
function openInfoPanel() {
    infoPanel.classList.add('active');
    panelOverlay.classList.add('active');
    instruction.classList.add('hidden');
}

function closeInfoPanel() {
    infoPanel.classList.remove('active');
    panelOverlay.classList.remove('active');
    instruction.classList.remove('hidden');
}

closePanel.addEventListener('click', closeInfoPanel);
backButton.addEventListener('click', closeInfoPanel);
panelOverlay.addEventListener('click', closeInfoPanel);

// ============================================
// СТРАХОВКА: ПАНЕЛЬ ТОЧНО СКРЫТА ПРИ СТАРТЕ
// ============================================
window.addEventListener('load', () => {
    infoPanel.classList.remove('active');
    panelOverlay.classList.remove('active');
    infoPanel.style.bottom = '-100%';
    infoPanel.style.opacity = '0';
    infoPanel.style.visibility = 'hidden';
});

// Отключаем зум и двойной тап на iOS
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());

let lastTouch = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch <= 300) e.preventDefault();
    lastTouch = now;
}, false);

console.log('AR Project ready');