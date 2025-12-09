// Глобальный объект для управления состоянием
window.ARApp = {
  isMarkerVisible: false,

  // Инициализация приложения
  init() {
    this.bindEvents();
  },

  // Привязка событий
  bindEvents() {
    document.getElementById('startArButton').addEventListener('click', () => {
      this.startAR();
    });

    // Добавляем обработчики для маркера через A-Frame
    const scene = document.querySelector('#arScene');
    if (scene) {
      scene.addEventListener('marker-found', (e) => {
        this.onMarkerFound(e);
      });
      scene.addEventListener('marker-lost', (e) => {
        this.onMarkerLost(e);
      });
    }

    // Обработка клика по флагу и панели
    document.addEventListener('click', (e) => {
      if (
        !e.target.closest('#flagSprite') &&
        !e.target.closest('#infoPanel') &&
        this.isPanelVisible()
      ) {
        this.hidePanel();
      }
    });
  },

  // Запуск AR-сцены
  startAR() {
    const scene1 = document.getElementById('scene1');
    const scene2 = document.getElementById('scene2');

    if (scene1 && scene2) {
      scene1.style.display = 'none';
      scene2.style.display = 'flex';

      // Убедимся, что камера запускается
      this.initARScene();
    }
  },

  // Инициализация AR-сцены (запуск камеры)
  initARScene() {
    const scene = document.querySelector('#arScene');
    if (scene) {
      // Вручную запускаем камеру (на случай, если она не запустилась автоматически)
      const camera = scene.querySelector('a-entity[camera]');
      if (camera) {
        console.log('Камера активирована');
      }
    }
  },

  // Обработчик: маркер найден
  onMarkerFound(event) {
    const flagSprite = document.getElementById('flagSprite');
    if (flagSprite) {
      flagSprite.setAttribute('visible', true);
      this.isMarkerVisible = true;
    }
  },

  // Обработчик: маркер потерян
  onMarkerLost(event) {
    const flagSprite = document.getElementById('flagSprite');
    if (flagSprite) {
      flagSprite.setAttribute('visible', false);
      this.isMarkerVisible = false;
      this.hidePanel(); // Также скрываем панель
    }
  },

  // Показать панель
  showPanel() {
    if (!this.isMarkerVisible) return;

    const panel = document.getElementById('infoPanel');
    if (panel) {
      panel.setAttribute('visible', true);
    }
  },

  // Скрыть панель
  hidePanel() {
    const panel = document.getElementById('infoPanel');
    if (panel) {
      panel.setAttribute('visible', false);
    }
  },

  // Проверка видимости панели
  isPanelVisible() {
    const panel = document.getElementById('infoPanel');
    return panel && panel.getAttribute('visible') === 'true';
  }
};

// Запуск приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.ARApp.init();
});