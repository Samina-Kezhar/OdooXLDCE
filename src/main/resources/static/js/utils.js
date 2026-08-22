/**
 * GlobeTrotter Utility Library
 * Toast engine, conflict detection, currency formatters, debounce, image validator, date helpers.
 */

const Utils = {
  /**
   * Global Toast Notification Manager
   */
  showToast(message, type = 'info', title = null, duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const defaultTitles = {
      success: 'Success',
      error: 'Error Occurred',
      warning: 'Attention Needed',
      info: 'Information'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ'}</div>
      <div class="toast-content">
        <div class="toast-title">${title || defaultTitles[type] || 'Notification'}</div>
        <div class="toast-message">${Utils.escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
      <div class="toast-progress">
        <div class="toast-progress-fill"></div>
      </div>
    `;

    container.appendChild(toast);

    // Animate progress bar
    const progressFill = toast.querySelector('.toast-progress-fill');
    if (progressFill) {
      progressFill.style.transition = `transform ${duration}ms linear`;
      requestAnimationFrame(() => {
        progressFill.style.transform = 'scaleX(0)';
      });
    }

    // Dismiss handlers
    let dismissTimer = setTimeout(() => dismiss(), duration);

    function dismiss() {
      clearTimeout(dismissTimer);
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }

    toast.querySelector('.toast-close').addEventListener('click', () => dismiss());
  },

  /**
   * Overlapping Activity Conflict Detection Algorithm
   * Inspects all activities within a single day and flags overlapping time intervals.
   */
  detectActivityConflicts(activities) {
    if (!activities || activities.length < 2) {
      return { hasConflict: false, conflictingIds: new Set(), conflictPairs: [] };
    }

    const conflictingIds = new Set();
    const conflictPairs = [];

    // Parse each activity's start and end times in minutes from midnight
    const parsed = activities.map(act => ({
      id: act.id,
      name: act.name,
      start: Utils.timeToMinutes(act.startTime || '00:00'),
      end: Utils.timeToMinutes(act.endTime || '01:00')
    })).filter(a => a.end > a.start); // only consider valid duration

    for (let i = 0; i < parsed.length; i++) {
      for (let j = i + 1; j < parsed.length; j++) {
        const a = parsed[i];
        const b = parsed[j];

        // Overlap condition: a.start < b.end && b.start < a.end
        if (a.start < b.end && b.start < a.end) {
          conflictingIds.add(a.id);
          conflictingIds.add(b.id);
          conflictPairs.push({
            activityA: a.name,
            activityB: b.name,
            idA: a.id,
            idB: b.id
          });
        }
      }
    }

    return {
      hasConflict: conflictingIds.size > 0,
      conflictingIds,
      conflictPairs
    };
  },

  /**
   * Convert "HH:MM" (24h) to minutes from midnight
   */
  timeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  },

  /**
   * Debounce utility for responsive search inputs
   */
  debounce(fn, delay = 300) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Robust Currency Formatter with locale formatting and fallback
   */
  formatCurrency(amount, currencyCode = 'USD') {
    const numeric = Number(amount) || 0;
    const currency = CONFIG.CURRENCIES.find(c => c.code === currencyCode) || CONFIG.CURRENCIES[0];
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
        maximumFractionDigits: 0
      }).format(numeric);
    } catch (e) {
      return `${currency.symbol}${numeric.toLocaleString()}`;
    }
  },

  /**
   * Division-by-Zero safe percentage calculation
   */
  safePercentage(part, total) {
    const numPart = Number(part) || 0;
    const numTotal = Number(total) || 0;
    if (numTotal <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((numPart / numTotal) * 100)));
  },

  /**
   * Client-side Image File Size & Type Validator
   */
  validateImageFile(file, maxMb = 10) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('No file selected.'));
      }
      // Check MIME type
      if (!file.type.startsWith('image/')) {
        return reject(new Error('Selected file must be an image (JPEG, PNG, WEBP).'));
      }
      // Check file size (maxMb in bytes)
      const maxSizeBytes = maxMb * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
        return reject(new Error(`File is too large (${sizeInMb}MB). Maximum allowed image size is ${maxMb}MB.`));
      }

      // Convert to DataURL for immediate preview and offline persistence
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Date & Time Formatters
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  },

  formatDateShort(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  },

  daysBetween(startStr, endStr) {
    if (!startStr || !endStr) return 1;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diff = Math.max(0, end - start);
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  },

  isDateInPast(dateStr) {
    if (!dateStr) return false;
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return target < today;
  },

  getTripStatus(trip) {
    const today = new Date().toISOString().split('T')[0];
    if (trip.startDate > today) {
      const daysLeft = Utils.daysBetween(today, trip.startDate) - 1;
      return { label: `In ${daysLeft} days`, type: 'primary', raw: 'upcoming' };
    } else if (trip.endDate < today) {
      return { label: 'Completed', type: 'gray', raw: 'past' };
    } else {
      return { label: 'Ongoing Now', type: 'emerald', raw: 'ongoing' };
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
