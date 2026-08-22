/**
 * Screen 10: Trip Calendar & Chronological Timeline View
 * Interactive calendar day cell visualizer, expandable timeline, and time-zone toggle awareness.
 */

const CalendarView = {
  useDestinationTime: true,

  async render(tripId = null) {
    const container = document.getElementById('view-container');
    if (!container) return;

    const currentId = tripId || AppStore.currentTripId;
    const response = await MockApi.getTripById(currentId);
    const trip = response.data;

    const duration = Utils.daysBetween(trip.startDate, trip.endDate);
    const timeZoneNotice = this.useDestinationTime 
      ? `Destination Local Time (${trip.stops?.[0]?.timeZone || 'GMT+2 Central Europe'})` 
      : `Your Device Time (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;

    container.innerHTML = `
      <div class="animate-fade-in" style="max-width: 1040px; margin: 0 auto;">
        <!-- Header -->
        <div class="glass-card flex items-center justify-between" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="flex items-center gap-2" style="margin-bottom: 0.35rem;">
              <span class="badge badge-primary">Calendar & Timeline</span>
              <span class="badge badge-cyan">${duration} Days Journey</span>
            </div>
            <h2>Schedule Flow: <span class="text-gradient">${Utils.escapeHtml(trip.title)}</span></h2>
            <p>Chronological overview of dates, stops, and scheduled bookings.</p>
          </div>

          <div class="flex items-center gap-2">
            <button class="btn btn-secondary btn-sm" onclick="AppRouter.navigate('itinerary-builder', '${trip.id}')">
              &larr; Builder
            </button>
            <button class="btn btn-primary btn-sm" onclick="AppRouter.navigate('budget', '${trip.id}')">
              <span>📊</span> View Budget
            </button>
          </div>
        </div>

        <!-- Time Zone Awareness Info Banner (Edge Case) -->
        <div class="alert-banner alert-info flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-2">
            <span>🌐</span>
            <div>
              <strong>Time Zone Sync:</strong> Currently displaying in <u>${timeZoneNotice}</u>.
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="CalendarView.toggleTimeZone('${trip.id}')">
            Switch to ${this.useDestinationTime ? 'My Local Time' : 'Destination Time'}
          </button>
        </div>

        <!-- Chronological Expandable Day Stream -->
        <div class="flex flex-col gap-4">
          ${trip.days.map((day, idx) => {
            const conflictData = Utils.detectActivityConflicts(day.activities);
            const totalCost = day.activities.reduce((s, a) => s + (Number(a.cost) || 0), 0);

            return `
              <div class="glass-card" style="padding: 1.25rem;">
                <div class="flex items-center justify-between" style="cursor: pointer;" onclick="CalendarView.toggleDayExpansion(${day.dayNumber})">
                  <div class="flex items-center gap-3">
                    <div class="day-number-badge">Day ${day.dayNumber}</div>
                    <div>
                      <h4 style="margin-bottom: 2px;">${Utils.formatDate(day.date)}</h4>
                      <div style="font-size: 0.8rem; color: var(--accent-cyan);">📍 ${Utils.escapeHtml(day.city || trip.destination)}</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    ${conflictData.hasConflict ? `<span class="badge badge-amber">⚠️ Overlap</span>` : ''}
                    <span style="font-size: 0.85rem; color: var(--text-muted);">${day.activities.length} item${day.activities.length === 1 ? '' : 's'}</span>
                    <span class="font-bold" style="color: var(--accent-emerald); font-size: 0.95rem;">${Utils.formatCurrency(totalCost, trip.currency)}</span>
                    <span id="exp-icon-${day.dayNumber}" style="font-size: 1.1rem; color: var(--text-subtle); transition: transform 0.2s ease;">▼</span>
                  </div>
                </div>

                <!-- Expanded Content -->
                <div id="day-content-${day.dayNumber}" style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
                  ${day.activities.length === 0 ? `
                    <div style="font-size: 0.85rem; color: var(--text-subtle); font-style: italic;">No activities planned for this date.</div>
                  ` : `
                    <div style="position: relative; padding-left: 1.5rem; border-left: 2px solid var(--surface-3); margin-left: 0.5rem;">
                      ${day.activities.map(act => {
                        const cat = CONFIG.CATEGORIES.find(c => c.id === act.category) || CONFIG.CATEGORIES[0];
                        return `
                          <div style="position: relative; margin-bottom: 1rem;">
                            <div style="position: absolute; left: -1.95rem; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: ${cat.color}; border: 2px solid var(--bg-app);"></div>
                            <div class="glass-card-subtle flex items-center justify-between" style="padding: 0.65rem 0.85rem;">
                              <div>
                                <div class="flex items-center gap-2">
                                  <span>${cat.icon}</span>
                                  <strong style="font-size: 0.9rem;">${Utils.escapeHtml(act.name)}</strong>
                                </div>
                                <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                                  ${act.location ? `📍 ${Utils.escapeHtml(act.location)}` : ''}
                                </div>
                              </div>
                              <div style="text-align: right;">
                                <div class="activity-time-tag">${act.startTime} - ${act.endTime}</div>
                                <div style="font-size: 0.825rem; font-weight: 700; color: var(--accent-emerald); margin-top: 2px;">
                                  ${Utils.formatCurrency(act.cost, trip.currency)}
                                </div>
                              </div>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  toggleTimeZone(tripId) {
    this.useDestinationTime = !this.useDestinationTime;
    Utils.showToast(`Switched calendar time reference!`, 'info');
    this.render(tripId);
  },

  toggleDayExpansion(dayNumber) {
    const content = document.getElementById(`day-content-${dayNumber}`);
    const icon = document.getElementById(`exp-icon-${dayNumber}`);
    if (!content || !icon) return;

    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? 'block' : 'none';
    icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
  }
};
