// AdShield Pro - Popup Script

(function () {
  'use strict';

  // ── DOM Elements ─────────────────────────────────────────────────
  const elements = {
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    adsBlocked: document.getElementById('adsBlocked'),
    trackersBlocked: document.getElementById('trackersBlocked'),
    timeSaved: document.getElementById('timeSaved'),
    siteToggle: document.getElementById('siteToggle'),
    siteLabel: document.getElementById('siteLabel'),
    siteDomain: document.getElementById('siteDomain'),
    trackerToggle: document.getElementById('trackerToggle'),
    cookieToggle: document.getElementById('cookieToggle'),
    malwareToggle: document.getElementById('malwareToggle'),
    globalToggleBtn: document.getElementById('globalToggleBtn'),
    globalIcon: document.getElementById('globalIcon'),
    globalText: document.getElementById('globalText'),
    settingsBtn: document.getElementById('settingsBtn'),
    statsBtn: document.getElementById('statsBtn'),
    proBtn: document.getElementById('proBtn'),
  };

  let currentHostname = '';
  let globalEnabled = true;

  // ── Initialize ───────────────────────────────────────────────────
  async function init() {
    await loadCurrentTab();
    await loadSettings();
    await loadStats();
    attachEvents();
  }

  // ── Load current tab info ────────────────────────────────────────
  async function loadCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        try {
          const url = new URL(tab.url);
          currentHostname = url.hostname;
          elements.siteDomain.textContent = currentHostname;
        } catch {
          elements.siteDomain.textContent = 'N/A';
        }
      }
    } catch {
      elements.siteDomain.textContent = 'N/A';
    }
  }

  // ── Load settings ────────────────────────────────────────────────
  async function loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: CONSTANTS.MESSAGES.GET_SETTINGS,
      });

      if (response) {
        globalEnabled = response[CONSTANTS.STORAGE_KEYS.GLOBAL_ENABLED] !== false;
        const whitelist = response[CONSTANTS.STORAGE_KEYS.SITE_WHITELIST] || [];
        const siteEnabled = !whitelist.includes(currentHostname);

        elements.siteToggle.checked = siteEnabled;
        elements.siteLabel.textContent = siteEnabled ? 'Enabled on this site' : 'Disabled on this site';

        elements.trackerToggle.checked = response[CONSTANTS.STORAGE_KEYS.TRACKER_BLOCKING] !== false;
        elements.cookieToggle.checked = response[CONSTANTS.STORAGE_KEYS.COOKIE_BLOCKING] !== false;
        elements.malwareToggle.checked = response[CONSTANTS.STORAGE_KEYS.MALWARE_PROTECTION] !== false;

        updateGlobalUI();
      }
    } catch (e) {
      console.error('AdShield: Error loading settings', e);
    }
  }

  // ── Load stats ───────────────────────────────────────────────────
  async function loadStats() {
    try {
      const stats = await chrome.runtime.sendMessage({
        type: CONSTANTS.MESSAGES.GET_STATS,
      });

      if (stats) {
        elements.adsBlocked.textContent = formatNumber(stats.today.ads || 0);
        elements.trackersBlocked.textContent = formatNumber(stats.today.trackers || 0);

        // Estimate time saved (approx 50ms per blocked request)
        const totalBlocked = (stats.today.ads || 0) + (stats.today.trackers || 0);
        const secondsSaved = Math.round(totalBlocked * 0.05);
        elements.timeSaved.textContent = formatTimeSaved(secondsSaved);
      }
    } catch (e) {
      console.error('AdShield: Error loading stats', e);
    }
  }

  // ── Attach event listeners ───────────────────────────────────────
  function attachEvents() {
    // Site toggle
    elements.siteToggle.addEventListener('change', async () => {
      const enabled = elements.siteToggle.checked;
      elements.siteLabel.textContent = enabled ? 'Enabled on this site' : 'Disabled on this site';

      await chrome.runtime.sendMessage({
        type: CONSTANTS.MESSAGES.TOGGLE_SITE,
        hostname: currentHostname,
        enabled: enabled,
      });
    });

    // Tracker toggle
    elements.trackerToggle.addEventListener('change', async () => {
      await chrome.runtime.sendMessage({
        type: CONSTANTS.MESSAGES.UPDATE_SETTING,
        key: CONSTANTS.STORAGE_KEYS.TRACKER_BLOCKING,
        value: elements.trackerToggle.checked,
      });
    });

    // Cookie toggle
    elements.cookieToggle.addEventListener('change', async () => {
      await chrome.runtime.sendMessage({
        type: CONSTANTS.MESSAGES.UPDATE_SETTING,
        key: CONSTANTS.STORAGE_KEYS.COOKIE_BLOCKING,
        value: elements.cookieToggle.checked,
      });
    });

    // Malware toggle
    elements.malwareToggle.addEventListener('change', async () => {
      await chrome.runtime.sendMessage({
        type: CONSTANTS.MESSAGES.UPDATE_SETTING,
        key: CONSTANTS.STORAGE_KEYS.MALWARE_PROTECTION,
        value: elements.malwareToggle.checked,
      });
    });

    // Global toggle
    elements.globalToggleBtn.addEventListener('click', async () => {
      globalEnabled = !globalEnabled;
      updateGlobalUI();

      await chrome.runtime.sendMessage({
        type: CONSTANTS.MESSAGES.TOGGLE_GLOBAL,
        enabled: globalEnabled,
      });
    });

    // Footer nav
    elements.settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    elements.statsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'src/options/index.html#stats' });
    });

    elements.proBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'src/options/index.html#account' });
    });
  }

  // ── Update global toggle UI ──────────────────────────────────────
  function updateGlobalUI() {
    if (globalEnabled) {
      elements.statusDot.classList.remove('disabled');
      elements.statusText.textContent = 'Active';
      elements.globalToggleBtn.classList.remove('paused');
      elements.globalIcon.textContent = '⏸';
      elements.globalText.textContent = 'Pause AdShield';
      enableControls(true);
    } else {
      elements.statusDot.classList.add('disabled');
      elements.statusText.textContent = 'Paused';
      elements.globalToggleBtn.classList.add('paused');
      elements.globalIcon.textContent = '▶';
      elements.globalText.textContent = 'Resume AdShield';
      enableControls(false);
    }
  }

  // ── Enable/disable individual controls ───────────────────────────
  function enableControls(enabled) {
    const toggles = [
      elements.siteToggle,
      elements.trackerToggle,
      elements.cookieToggle,
      elements.malwareToggle,
    ];
    toggles.forEach((t) => {
      t.disabled = !enabled;
      t.closest('.control-row').style.opacity = enabled ? '1' : '0.5';
    });
  }

  // ── Utility: Format numbers ──────────────────────────────────────
  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  }

  // ── Utility: Format time saved ───────────────────────────────────
  function formatTimeSaved(seconds) {
    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) return Math.round(seconds / 60) + 'm';
    return (seconds / 3600).toFixed(1) + 'h';
  }

  // ── Start ────────────────────────────────────────────────────────
  init();
})();
