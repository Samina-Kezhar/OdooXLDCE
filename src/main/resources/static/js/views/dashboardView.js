/**
 * Screen 2: Dashboard / Home View with VisitTheUSA Cinematic Hero Carousel & 3D Motion
 * Dynamic rotating headlines, timer progress indicators, stats, 3D card tilt, and empty states.
 */

const DashboardView = {
  simulateLoadingError: false,

  async render() {
    const container = document.getElementById('view-container');
    if (!container) return;

    this.renderSkeleton(container);

    try {
      if (this.simulateLoadingError) {
        throw new Error('Simulated network error while fetching dashboard trips.');
      }
      
      const tripsResponse = await MockApi.getTrips();
      const trips = tripsResponse.data;
      const user = AppStore.user;

      // Greeting
      const hour = new Date().getHours();
      let greeting = 'Good morning';
      let greetingIcon = '☀️';
      if (hour >= 12 && hour < 17) { greeting = 'Good afternoon'; greetingIcon = '🌤️'; }
      else if (hour >= 17) { greeting = 'Good evening'; greetingIcon = '🌙'; }

      // Stats
      const totalTrips = trips.length;
      let totalDays = 0;
      let totalBudget = 0;
      let totalActivities = 0;

      trips.forEach(t => {
        totalDays += Utils.daysBetween(t.startDate, t.endDate);
        totalBudget += Number(t.budget) || 0;
        t.days?.forEach(d => { totalActivities += d.activities?.length || 0; });
      });

      let contentHtml = `
        <div class="animate-fade-in">
          <!-- VisitTheUSA Style Cinematic Hero Story Container -->
          <div id="story-hero-container"></div>

          <!-- Quick Stats Bar (With Scroll Reveal) -->
          <div class="stats-grid scroll-reveal delay-1">
            <div class="glass-card stat-card tilt-card">
              <div class="tilt-glare"></div>
              <div class="stat-icon-wrapper" style="background: rgba(99, 102, 241, 0.15); color: #818cf8;">🗺️</div>
              <div>
                <div class="stat-value">${totalTrips}</div>
                <div class="stat-label">Total Journeys</div>
              </div>
            </div>

            <div class="glass-card stat-card tilt-card">
              <div class="tilt-glare"></div>
              <div class="stat-icon-wrapper" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee;">📅</div>
              <div>
                <div class="stat-value">${totalDays}</div>
                <div class="stat-label">Days Planned</div>
              </div>
            </div>

            <div class="glass-card stat-card tilt-card">
              <div class="tilt-glare"></div>
              <div class="stat-icon-wrapper" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">🎯</div>
              <div>
                <div class="stat-value">${totalActivities}</div>
                <div class="stat-label">Curated Activities</div>
              </div>
            </div>

            <div class="glass-card stat-card tilt-card">
              <div class="tilt-glare"></div>
              <div class="stat-icon-wrapper" style="background: rgba(249, 115, 22, 0.15); color: #fb923c;">💰</div>
              <div>
                <div class="stat-value">${Utils.formatCurrency(totalBudget, user.homeCurrency || 'USD')}</div>
                <div class="stat-label">Estimated Budget</div>
              </div>
            </div>
          </div>
      `;

      // Check if user has NO trips (Empty State)
      if (trips.length === 0) {
        contentHtml += `
          <div class="empty-state scroll-reveal delay-2" style="margin-top: 2rem; margin-bottom: 3rem;">
            <div class="empty-state-icon animate-float">🧳</div>
            <h3 class="empty-state-title">No trips planned yet</h3>
            <p class="empty-state-desc">
              Your passport is waiting! Start planning your next dream vacation with day-by-day itineraries, budgets, and activities.
            </p>
            <div class="flex items-center gap-3" style="flex-wrap: wrap; justify-content: center;">
              <button class="btn btn-primary ripple-effect" onclick="AppRouter.navigate('create-trip')">
                <span>➕</span> Create Your First Trip
              </button>
              <button class="btn btn-secondary ripple-effect" onclick="DashboardView.loadSampleTrip()">
                <span>⚡</span> Load Sample Itinerary
              </button>
            </div>
          </div>
        `;
      } else {
        // Active Trips Section
        contentHtml += `
          <div class="section-header scroll-reveal delay-2">
            <div class="section-title">
              <span>✈️</span> Your Active Itineraries
            </div>
            <a href="javascript:void(0)" onclick="AppRouter.navigate('my-trips')" class="font-semibold" style="font-size: 0.875rem;">
              View All (${trips.length}) &rarr;
            </a>
          </div>

          <div class="trips-grid scroll-reveal delay-2">
            ${trips.slice(0, 3).map(trip => {
              const status = Utils.getTripStatus(trip);
              const totalSpent = trip.days?.reduce((sum, d) => sum + (d.activities?.reduce((s, a) => s + (Number(a.cost) || 0), 0) || 0), 0) || 0;
              const progressPct = Utils.safePercentage(totalSpent, trip.budget);
              const duration = Utils.daysBetween(trip.startDate, trip.endDate);

              return `
                <div class="glass-card trip-card glass-card-interactive tilt-card" onclick="DashboardView.openTrip('${trip.id}')">
                  <div class="tilt-glare"></div>
                  <div class="trip-card-header">
                    <img src="${trip.coverImage || CONFIG.COVER_PRESETS[0].url}" alt="${Utils.escapeHtml(trip.title)}" class="trip-card-cover" />
                    <span class="badge badge-${status.type} trip-status-tag">${status.label}</span>
                  </div>
                  <div class="trip-card-body">
                    <div class="trip-card-title">${Utils.escapeHtml(trip.title)}</div>
                    <div class="trip-meta-row">
                      <span>📍 ${Utils.escapeHtml(trip.destination)}</span>
                      <span>⏱️ ${duration} days</span>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.4; margin-bottom: 0.75rem; color: var(--text-muted);">
                      ${Utils.escapeHtml(trip.description || 'Custom multi-city journey.')}
                    </p>

                    <div class="trip-budget-progress">
                      <div class="flex items-center justify-between" style="font-size: 0.8rem;">
                        <span style="color: var(--text-subtle);">Budget Utilized</span>
                        <span class="font-semibold" style="color: ${progressPct > 100 ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">
                          ${Utils.formatCurrency(totalSpent, trip.currency)} / ${Utils.formatCurrency(trip.budget, trip.currency)} (${progressPct}%)
                        </span>
                      </div>
                      <div class="progress-bar-wrap">
                        <div class="progress-bar-fill" style="width: ${Math.min(100, progressPct)}%; background: ${progressPct > 100 ? 'var(--accent-rose)' : 'var(--grad-primary)'};"></div>
                      </div>
                    </div>
                  </div>
                  <div class="trip-card-actions" onclick="event.stopPropagation();">
                    <button class="btn btn-secondary btn-sm ripple-effect" onclick="DashboardView.openTrip('${trip.id}')">
                      <span>📝</span> Builder
                    </button>
                    <button class="btn btn-secondary btn-sm ripple-effect" onclick="AppRouter.navigate('budget', '${trip.id}')">
                      <span>📊</span> Budget
                    </button>
                    <button class="btn btn-primary btn-sm ripple-effect" onclick="AppRouter.navigate('itinerary-view', '${trip.id}')">
                      <span>👁️</span> View
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      // Recommended Destinations Section
      contentHtml += `
        <div class="section-header scroll-reveal delay-3" style="margin-top: 2.5rem;">
          <div class="section-title">
            <span>✨</span> Recommended Destinations
          </div>
          <span style="font-size: 0.85rem; color: var(--text-subtle);">Handpicked by global travelers</span>
        </div>

        <div class="destinations-grid scroll-reveal delay-3">
          ${CONFIG.DESTINATIONS.slice(0, 4).map(dest => `
            <div class="glass-card destination-card glass-card-interactive tilt-card" onclick="DashboardView.planTripToDestination('${dest.id}')">
              <div class="tilt-glare"></div>
              <img src="${dest.image}" alt="${dest.name}" class="destination-card-img" />
              <div class="destination-card-overlay">
                <div class="flex items-center justify-between" style="margin-bottom: 0.25rem;">
                  <span class="badge badge-cyan">${dest.region}</span>
                  <span style="font-size: 0.8rem; color: #fbbf24;">★ ${dest.rating}</span>
                </div>
                <h4 style="color: #fff; margin-bottom: 0.25rem;">${dest.name}, ${dest.country}</h4>
                <p style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.75rem; line-height: 1.3;">${dest.description}</p>
                <div class="flex items-center justify-between">
                  <span style="font-size: 0.8rem; color: var(--accent-emerald);">Avg ${Utils.formatCurrency(dest.avgDailyCost, 'USD')}/day</span>
                  <button class="btn btn-primary btn-sm ripple-effect" onclick="event.stopPropagation(); DashboardView.planTripToDestination('${dest.id}')">
                    Plan Trip &rarr;
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      contentHtml += `</div>`;
      container.innerHTML = contentHtml;

      // Mount VisitTheUSA Cinematic Story Carousel & Observers
      requestAnimationFrame(() => {
        if (typeof MotionEngine !== 'undefined') {
          MotionEngine.renderStoryHero('story-hero-container');
          MotionEngine.initScrollReveal();
        }
      });

    } catch (err) {
      container.innerHTML = `
        <div class="empty-state" style="margin-top: 3rem;">
          <div class="empty-state-icon" style="color: var(--accent-rose);">⚠️</div>
          <h3 class="empty-state-title">Failed to load Dashboard data</h3>
          <p class="empty-state-desc">${Utils.escapeHtml(err.message || 'An error occurred while loading dashboard.')}</p>
          <div class="flex items-center gap-3">
            <button class="btn btn-primary ripple-effect" onclick="DashboardView.retryLoad()">
              <span>🔄</span> Retry Loading
            </button>
            <button class="btn btn-secondary ripple-effect" onclick="AppStore.resetToDemo(); DashboardView.render();">
              <span>⚡</span> Reset to Demo Trips
            </button>
          </div>
        </div>
      `;
    }
  },

  renderSkeleton(container) {
    container.innerHTML = `
      <div class="skeleton" style="height: 320px; border-radius: var(--radius-lg); margin-bottom: 2rem;"></div>
      <div class="stats-grid">
        <div class="skeleton" style="height: 90px; border-radius: var(--radius-md);"></div>
        <div class="skeleton" style="height: 90px; border-radius: var(--radius-md);"></div>
        <div class="skeleton" style="height: 90px; border-radius: var(--radius-md);"></div>
        <div class="skeleton" style="height: 90px; border-radius: var(--radius-md);"></div>
      </div>
      <div class="skeleton" style="height: 280px; border-radius: var(--radius-md); margin-top: 1.5rem;"></div>
    `;
  },

  openTrip(tripId) {
    AppStore.setCurrentTripId(tripId);
    AppRouter.navigate('itinerary-builder', tripId);
  },

  planTripToDestination(destId) {
    const dest = CONFIG.DESTINATIONS.find(d => d.id === destId);
    if (!dest) return;
    AppRouter.navigate('create-trip', {
      destination: `${dest.name}, ${dest.country}`,
      coverImage: dest.image,
      budget: dest.avgDailyCost * 7
    });
  },

  loadSampleTrip() {
    AppStore.resetToDemo();
    Utils.showToast('Sample itineraries loaded!', 'success');
    this.render();
  },

  retryLoad() {
    this.simulateLoadingError = false;
    this.render();
  }
};
