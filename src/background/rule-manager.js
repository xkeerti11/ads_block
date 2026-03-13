// AdShield Pro - Rule Manager
const RuleManager = {
  /**
   * Enable/disable all static rulesets
   */
  async toggleAllRules(enabled) {
    const rulesetIds = ['easylist', 'easyprivacy', 'easylist_india', 'malware_domains'];
    try {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: enabled ? rulesetIds : [],
        disableRulesetIds: enabled ? [] : rulesetIds,
      });
    } catch (e) {
      console.error('AdShield: Error toggling rulesets', e);
    }
  },

  /**
   * Enable/disable specific ruleset
   */
  async toggleRuleset(rulesetId, enabled) {
    try {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: enabled ? [rulesetId] : [],
        disableRulesetIds: enabled ? [] : [rulesetId],
      });
    } catch (e) {
      console.error('AdShield: Error toggling ruleset', rulesetId, e);
    }
  },

  /**
   * Add a site to whitelist using session rules
   */
  async whitelistSite(hostname) {
    const ruleId = this._hostnameToRuleId(hostname);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({
        addRules: [
          {
            id: ruleId,
            priority: 100,
            action: { type: 'allowAllRequests' },
            condition: {
              requestDomains: [hostname],
              resourceTypes: [
                'main_frame',
                'sub_frame',
                'script',
                'image',
                'xmlhttprequest',
                'media',
                'font',
                'stylesheet',
                'other',
              ],
            },
          },
        ],
      });
    } catch (e) {
      console.error('AdShield: Error whitelisting site', hostname, e);
    }
  },

  /**
   * Remove a site from whitelist session rules
   */
  async unwhitelistSite(hostname) {
    const ruleId = this._hostnameToRuleId(hostname);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId],
      });
    } catch (e) {
      console.error('AdShield: Error removing whitelist', hostname, e);
    }
  },

  /**
   * Re-apply all whitelist session rules (on startup)
   */
  async applyWhitelist() {
    const whitelist = await StorageHelper.getValue(CONSTANTS.STORAGE_KEYS.SITE_WHITELIST, []);
    for (const hostname of whitelist) {
      await this.whitelistSite(hostname);
    }
  },

  /**
   * Convert hostname to a numeric rule ID (deterministic hash)
   */
  _hostnameToRuleId(hostname) {
    let hash = 0;
    for (let i = 0; i < hostname.length; i++) {
      const char = hostname.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash % 900000) + 100000; // Range: 100000 - 999999
  },

  /**
   * Get count of enabled rules
   */
  async getEnabledRuleCount() {
    try {
      const rulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
      return rulesets.length;
    } catch {
      return 0;
    }
  },
};
