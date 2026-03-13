// AdShield Pro - YouTube Ad Blocker Content Script
// Runs only on youtube.com

(function () {
  'use strict';

  // ── YouTube Ad Selectors ─────────────────────────────────────────
  const YT_AD_SELECTORS = [
    // Video ad overlays
    '.ytp-ad-module',
    '.ytp-ad-overlay-container',
    '.ytp-ad-text-overlay',
    '.ytp-ad-image-overlay',
    '.video-ads',
    '#player-ads',
    '#masthead-ad',

    // Home page / feed ads
    'ytd-banner-promo-renderer',
    'ytd-statement-banner-renderer',
    'ytd-in-feed-ad-layout-renderer',
    'ytd-ad-slot-renderer',
    'ytd-display-ad-renderer',
    'ytd-promoted-sparkles-web-renderer',
    'ytd-promoted-video-renderer',
    'ytd-compact-promoted-video-renderer',
    'ytd-action-companion-ad-renderer',
    'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',

    // Sidebar ads
    '#related ytd-promoted-sparkles-web-renderer',
    '.ytd-merch-shelf-renderer',
    'ytd-merch-shelf-renderer',

    // Sponsored cards
    '.ytp-ad-overlay-close-button',
    '.ytp-ad-skip-button-container',
  ];

  let observer = null;

  // ── Skip video ads ───────────────────────────────────────────────
  function skipVideoAd() {
    const video = document.querySelector('video.html5-main-video');
    if (!video) return;

    // Check if an ad is playing
    const adOverlay = document.querySelector('.ytp-ad-player-overlay');
    const adModule = document.querySelector('.ytp-ad-module .ytp-ad-player-overlay-instream-info');

    if (adOverlay || adModule) {
      // Try to click skip button
      const skipBtn =
        document.querySelector('.ytp-ad-skip-button') ||
        document.querySelector('.ytp-ad-skip-button-modern') ||
        document.querySelector('.ytp-skip-ad-button') ||
        document.querySelector('button.ytp-ad-skip-button-container');

      if (skipBtn) {
        skipBtn.click();
        notifyBlocked();
        return;
      }

      // If no skip button, fast-forward ad
      if (video.duration && video.duration > 0 && isFinite(video.duration)) {
        video.currentTime = video.duration;
        notifyBlocked();
      }

      // Mute ad
      video.muted = true;
    }
  }

  // ── Hide ad elements ─────────────────────────────────────────────
  function hideAdElements() {
    const combined = YT_AD_SELECTORS.join(', ');
    const elements = document.querySelectorAll(combined);
    let count = 0;

    elements.forEach((el) => {
      if (el && !el.hasAttribute('data-adshield-yt-hidden')) {
        el.style.display = 'none';
        el.setAttribute('data-adshield-yt-hidden', 'true');
        count++;
      }
    });

    if (count > 0) {
      notifyBlocked();
    }
  }

  // ── Intercept ad player response ─────────────────────────────────
  function interceptPlayerAds() {
    // Override XMLHttpRequest to filter ad-related player responses
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';

      // Block ad-related API calls
      if (
        url.includes('/pagead/') ||
        url.includes('/ptracking') ||
        url.includes('doubleclick.net') ||
        url.includes('/ad_break')
      ) {
        return new Response('', { status: 200, statusText: 'Blocked by AdShield' });
      }

      return originalFetch.apply(this, args);
    };
  }

  // ── Notify background ────────────────────────────────────────────
  function notifyBlocked() {
    try {
      chrome.runtime.sendMessage({
        type: 'incrementStat',
        statType: 'ads',
        hostname: 'youtube.com',
      });
    } catch {
      // Context invalidated
    }
  }

  // ── MutationObserver ─────────────────────────────────────────────
  function startObserver() {
    if (observer) return;

    observer = new MutationObserver(() => {
      skipVideoAd();
      hideAdElements();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // ── Periodic check for video ads ─────────────────────────────────
  function startPeriodicCheck() {
    setInterval(() => {
      skipVideoAd();
    }, 500);
  }

  // ── CSS injection for YouTube ads ────────────────────────────────
  function injectYTStyles() {
    const style = document.createElement('style');
    style.id = 'adshield-yt-styles';
    style.textContent = `
      ${YT_AD_SELECTORS.join(',\n      ')} {
        display: none !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      .ytp-ad-overlay-container { display: none !important; }
      .ytp-ad-module { display: none !important; }
      #masthead-ad { display: none !important; }
      #player-ads { display: none !important; }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  // ── Initialize ───────────────────────────────────────────────────
  function init() {
    injectYTStyles();
    interceptPlayerAds();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        hideAdElements();
        startObserver();
        startPeriodicCheck();
      });
    } else {
      hideAdElements();
      startObserver();
      startPeriodicCheck();
    }
  }

  init();
})();
