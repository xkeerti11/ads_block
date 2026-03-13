// AdShield Pro - Background Service Worker

// Import dependencies
importScripts(
  '../utils/constants.js',
  '../utils/storage.js',
  '../utils/messaging.js',
  './stats-tracker.js',
  './rule-manager.js',
  './filter-updater.js'
);

// ── Extension Install / Startup ──────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('AdShield Pro installed/updated:', details.reason);

  // Initialize default settings
  await StorageHelper.initDefaults(CONSTANTS.DEFAULTS);

  // Initialize stats
  await StatsTracker.init();

  // Schedule filter updates
  await FilterUpdater.scheduleUpdates();

  // Apply saved whitelist as session rules
  await RuleManager.applyWhitelist();

  // Set badge
  await updateBadge(null, true);

  // Open onboarding on first install
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'src/options/index.html?onboarding=true' });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('AdShield Pro starting up...');
  await StatsTracker.init();
  await RuleManager.applyWhitelist();
  await updateBadge(null, true);
});

// ── Alarm Handler ────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener((alarm) => {
  FilterUpdater.onAlarm(alarm);
});

// ── Block Counter via DNR Feedback ───────────────────────────────────

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(async (info) => {
  const { request, rule } = info;
  const hostname = Messaging.getHostname(request.url);

  if (rule.rulesetId === 'easyprivacy') {
    await StatsTracker.increment('trackers', hostname);
  } else {
    await StatsTracker.increment('ads', hostname);
  }

  // Update badge for the tab
  if (request.tabId > 0) {
    await updateTabBadge(request.tabId);
  }
});

// ── Tab tracking for badge ───────────────────────────────────────────

const tabBlockCounts = {};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabBlockCounts[tabId] = 0;
    await updateTabBadge(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabBlockCounts[tabId];
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateTabBadge(activeInfo.tabId);
});

// ── Message Handler ──────────────────────────────────────────────────

