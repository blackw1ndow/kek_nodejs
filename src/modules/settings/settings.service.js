const { AppError, NotFoundError } = require('../../errors/AppError');
const { settingsRepository } = require('./settings.repository');

/**
 * Normalizes a key to CONSTANT_CASE.
 * Example: 'tuitionMonthly' | 'TUITION_MONTHLY' | 'tuition-monthly' -> 'TUITION_MONTHLY'
 * 
 * @param {string} key
 * @returns {string}
 */
function toConstantCase(key) {
  return String(key)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}

function freezeValue(value) {
  return Array.isArray(value) ? Object.freeze([...value]) : value;
}

/**
 * Settings cache service.
 * Performs a single database query on startup; subsequent get() calls are synchronous.
 *
 * Example usage:
 *   await settingsService.load();                         // Call once on startup (e.g., server.js)
 *   const price = settingsService.get('TUITION_MONTHLY'); // Used everywhere else, no DB calls
 */
class SettingsService {
  constructor(repository = settingsRepository) {
    this.repository = repository;
    this.cache = Object.freeze({
      TUITION_MONTHLY: 1500000,
      MEAL_BASE_PER_DAY: 30000,
    });
    this.dbKeys = new Map([
      ['TUITION_MONTHLY', 'tuitionMonthly'],
      ['MEAL_BASE_PER_DAY', 'mealBasePerDay'],
    ]);
    this.loaded = true;
    this.loading = null;
  }

  /**
   * Loads settings once; repeated calls return the same result without hitting the database.
   * @returns {Promise<Object>}
   */
  async load() {
    if (!this.loading) {
      this.loading = this.refresh().catch((error) => {
        this.loading = null;
        throw error;
      });
    }
    return this.loading;
  }

  /**
   * Forcefully reloads settings from the database (e.g., if modified externally).
   * @returns {Promise<Object>}
   */
  async refresh() {
    const rows = await this.repository.findAll();
    const cache = {};
    const dbKeys = new Map();
    for (const row of rows) {
      const key = toConstantCase(row.key);
      cache[key] = freezeValue(row.value);
      dbKeys.set(key, row.key);
    }
    this.cache = Object.freeze(cache);
    this.dbKeys = dbKeys;
    this.loaded = true;
    return this.cache;
  }

  assertLoaded() {
    if (!this.loaded) {
      throw new AppError('Settings are not loaded yet: call settingsService.load() on startup');
    }
  }

  /**
   * Retrieves a setting by key.
   * 
   * @param {string} key e.g. 'TUITION_MONTHLY'
   * @returns {number|number[]|*}
   */
  get(key) {
    this.assertLoaded();
    const normalized = toConstantCase(key);
    if (!Object.hasOwn(this.cache, normalized)) {
      throw new NotFoundError(`Setting not found: ${key}`);
    }
    return this.cache[normalized];
  }

  getAll() {
    this.assertLoaded();
    return this.cache;
  }

  /**
   * Updates a value in the DB and immediately updates the cache.
   * New keys cannot be created — only existing ones can be updated.
   * 
   * @param {string} key
   * @param {*} value
   * @returns {Promise<{ key: string, value: * }>}
   */
  async set(key, value) {
    this.assertLoaded();
    const normalized = toConstantCase(key);
    const dbKey = this.dbKeys.get(normalized);
    if (dbKey === undefined) {
      throw new NotFoundError(`Setting not found: ${key}`);
    }

    const row = await this.repository.update(dbKey, value);
    this.cache = Object.freeze({ ...this.cache, [normalized]: freezeValue(row.value) });
    return { key: normalized, value: this.cache[normalized] };
  }
}

const settingsService = new SettingsService();

module.exports = { SettingsService, settingsService, toConstantCase };