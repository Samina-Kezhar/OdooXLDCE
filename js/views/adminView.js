/**
 * Screen 13: Admin & Platform Analytics Dashboard
 * High-level adoption statistics, popular destinations, activity counts, and system metrics.
 */

const AdminView = {
  render() {
    const container = document.getElementById('view-container');
    if (!container) return;

    const trips = AppStore.trips;
    const totalTrips = trips.length;
    let totalActivities = 0;
    trips.forEach(t => t.days.forEach(d => totalActivities += d.activities.length));

    container.innerHTML = `
      <div class="animate-fade-in" style="max-width: 1080px; margin: 0 auto;">
        <!-- Header -->
        <div class="glass-card flex items-center justify-between" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="flex items-center gap-2" style="margin-bottom: 0.35rem;">
              <span class="badge badge-purple">Admin Control Panel</span>
              <span class="badge badge-emerald">System Healthy (99.98% Uptime)</span>
            </div>
            <h2>Platform <span class="text-gradient">Analytics & Metrics</span></h2>
            <p>Real-time analytics for user travel plans, destination popularity, and engagement.</p>
          </div>

          <button class="btn btn-secondary btn-sm" onclick="AppRouter.navigate('dashboard')">
            &larr; Return to Traveler Dashboard
          </button>
        </div>

        <!-- Metric Cards -->
        <div class="stats-grid">
          <div class="glass-card stat-card">
            <div class="stat-icon-wrapper" style="background: rgba(168, 85, 247, 0.15); color: #c084fc;">👥</div>
            <div>
              <div class="stat-value">12,480</div>
              <div class="stat-label">Active Travelers</div>
            </div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-icon-wrapper" style="background: rgba(99, 102, 241, 0.15); color: #818cf8;">🗺️</div>
            <div>
              <div class="stat-value">${totalTrips + 8420}</div>
              <div class="stat-label">Total Trips Created</div>
            </div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-icon-wrapper" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee;">🎯</div>
            <div>
              <div class="stat-value">${totalActivities + 34200}</div>
              <div class="stat-label">Activities Scheduled</div>
            </div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-icon-wrapper" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">⭐</div>
            <div>
              <div class="stat-value">4.92 / 5</div>
              <div class="stat-label">Satisfaction Score</div>
            </div>
          </div>
        </div>

        <!-- Top Destinations Table -->
        <div class="glass-card" style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem;">🏆 Most Popular Destinations (Top 5)</h3>

          <div class="flex flex-col gap-3">
            ${CONFIG.DESTINATIONS.slice(0, 5).map((dest, idx) => `
              <div class="glass-card-subtle flex items-center justify-between" style="padding: 0.85rem 1.25rem;">
                <div class="flex items-center gap-3">
                  <span class="day-number-badge" style="background: var(--surface-3); font-size: 0.8rem;">#${idx + 1}</span>
                  <img src="${dest.image}" style="width: 44px; height: 44px; border-radius: var(--radius-xs); object-fit: cover;" />
                  <div>
                    <strong style="font-size: 0.95rem;">${dest.name}, ${dest.country}</strong>
                    <div style="font-size: 0.78rem; color: var(--accent-cyan);">${dest.region} &bull; ${dest.costIndex}</div>
                  </div>
                </div>

                <div class="flex items-center gap-6">
                  <div style="text-align: right;">
                    <span style="font-weight: 700; color: #fbbf24;">★ ${dest.rating}</span>
                    <div style="font-size: 0.75rem; color: var(--text-subtle);">${Math.round(dest.popularity * 420)} bookings</div>
                  </div>
                  <button class="btn btn-secondary btn-sm" onclick="DashboardView.planTripToDestination('${dest.id}')">
                    Inspect
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
};