Messaging.onMessage(async (message, sender) => {
  const { type } = message;

  switch (type) {
    case CONSTANTS.MESSAGES.GET_STATS:
      return await StatsTracker.getStats();

    case CONSTANTS.MESSAGES.GET_SETTINGS:
      return await StorageHelper.get(Object.values(CONSTANTS.STORAGE_KEYS));

    case CONSTANTS.MESSAGES.UPDATE_SETTING: {
      const { key, value } = message;
      await StorageHelper.set({ [key]: value });

      // Handle specific setting changes
      if (key === CONSTANTS.STORAGE_KEYS.TRACKER_BLOCKING) {
        await RuleManager.toggleRuleset('easyprivacy', value);
      } else if (key === CONSTANTS.STORAGE_KEYS.MALWARE_PROTECTION) {
        await RuleManager.toggleRuleset('malware_domains', value);
      }
      return { success: true };
    }

    case CONSTANTS.MESSAGES.TOGGLE_GLOBAL: {
      const enabled = message.enabled;
      await StorageHelper.set({ [CONSTANTS.STORAGE_KEYS.GLOBAL_ENABLED]: enabled });
      await RuleManager.toggleAllRules(enabled);
      await updateBadge(null, enabled);
      return { success: true, enabled };
    }

    case CONSTANTS.MESSAGES.TOGGLE_SITE: {
      const { hostname, enabled } = message;
      const whitelist = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.SITE_WHITELIST, []);

      if (!enabled) {
        // Disable on site = add to whitelist
        if (!whitelist.includes(hostname)) {
          whitelist.push(hostname);
        }
        await RuleManager.whitelistSite(hostname);
      } else {
        // Enable on site = remove from whitelist
        const idx = whitelist.indexOf(hostname);
        if (idx > -1) whitelist.splice(idx, 1);
        await RuleManager.unwhitelistSite(hostname);
      }

      await StorageHelper.set({ [CONSTANTS.STORAGE_KEYS.SITE_WHITELIST]: whitelist });
      return { success: true, whitelist };
    }

    case CONSTANTS.MESSAGES.GET_SITE_STATUS: {
      const whitelist = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.SITE_WHITELIST, []);
      const globalEnabled = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.GLOBAL_ENABLED, true);
      const isWhitelisted = whitelist.includes(message.hostname);
      return {
        globalEnabled,
        siteEnabled: !isWhitelisted,
        hostname: message.hostname,
      };
    }

    case CONSTANTS.MESSAGES.INCREMENT_STAT: {
      const result = await StatsTracker.increment(message.statType, message.hostname);
      if (sender.tab && sender.tab.id > 0) {
        tabBlockCounts[sender.tab.id] = (tabBlockCounts[sender.tab.id] || 0) + 1;
        await updateTabBadge(sender.tab.id);
      }
      return result;
    }

    case CONSTANTS.MESSAGES.RESET_STATS:
      await StatsTracker.reset();
      return { success: true };

    case CONSTANTS.MESSAGES.UPDATE_FILTERS: {
      const results = await FilterUpdater.updateAllFilters();
      return results;
    }

    case CONSTANTS.MESSAGES.ADD_WHITELIST: {
      const list = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.SITE_WHITELIST, []);
      if (!list.includes(message.hostname)) {
        list.push(message.hostname);
        await StorageHelper.set({ [CONSTANTS.STORAGE_KEYS.SITE_WHITELIST]: list });
        await RuleManager.whitelistSite(message.hostname);
      }
      return { success: true, whitelist: list };
    }

    case CONSTANTS.MESSAGES.REMOVE_WHITELIST: {
      const list2 = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.SITE_WHITELIST, []);
      const idx = list2.indexOf(message.hostname);
      if (idx > -1) {
        list2.splice(idx, 1);
        await StorageHelper.set({ [CONSTANTS.STORAGE_KEYS.SITE_WHITELIST]: list2 });
        await RuleManager.unwhitelistSite(message.hostname);
      }
      return { success: true, whitelist: list2 };
    }

    case CONSTANTS.MESSAGES.GET_WHITELIST: {
      const wl = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.SITE_WHITELIST, []);
      return { whitelist: wl };
    }

    case CONSTANTS.MESSAGES.ADD_CUSTOM_RULE: {
      const rules = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.CUSTOM_RULES, []);
      rules.push(message.rule);
      await StorageHelper.set({ [CONSTANTS.STORAGE_KEYS.CUSTOM_RULES]: rules });
      return { success: true, rules };
    }

    case CONSTANTS.MESSAGES.REMOVE_CUSTOM_RULE: {
      const rules2 = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.CUSTOM_RULES, []);
      const filtered = rules2.filter((r) => r !== message.rule);
      await StorageHelper.set({ [CONSTANTS.STORAGE_KEYS.CUSTOM_RULES]: filtered });
      return { success: true, rules: filtered };
    }

    default:
      return { error: 'Unknown message type' };
  }
});

// ── Badge Helpers ────────────────────────────────────────────────────

async function updateBadge(tabId, enabled) {
  const badgeEnabled = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.BADGE_ENABLED, true);
  const globalEnabled = enabled !== undefined
    ? enabled
    : await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.GLOBAL_ENABLED, true);

  const options = tabId ? { tabId } : {};

  if (!globalEnabled) {
    await chrome.action.setBadgeText({ text: 'OFF', ...options });
    await chrome.action.setBadgeBackgroundColor({
      color: CONSTANTS.BADGE_COLORS.DISABLED,
      ...options,
    });
    return;
  }

  if (!badgeEnabled) {
    await chrome.action.setBadgeText({ text: '', ...options });
    return;
  }

  const count = tabId ? (tabBlockCounts[tabId] || 0) : 0;
  await chrome.action.setBadgeText({
    text: count > 0 ? String(count) : '',
    ...options,
  });
  await chrome.action.setBadgeBackgroundColor({
    color: CONSTANTS.BADGE_COLORS.ACTIVE,
    ...options,
  });
}

async function updateTabBadge(tabId) {
  const globalEnabled = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.GLOBAL_ENABLED, true);
  if (!globalEnabled) return;

  const badgeEnabled = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.BADGE_ENABLED, true);
  if (!badgeEnabled) return;

  const count = tabBlockCounts[tabId] || 0;
  if (count > 0) {
    await chrome.action.setBadgeText({ text: String(count), tabId });
    await chrome.action.setBadgeBackgroundColor({
      color: CONSTANTS.BADGE_COLORS.ACTIVE,
      tabId,
    });
  }
}

console.log('AdShield Pro service worker loaded.');
