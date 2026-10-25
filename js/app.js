/* ============================================================
   Orbit New Tab — app.js
   Tile rendering, settings panel, chrome.storage persistence.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Default app list
  ---------------------------------------------------------- */
  const DEFAULT_APPS = [
    {
      id:        'netflix',
      name:      'Netflix',
      url:       'https://www.netflix.com',
      icon:      'app-icons/netflix.svg',
      glowColor: 'rgba(229, 9, 20, 0.55)'
    },
    {
      id:        'hotstar',
      name:      'JioHotstar',
      url:       'https://www.jiohotstar.com',
      icon:      'app-icons/hotstar.svg',
      glowColor: 'rgba(59, 130, 246, 0.55)'
    },
    {
      id:        'youtube',
      name:      'YouTube',
      url:       'https://www.youtube.com',
      icon:      'app-icons/youtube.svg',
      glowColor: 'rgba(255, 48, 48, 0.55)'
    },
    {
      id:        'chatgpt',
      name:      'ChatGPT',
      url:       'https://chat.openai.com',
      icon:      'app-icons/chatgpt.svg',
      glowColor: 'rgba(16, 163, 127, 0.55)'
    }
  ];

  /* ----------------------------------------------------------
     State
  ---------------------------------------------------------- */
  let apps          = [];
  let tileSize      = 'large';
  let animSpeed     = 'normal';
  let editMode      = false;

  /* ----------------------------------------------------------
     Storage helpers
  ---------------------------------------------------------- */
  function loadSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['apps', 'tileSize', 'animSpeed'], (data) => {
          apps      = data.apps      || JSON.parse(JSON.stringify(DEFAULT_APPS));
          tileSize  = data.tileSize  || 'large';
          animSpeed = data.animSpeed || 'normal';
          resolve();
        });
      } else {
        // Local-file fallback (testing without extension context)
        apps      = JSON.parse(JSON.stringify(DEFAULT_APPS));
        resolve();
      }
    });
  }

  function saveSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ apps, tileSize, animSpeed });
    }
  }

  /* ----------------------------------------------------------
     Render tiles
  ---------------------------------------------------------- */
  function renderTiles() {
    const grid = document.getElementById('tiles-grid');
    grid.innerHTML = '';
    grid.className = `tiles-grid tiles-grid--${tileSize}`;

    apps.forEach((app, index) => {
      const tile = document.createElement('a');
      tile.className  = 'tile';
      tile.href       = app.url;
      tile.dataset.appId = app.id;
      tile.style.setProperty('--glow-color', app.glowColor);
      tile.setAttribute('aria-label', app.name);
      tile.setAttribute('role', 'listitem');

      // Stagger entrance animations
      tile.style.animationDelay = `${index * 70}ms`;

      // Icon with fallback
      const iconSrc = app.icon || `https://www.google.com/s2/favicons?domain=${getDomain(app.url)}&sz=128`;

      tile.innerHTML = `
        <div class="tile__icon-wrap">
          <img
            class="tile__icon"
            src="${escapeAttr(iconSrc)}"
            alt=""
            draggable="false"
            onerror="this.src='app-icons/fallback.svg'"
          >
        </div>
        <span class="tile__name">${escapeHtml(app.name)}</span>
      `;

      if (editMode) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'tile__remove';
        removeBtn.setAttribute('aria-label', `Remove ${app.name}`);
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          removeApp(app.id);
        });
        tile.appendChild(removeBtn);
      }

      // Prevent navigation in edit mode
      tile.addEventListener('click', (e) => {
        if (editMode) e.preventDefault();
      });

      grid.appendChild(tile);
    });
  }

  /* ----------------------------------------------------------
     App CRUD
  ---------------------------------------------------------- */
  function removeApp(id) {
    apps = apps.filter(a => a.id !== id);
    saveSettings();
    renderTiles();
  }

  function addApp(name, url, glowColor) {
    const normalised = url.startsWith('http') ? url : `https://${url}`;
    const domain     = getDomain(normalised);
    const id         = domain.replace(/\./g, '-') + '-' + Date.now();

    apps.push({
      id,
      name:      name.trim(),
      url:       normalised,
      icon:      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      glowColor: glowColor || 'rgba(255, 255, 255, 0.40)'
    });

    saveSettings();
    renderTiles();
  }

  /* ----------------------------------------------------------
     Helpers
  ---------------------------------------------------------- */
  function getDomain(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); }
    catch { return url; }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;');
  }

  /* ----------------------------------------------------------
     Settings panel wiring
  ---------------------------------------------------------- */
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsPanel  = document.getElementById('settings-panel');
  const settingsClose  = document.getElementById('settings-close');

  function openPanel() {
    settingsPanel.classList.add('open');
    settingsToggle.classList.add('panel-open');
    settingsToggle.setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    settingsPanel.classList.remove('open');
    settingsToggle.classList.remove('panel-open');
    settingsToggle.setAttribute('aria-expanded', 'false');
  }

  settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.contains('open') ? closePanel() : openPanel();
  });

  settingsClose.addEventListener('click', closePanel);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsPanel.classList.contains('open')) closePanel();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      settingsPanel.classList.contains('open') &&
      !settingsPanel.contains(e.target) &&
      !settingsToggle.contains(e.target)
    ) {
      closePanel();
    }
  });

  /* ----------------------------------------------------------
     Tile size buttons
  ---------------------------------------------------------- */
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tileSize = btn.dataset.size;
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      saveSettings();
      renderTiles();
    });
  });

  /* ----------------------------------------------------------
     Animation speed buttons
  ---------------------------------------------------------- */
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      animSpeed = btn.dataset.speed;
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.documentElement.dataset.animSpeed = animSpeed;
      document.dispatchEvent(new CustomEvent('orbitAnimSpeedChange'));
      saveSettings();
    });
  });

  /* ----------------------------------------------------------
     Edit mode toggle
  ---------------------------------------------------------- */
  const editBtn = document.getElementById('edit-mode-toggle');

  editBtn.addEventListener('click', () => {
    editMode = !editMode;
    editBtn.textContent = editMode ? 'Done Editing' : 'Edit Tiles';
    renderTiles();
  });

  /* ----------------------------------------------------------
     Add-app form
  ---------------------------------------------------------- */
  document.getElementById('add-app-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = document.getElementById('new-app-name').value.trim();
    const url   = document.getElementById('new-app-url').value.trim();
    const hex   = document.getElementById('new-app-color').value;

    if (!name || !url) return;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    addApp(name, url, `rgba(${r}, ${g}, ${b}, 0.55)`);

    document.getElementById('new-app-name').value = '';
    document.getElementById('new-app-url').value  = '';
  });

  /* ----------------------------------------------------------
     Reset to defaults
  ---------------------------------------------------------- */
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Reset all tiles and settings to defaults?')) return;
    apps      = JSON.parse(JSON.stringify(DEFAULT_APPS));
    tileSize  = 'large';
    animSpeed = 'normal';
    saveSettings();
    applySettingsToUI();
    renderTiles();
  });

  /* ----------------------------------------------------------
     Apply loaded settings back to the UI controls
  ---------------------------------------------------------- */
  function applySettingsToUI() {
    // Tile size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === tileSize);
    });

    // Speed buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.speed === animSpeed);
    });

    // HTML data attribute (read by stars.js)
    document.documentElement.dataset.animSpeed = animSpeed;
  }

  /* ----------------------------------------------------------
     Boot
  ---------------------------------------------------------- */
  async function init() {
    await loadSettings();
    applySettingsToUI();
    renderTiles();
  }

  init();
})();
