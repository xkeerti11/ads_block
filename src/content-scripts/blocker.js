// AdShield Pro - Main Content Script (blocker.js)
// Runs on all pages at document_start

(function () {
  'use strict';

  // ── Common Ad Selectors ──────────────────────────────────────────
  const AD_SELECTORS = [
    // Google Ads
    'ins.adsbygoogle',
    '[id^="google_ads"]',
    '[id^="div-gpt-ad"]',
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="googlesyndication.com"]',

    // Generic ad containers
    '[class*="ad-banner"]',
    '[class*="ad-container"]',
    '[class*="ad-wrapper"]',
    '[class*="ad-slot"]',
    '[class*="ad-unit"]',
    '[class*="advert-"]',
    '[class*="advertisement"]',
    '[id*="ad-banner"]',
    '[id*="ad-container"]',
    '[id*="ad-wrapper"]',

    // Sponsored content
    '[class*="sponsored"]',
    '[data-ad]',
    '[data-ad-slot]',
    '[data-adunit]',
    '[data-dfp]',

    // Common ad network containers
    '[class*="taboola"]',
    '[id*="taboola"]',
    '[class*="outbrain"]',
    '[id*="outbrain"]',
    'div[id^="rcjsload"]',
    '[class*="mgid"]',
    '[id*="mgid"]',

    // Popup overlays
    '[class*="popup-overlay"]',
    '[class*="modal-overlay"][class*="ad"]',
    '[class*="interstitial"]',

    // Cookie notices
    '[class*="cookie-banner"]',
    '[class*="cookie-notice"]',
    '[class*="cookie-consent"]',
    '[id*="cookie-banner"]',
    '[id*="cookie-notice"]',
    '[id*="cookie-consent"]',
    '[class*="gdpr"]',
    '[id*="gdpr"]',
    '[class*="consent-banner"]',
    '#onetrust-banner-sdk',
    '#onetrust-consent-sdk',
    '.cc-banner',
    '.cc-window',
    '#CybotCookiebotDialog',
    '[class*="CookieConsent"]',
  ];

  // ── State ────────────────────────────────────────────────────────
  let isEnabled = true;
  let blockedCount = 0;

  // ── Inject CSS hiding rules immediately ──────────────────────────
  function injectHidingCSS() {
    const style = document.createElement('style');
    style.id = 'adshield-pro-styles';
    style.textContent = AD_SELECTORS.map(
      (s) => `${s} { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; }`
    ).join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  // ── Remove ad elements from DOM ──────────────────────────────────
  function removeAds() {
    const combined = AD_SELECTORS.join(', ');
    const elements = document.querySelectorAll(combined);
    elements.forEach((el) => {
      if (el && el.parentNode) {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.setAttribute('data-adshield-hidden', 'true');
        blockedCount++;
      }
    });
  }

  // ── Pop-up Blocker ───────────────────────────────────────────────
  function blockPopups() {
    const originalOpen = window.open;
    window.open = function (url, name, features) {
      // Allow same-origin popups (login, payment, etc.)
      if (url) {
        try {
          const popupUrl = new URL(url, window.location.href);
          if (popupUrl.hostname === window.location.hostname) {
            return originalOpen.call(window, url, name, features);
          }
        } catch {
          // Invalid URL, block it
        }
      }
      console.log('AdShield: Blocked popup:', url);
      notifyBackground('ads');
      return null;
    };
  }

  // ── MutationObserver for dynamic ads ─────────────────────────────
  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      if (!isEnabled) return;

      let shouldScan = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldScan = true;
          break;
        }
      }

      if (shouldScan) {
        removeAds();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // ── Notify background of blocked item ────────────────────────────
  function notifyBackground(statType) {
    try {
      chrome.runtime.sendMessage({
        type: 'incrementStat',
        statType: statType,
        hostname: window.location.hostname,
      });
    } catch {
      // Extension context may be invalidated
    }
  }

  // ── Check if site is whitelisted ─────────────────────────────────
  async function checkStatus() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'getSiteStatus',
        hostname: window.location.hostname,
      });
      if (response) {
        isEnabled = response.globalEnabled && response.siteEnabled;
        if (!isEnabled) {
          disableBlocking();
        }
      }
    } catch {
      // Extension not ready yet, default to enabled
    }
  }

  // ── Disable blocking ─────────────────────────────────────────────
  function disableBlocking() {
    const style = document.getElementById('adshield-pro-styles');
    if (style) {
      style.remove();
    }
    document.querySelectorAll('[data-adshield-hidden]').forEach((el) => {
      el.style.display = '';
      el.style.visibility = '';
      el.removeAttribute('data-adshield-hidden');
    });
  }

  // ── Listen for toggle messages ───────────────────────────────────
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'toggleBlocking') {
      isEnabled = message.enabled;
      if (isEnabled) {
        injectHidingCSS();
        removeAds();
      } else {
        disableBlocking();
      }
    }
  });

  // ── Initialize ───────────────────────────────────────────────────
  function init() {
    injectHidingCSS();
    blockPopups();
    checkStatus();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        removeAds();
        observeDOM();
      });
    } else {
      removeAds();
      observeDOM();
    }
  }

  init();
})();
