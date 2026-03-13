// AdShield Pro - Options Page Logic

(async function () {
  'use strict';

  // ── Page Navigation ──────────────────────────────────────────────

  const navItems = document.querySelectorAll('.nav-item[data-page]');
  const pages = document.querySelectorAll('.page');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const pageId = item.dataset.page;
      navItems.forEach((n) => n.classList.remove('active'));
      pages.forEach((p) => p.classList.remove('active'));
      item.classList.add('active');
      const target = document.getElementById(`page-${pageId}`);
      if (target) target.classList.add('active');
    });
  });

  // ── Toast Helper ─────────────────────────────────────────────────

  const toastEl = document.getElementById('toast');
  let toastTimer;

  function showToast(message) {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  // ── Load Settings ────────────────────────────────────────────────

  const settingToggles = {
    'opt-globalEnabled': CONSTANTS.STORAGE_KEYS.GLOBAL_ENABLED,
    'opt-trackerBlocking': CONSTANTS.STORAGE_KEYS.TRACKER_BLOCKING,
    'opt-cookieBlocking': CONSTANTS.STORAGE_KEYS.COOKIE_BLOCKING,
    'opt-malwareProtection': CONSTANTS.STORAGE_KEYS.MALWARE_PROTECTION,
    'opt-badgeEnabled': CONSTANTS.STORAGE_KEYS.BADGE_ENABLED,
    'opt-acceptableAds': CONSTANTS.STORAGE_KEYS.ACCEPTABLE_ADS,
  };

  async function loadSettings() {
    const settings = await Messaging.sendToBackground(CONSTANTS.MESSAGES.GET_SETTINGS);
    for (const [elementId, storageKey] of Object.entries(settingToggles)) {
      const el = document.getElementById(elementId);
      if (el) {
        el.checked = settings[storageKey] ?? CONSTANTS.DEFAULTS[storageKey] ?? false;
      }
    }
  }

  // Bind setting toggles
  for (const [elementId, storageKey] of Object.entries(settingToggles)) {
    const el = document.getElementById(elementId);
    if (el) {
      el.addEventListener('change', async () => {
        await Messaging.sendToBackground(CONSTANTS.MESSAGES.UPDATE_SETTING, {
          key: storageKey,
          value: el.checked,
        });
        showToast('Setting updated');
      });
    }
  }

  // ── Filter Lists ─────────────────────────────────────────────────

  const filterToggles = document.querySelectorAll('[data-ruleset]');
  filterToggles.forEach((toggle) => {
    toggle.addEventListener('change', async () => {
      const rulesetId = toggle.dataset.ruleset;
      // Map ruleset to settings key
      const keyMap = {
        easyprivacy: CONSTANTS.STORAGE_KEYS.TRACKER_BLOCKING,
        malware_domains: CONSTANTS.STORAGE_KEYS.MALWARE_PROTECTION,
      };
      const settingKey = keyMap[rulesetId];
      if (settingKey) {
        await Messaging.sendToBackground(CONSTANTS.MESSAGES.UPDATE_SETTING, {
          key: settingKey,
          value: toggle.checked,
        });
      }
      showToast(`${rulesetId.replace(/_/g, ' ')} ${toggle.checked ? 'enabled' : 'disabled'}`);
    });
  });

  // Update filters button
  const updateFiltersBtn = document.getElementById('updateFiltersBtn');
  const lastUpdateTime = document.getElementById('lastUpdateTime');

  async function loadLastUpdate() {
    const ts = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.LAST_FILTER_UPDATE, null);
    if (ts) {
      lastUpdateTime.textContent = new Date(ts).toLocaleString();
    }
  }

  updateFiltersBtn.addEventListener('click', async () => {
    updateFiltersBtn.disabled = true;
    updateFiltersBtn.textContent = 'Updating...';
    try {
      await Messaging.sendToBackground(CONSTANTS.MESSAGES.UPDATE_FILTERS);
      await loadLastUpdate();
      showToast('Filters updated successfully');
    } catch {
      showToast('Filter update failed');
    }
    updateFiltersBtn.disabled = false;
    updateFiltersBtn.textContent = 'Update Now';
  });

  // ── Whitelist Management ─────────────────────────────────────────

  const whitelistInput = document.getElementById('whitelistInput');
  const addWhitelistBtn = document.getElementById('addWhitelistBtn');
  const whitelistContainer = document.getElementById('whitelistContainer');
  const exportWhitelistBtn = document.getElementById('exportWhitelistBtn');
  const importWhitelistBtn = document.getElementById('importWhitelistBtn');
  const importFileInput = document.getElementById('importFileInput');

  async function loadWhitelist() {
    const response = await Messaging.sendToBackground(CONSTANTS.MESSAGES.GET_WHITELIST);
    renderWhitelist(response.whitelist || []);
  }

  function renderWhitelist(list) {
    whitelistContainer.innerHTML = '';
    if (list.length === 0) {
      whitelistContainer.innerHTML =
        '<p style="color:#9CA3AF;font-size:13px;padding:8px 0;">No whitelisted sites yet.</p>';
      return;
    }
    list.forEach((domain) => {
      const item = document.createElement('div');
      item.className = 'whitelist-item';
      item.innerHTML =
        `<span class="domain">${escapeHtml(domain)}</span>` +
        `<button class="remove-btn" data-domain="${escapeHtml(domain)}" title="Remove">&times;</button>`;
      whitelistContainer.appendChild(item);
    });

    whitelistContainer.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await Messaging.sendToBackground(CONSTANTS.MESSAGES.REMOVE_WHITELIST, {
          hostname: btn.dataset.domain,
        });
        await loadWhitelist();
        showToast('Site removed from whitelist');
      });
    });
  }

  function sanitizeDomain(input) {
    let domain = input.trim().toLowerCase();
    // Strip protocol
    domain = domain.replace(/^https?:\/\//, '');
    // Strip path
    domain = domain.split('/')[0];
    // Strip port
    domain = domain.split(':')[0];
    return domain;
  }

  addWhitelistBtn.addEventListener('click', async () => {
    const domain = sanitizeDomain(whitelistInput.value);
    if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      showToast('Please enter a valid domain');
      return;
    }
    await Messaging.sendToBackground(CONSTANTS.MESSAGES.ADD_WHITELIST, { hostname: domain });
    whitelistInput.value = '';
    await loadWhitelist();
    showToast(`${domain} added to whitelist`);
  });

  whitelistInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addWhitelistBtn.click();
  });

  exportWhitelistBtn.addEventListener('click', async () => {
    const response = await Messaging.sendToBackground(CONSTANTS.MESSAGES.GET_WHITELIST);
    const list = response.whitelist || [];
    const text = list.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adshield-whitelist.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Whitelist exported');
  });

  importWhitelistBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const domains = text
      .split(/[\n,]+/)
      .map((d) => sanitizeDomain(d))
      .filter((d) => d && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d));

    for (const domain of domains) {
      await Messaging.sendToBackground(CONSTANTS.MESSAGES.ADD_WHITELIST, { hostname: domain });
    }
    await loadWhitelist();
    showToast(`Imported ${domains.length} domains`);
    importFileInput.value = '';
  });

  // ── Custom Rules ─────────────────────────────────────────────────

  const rulesEditor = document.getElementById('rulesEditor');
  const saveRulesBtn = document.getElementById('saveRulesBtn');
  const clearRulesBtn = document.getElementById('clearRulesBtn');

  async function loadCustomRules() {
    const rules = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.CUSTOM_RULES, []);
    rulesEditor.value = rules.join('\n');
  }

  saveRulesBtn.addEventListener('click', async () => {
    const lines = rulesEditor.value
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('!'));

    // Save each rule
    // First clear existing, then add new ones
    await StorageHelper.set({ [CONSTANTS.STORAGE_KEYS.CUSTOM_RULES]: lines });
    showToast(`${lines.length} rule(s) saved`);
  });

  clearRulesBtn.addEventListener('click', async () => {
    rulesEditor.value = '';
    await StorageHelper.set({ [CONSTANTS.STORAGE_KEYS.CUSTOM_RULES]: [] });
    showToast('Custom rules cleared');
  });

  // ── Statistics ───────────────────────────────────────────────────

  async function loadStats() {
    const stats = await Messaging.sendToBackground(CONSTANTS.MESSAGES.GET_STATS);

    document.getElementById('stat-totalAds').textContent = formatNumber(stats.total.ads);
    document.getElementById('stat-totalTrackers').textContent = formatNumber(stats.total.trackers);
    document.getElementById('stat-todayTotal').textContent = formatNumber(
      stats.today.ads + stats.today.trackers
    );

    // Per-site table
    const tbody = document.getElementById('siteStatsBody');
    tbody.innerHTML = '';
    const sites = Object.entries(stats.perSite || {}).sort(
      (a, b) => (b[1].ads + b[1].trackers) - (a[1].ads + a[1].trackers)
    );

    if (sites.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="color:#9CA3AF;text-align:center;">No data yet</td></tr>';
    } else {
      for (const [site, data] of sites) {
        const row = document.createElement('tr');
        row.innerHTML =
          `<td>${escapeHtml(site)}</td>` +
          `<td>${formatNumber(data.ads)}</td>` +
          `<td>${formatNumber(data.trackers)}</td>` +
          `<td><strong>${formatNumber(data.ads + data.trackers)}</strong></td>`;
        tbody.appendChild(row);
      }
    }
  }

  const resetStatsBtn = document.getElementById('resetStatsBtn');
  resetStatsBtn.addEventListener('click', async () => {
    if (!confirm('Reset all statistics? This cannot be undone.')) return;
    await Messaging.sendToBackground(CONSTANTS.MESSAGES.RESET_STATS);
    await loadStats();
    showToast('Statistics reset');
  });

  // ── Onboarding ───────────────────────────────────────────────────

  const onboardingOverlay = document.getElementById('onboarding');
  const onboardingTitle = document.getElementById('onboarding-title');
  const onboardingText = document.getElementById('onboarding-text');
  const onboardingNext = document.getElementById('onboarding-next');
  const stepDots = document.querySelectorAll('.step-dot');

  const onboardingSteps = [
    {
      title: 'Welcome to AdShield Pro!',
      text: 'Your ad blocker is ready! We\'re blocking ads, trackers, and malware to give you a cleaner, faster browsing experience.',
    },
    {
      title: 'Support Your Favorite Sites',
      text: 'You can whitelist websites you love so they continue earning ad revenue. Go to the Whitelist page anytime to manage this.',
    },
    {
      title: 'Stay Protected',
      text: 'Filter lists update automatically every 24 hours. We block ads, trackers, malware domains, and cookie banners — all with zero data collection.',
    },
    {
      title: 'You\'re All Set!',
      text: 'Enjoy ad-free, fast, and private browsing. Check the Statistics page to see how many ads we\'ve blocked for you.',
    },
  ];

  let currentStep = 0;

  function showOnboardingStep(step) {
    currentStep = step;
    onboardingTitle.textContent = onboardingSteps[step].title;
    onboardingText.textContent = onboardingSteps[step].text;
    stepDots.forEach((d, i) => d.classList.toggle('active', i === step));
    onboardingNext.textContent = step === onboardingSteps.length - 1 ? 'Get Started' : 'Next';
  }

  onboardingNext.addEventListener('click', async () => {
    if (currentStep < onboardingSteps.length - 1) {
      showOnboardingStep(currentStep + 1);
    } else {
      onboardingOverlay.classList.add('hidden');
      await StorageHelper.set({ [CONSTANTS.STORAGE_KEYS.ONBOARDING_DONE]: true });
    }
  });

  // Check if onboarding should show
  const urlParams = new URLSearchParams(window.location.search);
  const onboardingDone = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.ONBOARDING_DONE, false);
  if (urlParams.get('onboarding') === 'true' && !onboardingDone) {
    onboardingOverlay.classList.remove('hidden');
    showOnboardingStep(0);
  }

  // ── Utility Functions ────────────────────────────────────────────

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Initialize ───────────────────────────────────────────────────

  await loadSettings();
  await loadLastUpdate();
  await loadWhitelist();
  await loadCustomRules();
  await loadStats();
})();
