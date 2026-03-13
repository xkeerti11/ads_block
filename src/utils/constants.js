// AdShield Pro - Constants
const CONSTANTS = {
  APP_NAME: 'AdShield Pro',
  VERSION: '1.0.0',

  STORAGE_KEYS: {
    GLOBAL_ENABLED: 'globalEnabled',
    SITE_WHITELIST: 'siteWhitelist',
    TRACKER_BLOCKING: 'trackerBlocking',
    COOKIE_BLOCKING: 'cookieBlocking',
    MALWARE_PROTECTION: 'malwareProtection',
    BADGE_ENABLED: 'badgeEnabled',
    STATS_TODAY: 'statsToday',
    STATS_TOTAL: 'statsTotal',
    STATS_PER_SITE: 'statsPerSite',
    STATS_DATE: 'statsDate',
    CUSTOM_RULES: 'customRules',
    FILTER_LISTS: 'filterLists',
    LAST_FILTER_UPDATE: 'lastFilterUpdate',
    ONBOARDING_DONE: 'onboardingDone',
    ACCEPTABLE_ADS: 'acceptableAds',
  },

  DEFAULTS: {
    globalEnabled: true,
    siteWhitelist: [],
    trackerBlocking: true,
    cookieBlocking: true,
    malwareProtection: true,
    badgeEnabled: true,
    acceptableAds: false,
    statsToday: { ads: 0, trackers: 0 },
    statsTotal: { ads: 0, trackers: 0 },
    statsPerSite: {},
    statsDate: '',
    customRules: [],
    onboardingDone: false,
  },

  FILTER_URLS: {
    easylist: 'https://easylist.to/easylist/easylist.txt',
    easyprivacy: 'https://easylist.to/easylist/easyprivacy.txt',
    easylist_india: 'https://easylist-downloads.adblockplus.org/indianlist.txt',
    malware_domains: 'https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-dnr.json',
  },

  ALARMS: {
    FILTER_UPDATE: 'filterUpdate',
    STATS_RESET: 'statsReset',
  },

  FILTER_UPDATE_INTERVAL: 24 * 60,

  MESSAGES: {
    GET_STATS: 'getStats',
    GET_SETTINGS: 'getSettings',
    UPDATE_SETTING: 'updateSetting',
    TOGGLE_SITE: 'toggleSite',
    TOGGLE_GLOBAL: 'toggleGlobal',
    GET_SITE_STATUS: 'getSiteStatus',
    AD_BLOCKED: 'adBlocked',
    TRACKER_BLOCKED: 'trackerBlocked',
    INCREMENT_STAT: 'incrementStat',
    RESET_STATS: 'resetStats',
    UPDATE_FILTERS: 'updateFilters',
    ADD_WHITELIST: 'addWhitelist',
    REMOVE_WHITELIST: 'removeWhitelist',
    GET_WHITELIST: 'getWhitelist',
    ADD_CUSTOM_RULE: 'addCustomRule',
    REMOVE_CUSTOM_RULE: 'removeCustomRule',
  },

  BADGE_COLORS: {
    ACTIVE: '#1D4ED8',
    DISABLED: '#9CA3AF',
  },

  COLORS: {
    PRIMARY: '#1D4ED8',
    SUCCESS: '#22C55E',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
    GREY: '#6B7280',
    BG_LIGHT: '#F9FAFB',
    BG_DARK: '#111827',
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONSTANTS;
}
