/**
 * Screen 4: My Trips (Trip List) View
 * Handles trip cards listing, filtering (All, Upcoming, Ongoing, Past), pagination/infinite scroll,
 * cloning, and safe deletion confirmation modal.
 */

const TripListView = {
  currentFilter: 'all',
  searchQuery: '',
  currentPage: 1,
  pageSize: 6,

  async render() {
    const container = document.getElementById('view-container');
    if (!container) return;

    const tripsResponse = await MockApi.getTrips();
    let trips = tripsResponse.data;

    // Filter by tab
    if (this.currentFilter !== 'all') {
      trips = trips.filter(t => Utils.getTripStatus(t).raw === this.currentFilter);
    }

    // Filter by keyword search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      trips = trips.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.destination.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Pagination calculations
    const totalItems = trips.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    this.currentPage = Math.min(this.currentPage, totalPages);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginatedTrips = trips.slice(startIndex, startIndex + this.pageSize);

    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Header -->
        <div class="flex items-center justify-between" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="badge badge-primary" style="margin-bottom: 0.5rem;">My Itineraries</div>
            <h1>Your Travel <span class="text-gradient">Collections</span></h1>
            <p>Review, modify, duplicate, or share all your upcoming and past travel itineraries.</p>
          </div>
          <button class="btn btn-primary btn-lg" onclick="AppRouter.navigate('create-trip')">
            <span>✨</span> Plan New Trip
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="glass-card flex items-center justify-between" style="padding: 0.85rem 1.25rem; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;">
          <!-- Tabs -->
          <div class="tab-list">
            <button class="tab-btn ${this.currentFilter === 'all' ? 'active' : ''}" onclick="TripListView.setFilter('all')">All Trips</button>
            <button class="tab-btn ${this.currentFilter === 'upcoming' ? 'active' : ''}" onclick="TripListView.setFilter('upcoming')">Upcoming</button>
            <button class="tab-btn ${this.currentFilter === 'ongoing' ? 'active' : ''}" onclick="TripListView.setFilter('ongoing')">Ongoing</button>
            <button class="tab-btn ${this.currentFilter === 'past' ? 'active' : ''}" onclick="TripListView.setFilter('past')">Past / Archive</button>
          </div>

          <!-- Search Input -->
          <div style="position: relative; min-width: 260px;">
            <input type="text" class="form-control" placeholder="Search trips or cities..." 
              value="${Utils.escapeHtml(this.searchQuery)}"
              oninput="TripListView.handleSearchInput(this.value)" 
              style="padding-left: 2.2rem; font-size: 0.85rem;" />
            <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-subtle);">🔍</span>
          </div>
        </div>

        <!-- Trips Grid -->
        ${totalItems === 0 ? `
          <div class="empty-state" style="margin: 3rem auto;">
            <div class="empty-state-icon">🗺️</div>
            <h3 class="empty-state-title">No trips matching criteria</h3>
            <p class="empty-state-desc">Try clearing your search query or creating a new adventure.</p>
            <button class="btn btn-primary" onclick="TripListView.clearFilters()">
              Reset Filters
            </button>
          </div>
        ` : `
          <div class="trips-grid">
            ${paginatedTrips.map(trip => {
              const status = Utils.getTripStatus(trip);
              const duration = Utils.daysBetween(trip.startDate, trip.endDate);
              const totalSpent = trip.days.reduce((sum, d) => sum + d.activities.reduce((s, a) => s + (Number(a.cost) || 0), 0), 0);
              const progressPct = Utils.safePercentage(totalSpent, trip.budget);
              const stopCount = trip.stops?.length || 1;

              return `
                <div class="glass-card trip-card glass-card-interactive" onclick="TripListView.openTrip('${trip.id}')">
                  <div class="trip-card-header">
                    <img src="${trip.coverImage || CONFIG.COVER_PRESETS[0].url}" alt="${Utils.escapeHtml(trip.title)}" class="trip-card-cover" />
                    <span class="badge badge-${status.type} trip-status-tag">${status.label}</span>
                  </div>
                  <div class="trip-card-body">
                    <div class="trip-card-title">${Utils.escapeHtml(trip.title)}</div>
                    <div class="trip-meta-row">
                      <span>📍 ${Utils.escapeHtml(trip.destination)} (${stopCount} stops)</span>
                      <span>⏱️ ${duration} days</span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-subtle); margin-bottom: 0.5rem;">
                      🗓️ ${Utils.formatDateShort(trip.startDate)} - ${Utils.formatDateShort(trip.endDate)}
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.4; margin-bottom: 0.85rem; color: var(--text-muted);">
                      ${Utils.escapeHtml(trip.description || 'Custom trip itinerary.')}
                    </p>

                    <div class="trip-budget-progress">
                      <div class="flex items-center justify-between" style="font-size: 0.8rem;">
                        <span style="color: var(--text-subtle);">Budget</span>
                        <span class="font-semibold" style="color: ${progressPct > 100 ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">
                          ${Utils.formatCurrency(totalSpent, trip.currency)} / ${Utils.formatCurrency(trip.budget, trip.currency)}
                        </span>
                      </div>
                      <div class="progress-bar-wrap">
                        <div class="progress-bar-fill" style="width: ${Math.min(100, progressPct)}%; background: ${progressPct > 100 ? 'var(--accent-rose)' : 'var(--grad-primary)'};"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Actions Toolbar -->
                  <div class="trip-card-actions" onclick="event.stopPropagation();">
                    <div class="flex items-center gap-1">
                      <button class="btn btn-secondary btn-sm" onclick="AppRouter.navigate('itinerary-builder', '${trip.id}')" title="Edit Itinerary">
                        <span>📝</span> Edit
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="AppRouter.navigate('budget', '${trip.id}')" title="Budget Breakdown">
                        <span>📊</span> Budget
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="TripListView.cloneTrip('${trip.id}')" title="Duplicate Trip">
                        <span>📋</span>
                      </button>
                    </div>
                    <div class="flex items-center gap-1">
                      <button class="btn btn-secondary btn-sm" onclick="AppRouter.navigate('shared-trip', '${trip.id}')" title="Share Trip">
                        <span>🔗</span>
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="TripListView.promptDeleteTrip('${trip.id}', '${Utils.escapeHtml(trip.title)}')" title="Delete Trip">
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Pagination Controls -->
          ${totalPages > 1 ? `
            <div class="pagination-wrap">
              <button class="btn btn-secondary btn-sm" ${this.currentPage === 1 ? 'disabled style="opacity:0.5;"' : ''} onclick="TripListView.setPage(${this.currentPage - 1})">
                &larr; Prev
              </button>
              <span style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0.5rem;">
                Page <strong>${this.currentPage}</strong> of <strong>${totalPages}</strong> (${totalItems} total trips)
              </span>
              <button class="btn btn-secondary btn-sm" ${this.currentPage === totalPages ? 'disabled style="opacity:0.5;"' : ''} onclick="TripListView.setPage(${this.currentPage + 1})">
                Next &rarr;
              </button>
            </div>
          ` : ''}
        `}
      </div>
    `;
  },

  setFilter(filter) {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.render();
  },

  handleSearchInput: Utils.debounce(function(val) {
    TripListView.searchQuery = val;
    TripListView.currentPage = 1;
    TripListView.render();
  }, 250),

  clearFilters() {
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.currentPage = 1;
    this.render();
  },

  setPage(page) {
    this.currentPage = page;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openTrip(tripId) {
    AppStore.setCurrentTripId(tripId);
    AppRouter.navigate('itinerary-builder', tripId);
  },

  async cloneTrip(tripId) {
    try {
      const res = await MockApi.cloneTrip(tripId);
      Utils.showToast(`Trip "${res.data.title}" duplicated!`, 'success');
      this.render();
    } catch (err) {
      Utils.showToast(err.message || 'Failed to clone trip.', 'error');
    }
  },

  promptDeleteTrip(tripId, tripTitle) {
    const modalHtml = `
      <div class="modal-header">
        <div class="modal-title" style="color: var(--accent-rose);">⚠️ Delete Trip</div>
        <button class="modal-close" onclick="AppRouter.closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom: 1rem;">Are you sure you want to delete <strong>"${tripTitle}"</strong>?</p>
        <div class="alert-banner alert-danger">
          <span>⚠️</span>
          <div>This action cannot be undone. All days, activities, and budget notes for this journey will be permanently deleted.</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="AppRouter.closeModal()">Keep Trip</button>
        <button class="btn btn-danger" onclick="TripListView.confirmDelete('${tripId}')">
          Yes, Delete Trip
        </button>
      </div>
    `;
    AppRouter.openModal(modalHtml);
  },

  async confirmDelete(tripId) {
    AppRouter.closeModal();
    try {
      await MockApi.deleteTrip(tripId);
      Utils.showToast('Trip successfully deleted.', 'success');
      this.render();
    } catch (err) {
      Utils.showToast(err.message || 'Failed to delete trip.', 'error');
    }
  }
};
