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
      id:        'google',
      name:      'Google',
      url:       'https://www.google.com',
      icon:      'https://logo.clearbit.com/google.com',
      glowColor: 'rgba(66, 133, 244, 0.55)'
    },
    {
      id:        'gmail',
      name:      'Gmail',
      url:       'https://mail.google.com',
      icon:      'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://mail.google.com&size=256',
      glowColor: 'rgba(234, 67, 53, 0.55)'
    },
    {
      id:        'twitter',
      name:      'Twitter',
      url:       'https://x.com',
      icon:      'https://logo.clearbit.com/x.com',
      glowColor: 'rgba(200, 200, 200, 0.40)'
    },
    {
      id:        'chatgpt',
      name:      'ChatGPT',
      url:       'https://chat.openai.com',
      icon:      'https://logo.clearbit.com/openai.com',
      glowColor: 'rgba(16, 163, 127, 0.55)'
    },
    {
      id:        'speedtest',
      name:      'Speedtest',
      url:       'https://www.speedtest.net',
      icon:      'https://logo.clearbit.com/speedtest.net',
      glowColor: 'rgba(0, 185, 150, 0.55)'
    },
    {
      id:        'strava',
      name:      'Strava',
      url:       'https://www.strava.com',
      icon:      'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.strava.com&size=256',
      glowColor: 'rgba(252, 76, 2, 0.55)'
    },
    {
      id:        'youtube',
      name:      'YouTube',
      url:       'https://www.youtube.com',
      icon:      'https://logo.clearbit.com/youtube.com',
      glowColor: 'rgba(255, 48, 48, 0.55)'
    },
    {
      id:        'ott-folder',
      type:      'folder',
      name:      'OTT',
      glowColor: 'rgba(139, 92, 246, 0.55)',
      apps: [
        {
          id:   'hotstar',
          name: 'JioHotstar',
          url:  'https://www.jiohotstar.com',
          icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.jiohotstar.com&size=256',
          glowColor: 'rgba(59, 130, 246, 0.55)'
        },
        {
          id:   'prime',
          name: 'Prime Video',
          url:  'https://www.primevideo.com',
          icon: 'https://logo.clearbit.com/primevideo.com',
          glowColor: 'rgba(0, 168, 225, 0.55)'
        },
        {
          id:   'plex',
          name: 'Plex',
          url:  'https://www.plex.tv',
          icon: 'https://logo.clearbit.com/plex.tv',
          glowColor: 'rgba(229, 160, 13, 0.55)'
        },
        {
          id:   'appletv',
          name: 'Apple TV+',
          url:  'https://tv.apple.com',
          icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://tv.apple.com&size=256',
          glowColor: 'rgba(255, 255, 255, 0.35)'
        },
        {
          id:   'sonyliv',
          name: 'SonyLIV',
          url:  'https://www.sonyliv.com',
          icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.sonyliv.com&size=256',
          glowColor: 'rgba(0, 112, 206, 0.55)'
        },
        {
          id:   'zee5',
          name: 'ZEE5',
          url:  'https://www.zee5.com',
          icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.zee5.com&size=256',
          glowColor: 'rgba(100, 28, 161, 0.55)'
        }
      ]
    },
    {
      id:        'applemusic',
      name:      'Apple Music',
      url:       'https://music.apple.com',
      icon:      'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://music.apple.com&size=256',
      glowColor: 'rgba(252, 60, 68, 0.55)'
    },
    {
      id:        'tickets-folder',
      type:      'folder',
      name:      'Tickets',
      glowColor: 'rgba(239, 68, 68, 0.55)',
      apps: [
        {
          id:   'pvr',
          name: 'PVR Cinemas',
          url:  'https://www.pvrcinemas.com',
          icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.pvrcinemas.com&size=256',
          glowColor: 'rgba(220, 38, 38, 0.55)'
        },
        {
          id:   'district',
          name: 'District',
          url:  'https://www.districtapp.in',
          icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.districtapp.in&size=256',
          glowColor: 'rgba(147, 51, 234, 0.60)'
        },
        {
          id:   'bookmyshow',
          name: 'BookMyShow',
          url:  'https://in.bookmyshow.com',
          icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://in.bookmyshow.com&size=256',
          glowColor: 'rgba(240, 20, 54, 0.60)'
        }
      ]
    },
    {
      id:        'shop-folder',
      type:      'folder',
      name:      'Shopping',
      glowColor: 'rgba(251, 146, 60, 0.55)',
      apps: [
        {
          id:   'flipkart',
          name: 'Flipkart',
          url:  'https://www.flipkart.com',
          icon: 'https://logo.clearbit.com/flipkart.com',
          glowColor: 'rgba(247, 148, 30, 0.55)'
        },
        {
          id:   'amazon',
          name: 'Amazon',
          url:  'https://www.amazon.in',
          icon: 'https://logo.clearbit.com/amazon.in',
          glowColor: 'rgba(255, 153, 0, 0.55)'
        },
        {
          id:   'ajio',
          name: 'AJIO',
          url:  'https://www.ajio.com',
          icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.ajio.com&size=256',
          glowColor: 'rgba(220, 38, 38, 0.55)'
        },
        {
          id:   'decathlon',
          name: 'Decathlon',
          url:  'https://www.decathlon.in',
          icon: 'https://logo.clearbit.com/decathlon.in',
          glowColor: 'rgba(0, 130, 200, 0.55)'
        },
        {
          id:   'souledstore',
          name: 'The Souled Store',
          url:  'https://www.thesouledstore.com',
          icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.thesouledstore.com&size=256',
          glowColor: 'rgba(239, 68, 68, 0.55)'
        }
      ]
    },
    {
      id:        'incognito',
      type:      'incognito',
      name:      'Incognito',
      url:       '',
      icon:      'app-icons/incognito.svg',
      glowColor: 'rgba(139, 92, 246, 0.55)'
    }
  ];

  /* ----------------------------------------------------------
     State
  ---------------------------------------------------------- */
  let apps          = [];
  let tileSize      = 'large';
  let animSpeed     = 'normal';
  let editMode      = false;
  let currentView   = { type: 'main' }; // or { type: 'folder', folder: app }

  /* ----------------------------------------------------------
     Storage helpers
  ---------------------------------------------------------- */
  const STORAGE_VERSION = 19;

  function loadSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['apps', 'tileSize', 'animSpeed', 'storageVersion'], (data) => {
          // Reset to defaults if version mismatch
          if (data.storageVersion !== STORAGE_VERSION) {
            apps      = JSON.parse(JSON.stringify(DEFAULT_APPS));
            tileSize  = 'large';
            animSpeed = 'normal';
            chrome.storage.sync.set({ apps, tileSize, animSpeed, storageVersion: STORAGE_VERSION });
          } else {
            apps      = data.apps      || JSON.parse(JSON.stringify(DEFAULT_APPS));
            tileSize  = data.tileSize  || 'large';
            animSpeed = data.animSpeed || 'normal';
          }
          resolve();
        });
      } else {
        apps = JSON.parse(JSON.stringify(DEFAULT_APPS));
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
    const grid     = document.getElementById('tiles-grid');
    grid.innerHTML = '';
    grid.className = `tiles-grid tiles-grid--${tileSize}`;

    const inFolder   = currentView.type === 'folder';
    const appsToShow = inFolder ? currentView.folder.apps : apps;

    // Exactly 2 rows — derive column count from item count
    const cols = Math.ceil(appsToShow.length / 2);
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    appsToShow.forEach((app, index) => {

      // ── Incognito tile ───────────────────────────────────
      if (!inFolder && app.type === 'incognito') {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.setProperty('--glow-color', app.glowColor);
        tile.style.animationDelay = `${index * 70}ms`;
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '0');
        tile.setAttribute('aria-label', 'Open Incognito window');
        tile.innerHTML = `
          <div class="tile__icon-wrap">
            <img class="tile__icon" src="app-icons/incognito.svg" alt="" draggable="false">
          </div>`;
        tile.addEventListener('click', () => {
          if (typeof chrome !== 'undefined' && chrome.windows) {
            chrome.windows.create({ incognito: true }, () => {
              if (chrome.runtime.lastError) {
                alert('Enable "Allow in Incognito" for Orbit New Tab in chrome://extensions.');
              }
            });
          }
        });
        tile.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tile.click(); }
        });
        grid.appendChild(tile);
        return;
      }

      // ── Folder tile (main view only) ────────────────────
      if (!inFolder && app.type === 'folder') {
        const tile = document.createElement('div');
        tile.className = 'tile tile--folder';
        tile.style.setProperty('--glow-color', app.glowColor);
        tile.style.animationDelay = `${index * 70}ms`;
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '0');
        tile.setAttribute('aria-label', `${app.name} folder`);

        const miniIcons = (app.apps || []).slice(0, 4).map(a => {
          const d = getDomain(a.url);
          return `<img class="folder-mini-icon" src="${escapeAttr(a.icon)}" alt=""
                       data-fallback1="https://www.google.com/s2/favicons?domain=${d}&sz=64"
                       data-fallback2="app-icons/fallback.svg">`;
        }).join('');

        tile.innerHTML = `<div class="folder-mini-grid">${miniIcons}</div>`;
        tile.addEventListener('click', () => openFolder(app));
        tile.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFolder(app); }
        });

        if (editMode) {
          const removeBtn = document.createElement('button');
          removeBtn.className = 'tile__remove';
          removeBtn.setAttribute('aria-label', 'Remove folder');
          removeBtn.textContent = '×';
          removeBtn.addEventListener('click', (e) => { e.stopPropagation(); removeApp(app.id); });
          tile.appendChild(removeBtn);
        }

        grid.appendChild(tile);
        return;
      }

      // ── Regular app tile ─────────────────────────────────
      const tile = document.createElement('a');
      tile.className = 'tile';
      tile.href      = app.url;
      tile.style.setProperty('--glow-color', app.glowColor);
      tile.setAttribute('aria-label', app.name);
      tile.setAttribute('role', 'listitem');
      tile.style.animationDelay = `${index * 70}ms`;

      const domain    = getDomain(app.url);
      const iconSrc   = app.icon || `https://logo.clearbit.com/${domain}`;
      const fallback1 = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

      tile.innerHTML = `
        <div class="tile__icon-wrap">
          <img class="tile__icon" src="${escapeAttr(iconSrc)}" alt=""
               draggable="false"
               data-fallback1="${escapeAttr(fallback1)}"
               data-fallback2="app-icons/fallback.svg">
        </div>
        <span class="tile__name">${escapeHtml(app.name)}</span>
      `;

      if (!inFolder && editMode) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'tile__remove';
        removeBtn.setAttribute('aria-label', `Remove ${app.name}`);
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault(); e.stopPropagation(); removeApp(app.id);
        });
        tile.appendChild(removeBtn);
      }

      tile.addEventListener('click', (e) => { if (editMode) e.preventDefault(); });
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
    if (e.key === 'Escape') {
      if (currentView.type === 'folder') { closeFolderView(); return; }
      if (settingsPanel.classList.contains('open')) closePanel();
    }
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
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ apps, tileSize, animSpeed, storageVersion: STORAGE_VERSION });
    }
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
     Folder open / close — full-page view switch
  ---------------------------------------------------------- */
  function openFolder(folder) {
    currentView = { type: 'folder', folder };
    renderTiles();
    showBackButton();
  }

  function closeFolderView() {
    currentView = { type: 'main' };
    renderTiles();
    hideBackButton();
  }

  function showBackButton() {
    let btn = document.getElementById('back-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'back-btn';
      btn.className = 'back-btn';
      btn.setAttribute('aria-label', 'Back to home');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
             stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      `;
      btn.addEventListener('click', closeFolderView);
      document.body.appendChild(btn);
    }
    requestAnimationFrame(() => btn.classList.add('visible'));
  }

  function hideBackButton() {
    const btn = document.getElementById('back-btn');
    if (btn) btn.classList.remove('visible');
  }

  /* ----------------------------------------------------------
     Icon fallback chain — handles tiles + folder modal images
  ---------------------------------------------------------- */
  document.body.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName !== 'IMG') return;
    if (!img.dataset.failed1 && img.dataset.fallback1) {
      img.dataset.failed1 = '1';
      img.src = img.dataset.fallback1;
    } else if (!img.dataset.failed2 && img.dataset.fallback2) {
      img.dataset.failed2 = '1';
      img.src = img.dataset.fallback2;
    }
  }, true);

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
