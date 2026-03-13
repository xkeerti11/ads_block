// AdShield Pro - Filter Updater
const FilterUpdater = {
  /**
   * Schedule periodic filter list updates
   */
  async scheduleUpdates() {
    await chrome.alarms.create(CONSTANTS.ALARMS.FILTER_UPDATE, {
      periodInMinutes: CONSTANTS.FILTER_UPDATE_INTERVAL,
    });
  },

  /**
   * Handle alarm trigger - update filter lists
   */
  async onAlarm(alarm) {
    if (alarm.name === CONSTANTS.ALARMS.FILTER_UPDATE) {
      await this.updateAllFilters();
    }
  },

  /**
   * Update all filter lists from remote URLs
   */
  async updateAllFilters() {
    console.log('AdShield: Starting filter update...');
    const results = {};

    for (const [name, url] of Object.entries(CONSTANTS.FILTER_URLS)) {
      try {
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (response.ok) {
          results[name] = {
            success: true,
            timestamp: Date.now(),
          };
          console.log(`AdShield: Updated ${name} filter list`);
        } else {
          results[name] = { success: false, error: response.statusText };
          console.warn(`AdShield: Failed to update ${name}: ${response.statusText}`);
        }
      } catch (e) {
        results[name] = { success: false, error: e.message };
        console.warn(`AdShield: Failed to update ${name}:`, e.message);
      }
    }

    await StorageHelper.set({
      [CONSTANTS.STORAGE_KEYS.LAST_FILTER_UPDATE]: Date.now(),
      [CONSTANTS.STORAGE_KEYS.FILTER_LISTS]: results,
    });

    return results;
  },

  /**
   * Get last update timestamp
   */
  async getLastUpdate() {
    return StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.LAST_FILTER_UPDATE, null);
  },
};
