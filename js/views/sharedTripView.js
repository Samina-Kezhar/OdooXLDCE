/**
 * Screen 11: Shared / Public Itinerary View Screen
 * Read-only shareable itinerary presentation, 1-click trip cloning, clipboard copy, and social sharing.
 */

const SharedTripView = {
  async render(tripId = null) {
    const container = document.getElementById('view-container');
    if (!container) return;

    const currentId = tripId || AppStore.currentTripId;
    const response = await MockApi.getTripById(currentId);
    const trip = response.data;

    const duration = Utils.daysBetween(trip.startDate, trip.endDate);
    const totalSpent = trip.days.reduce((sum, d) => sum + d.activities.reduce((s, a) => s + (Number(a.cost) || 0), 0), 0);
    const shareUrl = `${window.location.origin}${window.location.pathname}#shared-trip?id=${trip.id}`;

    container.innerHTML = `
      <div class="animate-fade-in" style="max-width: 980px; margin: 0 auto;">
        <!-- Public Share Notice Banner -->
        <div class="alert-banner alert-info flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-2">
            <span>🌐</span>
            <div><strong>Public Presentation Mode:</strong> Anyone with this link can view this curated itinerary and copy it to their own profile.</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="AppRouter.navigate('itinerary-builder', '${trip.id}')">
            &larr; Return to Edit Mode
          </button>
        </div>

        <!-- Hero Cover Header -->
        <div class="shared-trip-hero">
          <img src="${trip.coverImage || CONFIG.COVER_PRESETS[0].url}" alt="${Utils.escapeHtml(trip.title)}" class="shared-trip-hero-img" />
          <div class="shared-hero-overlay">
            <div class="flex items-center gap-2" style="margin-bottom: 0.5rem;">
              <span class="badge badge-cyan">🌍 Verified Itinerary</span>
              <span class="badge badge-primary">${duration} Days</span>
              <span class="badge badge-emerald">Budget: ${Utils.formatCurrency(trip.budget, trip.currency)}</span>
            </div>
            <h1 style="color: #fff; font-size: 2.2rem; margin-bottom: 0.5rem;">${Utils.escapeHtml(trip.title)}</h1>
            <p style="color: #cbd5e1; font-size: 1rem; max-width: 680px; margin-bottom: 1.25rem;">
              ${Utils.escapeHtml(trip.description || 'A curated multi-city adventure with day-by-day activities.')}
            </p>
            <div class="flex items-center gap-3" style="font-size: 0.85rem; color: #94a3b8;">
              <span>🗓️ ${Utils.formatDate(trip.startDate)} - ${Utils.formatDate(trip.endDate)}</span>
              <span>📍 ${Utils.escapeHtml(trip.destination)}</span>
              <span>👤 Created by Alex River</span>
            </div>
          </div>
        </div>

        <!-- Sharing & Clone Action Toolbar -->
        <div class="glass-card flex items-center justify-between" style="margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div class="social-share-bar">
            <button class="btn btn-primary" onclick="SharedTripView.copyLink('${shareUrl}')">
              <span>📋</span> Copy Public Link
            </button>
            <button class="btn btn-secondary" onclick="SharedTripView.shareWhatsApp('${Utils.escapeHtml(trip.title)}', '${shareUrl}')">
              <span>💬</span> WhatsApp
            </button>
            <button class="btn btn-secondary" onclick="SharedTripView.shareTwitter('${Utils.escapeHtml(trip.title)}', '${shareUrl}')">
              <span>🐦</span> X / Twitter
            </button>
            <button class="btn btn-secondary" onclick="window.print()">
              <span>🖨️</span> Print Itinerary
            </button>
          </div>

          <!-- 1-Click Copy Trip to Account CTA -->
          <button class="btn btn-accent btn-lg" onclick="SharedTripView.cloneToMyAccount('${trip.id}')">
            <span>✨</span> Copy Trip to My Account
          </button>
        </div>

        <!-- Itinerary Schedule Days -->
        <div class="flex flex-col gap-5">
          ${trip.days.map(day => {
            const dayCost = day.activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

            return `
              <div class="glass-card" style="padding: 1.5rem;">
                <div class="flex items-center justify-between" style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--glass-border);">
                  <div class="flex items-center gap-3">
                    <span class="day-number-badge">Day ${day.dayNumber}</span>
                    <h3 style="font-size: 1.15rem;">${Utils.formatDate(day.date)}</h3>
                    <span style="font-size: 0.825rem; color: var(--accent-cyan);">📍 ${Utils.escapeHtml(day.city || trip.destination)}</span>
                  </div>
                  <span class="font-bold" style="color: var(--accent-emerald);">${Utils.formatCurrency(dayCost, trip.currency)}</span>
                </div>

                ${day.activities.length === 0 ? `
                  <p style="color: var(--text-subtle); font-style: italic; font-size: 0.875rem;">Free exploration day.</p>
                ` : `
                  <div class="flex flex-col gap-3">
                    ${day.activities.map(act => {
                      const cat = CONFIG.CATEGORIES.find(c => c.id === act.category) || CONFIG.CATEGORIES[0];
                      return `
                        <div class="activity-item" style="padding: 0.85rem 1rem;">
                          <div style="font-size: 1.4rem;">${cat.icon}</div>
                          <div style="flex: 1;">
                            <div class="font-semibold" style="font-size: 0.925rem; color: var(--text-main);">${Utils.escapeHtml(act.name)}</div>
                            <div class="flex items-center gap-3" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                              ${act.location ? `<span>📍 ${Utils.escapeHtml(act.location)}</span>` : ''}
                              ${act.notes ? `<span>📝 ${Utils.escapeHtml(act.notes)}</span>` : ''}
                            </div>
                          </div>
                          <div style="text-align: right;">
                            <span class="activity-time-tag">${act.startTime} - ${act.endTime}</span>
                            <div class="activity-cost-tag" style="margin-top: 3px;">${Utils.formatCurrency(act.cost, trip.currency)}</div>
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

  async copyLink(url) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      Utils.showToast('Public itinerary link copied to clipboard!', 'success');
    } catch (e) {
      Utils.showToast(`Share URL: ${url}`, 'info');
    }
  },

  shareWhatsApp(title, url) {
    const text = encodeURIComponent(`Check out my travel itinerary for "${title}" on GlobeTrotter: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  },

  shareTwitter(title, url) {
    const text = encodeURIComponent(`Planning an adventure: ${title}! Powered by GlobeTrotter ✈️ ${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  },

  async cloneToMyAccount(tripId) {
    try {
      const res = await MockApi.cloneTrip(tripId);
      Utils.showToast(`Itinerary cloned to your account as "${res.data.title}"!`, 'success');
      AppRouter.navigate('itinerary-builder', res.data.id);
    } catch (err) {
      Utils.showToast(err.message || 'Failed to clone trip.', 'error');
    }
  }
};
