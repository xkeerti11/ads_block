# AdShield Pro – Chrome Extension
## Product Requirements Document (PRD)

**Version:** 1.0.0
**Date:** March 2026
**Platform:** Chrome Manifest V3
**Status:** Planning Phase
**Inspired By:** Adblock Plus (cfhdojbkjhnklbpkdaibdccddilifddb)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Users (Personas)](#3-target-users-personas)
4. [Feature List – Free Tier](#4-feature-list--free-tier)
5. [Feature List – Premium Tier](#5-feature-list--premium-tier)
6. [UI/UX Design Specifications](#6-uiux-design-specifications)
7. [Technical Architecture](#7-technical-architecture)
8. [Filter Lists & Blocking Rules](#8-filter-lists--blocking-rules)
9. [Permissions & Privacy Policy](#9-permissions--privacy-policy)
10. [Monetization Strategy](#10-monetization-strategy)
11. [Development Roadmap](#11-development-roadmap)
12. [Success Metrics (KPIs)](#12-success-metrics-kpis)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Tech Stack Summary](#14-tech-stack-summary)
15. [File & Folder Structure](#15-file--folder-structure)
16. [Open Questions & Decisions](#16-open-questions--decisions)

---

## 1. Executive Summary

**AdShield Pro** ek powerful, privacy-first Chrome browser extension hai jo Adblock Plus ki tarah kaam karega. Yeh extension users ko online ads, trackers, malware scripts, aur annoying pop-ups se protect karega — bilkul free mein. Saath hi ek Premium tier bhi hogi jisme advanced features honge.

Extension Google Chrome ka **Manifest V3 (MV3)** standard follow karega jo latest aur future-proof Chrome extension model hai. Yeh extension 500M+ downloads wale Adblock Plus ke sath directly compete karega, lekin India-specific features aur better free tier ke sath.

### Problem Statement

- Internet pe 40%+ websites intrusive ads serve karti hain jo user experience kharab karti hain
- Third-party trackers users ki browsing data collect karte hain bina consent ke
- Malvertising (ads ke through malware) ek growing cybersecurity threat hai
- Ad-heavy websites pe page load time 3–5x slow ho jaata hai
- Existing solutions (uBlock, ABP) mein India-specific filter lists aur Hindi UX nahi hai

### Solution

Ek free Chrome extension jo:
- Automatically sab major ads, trackers, aur pop-ups block kare
- Page load speed 30–40% improve kare
- User ki privacy protect kare bina koi data collect kiye
- Simple one-click interface provide kare
- India-specific ad networks ko bhi cover kare

---

## 2. Product Vision & Goals

### Vision Statement

> "Har Indian user ke liye ek safe, fast, aur ad-free browsing experience — bilkul free."

### Product Goals

| Goal | Description | Success Metric |
|------|-------------|----------------|
| Ad Blocking | 99%+ ads block karna across major websites | Block rate ≥ 99% on Alexa Top 1000 |
| Privacy Protection | Trackers aur fingerprinting scripts block karna | EasyPrivacy list 100% coverage |
| Performance | Page load speed improve karna | 30%+ faster load on ad-heavy sites |
| User Control | Whitelist/blacklist, per-site settings | 95%+ users satisfied in survey |
| Monetization | Sustainable freemium model | 5% free users → Premium convert |
| India Focus | Indian ad networks cover karna | EasyList India integration |

### Non-Goals (Kya nahi banayenge — v1 mein)

- Mobile browser extension (Android/iOS) — Phase 5 mein
- VPN functionality
- Password manager
- Full parental control suite
- Firefox/Edge support — Phase 4 mein

---

## 3. Target Users (Personas)

### Persona 1 – Casual Rahul (Primary – 60% users)

- **Age:** 22–35
- **Occupation:** Office worker, student
- **Tech Level:** Low to medium
- **Problem:** YouTube aur news sites pe ads se pareshan hai
- **Need:** Simple on/off toggle, koi configuration nahi chahiye
- **Quote:** *"Bas kaam karo, settings mat dikhao mujhe"*

### Persona 2 – Tech-Savvy Priya (Power User – 20% users)

- **Age:** 25–40
- **Occupation:** Developer, designer
- **Tech Level:** High
- **Problem:** Custom rules likhna chahti hai, per-site control chahiye
- **Need:** Advanced filter rules, devtools integration, detailed logs
- **Quote:** *"Mujhe full control chahiye — kya block ho, kya nahi"*

### Persona 3 – Family Man Amit (Safety-Focused – 15% users)

- **Age:** 30–50
- **Occupation:** Any
- **Tech Level:** Low
- **Problem:** Parivar ke liye safe browsing — bacchon ke liye inappropriate ads nahi chahiye
- **Need:** Family safe mode, malware protection, simple interface
- **Quote:** *"Mere bachche bhi use karte hain laptop — kuch galat nahi dikhna chahiye"*

### Persona 4 – Business Neha (Enterprise – 5% users)

- **Age:** 28–45
- **Occupation:** IT Admin, Business Owner
- **Tech Level:** High
- **Problem:** Company ke sab employees ke liye deploy karna hai
- **Need:** Admin controls, bulk deployment, company-wide whitelists, reporting
- **Quote:** *"Poori team ke liye ek central policy chahiye"*

---

## 4. Feature List – Free Tier

### 4.1 Core Blocking Features

#### F-01 – Display Ad Blocking
- **Description:** Banner ads, sidebar ads, inline ads, sponsored content blocks hide karna
- **Priority:** P0 (Must Have)
- **Implementation:** `declarativeNetRequest` API with EasyList rules
- **Acceptance Criteria:**
  - Google Display Ads 99%+ block ho
  - Facebook/Instagram feed ads block ho
  - News site banners block ho
  - No false positives on content

#### F-02 – Video Ad Blocking
- **Description:** YouTube pre-roll ads, mid-roll ads, sponsored cards skip/block karna
- **Priority:** P0 (Must Have)
- **Implementation:** Content script injection, DOM mutation observer
- **Acceptance Criteria:**
  - YouTube pre-roll ads skip ho automatically
  - Mid-roll ads skip ho
  - YouTube homepage promoted videos label ho
  - Hotstar aur JioCinema ads bhi block ho

#### F-03 – Pop-up & Pop-under Blocking
- **Description:** New tab/window mein open hone wale ad pop-ups block karna
- **Priority:** P0 (Must Have)
- **Implementation:** `window.open` override via content script
- **Acceptance Criteria:**
  - Pop-up windows automatically block ho
  - Pop-under ads block ho
  - Legitimate pop-ups (login, payment) allow ho

#### F-04 – Tracker Blocking
- **Description:** Google Analytics, Facebook Pixel, hotjar, mixpanel aur similar tracking scripts block karna
- **Priority:** P0 (Must Have)
- **Implementation:** EasyPrivacy filter list via DNR
- **Acceptance Criteria:**
  - Top 100 known trackers block ho
  - Cross-site tracking cookies block ho
  - Network request to tracking domains block ho

#### F-05 – Malware & Phishing Protection
- **Description:** Known malicious domains aur phishing sites pe navigate karne se pehle warning ya block
- **Priority:** P0 (Must Have)
- **Implementation:** Malware domain blocklist via DNR
- **Acceptance Criteria:**
  - Known malware domains block ho
  - Phishing URLs block ho
  - User ko warning page dikhao
  - False positive rate < 0.1%

#### F-06 – Cookie Notice / GDPR Banner Remover
- **Description:** Websites pe aane wale cookie consent banners aur overlays automatically hide karna
- **Priority:** P1 (Should Have)
- **Implementation:** CSS injection via content script, element hiding rules
- **Acceptance Criteria:**
  - Top 500 Indian aur global websites pe cookie banners hide ho
  - Page layout break na ho
  - User ka scroll block na ho

#### F-07 – Enable / Disable Per Site
- **Description:** Specific website pe extension on/off karna
- **Priority:** P0 (Must Have)
- **Implementation:** Dynamic DNR rule modification, per-origin allowlist
- **Acceptance Criteria:**
  - Ek click mein current site pe disable ho
  - Disable preference save ho across sessions
  - Global disable bhi available ho

#### F-08 – Global Enable / Disable Toggle
- **Description:** Ek click se sab blocking globally band/chalu karna
- **Priority:** P0 (Must Have)
- **Implementation:** DNR rules enable/disable programmatically
- **Acceptance Criteria:**
  - Popup mein prominent toggle dikhe
  - Extension icon change ho (colored = on, grey = off)

#### F-09 – Filter List Auto-Update
- **Description:** EasyList, EasyPrivacy aur other filter lists automatically har 24 ghante mein update hona
- **Priority:** P0 (Must Have)
- **Implementation:** Background service worker with `chrome.alarms` API
- **Acceptance Criteria:**
  - Silent background update ho, user interrupt na ho
  - Failed update retry mechanism ho
  - Last updated timestamp settings mein dikhe

#### F-10 – Basic Statistics Dashboard
- **Description:** Kitne ads aur trackers block hue — ek simple counter
- **Priority:** P1 (Should Have)
- **Implementation:** `chrome.storage.local` counter increments on each block
- **Acceptance Criteria:**
  - Today ke aur total blocked ads/trackers count dikhe
  - Per-site stats bhi dikhe
  - Counter persistent rahe across browser restarts

### 4.2 User Control Features

#### F-11 – Whitelist (Allowlist) Management
- **Description:** User apni pasandida sites ko whitelist kar sake taaki unhe ad revenue mile
- **Priority:** P0 (Must Have)
- **Implementation:** User-defined DNR rules
- **Acceptance Criteria:**
  - URL ya domain add karne ka simple UI
  - Bulk import/export (text file)
  - Whitelisted sites pe sab blocking disable ho

#### F-12 – Custom Filter Rules (Basic)
- **Description:** User apne simple element hiding ya URL blocking rules add kar sake
- **Priority:** P2 (Nice to Have — Free)
- **Implementation:** ABP filter syntax parser, user rule set in DNR
- **Acceptance Criteria:**
  - Basic ABP syntax support (`##`, `||`, `@@`)
  - Rules real-time apply ho
  - Rule validation aur error feedback

#### F-13 – Notification Badge
- **Description:** Extension icon pe blocked count badge dikhana
- **Priority:** P2 (Nice to Have)
- **Implementation:** `chrome.action.setBadgeText()`
- **Acceptance Criteria:**
  - Current tab pe blocked count dikhe
  - Settings mein badge on/off toggle

---

## 5. Feature List – Premium Tier

### Pricing: ₹149/month ya ₹999/year

#### P-01 – Auto-Play Video Blocker
- **Description:** Automatically play hone wale videos (news sites, social media) block karna
- **Implementation:** Content script — HTMLVideoElement.play() override
- **Acceptance Criteria:** CNN, NDTV, Twitter auto-play videos block ho

#### P-02 – Newsletter / Sign-up Pop-up Blocker
- **Description:** Email subscription modals aur survey overlays detect karke hide karna
- **Implementation:** ML-based DOM pattern detection + known patterns list
- **Acceptance Criteria:** 90%+ newsletter pop-ups detected aur hidden

#### P-03 – Smart Cookie Manager
- **Description:** Cookie consent dialogs automatically accept/reject karna user preference ke basis pe
- **Implementation:** Consent-O-Matic integration + custom rules
- **Acceptance Criteria:**
  - "Reject All" automatically click ho by default
  - User choose kar sake accept ya reject policy

#### P-04 – Anti-Fingerprinting
- **Description:** Browser fingerprinting scripts block karna jo cookies ke bina bhi users track karte hain
- **Implementation:** Canvas, WebGL, AudioContext API spoofing via content script
- **Acceptance Criteria:**
  - Canvas fingerprinting blocked
  - WebRTC IP leak protection
  - User agent randomization

#### P-05 – Advanced Analytics Dashboard
- **Description:** Detailed breakdown — kaunsi site ne kitne ads serve kiye, data saved, speed improvement
- **Implementation:** Extended storage, charts via Chart.js in options page
- **Acceptance Criteria:**
  - 30-day history
  - Exportable reports (CSV)
  - Per-domain breakdown

#### P-06 – Cloud Sync (Settings & Rules)
- **Description:** User ki settings, whitelists, custom rules multiple devices pe sync ho
- **Implementation:** `chrome.storage.sync` + Supabase backend for large data
- **Acceptance Criteria:**
  - Login with Google
  - Settings 2 devices pe max 30 seconds mein sync ho
  - Offline mode bhi kaam kare

#### P-07 – Advanced Custom Filter Rules
- **Description:** Full ABP/uBlock Origin compatible filter syntax support
- **Implementation:** Complete filter parser, scriptlet injection support
- **Acceptance Criteria:**
  - Full ABP extended syntax
  - uBlock cosmetic filters
  - Script injection rules
  - Rule import from .txt file

#### P-08 – Family Safe Mode
- **Description:** Adult content, gambling, alcohol ads aur inappropriate content automatically filter karna
- **Implementation:** Additional blocklist for adult/gambling domains + CSS element hiding
- **Acceptance Criteria:**
  - Adult content ads block ho
  - Gambling site ads block ho
  - PIN-protected settings so children can't disable

---

## 6. UI/UX Design Specifications

### 6.1 Extension Popup (340px × 480px)

```
┌─────────────────────────────────┐
│  🛡️  AdShield Pro      ● Active │  ← Header (blue gradient)
├─────────────────────────────────┤
│   1,247      89        2.3s     │
│  Ads Blocked  Trackers  Saved   │  ← Stats row
├─────────────────────────────────┤
│  🌐 Enabled on this site    [●] │  ← Per-site toggle
│  🕵️ Tracker blocking        [●] │
│  🍪 Cookie notice block     [●] │
│  🛡️ Malware protection      [●] │
├─────────────────────────────────┤
│  [⚙️ Settings] [📊 Stats] [★ Pro]│  ← Footer nav
└─────────────────────────────────┘
```

### 6.2 Extension Icon States

| State | Icon | Badge |
|-------|------|-------|
| Active, blocking | Blue shield 🛡️ | Number (e.g. "47") |
| Disabled on this site | Grey shield | "OFF" |
| Globally disabled | Grey shield | — |
| Updating filters | Blue shield | "..." |

### 6.3 Options / Settings Page (Full Tab)

Sections:
1. **General** — Global toggle, badge, language
2. **Filter Lists** — Enable/disable lists, manual update, add custom list URL
3. **Whitelist** — Add/remove sites, import/export
4. **Custom Rules** — Text editor for ABP syntax rules
5. **Stats** — Full analytics (Premium)
6. **Account** — Premium status, sync settings (Premium)
7. **About** — Version, changelog, donate

### 6.4 Onboarding Flow (First Install)

```
Step 1: Welcome screen → "Aapka ad blocker ready hai!"
Step 2: Explain whitelist → "Apni favourite sites ko support karo"
Step 3: Optional stats opt-in → Anonymous analytics allow karo?
Step 4: Done → "Enjoy ad-free browsing!"
```

### 6.5 Design System

| Element | Value |
|---------|-------|
| Primary Color | `#1D4ED8` (Blue) |
| Success Color | `#22C55E` (Green) |
| Warning Color | `#F59E0B` (Amber) |
| Font | System UI / Segoe UI / Arial |
| Border Radius | 8px cards, 4px buttons |
| Dark Mode | Auto (follows system preference) |

---

## 7. Technical Architecture

### 7.1 Extension Components

```
adshield-pro/
├── manifest.json          ← MV3 manifest
├── background/
│   └── service-worker.js  ← Background logic, rule updates, alarms
├── content-scripts/
│   ├── blocker.js         ← DOM manipulation, element hiding
│   ├── youtube.js         ← YouTube-specific ad skip logic
│   └── styles.css         ← Element hiding CSS
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/
│   ├── index.html
│   └── src/               ← React app
│       ├── App.jsx
│       ├── pages/
│       └── components/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── rules/
│   ├── easylist.json      ← Pre-bundled DNR rules
│   └── easyprivacy.json
└── _locales/
    ├── en/messages.json
    └── hi/messages.json   ← Hindi UI strings
```

### 7.2 Core APIs Used

| API | Purpose |
|-----|---------|
| `chrome.declarativeNetRequest` | Network-level ad/tracker blocking |
| `chrome.scripting` | Content script injection |
| `chrome.storage.local` | Settings, stats, custom rules |
| `chrome.storage.sync` | Cloud sync (Premium) |
| `chrome.tabs` | Current tab info, per-site logic |
| `chrome.alarms` | Filter list update scheduling |
| `chrome.action` | Icon badge, popup |
| `chrome.runtime` | Message passing between components |

### 7.3 Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "AdShield Pro",
  "version": "1.0.0",
  "description": "Block ads, trackers and malware. Browse faster & safer.",
  "permissions": [
    "declarativeNetRequest",
    "declarativeNetRequestFeedback",
    "storage",
    "tabs",
    "alarms",
    "scripting"
  ],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content-scripts/blocker.js"],
      "css": ["content-scripts/styles.css"],
      "run_at": "document_start"
    }
  ],
  "declarative_net_request": {
    "rule_resources": [
      {
        "id": "easylist",
        "enabled": true,
        "path": "rules/easylist.json"
      },
      {
        "id": "easyprivacy",
        "enabled": true,
        "path": "rules/easyprivacy.json"
      }
    ]
  },
  "options_page": "options/index.html"
}
```

### 7.4 Key Technical Challenges & Solutions

#### Challenge 1: MV3 Rule Limit (30,000 dynamic rules)
- **Problem:** EasyList mein ~80,000 rules hain jo limit exceed karti hain
- **Solution:**
  - Most important rules select karo (top 30K by frequency)
  - Static bundled rules alag rakho (no limit for static)
  - Rules ko compress/deduplicate karo
  - Static ruleset: 30K pre-bundled | Dynamic: 30K user/custom rules

#### Challenge 2: YouTube Ad Blocking
- **Problem:** YouTube actively detects aur fights ad blockers
- **Solution:**
  - Content script se `ytInitialPlayerResponse` intercept karo
  - Ad format DOM patterns monitor karo (MutationObserver)
  - Frequent updates deploy karo (weekly)
  - Backup: `skip` button auto-click

#### Challenge 3: Service Worker Lifecycle
- **Problem:** Service workers sleep ho jaate hain, persistent state lost
- **Solution:**
  - Sab state `chrome.storage` mein rakho, memory mein nahi
  - `chrome.alarms` se periodic wake-up
  - Message passing se popup ke sath communicate karo

---

## 8. Filter Lists & Blocking Rules

### 8.1 Bundled Filter Lists

| Filter List | Purpose | Update Frequency | Approx. Rules |
|-------------|---------|-----------------|--------------|
| EasyList | Main ad blocking (global) | Every 4 days | ~80,000 |
| EasyPrivacy | Tracker & analytics blocking | Every 4 days | ~30,000 |
| EasyList India | Indian website ads | Weekly | ~5,000 |
| Malware Domain List | Known malware/phishing domains | Daily | ~26,000 |
| Anti-Cookie Notices | GDPR/cookie banners hide | Weekly | ~3,000 |
| AdShield Custom | Our own maintained list | As needed | ~2,000 |

### 8.2 Optional Filter Lists (User Can Enable)

| Filter List | Purpose |
|-------------|---------|
| Fanboy's Social Blocking | Facebook, Twitter widgets block |
| uBlock Origin filters | Extra cosmetic filters |
| Peter Lowe's Ad List | Additional ad servers |
| Spam404 | Scam & spam sites |

### 8.3 Filter Rule Format (ABP Syntax)

```
# URL blocking
||ads.example.com^

# Element hiding
example.com##.ad-banner

# Exception (whitelist)
@@||example.com^$document

# Advanced (scriptlet)
example.com##+js(abort-on-property-read, _ads)
```

### 8.4 Rule Processing Pipeline

```
User visits page
      ↓
Service Worker checks DNR rules
      ↓
Network request blocked? → YES → Block request, increment counter
      ↓ NO
Content script runs on page load
      ↓
DOM elements matched against CSS hiding rules
      ↓
Hidden elements se layout reflow karna
      ↓
Stats update karo → show in popup
```

---

## 9. Permissions & Privacy Policy

### 9.1 Permissions Justification

| Permission | Why Needed | User-Facing Explanation |
|-----------|-----------|------------------------|
| `declarativeNetRequest` | Ads aur trackers block karna | Core blocking functionality |
| `storage` | Settings aur stats save karna | Aapki preferences yaad rakhna |
| `tabs` | Current tab URL jaanna | Is site pe settings apply karna |
| `alarms` | Filter list update schedule karna | Latest rules auto-update |
| `scripting` | Content scripts inject karna | Page pe ads hide karna |
| `<all_urls>` | Har site pe rules apply karna | Everywhere effective blocking |

### 9.2 Privacy Commitments

**Hum kya NAHI karte:**
- User ki browsing history collect ya send nahi karte
- Personal data kisi third-party ko share nahi karte
- User ke form data ya passwords access nahi karte
- Remote code execute nahi karte (MV3 banned bhi hai)
- Kisi server pe ad viewing data nahi bhejte

**Hum kya KARTE hain:**
- Anonymous, aggregated usage stats (sirf opt-in ke baad)
- Filter list update ke liye CDN se rules download karna
- Premium users ke liye account sync (opt-in)

**Data Retention:**
- Local stats: User ke device pe, user delete kar sakta hai
- Sync data: Account delete pe saara data permanently remove

### 9.3 Acceptable Ads Program (Optional Revenue)

Adblock Plus ki tarah, hum ek **Acceptable Ads** program rakh sakte hain:
- Non-intrusive ads (static image, no animation) allow karna
- No tracking, no retargeting ads
- Advertisers ek small fee dete hain
- Users settings mein is program ko **disable** kar sakte hain
- Default: Enabled (users opt-out kar sakte hain)

---

## 10. Monetization Strategy

### 10.1 Revenue Streams

#### Stream 1 – Acceptable Ads Program
- Non-intrusive whitelisted ads se revenue
- Target: ₹10–50 CPM (cost per mille impressions)
- Estimated: ₹5–15 per MAU per month

#### Stream 2 – Premium Subscription
| Plan | Price | Target |
|------|-------|--------|
| Monthly | ₹149/month | Casual premium users |
| Annual | ₹999/year (save ₹789) | Committed users |
| Family | ₹199/month (up to 5 devices) | Family persona |

#### Stream 3 – Business / Enterprise
| Plan | Price | Features |
|------|-------|---------|
| Team (up to 25) | ₹999/month | Admin panel, bulk deploy |
| Enterprise (25+) | Custom pricing | SSO, API access, SLA, dedicated support |

#### Stream 4 – Whitelabel / API
- Other apps/browsers ko ad-blocking engine license karna
- B2B model, custom pricing

### 10.2 Financial Projections

| Milestone | Users | MRR |
|-----------|-------|-----|
| 3 months | 10,000 | ₹50,000 |
| 6 months | 100,000 | ₹3,00,000 |
| 12 months | 500,000 | ₹25,00,000 |
| 24 months | 2,000,000 | ₹1,00,00,000 |

*Assumptions: 2% premium conversion, ₹149 ARPU, 50% churn adjustment*

---

## 11. Development Roadmap

### Phase 1 – MVP (Month 1–2)

**Goal:** Working extension Chrome Web Store pe publish karna

**Features:**
- Basic ad blocking (pre-bundled EasyList rules)
- Simple popup UI (toggle, blocked count)
- Per-site whitelist
- Global enable/disable
- Extension icon with badge
- Chrome Web Store listing

**Tech:**
- Vanilla JS + HTML/CSS
- MV3 manifest
- Static DNR rule files
- `chrome.storage.local`

**Team:** 1 Frontend dev + 1 Designer
**Deliverable:** Published extension with 100+ installs

---

### Phase 2 – Core Feature Complete (Month 3–4)

**Goal:** Full-featured free tier

**Features:**
- YouTube ad blocking
- Tracker blocking (EasyPrivacy)
- Cookie notice remover
- Malware protection
- Filter list auto-update (24-hour schedule)
- Options page (React)
- Onboarding flow
- Basic stats dashboard
- India-specific filter list

**Tech:**
- React.js options page
- Service worker alarms
- Content script for YouTube
- Mutation Observer for dynamic content

**Team:** 2 Frontend devs + 1 Designer + 1 QA
**Deliverable:** 10,000 installs target

---

### Phase 3 – Premium Launch (Month 5–6)

**Goal:** Monetization shuru karna

**Features:**
- Premium subscription system
- Auto-play video blocker
- Newsletter pop-up blocker
- Smart cookie manager
- Cloud sync (Google login)
- Razorpay + Stripe payment integration
- Subscription management page

**Tech:**
- Supabase backend (auth + sync)
- Razorpay API
- JWT-based premium verification

**Team:** +1 Backend dev
**Deliverable:** ₹50,000 MRR

---

### Phase 4 – Growth (Month 7–9)

**Goal:** Power users aur enterprise attract karna

**Features:**
- Anti-fingerprinting
- Family safe mode
- Advanced analytics dashboard
- Advanced custom filter rules
- Firefox extension port
- Business tier admin panel
- Bulk deployment guide

**Tech:**
- WebExtensions API (cross-browser)
- Chart.js analytics
- Enterprise admin dashboard

**Team:** +1 Dev (backend/infra)
**Deliverable:** 100,000 installs, ₹3,00,000 MRR

---

### Phase 5 – Scale (Month 10–12)

**Goal:** Market leadership in India

**Features:**
- Mobile browser support (Kiwi, Brave)
- Whitelabel API
- AI-powered ad detection (for new ad formats)
- Hindi UI fully complete
- Regional filter lists (Bengali, Tamil, Telugu)
- Public roadmap aur community filter contributions

**Tech:**
- ML model (TFLite) for ad classification
- Multi-language i18n
- Public GitHub filter list contributions

**Deliverable:** 500,000 installs, ₹25,00,000 MRR

---

## 12. Success Metrics (KPIs)

### Product Metrics

| Metric | 3-Month Target | 12-Month Target |
|--------|---------------|-----------------|
| Chrome Web Store Installs | 10,000 | 500,000 |
| Daily Active Users (DAU) | 5,000 | 200,000 |
| Monthly Active Users (MAU) | 8,000 | 350,000 |
| 30-Day Retention | 40% | 60% |
| Average Rating | 4.0+ | 4.5+ |
| Crash Rate | < 1% | < 0.5% |

### Blocking Performance Metrics

| Metric | Target |
|--------|--------|
| Ad Block Rate (Alexa Top 1000) | ≥ 99% |
| Tracker Block Rate | ≥ 98% |
| Malware Domain Block Rate | ≥ 99.5% |
| False Positive Rate | < 0.1% |
| Page Load Improvement | ≥ 30% |
| CPU Overhead | < 2% per tab |
| Memory Usage | < 50MB |

### Business Metrics

| Metric | 3-Month | 12-Month |
|--------|---------|---------|
| Premium Conversions | 1% | 5% |
| Monthly Recurring Revenue | ₹50,000 | ₹25,00,000 |
| Churn Rate (Monthly) | < 10% | < 5% |
| Support Ticket Rate | < 2% of MAU | < 1% |

---

## 13. Risks & Mitigations

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| MV3 rule limit (30K) too restrictive | High | High | Static rules + rule deduplication + prioritization |
| YouTube ad blocker detection | High | High | Weekly content script updates, obfuscation |
| Service worker sleeping (state loss) | Medium | High | Persistent chrome.storage, no in-memory state |
| Chrome Web Store rejection | Medium | High | Strictly follow policies, review prep, appeal process |
| Filter list CDN downtime | Low | Medium | Multiple CDN mirrors, fallback to bundled rules |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Competition from uBlock/ABP/Brave | High | Medium | India focus, Hindi UX, better free tier, performance |
| Google restricting ad blockers more | Medium | High | Engage with open-source community, Chromium advocacy |
| Low premium conversion | Medium | Medium | Better onboarding, free trial, feature gating |
| User trust issues (privacy) | Low | High | Open-source code, no data collection, privacy audit |
| Acceptable Ads backlash | Medium | Low | Easy opt-out, transparency, clear communication |

### Compliance Risks

| Risk | Mitigation |
|------|-----------|
| GDPR compliance (EU users) | No PII collection, privacy-by-design |
| Google Play / Chrome Store policies | Regular policy review, legal counsel |
| Copyright for filter lists | Use open-source lists (EasyList — CC BY-SA 3.0) |

---

## 14. Tech Stack Summary

### Frontend (Extension)
- **Popup:** Vanilla JavaScript, HTML5, CSS3
- **Options Page:** React 18, Tailwind CSS, Vite bundler
- **Content Scripts:** Vanilla JavaScript (no framework — performance critical)
- **Build Tool:** Webpack / Vite with crxjs plugin

### Backend (Premium Features)
- **Auth & Sync:** Supabase (PostgreSQL + Auth)
- **Payments:** Razorpay (India) + Stripe (International)
- **Filter CDN:** Cloudflare CDN + R2 Storage
- **Analytics:** Self-hosted Plausible (privacy-first)
- **Error Tracking:** Sentry

### Infrastructure
- **Hosting:** Cloudflare Workers (edge functions)
- **Database:** Supabase PostgreSQL
- **CI/CD:** GitHub Actions
- **Package Manager:** pnpm

### Development Tools
- **Language:** JavaScript (ES2022+) / TypeScript (options page)
- **Testing:** Jest + Playwright (E2E)
- **Linting:** ESLint + Prettier
- **Version Control:** GitHub

---

## 15. File & Folder Structure

```
adshield-pro/
├── src/
│   ├── background/
│   │   ├── service-worker.js      # Main background script
│   │   ├── filter-updater.js      # Filter list download & update
│   │   ├── rule-manager.js        # DNR rule management
│   │   └── stats-tracker.js       # Block count tracking
│   │
│   ├── content-scripts/
│   │   ├── blocker.js             # Main element hiding
│   │   ├── youtube.js             # YouTube-specific logic
│   │   ├── autoplay-blocker.js    # Auto-play video (Premium)
│   │   ├── popup-blocker.js       # Newsletter pop-ups (Premium)
│   │   └── styles.css             # Element hiding CSS
│   │
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   │
│   ├── options/
│   │   ├── index.html
│   │   └── src/
│   │       ├── App.jsx
│   │       ├── pages/
│   │       │   ├── General.jsx
│   │       │   ├── FilterLists.jsx
│   │       │   ├── Whitelist.jsx
│   │       │   ├── CustomRules.jsx
│   │       │   ├── Statistics.jsx
│   │       │   └── Account.jsx
│   │       └── components/
│   │           ├── Toggle.jsx
│   │           ├── FilterListItem.jsx
│   │           └── StatsChart.jsx
│   │
│   ├── filter-parser/
│   │   ├── abp-parser.js          # ABP filter syntax parser
│   │   └── rule-converter.js      # ABP → DNR format converter
│   │
│   └── utils/
│       ├── storage.js             # Storage helper functions
│       ├── messaging.js           # Chrome runtime messaging
│       └── constants.js           # App constants
│
├── rules/
│   ├── easylist.json              # Pre-converted DNR rules
│   ├── easyprivacy.json
│   ├── easylist-india.json
│   └── malware-domains.json
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   ├── icon-disabled16.png
│   └── icon-disabled48.png
│
├── _locales/
│   ├── en/messages.json
│   └── hi/messages.json
│
├── manifest.json
├── package.json
├── vite.config.js
├── .eslintrc.js
└── README.md
```

---

## 16. Open Questions & Decisions

### Unresolved Items

| # | Question | Options | Decision By |
|---|----------|---------|------------|
| 1 | Premium payment gateway? | Razorpay only vs Razorpay + Stripe | Phase 3 start |
| 2 | Acceptable Ads default? | On by default vs Off by default | Pre-launch |
| 3 | Open-source strategy? | Fully open vs Core closed, filters open | Month 1 |
| 4 | Filter list hosting? | Self-host vs Use EasyList CDN | Month 2 |
| 5 | Analytics opt-in copy? | Hindi vs English vs Both | Design phase |
| 6 | Firefox support timeline? | Phase 4 vs Separate team | Roadmap review |
| 7 | AI ad detection scope? | Just video ads vs All ad types | Phase 5 |

### Assumptions Made in This PRD

- Chrome Web Store mein extension approved ho jaayegi
- EasyList India filter list maintained rehegi
- Google MV3 ke rules aage drastically change nahi honge in 12 months
- India mein users premium subscription ke liye ₹149/month pay karenge
- YouTube ad blocking feasible rahega (technically)

---

## Appendix

### A. Competitor Analysis

| Extension | Users | Price | India Filter | MV3 | Open Source |
|-----------|-------|-------|-------------|-----|-------------|
| Adblock Plus | 500M | Free/Premium | No | Yes | Partial |
| uBlock Origin | 50M | Free | No | Yes | Yes |
| Ghostery | 7M | Free/Premium | No | Yes | Yes |
| **AdShield Pro** | Target 500K | Free/₹149 | **Yes** | Yes | TBD |

### B. Glossary

| Term | Meaning |
|------|---------|
| MV3 | Manifest Version 3 — Chrome extension platform version |
| DNR | declarativeNetRequest — Chrome API for network blocking |
| ABP | Adblock Plus — filter rule syntax standard |
| EasyList | Open-source community-maintained ad blocking filter list |
| CDN | Content Delivery Network — fast file distribution |
| DAU/MAU | Daily/Monthly Active Users |
| MRR | Monthly Recurring Revenue |
| ARPU | Average Revenue Per User |
| DNR | Dynamic Network Request (rule) |
| FP | False Positive — legitimate content accidentally blocked |

### C. References

- Chrome Extension MV3 Documentation: https://developer.chrome.com/docs/extensions/mv3
- EasyList GitHub: https://github.com/easylist/easylist
- ABP Filter Syntax: https://help.adblockplus.org/hc/en-us/articles/360062733293
- Adblock Plus Source: https://gitlab.com/eyeo/adblockplus
- uBlock Origin: https://github.com/gorhill/uBlock

---

*Document maintained by: Product Team*
*Last Updated: March 2026*
*Next Review: April 2026*