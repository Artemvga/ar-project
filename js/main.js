// js/main.js
// Минимальная логика: Start/Stop AR, показывать флаг по markerFound, открывать панель только при клике на флаг.

document.addEventListener('DOMContentLoaded', function () {
  const btnStart = document.getElementById('btnStart');
  const btnStop = document.getElementById('btnStop');
  const status = document.getElementById('status');

  const arContainer = document.getElementById('arContainer');
  const arScene = document.getElementById('arScene');
  const marker = document.getElementById('markerVacnecov');
  const flag = document.getElementById('flag');

  const infoPanel = document.getElementById('infoPanel');
  const closeInfo = document.getElementById('closeInfo');

  let arStarted = false;
  let markerVisible = false;

  // Start: показать контейнер сцены
  btnStart.addEventListener('click', () => {
    if (arStarted) return;
    arContainer.style.display = 'block';
    status.textContent = 'starting...';
    arStarted = true;

    // Иногда a-scene генерирует renderstart — можно слушать, но не обязательно.
    // Обновим статус через небольшой таймаут, чтобы дать камере стартовать:
    setTimeout(() => { status.textContent = 'running'; }, 1000);
  });

  // Stop: скрыть сцену и сбросить видимость флага/панели
  btnStop.addEventListener('click', () => {
    if (!arStarted) return;
    arContainer.style.display = 'none';
    status.textContent = 'stopped';
    arStarted = false;
    markerVisible = false;
    if (flag) flag.setAttribute('visible', 'false');
    hideInfo();
  });

  // Обработка событий маркера (AR.js высылает markerFound/markerLost)
  if (marker) {
    marker.addEventListener('markerFound', () => {
      markerVisible = true;
      if (flag) flag.setAttribute('visible', 'true');
    });

    marker.addEventListener('markerLost', () => {
      markerVisible = false;
      if (flag) flag.setAttribute('visible', 'false');
      hideInfo();
    });
  }

  // Панель открывается ТОЛЬКО при нажатии на flag (a-image)
  if (flag) {
    // 'click' обычно работает в A-Frame при тапе по сущности
    flag.addEventListener('click', (evt) => {
      // Убедимся что маркер видим
      if (!markerVisible) return;
      showInfo();
      // Предотвратить распространение (чтобы не ловить другие общие клики)
      if (evt.stopPropagation) evt.stopPropagation();
    });
    // На случай мобильных браузеров — добавим touchstart тоже
    flag.addEventListener('touchstart', (evt) => {
      if (!markerVisible) return;
      showInfo();
      if (evt.stopPropagation) evt.stopPropagation();
    }, { passive: true });
  }

  // Закрытие панели
  if (closeInfo) closeInfo.addEventListener('click', hideInfo);

  // Также закрываем панель при нажатии в любом месте документа (но это не откроет её никогда)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#infoPanel') && infoPanel.style.display === 'block') {
      hideInfo();
    }
  });

  function showInfo() {
    infoPanel.style.display = 'block';
  }
  function hideInfo() {
    infoPanel.style.display = 'none';
  }

});
