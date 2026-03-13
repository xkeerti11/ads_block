// AdShield Pro - ABP Filter Syntax Parser
// Converts basic Adblock Plus filter rules to Chrome Declarative Net Request format

const FilterParser = {
  /**
   * Parse an array of ABP-syntax filter strings into DNR rules
   * @param {string[]} filters - ABP filter strings
   * @param {number} startId - Starting rule ID
   * @returns {{ rules: object[], errors: string[] }}
   */
  parse(filters, startId = 500000) {
    const rules = [];
    const errors = [];
    let ruleId = startId;

    for (const raw of filters) {
      const line = raw.trim();
      if (!line || line.startsWith('!') || line.startsWith('[')) continue;

      try {
        const rule = this._parseLine(line, ruleId);
        if (rule) {
          rules.push(rule);
          ruleId++;
        }
      } catch (e) {
        errors.push(`Invalid rule: "${line}" — ${e.message}`);
      }
    }

    return { rules, errors };
  },

  /**
   * Parse a single filter line
   * @param {string} line
   * @param {number} id
   * @returns {object|null}
   */
  _parseLine(line, id) {
    // Element hiding rule: domain##selector
    if (line.includes('##') && !line.includes('#@#')) {
      return this._parseElementHiding(line, id);
    }

    // Element hiding exception: domain#@#selector
    if (line.includes('#@#')) {
      return null; // Not supported in DNR — skip
    }

    // Exception (allowlist) rule: @@||domain^
    if (line.startsWith('@@')) {
      return this._parseException(line.substring(2), id);
    }

    // URL blocking rule: ||domain^ or /path/
    return this._parseBlockingRule(line, id);
  },

  /**
   * Parse a URL blocking rule
   */
  _parseBlockingRule(line, id) {
    let urlFilter = line;
    let domains = undefined;
    let resourceTypes = undefined;

    // Extract options after $
    const dollarPos = line.indexOf('$');
    if (dollarPos !== -1) {
      urlFilter = line.substring(0, dollarPos);
      const options = line.substring(dollarPos + 1).split(',');
      const parsed = this._parseOptions(options);
      domains = parsed.domains;
      resourceTypes = parsed.resourceTypes;
    }

    if (!urlFilter) return null;

    const condition = { urlFilter };
    if (resourceTypes && resourceTypes.length > 0) {
      condition.resourceTypes = resourceTypes;
    } else {
      condition.resourceTypes = ['script', 'image', 'sub_frame', 'xmlhttprequest', 'other'];
    }
    if (domains) {
      if (domains.include.length > 0) condition.initiatorDomains = domains.include;
      if (domains.exclude.length > 0) condition.excludedInitiatorDomains = domains.exclude;
    }

    return {
      id,
      priority: 1,
      action: { type: 'block' },
      condition,
    };
  },

  /**
   * Parse an exception/allowlist rule
   */
  _parseException(line, id) {
    let urlFilter = line;
    let resourceTypes = undefined;
    let domains = undefined;

    const dollarPos = line.indexOf('$');
    if (dollarPos !== -1) {
      urlFilter = line.substring(0, dollarPos);
      const options = line.substring(dollarPos + 1).split(',');
      const parsed = this._parseOptions(options);
      domains = parsed.domains;
      resourceTypes = parsed.resourceTypes;

      // $document exception = allow entire page
      if (parsed.isDocument) {
        return {
          id,
          priority: 2,
          action: { type: 'allowAllRequests' },
          condition: {
            urlFilter,
            resourceTypes: ['main_frame'],
          },
        };
      }
    }

    if (!urlFilter) return null;

    const condition = { urlFilter };
    if (resourceTypes && resourceTypes.length > 0) {
      condition.resourceTypes = resourceTypes;
    } else {
      condition.resourceTypes = ['script', 'image', 'sub_frame', 'xmlhttprequest', 'other'];
    }
    if (domains) {
      if (domains.include.length > 0) condition.initiatorDomains = domains.include;
      if (domains.exclude.length > 0) condition.excludedInitiatorDomains = domains.exclude;
    }

    return {
      id,
      priority: 2,
      action: { type: 'allow' },
      condition,
    };
  },

  /**
   * Parse an element hiding rule (returns null — these are CSS-based, not DNR)
   * Element hiding rules are handled by content scripts, not DNR.
   * We return a special marker so the caller can apply them differently.
   */
  _parseElementHiding(line, id) {
    const parts = line.split('##');
    const domainPart = parts[0];
    const selector = parts.slice(1).join('##');

    if (!selector) return null;

    // Return a special object type for element hiding
    return {
      id,
      type: 'cosmetic',
      domains: domainPart ? domainPart.split(',').filter(Boolean) : [],
      selector,
    };
  },

  /**
   * Parse filter options (after $)
   */
  _parseOptions(options) {
    const resourceTypeMap = {
      script: 'script',
      image: 'image',
      stylesheet: 'stylesheet',
      'sub_frame': 'sub_frame',
      subdocument: 'sub_frame',
      xmlhttprequest: 'xmlhttprequest',
      media: 'media',
      font: 'font',
      websocket: 'websocket',
      other: 'other',
      object: 'object',
    };

    const include = [];
    const exclude = [];
    const resourceTypes = [];
    let isDocument = false;

    for (const opt of options) {
      const trimmed = opt.trim().toLowerCase();

      if (trimmed === 'document') {
        isDocument = true;
        continue;
      }

      if (trimmed.startsWith('domain=')) {
        const domainStr = opt.substring(7);
        for (const d of domainStr.split('|')) {
          if (d.startsWith('~')) {
            exclude.push(d.substring(1));
          } else {
            include.push(d);
          }
        }
        continue;
      }

      // Resource type
      if (trimmed.startsWith('~')) {
        // Negated types — not directly supported, skip
        continue;
      }

      if (resourceTypeMap[trimmed]) {
        resourceTypes.push(resourceTypeMap[trimmed]);
      }

      if (trimmed === 'third-party') {
        // DNR uses domainType for this
        // We'll handle this separately if needed
      }
    }

    return {
      domains: (include.length > 0 || exclude.length > 0) ? { include, exclude } : undefined,
      resourceTypes: resourceTypes.length > 0 ? resourceTypes : undefined,
      isDocument,
    };
  },

  /**
   * Separate parsed results into DNR rules and cosmetic rules
   * @param {{ rules: object[], errors: string[] }} parsed
   * @returns {{ dnrRules: object[], cosmeticRules: object[], errors: string[] }}
   */
  separate(parsed) {
    const dnrRules = [];
    const cosmeticRules = [];

    for (const rule of parsed.rules) {
      if (rule.type === 'cosmetic') {
        cosmeticRules.push(rule);
      } else {
        dnrRules.push(rule);
      }
    }

    return { dnrRules, cosmeticRules, errors: parsed.errors };
  },

  /**
   * Validate a single filter line
   * @param {string} line
   * @returns {{ valid: boolean, type: string, error?: string }}
   */
  validate(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('!') || trimmed.startsWith('[')) {
      return { valid: true, type: 'comment' };
    }

    try {
      if (trimmed.includes('##')) return { valid: true, type: 'cosmetic' };
      if (trimmed.includes('#@#')) return { valid: true, type: 'cosmetic-exception' };
      if (trimmed.startsWith('@@')) return { valid: true, type: 'exception' };
      if (trimmed.startsWith('||') || trimmed.startsWith('/') || trimmed.includes('^')) {
        return { valid: true, type: 'blocking' };
      }
      return { valid: true, type: 'blocking' };
    } catch (e) {
      return { valid: false, type: 'unknown', error: e.message };
    }
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FilterParser;
}
