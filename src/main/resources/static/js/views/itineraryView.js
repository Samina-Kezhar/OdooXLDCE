/**
 * Screen 6: Itinerary View Screen
 * Visual representation of the completed trip itinerary in multiple view modes (Detailed, Timeline, Compact).
 */

const ItineraryView = {
  viewMode: 'detailed', // 'detailed' | 'timeline' | 'compact'

  async render(tripId = null) {
    const container = document.getElementById('view-container');
    if (!container) return;

    const currentId = tripId || AppStore.currentTripId;
    const response = await MockApi.getTripById(currentId);
    const trip = response.data;

    const duration = Utils.daysBetween(trip.startDate, trip.endDate);
    const totalSpent = trip.days.reduce((sum, d) => sum + d.activities.reduce((s, a) => s + (Number(a.cost) || 0), 0), 0);

    container.innerHTML = `
      <div class="animate-fade-in" style="max-width: 960px; margin: 0 auto;">
        <!-- Header Banner -->
        <div class="glass-card flex items-center justify-between" style="margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="flex items-center gap-2" style="margin-bottom: 0.35rem;">
              <span class="badge badge-primary">Itinerary View</span>
              <span class="badge badge-emerald">Ready for Travel</span>
            </div>
            <h2>${Utils.escapeHtml(trip.title)}</h2>
            <div class="flex items-center gap-4" style="margin-top: 0.35rem; font-size: 0.875rem; color: var(--text-muted); flex-wrap: wrap;">
              <span>📍 ${Utils.escapeHtml(trip.destination)}</span>
              <span>🗓️ ${Utils.formatDate(trip.startDate)} - ${Utils.formatDate(trip.endDate)} (${duration} days)</span>
              <span>💰 ${Utils.formatCurrency(totalSpent, trip.currency)} total</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button class="btn btn-secondary btn-sm" onclick="AppRouter.navigate('itinerary-builder', '${trip.id}')">
              <span>✏️</span> Edit Builder
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.print()">
              <span>🖨️</span> Print / PDF
            </button>
            <button class="btn btn-primary btn-sm" onclick="AppRouter.navigate('shared-trip', '${trip.id}')">
              <span>🔗</span> Share
            </button>
          </div>
        </div>

        <!-- View Mode Switcher -->
        <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
          <div class="tab-list">
            <button class="tab-btn ${this.viewMode === 'detailed' ? 'active' : ''}" onclick="ItineraryView.switchMode('detailed', '${trip.id}')">
              <span>📋</span> Detailed View
            </button>
            <button class="tab-btn ${this.viewMode === 'timeline' ? 'active' : ''}" onclick="ItineraryView.switchMode('timeline', '${trip.id}')">
              <span>⏱️</span> Timeline Flow
            </button>
            <button class="tab-btn ${this.viewMode === 'compact' ? 'active' : ''}" onclick="ItineraryView.switchMode('compact', '${trip.id}')">
              <span>📑</span> Compact List
            </button>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-muted);">
            Showing ${trip.days.length} Days &bull; ${trip.days.reduce((acc, d) => acc + d.activities.length, 0)} Activities
          </div>
        </div>

        <!-- Days Content -->
        <div class="flex flex-col gap-6">
          ${trip.days.map(day => {
            const dayCost = day.activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

            return `
              <div class="glass-card" style="padding: 1.5rem; border-left: 4px solid var(--primary-500);">
                <!-- Day Header -->
                <div class="flex items-center justify-between" style="margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--glass-border);">
                  <div class="flex items-center gap-3">
                    <span class="day-number-badge">Day ${day.dayNumber}</span>
                    <div>
                      <h4 style="margin-bottom: 2px;">${Utils.formatDate(day.date)}</h4>
                      <span style="font-size: 0.8rem; color: var(--accent-cyan);">📍 ${Utils.escapeHtml(day.city || trip.destination)}</span>
                    </div>
                  </div>
                  <span style="font-weight: 700; color: var(--accent-emerald); font-size: 0.95rem;">
                    ${Utils.formatCurrency(dayCost, trip.currency)}
                  </span>
                </div>

                <!-- Activities Content by View Mode -->
                ${day.activities.length === 0 ? `
                  <p style="font-style: italic; color: var(--text-subtle); font-size: 0.85rem;">Free exploration day — no scheduled bookings.</p>
                ` : this.viewMode === 'timeline' ? `
                  <!-- Timeline Layout -->
                  <div style="position: relative; padding-left: 1.5rem; border-left: 2px solid var(--surface-3); margin-left: 0.5rem;">
                    ${day.activities.map(act => {
                      const cat = CONFIG.CATEGORIES.find(c => c.id === act.category) || CONFIG.CATEGORIES[0];
                      return `
                        <div style="position: relative; margin-bottom: 1.25rem;">
                          <div style="position: absolute; left: -1.95rem; top: 0; width: 14px; height: 14px; border-radius: 50%; background: ${cat.color}; border: 2px solid var(--bg-app);"></div>
                          <div class="glass-card-subtle flex items-center justify-between" style="padding: 0.75rem 1rem;">
                            <div>
                              <div class="flex items-center gap-2">
                                <span>${cat.icon}</span>
                                <strong style="font-size: 0.9rem;">${Utils.escapeHtml(act.name)}</strong>
                              </div>
                              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;">
                                ${act.location ? `📍 ${Utils.escapeHtml(act.location)}` : ''}
                                ${act.notes ? ` &bull; ${Utils.escapeHtml(act.notes)}` : ''}
                              </div>
                            </div>
                            <div style="text-align: right;">
                              <span class="activity-time-tag">${act.startTime} - ${act.endTime}</span>
                              <div style="font-size: 0.85rem; font-weight: 700; color: var(--accent-emerald); margin-top: 3px;">
                                ${Utils.formatCurrency(act.cost, trip.currency)}
                              </div>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : this.viewMode === 'compact' ? `
                  <!-- Compact Table Layout -->
                  <div class="flex flex-col gap-2">
                    ${day.activities.map(act => {
                      const cat = CONFIG.CATEGORIES.find(c => c.id === act.category) || CONFIG.CATEGORIES[0];
                      return `
                        <div class="glass-card-subtle flex items-center justify-between" style="padding: 0.5rem 0.85rem;">
                          <div class="flex items-center gap-3">
                            <span class="activity-time-tag" style="padding: 2px 6px;">${act.startTime}</span>
                            <span>${cat.icon}</span>
                            <span style="font-size: 0.875rem; font-weight: 500;">${Utils.escapeHtml(act.name)}</span>
                          </div>
                          <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-emerald);">
                            ${Utils.formatCurrency(act.cost, trip.currency)}
                          </span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : `
                  <!-- Detailed Cards Layout -->
                  <div class="flex flex-col gap-3">
                    ${day.activities.map(act => {
                      const cat = CONFIG.CATEGORIES.find(c => c.id === act.category) || CONFIG.CATEGORIES[0];
                      return `
                        <div class="activity-item" style="padding: 1rem;">
                          <div style="font-size: 1.5rem;">${cat.icon}</div>
                          <div style="flex: 1;">
                            <div class="font-semibold" style="font-size: 0.95rem; margin-bottom: 3px;">${Utils.escapeHtml(act.name)}</div>
                            <div class="flex items-center gap-3" style="font-size: 0.8rem; color: var(--text-muted);">
                              ${act.location ? `<span>📍 ${Utils.escapeHtml(act.location)}</span>` : ''}
                              ${act.notes ? `<span>📝 ${Utils.escapeHtml(act.notes)}</span>` : ''}
                            </div>
                          </div>
                          <div style="text-align: right;">
                            <div class="activity-time-tag">${act.startTime} - ${act.endTime}</div>
                            <div class="activity-cost-tag" style="margin-top: 4px;">${Utils.formatCurrency(act.cost, trip.currency)}</div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  switchMode(mode, tripId) {
    this.viewMode = mode;
    this.render(tripId);
  }
};
