/**
 * Screens 7 & 8: City & Activity Search View
 * Fast debounced search across destinations and activities, multi-criteria filters,
 * "Add to Trip" actions, wishlist bookmarks, and friendly empty search states.
 */

const SearchView = {
  currentTab: 'activities', // 'activities' | 'destinations'
  searchQuery: '',
  selectedRegion: 'all',
  selectedCategory: 'all',
  selectedMaxCost: 300,
  targetTripContext: null, // { tripId, dayNumber } if opened from builder

  render(context = null) {
    const container = document.getElementById('view-container');
    if (!container) return;

    if (context) this.targetTripContext = context;

    // Filter Activities
    let activities = CONFIG.ACTIVITIES_CATALOG.filter(act => {
      // Query search
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchName = act.name.toLowerCase().includes(q);
        const matchCity = act.cityName.toLowerCase().includes(q);
        const matchDesc = act.description.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchDesc) return false;
      }
      // Category
      if (this.selectedCategory !== 'all' && act.category !== this.selectedCategory) return false;
      // Max cost
      if (act.cost > this.selectedMaxCost) return false;

      return true;
    });

    // Filter Destinations
    let destinations = CONFIG.DESTINATIONS.filter(dest => {
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const match = dest.name.toLowerCase().includes(q) || 
                      dest.country.toLowerCase().includes(q) || 
                      dest.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (this.selectedRegion !== 'all' && dest.region !== this.selectedRegion) return false;
      return true;
    });

    const regions = ['all', 'Europe', 'Asia', 'Americas', 'Africa'];
    const activeTrips = AppStore.trips;

    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Header -->
        <div class="flex items-center justify-between" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="badge badge-cyan" style="margin-bottom: 0.5rem;">Discovery Engine</div>
            <h1>Explore <span class="text-gradient-cyan">Destinations & Experiences</span></h1>
            <p>Find iconic landmarks, culinary tours, scenic train journeys, and add them directly to your itinerary.</p>
          </div>
          ${this.targetTripContext?.tripId ? `
            <div class="badge badge-emerald" style="padding: 0.5rem 1rem;">
              🎯 Adding to: ${Utils.escapeHtml(AppStore.getCurrentTrip()?.title || 'Active Trip')}
            </div>
          ` : ''}
        </div>

        <!-- Search Controls Hero Box -->
        <div class="search-hero">
          <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
            <!-- Main Search Input (Debounced) -->
            <div style="position: relative; flex: 1; min-width: 280px;">
              <input type="text" class="form-control" id="search-main-input"
                placeholder="Search by city, activity, e.g. 'Tokyo', 'Louvre', 'Cruise'..."
                value="${Utils.escapeHtml(this.searchQuery)}"
                oninput="SearchView.handleSearchInput(this.value)"
                style="padding-left: 2.5rem; font-size: 1rem;" />
              <span style="position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); font-size: 1.1rem; color: var(--text-subtle);">🔍</span>
            </div>

            <!-- Tab Switcher (Activities vs Cities) -->
            <div class="tab-list">
              <button class="tab-btn ${this.currentTab === 'activities' ? 'active' : ''}" onclick="SearchView.switchTab('activities')">
                <span>🎯</span> Activities (${activities.length})
              </button>
              <button class="tab-btn ${this.currentTab === 'destinations' ? 'active' : ''}" onclick="SearchView.switchTab('destinations')">
                <span>🏛️</span> Destinations (${destinations.length})
              </button>
            </div>
          </div>

          <!-- Dynamic Filter Pills -->
          ${this.currentTab === 'activities' ? `
            <!-- Activity Category Pills & Max Cost -->
            <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 1rem;">
              <div class="search-filter-pills" style="margin-top: 0;">
                <button class="filter-pill ${this.selectedCategory === 'all' ? 'active' : ''}" onclick="SearchView.setCategory('all')">All Categories</button>
                ${CONFIG.CATEGORIES.map(cat => `
                  <button class="filter-pill ${this.selectedCategory === cat.id ? 'active' : ''}" onclick="SearchView.setCategory('${cat.id}')">
                    ${cat.icon} ${cat.name}
                  </button>
                `).join('')}
              </div>

              <!-- Price Filter Slider -->
              <div class="flex items-center gap-2" style="font-size: 0.825rem; color: var(--text-muted);">
                <span>Max Cost:</span>
                <input type="range" min="0" max="300" step="10" value="${this.selectedMaxCost}" 
                  oninput="SearchView.setMaxCost(this.value)" style="cursor: pointer; width: 100px;" />
                <span class="font-bold" style="color: var(--accent-emerald);">${Utils.formatCurrency(this.selectedMaxCost, 'USD')}</span>
              </div>
            </div>
          ` : `
            <!-- Region Pills -->
            <div class="search-filter-pills" style="margin-top: 0;">
              ${regions.map(r => `
                <button class="filter-pill ${this.selectedRegion === r ? 'active' : ''}" onclick="SearchView.setRegion('${r}')">
                  ${r === 'all' ? '🌍 All Continents' : r}
                </button>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Search Results Grid -->
        ${(this.currentTab === 'activities' ? activities.length : destinations.length) === 0 ? `
          <!-- Friendly No Results Graphic & Reset CTA -->
          <div class="empty-state" style="margin: 3rem auto;">
            <div class="empty-state-icon">🔎</div>
            <h3 class="empty-state-title">No matching experiences found</h3>
            <p class="empty-state-desc">We couldn't find any results matching "<strong>${Utils.escapeHtml(this.searchQuery)}</strong>". Try adjusting your filters or price limit.</p>
            <button class="btn btn-primary" onclick="SearchView.resetSearchFilters()">
              Reset Search & Filters
            </button>
          </div>
        ` : this.currentTab === 'activities' ? `
          <!-- Activities Grid -->
          <div class="trips-grid">
            ${activities.map(act => {
              const cat = CONFIG.CATEGORIES.find(c => c.id === act.category) || CONFIG.CATEGORIES[0];

              return `
                <div class="glass-card trip-card">
                  <div class="trip-card-header">
                    <img src="${act.image}" alt="${Utils.escapeHtml(act.name)}" class="trip-card-cover" />
                    <span class="badge badge-primary trip-status-tag">${cat.icon} ${cat.name}</span>
                  </div>
                  <div class="trip-card-body">
                    <div class="flex items-center justify-between" style="margin-bottom: 0.35rem;">
                      <span style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600;">📍 ${act.cityName}</span>
                      <span style="font-size: 0.78rem; color: var(--text-subtle);">⏱️ ${act.duration}</span>
                    </div>
                    <div class="trip-card-title">${Utils.escapeHtml(act.name)}</div>
                    <p style="font-size: 0.85rem; line-height: 1.4; color: var(--text-muted); margin-bottom: 1rem;">
                      ${Utils.escapeHtml(act.description)}
                    </p>
                    
                    <div class="flex items-center justify-between" style="margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--glass-border);">
                      <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-emerald);">
                        ${act.cost === 0 ? 'Free' : Utils.formatCurrency(act.cost, 'USD')}
                      </div>
                      <button class="btn btn-primary btn-sm" onclick="SearchView.openAddToTripModal('${act.id}')">
                        <span>➕</span> Add to Trip
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- Destinations Grid -->
          <div class="destinations-grid">
            ${destinations.map(dest => {
              const isWishlisted = AppStore.wishlist.includes(dest.id);

              return `
                <div class="glass-card destination-card glass-card-interactive" onclick="SearchView.openDestinationDetail('${dest.id}')">
                  <img src="${dest.image}" alt="${dest.name}" class="destination-card-img" />
                  <div class="destination-card-overlay">
                    <div class="flex items-center justify-between" style="margin-bottom: 0.35rem;">
                      <span class="badge badge-cyan">${dest.region}</span>
                      <button class="btn btn-icon btn-sm" style="background: rgba(0,0,0,0.5); color: ${isWishlisted ? 'var(--accent-rose)' : '#fff'};" 
                        onclick="event.stopPropagation(); SearchView.toggleWishlist('${dest.id}')" title="Save to Wishlist">
                        ${isWishlisted ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <h3 style="color: #fff; margin-bottom: 0.25rem;">${dest.name}, ${dest.country}</h3>
                    <p style="font-size: 0.825rem; color: #cbd5e1; margin-bottom: 0.75rem; line-height: 1.3;">${dest.description}</p>
                    <div class="flex items-center justify-between">
                      <span style="font-size: 0.85rem; color: var(--accent-emerald); font-weight: 600;">
                        Avg ${Utils.formatCurrency(dest.avgDailyCost, 'USD')}/day
                      </span>
                      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); DashboardView.planTripToDestination('${dest.id}')">
                        Plan Journey &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  handleSearchInput: Utils.debounce(function(val) {
    SearchView.searchQuery = val;
    SearchView.render();
  }, 300),

  setCategory(cat) {
    this.selectedCategory = cat;
    this.render();
  },

  setRegion(region) {
    this.selectedRegion = region;
    this.render();
  },

  setMaxCost(cost) {
    this.selectedMaxCost = Number(cost);
    this.render();
  },

  resetSearchFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedRegion = 'all';
    this.selectedMaxCost = 300;
    this.render();
  },

  toggleWishlist(destId) {
    let list = [...AppStore.wishlist];
    if (list.includes(destId)) {
      list = list.filter(id => id !== destId);
      Utils.showToast('Removed from saved wishlist.', 'info');
    } else {
      list.push(destId);
      Utils.showToast('Saved to your destination wishlist! ❤️', 'success');
    }
    AppStore.saveWishlist(list);
    this.render();
  },

  openAddToTripModal(actId) {
    const act = CONFIG.ACTIVITIES_CATALOG.find(a => a.id === actId);
    if (!act) return;

    const trips = AppStore.trips;
    if (trips.length === 0) {
      Utils.showToast('Please create a trip first to add activities.', 'warning');
      AppRouter.navigate('create-trip');
      return;
    }

    const defaultTripId = this.targetTripContext?.tripId || AppStore.currentTripId || trips[0].id;
    const selectedTrip = trips.find(t => t.id === defaultTripId) || trips[0];

    const modalHtml = `
      <div class="modal-header">
        <div class="modal-title">➕ Add Experience to Trip</div>
        <button class="modal-close" onclick="AppRouter.closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="glass-card-subtle flex items-center gap-3" style="margin-bottom: 1.25rem;">
          <img src="${act.image}" style="width: 60px; height: 60px; border-radius: var(--radius-xs); object-fit: cover;" />
          <div>
            <div class="font-bold" style="font-size: 0.95rem;">${Utils.escapeHtml(act.name)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">📍 ${act.cityName} &bull; ${Utils.formatCurrency(act.cost, 'USD')}</div>
          </div>
        </div>

        <form id="form-add-to-trip" onsubmit="SearchView.handleAddToTripSubmit(event, '${act.id}')">
          <div class="form-group">
            <label class="form-label">Select Trip</label>
            <select id="select-target-trip" class="form-control" onchange="SearchView.updateModalDaysDropdown(this.value)">
              ${trips.map(t => `<option value="${t.id}" ${t.id === selectedTrip.id ? 'selected' : ''}>${Utils.escapeHtml(t.title)}</option>`).join('')}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Select Day</label>
              <select id="select-target-day" class="form-control">
                ${selectedTrip.days.map(d => `<option value="${d.dayNumber}">Day ${d.dayNumber} (${Utils.formatDateShort(d.date)})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Start Time</label>
              <input type="time" id="select-start-time" class="form-control" value="10:00" required />
            </div>
          </div>

          <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: -0.5rem;">
            <button type="button" class="btn btn-secondary" onclick="AppRouter.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm & Add</button>
          </div>
        </form>
      </div>
    `;
    AppRouter.openModal(modalHtml);
  },

  updateModalDaysDropdown(tripId) {
    const trip = AppStore.trips.find(t => t.id === tripId);
    const daySelect = document.getElementById('select-target-day');
    if (!trip || !daySelect) return;

    daySelect.innerHTML = trip.days.map(d => `<option value="${d.dayNumber}">Day ${d.dayNumber} (${Utils.formatDateShort(d.date)})</option>`).join('');
  },

  async handleAddToTripSubmit(event, actId) {
    event.preventDefault();
    const act = CONFIG.ACTIVITIES_CATALOG.find(a => a.id === actId);
    if (!act) return;

    const tripId = document.getElementById('select-target-trip').value;
    const dayNumber = parseInt(document.getElementById('select-target-day').value, 10);
    const startTime = document.getElementById('select-start-time').value;

    // Estimate end time (+2h)
    const [h, m] = startTime.split(':').map(Number);
    const endH = Math.min(23, h + 2);
    const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    try {
      await MockApi.addActivity(tripId, dayNumber, {
        name: act.name,
        category: act.category,
        cost: act.cost,
        startTime,
        endTime,
        location: act.cityName,
        notes: act.description
      });

      AppRouter.closeModal();
      Utils.showToast(`"${act.name}" added to Day ${dayNumber}!`, 'success');
      AppRouter.navigate('itinerary-builder', tripId);
    } catch (err) {
      Utils.showToast(err.message || 'Failed to add activity.', 'error');
    }
  }
};
