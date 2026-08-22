/**
 * GlobeTrotter Centralized State Management Store
 * Reactive state with local storage persistence and event emitter.
 */

class StateStore {
  constructor() {
    this.listeners = {};
    this.user = this.loadUser();
    this.trips = this.loadTrips();
    this.settings = this.loadSettings();
    this.wishlist = this.loadWishlist();
    this.currentTripId = this.trips.length > 0 ? this.trips[0].id : null;
    this.currentView = 'dashboard';
    this.activeSearchFilters = { query: '', region: 'all', category: 'all', maxCost: 300 };
  }

  loadUser() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY_USER);
      if (stored) {
        const parsed = JSON.parse(stored);
        // SECURITY FIX: never trust a stored isLoggedIn=true from a previous
        // session — the backend session may have expired. Always start as
        // logged-out; the backend /api/auth/me call will re-hydrate if valid.
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse user from localStorage', e);
    }
    // Default: guest (not logged in). Never auto-login.
    return { id: null, name: '', email: '', isLoggedIn: false };
  }

  loadTrips() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY_TRIPS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse trips from localStorage', e);
    }
    // Initialize with rich seed data
    const initial = JSON.parse(JSON.stringify(CONFIG.INITIAL_SEED_TRIPS));
    this.saveTrips(initial);
    return initial;
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse settings', e);
    }
    return {
      theme: 'dark',
      useDestinationTimeZone: true,
      simulateSlowNetwork: false,
      simulateConflictWarning: true
    };
  }

  loadWishlist() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY_WISHLIST);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse wishlist', e);
    }
    return ['dest-tokyo', 'dest-bali', 'dest-zurich'];
  }

  _persistTrips() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY_TRIPS, JSON.stringify(this.trips));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        Utils.showToast('Storage is full! Some data may not be saved. Please export a backup.', 'warning');
      }
    }
  }

  saveTrips(trips = this.trips) {
    this.trips = trips;
    // Debounce the actual write to avoid thrashing on rapid updates
    if (!this._saveTripsTimer) {
      this._saveTripsTimer = setTimeout(() => {
        this._persistTrips();
        this._saveTripsTimer = null;
      }, 400);
    }
    this.emit('trips:updated', this.trips);
  }

  saveUser(user = this.user) {
    this.user = user;
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY_USER, JSON.stringify(this.user));
    } catch (e) {
      console.warn('Failed to persist user state', e);
    }
    this.emit('user:updated', this.user);
  }

  saveSettings(settings = this.settings) {
    this.settings = settings;
    localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
    this.emit('settings:updated', this.settings);
  }

  saveWishlist(wishlist = this.wishlist) {
    this.wishlist = wishlist;
    localStorage.setItem(CONFIG.STORAGE_KEY_WISHLIST, JSON.stringify(this.wishlist));
    this.emit('wishlist:updated', this.wishlist);
  }

  // Active Trip Accessors
  getCurrentTrip() {
    if (!this.currentTripId && this.trips.length > 0) {
      this.currentTripId = this.trips[0].id;
    }
    return this.trips.find(t => t.id === this.currentTripId) || this.trips[0] || null;
  }

  setCurrentTripId(tripId) {
    this.currentTripId = tripId;
    this.emit('currentTrip:changed', this.getCurrentTrip());
  }

  // Pub / Sub Pattern
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  }

  // Reset to initial seed demo state
  resetToDemo() {
    localStorage.removeItem(CONFIG.STORAGE_KEY_TRIPS);
    localStorage.removeItem(CONFIG.STORAGE_KEY_USER);
    localStorage.removeItem(CONFIG.STORAGE_KEY_SETTINGS);
    localStorage.removeItem(CONFIG.STORAGE_KEY_WISHLIST);
    this.user = this.loadUser();
    this.trips = this.loadTrips();
    this.settings = this.loadSettings();
    this.wishlist = this.loadWishlist();
    this.currentTripId = this.trips[0]?.id || null;
    this.emit('app:reset', true);
  }
}

// Global singleton
window.AppStore = new StateStore();
