// AdShield Pro - Stats Tracker
const StatsTracker = {
  /**
   * Initialize stats, reset daily counter if new day
   */
  async init() {
    const data = await StorageHelper.get([
      CONSTANTS.STORAGE_KEYS.STATS_TODAY,
      CONSTANTS.STORAGE_KEYS.STATS_TOTAL,
      CONSTANTS.STORAGE_KEYS.STATS_PER_SITE,
      CONSTANTS.STORAGE_KEYS.STATS_DATE,
    ]);

    const today = new Date().toDateString();
    if (data[CONSTANTS.STORAGE_KEYS.STATS_DATE] !== today) {
      await StorageHelper.set({
        [CONSTANTS.STORAGE_KEYS.STATS_TODAY]: { ads: 0, trackers: 0 },
        [CONSTANTS.STORAGE_KEYS.STATS_DATE]: today,
      });
    }
  },

  /**
   * Increment blocked count
   * @param {string} type - 'ads' or 'trackers'
   * @param {string} hostname - site hostname
   */
  async increment(type, hostname) {
    const data = await StorageHelper.get([
      CONSTANTS.STORAGE_KEYS.STATS_TODAY,
      CONSTANTS.STORAGE_KEYS.STATS_TOTAL,
      CONSTANTS.STORAGE_KEYS.STATS_PER_SITE,
    ]);

    const today = data[CONSTANTS.STORAGE_KEYS.STATS_TODAY] || { ads: 0, trackers: 0 };
    const total = data[CONSTANTS.STORAGE_KEYS.STATS_TOTAL] || { ads: 0, trackers: 0 };
    const perSite = data[CONSTANTS.STORAGE_KEYS.STATS_PER_SITE] || {};

    today[type] = (today[type] || 0) + 1;
    total[type] = (total[type] || 0) + 1;

    if (hostname) {
      if (!perSite[hostname]) {
        perSite[hostname] = { ads: 0, trackers: 0 };
      }
      perSite[hostname][type] = (perSite[hostname][type] || 0) + 1;
    }

    await StorageHelper.set({
      [CONSTANTS.STORAGE_KEYS.STATS_TODAY]: today,
      [CONSTANTS.STORAGE_KEYS.STATS_TOTAL]: total,
      [CONSTANTS.STORAGE_KEYS.STATS_PER_SITE]: perSite,
    });

    return { today, total };
  },

  /**
   * Get all stats
   */
  async getStats() {
    const data = await StorageHelper.get([
      CONSTANTS.STORAGE_KEYS.STATS_TODAY,
      CONSTANTS.STORAGE_KEYS.STATS_TOTAL,
      CONSTANTS.STORAGE_KEYS.STATS_PER_SITE,
    ]);
    return {
      today: data[CONSTANTS.STORAGE_KEYS.STATS_TODAY] || { ads: 0, trackers: 0 },
      total: data[CONSTANTS.STORAGE_KEYS.STATS_TOTAL] || { ads: 0, trackers: 0 },
      perSite: data[CONSTANTS.STORAGE_KEYS.STATS_PER_SITE] || {},
    };
  },

  /**
   * Get stats for specific site
   */
  async getSiteStats(hostname) {
    const perSite = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.STATS_PER_SITE, {});
    return perSite[hostname] || { ads: 0, trackers: 0 };
  },

  /**
   * Reset all stats
   */
  async reset() {
    await StorageHelper.set({
      [CONSTANTS.STORAGE_KEYS.STATS_TODAY]: { ads: 0, trackers: 0 },
      [CONSTANTS.STORAGE_KEYS.STATS_TOTAL]: { ads: 0, trackers: 0 },
      [CONSTANTS.STORAGE_KEYS.STATS_PER_SITE]: {},
      [CONSTANTS.STORAGE_KEYS.STATS_DATE]: new Date().toDateString(),
    });
  },
};
