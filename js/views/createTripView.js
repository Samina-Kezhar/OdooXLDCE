/**
 * Screen 3: Create / Edit Trip View
 * Handles new trip creation, dates validation (start date in past, end date before start date),
 * 10MB image upload validation, cover image picker, and budget initialization.
 */

const CreateTripView = {
  selectedCoverUrl: CONFIG.COVER_PRESETS[0].url,
  selectedTags: ['Culture'],

  render(prefillData = null) {
    const container = document.getElementById('view-container');
    if (!container) return;

    // Default dates: tomorrow to next week
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 8);

    const defaultStart = tomorrow.toISOString().split('T')[0];
    const defaultEnd = nextWeek.toISOString().split('T')[0];

    const title = prefillData?.destination ? `Adventure to ${prefillData.destination}` : '';
    const destination = prefillData?.destination || '';
    const budget = prefillData?.budget || 2000;
    this.selectedCoverUrl = prefillData?.coverImage || CONFIG.COVER_PRESETS[0].url;

    const availableTags = ['Culture', 'Adventure', 'Foodie', 'Relax', 'Luxury', 'Budget', 'Solo', 'Family'];

    container.innerHTML = `
      <div class="animate-fade-in" style="max-width: 840px; margin: 0 auto;">
        <!-- Page Header -->
        <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
          <div>
            <div class="badge badge-primary" style="margin-bottom: 0.5rem;">Trip Planner</div>
            <h1>Create <span class="text-gradient">New Journey</span></h1>
            <p>Define your destination, dates, and budget to begin building your day-by-day itinerary.</p>
          </div>
          <button class="btn btn-secondary" onclick="AppRouter.navigate('dashboard')">
            &larr; Back to Dashboard
          </button>
        </div>

        <form id="form-create-trip" class="glass-card" onsubmit="CreateTripView.handleSubmit(event)">
          <!-- Trip Title & Destination -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="trip-title">Trip Name / Title <span class="required">*</span></label>
              <input type="text" id="trip-title" class="form-control" placeholder="e.g. Japanese Sakura & Tech Odyssey" required value="${Utils.escapeHtml(title)}" />
              <div class="form-error hidden" id="trip-title-error"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="trip-destination">Primary Destination(s) <span class="required">*</span></label>
              <input type="text" id="trip-destination" class="form-control" placeholder="e.g. Tokyo & Kyoto, Japan" required value="${Utils.escapeHtml(destination)}" />
              <div class="form-error hidden" id="trip-destination-error"></div>
            </div>
          </div>

          <!-- Date Range (With Strict Validation) -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="trip-start-date">Start Date <span class="required">*</span></label>
              <input type="date" id="trip-start-date" class="form-control" required value="${defaultStart}" onchange="CreateTripView.validateDates()" />
              <div class="form-error hidden" id="trip-start-date-error"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="trip-end-date">End Date <span class="required">*</span></label>
              <input type="date" id="trip-end-date" class="form-control" required value="${defaultEnd}" onchange="CreateTripView.validateDates()" />
              <div class="form-error hidden" id="trip-end-date-error"></div>
            </div>
          </div>

          <!-- Budget & Currency -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="trip-budget">Target Budget</label>
              <input type="number" id="trip-budget" class="form-control" placeholder="2500" min="0" step="50" value="${budget}" />
              <div class="form-hint">Set your total spending ceiling for automated daily cost alerts.</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="trip-currency">Currency</label>
              <select id="trip-currency" class="form-control">
                ${CONFIG.CURRENCIES.map(c => `
                  <option value="${c.code}" ${c.code === (AppStore.user.homeCurrency || 'USD') ? 'selected' : ''}>
                    ${c.name} (${c.symbol})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Travel Tags -->
          <div class="form-group">
            <label class="form-label">Travel Style & Tags</label>
            <div class="flex items-center gap-2" style="flex-wrap: wrap; margin-top: 0.25rem;">
              ${availableTags.map(tag => `
                <button type="button" class="filter-pill ${this.selectedTags.includes(tag) ? 'active' : ''}" 
                  onclick="CreateTripView.toggleTag('${tag}', this)">
                  #${tag}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Trip Description -->
          <div class="form-group">
            <label class="form-label" for="trip-desc">Trip Description & Notes (Optional)</label>
            <textarea id="trip-desc" class="form-control" placeholder="What are your goals, key landmarks, or travel buddies for this journey?"></textarea>
          </div>

          <!-- Cover Image Section -->
          <div class="form-group">
            <label class="form-label">Trip Cover Photo</label>
            <div style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 0.5rem;">
              Select a curated HD wallpaper or upload your own custom photo (Max 10MB).
            </div>

            <!-- Cover Preset Selection -->
            <div class="cover-picker-grid" id="cover-presets-container">
              ${CONFIG.COVER_PRESETS.map(preset => `
                <img src="${preset.url}" alt="${preset.title}" 
                  class="cover-preset-thumb ${preset.url === this.selectedCoverUrl ? 'selected' : ''}" 
                  title="${preset.title}"
                  onclick="CreateTripView.selectPresetCover('${preset.url}', this)" />
              `).join('')}
            </div>

            <!-- Custom File Upload (With 10MB Client-side File Guard) -->
            <div style="margin-top: 1rem;">
              <div class="file-dropzone" onclick="document.getElementById('trip-cover-file').click()">
                <input type="file" id="trip-cover-file" accept="image/*" class="hidden" onchange="CreateTripView.handleFileUpload(event)" />
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">📸</div>
                <div class="font-semibold" style="font-size: 0.9rem;">Upload Custom Image</div>
                <div style="font-size: 0.75rem; color: var(--text-subtle);">Supports JPG, PNG, WebP (Strict 10MB limit)</div>
              </div>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex items-center justify-between" style="margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--glass-border);">
            <button type="button" class="btn btn-ghost" onclick="AppRouter.navigate('dashboard')">
              Cancel
            </button>
            <button type="submit" id="btn-create-trip-submit" class="btn btn-primary btn-lg">
              <span>🚀</span> Create Trip & Start Itinerary
            </button>
          </div>
        </form>
      </div>
    `;
  },

  selectPresetCover(url, element) {
    this.selectedCoverUrl = url;
    document.querySelectorAll('.cover-preset-thumb').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
  },

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validate <= 10MB
      const dataUrl = await Utils.validateImageFile(file, 10);
      this.selectedCoverUrl = dataUrl;
      document.querySelectorAll('.cover-preset-thumb').forEach(el => el.classList.remove('selected'));
      Utils.showToast(`Custom cover image loaded (${(file.size / 1024 / 1024).toFixed(2)} MB)!`, 'success');
    } catch (err) {
      // Handles 10MB file size edge case
      Utils.showToast(err.message, 'error', 'File Upload Error');
      event.target.value = ''; // reset file input
    }
  },

  toggleTag(tag, element) {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
      element.classList.remove('active');
    } else {
      this.selectedTags.push(tag);
      element.classList.add('active');
    }
  },

  validateDates() {
    const startInput = document.getElementById('trip-start-date');
    const endInput = document.getElementById('trip-end-date');
    if (!startInput || !endInput) return true;

    const startDate = startInput.value;
    const endDate = endInput.value;

    let isValid = true;

    // Error: End date is before Start date
    if (startDate && endDate && endDate < startDate) {
      endInput.classList.add('is-invalid');
      Utils.showToast('End Date cannot be before the Start Date.', 'error');
      isValid = false;
    } else {
      endInput.classList.remove('is-invalid');
    }

    // Warning: Start date in past
    if (startDate && Utils.isDateInPast(startDate)) {
      startInput.classList.add('is-invalid');
      Utils.showToast('Note: The selected start date is in the past.', 'warning');
    } else {
      startInput.classList.remove('is-invalid');
    }

    return isValid;
  },

  async handleSubmit(event) {
    event.preventDefault();
    if (!this.validateDates()) return;

    const btn = document.getElementById('btn-create-trip-submit');
    const title = document.getElementById('trip-title').value.trim();
    const destination = document.getElementById('trip-destination').value.trim();
    const startDate = document.getElementById('trip-start-date').value;
    const endDate = document.getElementById('trip-end-date').value;
    const budget = document.getElementById('trip-budget').value;
    const currency = document.getElementById('trip-currency').value;
    const description = document.getElementById('trip-desc').value.trim();

    if (!title || !destination || !startDate || !endDate) {
      Utils.showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (endDate < startDate) {
      Utils.showToast('End date must be on or after the start date.', 'error');
      return;
    }

    btn.classList.add('btn-loading');
    try {
      const response = await MockApi.createTrip({
        title,
        destination,
        startDate,
        endDate,
        budget,
        currency,
        description,
        coverImage: this.selectedCoverUrl,
        tags: this.selectedTags
      });

      Utils.showToast(`Trip "${response.data.title}" successfully created!`, 'success');
      AppRouter.navigate('itinerary-builder', response.data.id);
    } catch (err) {
      Utils.showToast(err.message || 'Failed to create trip.', 'error');
    } finally {
      btn.classList.remove('btn-loading');
    }
  }
};
