// AdShield Pro - Storage Helper
const StorageHelper = {
  async get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  },

  async set(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  },

  async remove(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => {
        resolve();
      });
    });
  },

  async getValue(key, defaultValue) {
    const result = await this.get([key]);
    return result[key] !== undefined ? result[key] : defaultValue;
  },

  async initDefaults(defaults) {
    const current = await this.get(Object.keys(defaults));
    const toSet = {};
    for (const [key, value] of Object.entries(defaults)) {
      if (current[key] === undefined) {
        toSet[key] = value;
      }
    }
    if (Object.keys(toSet).length > 0) {
      await this.set(toSet);
    }
  },

  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  },

  async incrementStat(type, hostname) {
    const todayKey = this.getTodayKey();
    const data = await this.get([
      CONSTANTS.STORAGE_KEYS.STATS_TODAY,
      CONSTANTS.STORAGE_KEYS.STATS_TOTAL,
      CONSTANTS.STORAGE_KEYS.STATS_PER_SITE,
      CONSTANTS.STORAGE_KEYS.STATS_DATE,
    ]);

    let statsToday = data[CONSTANTS.STORAGE_KEYS.STATS_TODAY] || { ads: 0, trackers: 0 };
    let statsTotal = data[CONSTANTS.STORAGE_KEYS.STATS_TOTAL] || { ads: 0, trackers: 0 };
    let statsPerSite = data[CONSTANTS.STORAGE_KEYS.STATS_PER_SITE] || {};
    const storedDate = data[CONSTANTS.STORAGE_KEYS.STATS_DATE];

    if (storedDate !== todayKey) {
      statsToday = { ads: 0, trackers: 0 };
    }

    statsToday[type] = (statsToday[type] || 0) + 1;
    statsTotal[type] = (statsTotal[type] || 0) + 1;

    if (hostname) {
      if (!statsPerSite[hostname]) {
        statsPerSite[hostname] = { ads: 0, trackers: 0 };
      }
      statsPerSite[hostname][type] = (statsPerSite[hostname][type] || 0) + 1;
    }

    await this.set({
      [CONSTANTS.STORAGE_KEYS.STATS_TODAY]: statsToday,
      [CONSTANTS.STORAGE_KEYS.STATS_TOTAL]: statsTotal,
      [CONSTANTS.STORAGE_KEYS.STATS_PER_SITE]: statsPerSite,
      [CONSTANTS.STORAGE_KEYS.STATS_DATE]: todayKey,
    });

    return { statsToday, statsTotal };
  },
};
