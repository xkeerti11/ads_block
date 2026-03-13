// AdShield Pro - Chrome Runtime Messaging Helper

const Messaging = {
  /**
   * Send a message to the background service worker
   */
  async sendToBackground(type, data = {}) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type, ...data }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  },

  /**
   * Send a message to a specific tab's content script
   */
  async sendToTab(tabId, type, data = {}) {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { type, ...data }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  },

  /**
   * Get the current active tab
   */
  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  },

  /**
   * Extract hostname from URL string
   */
  getHostname(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  },

  /**
   * Listen for messages with async handler support
   */
  onMessage(handler) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const result = handler(message, sender);
      if (result instanceof Promise) {
        result.then(sendResponse).catch(() => sendResponse({ error: true }));
        return true;
      }
      if (result !== undefined) {
        sendResponse(result);
      }
    });
  },
};
