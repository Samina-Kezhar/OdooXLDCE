/**
 * Screen 9: Trip Budget & Cost Breakdown View
 * Financial summaries, interactive category donut chart, daily expenditure bar chart,
 * overbudget warnings, and robust division-by-zero safeguards.
 */

const BudgetView = {
  async render(tripId = null) {
    const container = document.getElementById('view-container');
    if (!container) return;

    const currentId = tripId || AppStore.currentTripId;
    const response = await MockApi.getTripById(currentId);
    const trip = response.data;

    const duration = Utils.daysBetween(trip.startDate, trip.endDate);
    const totalBudget = Number(trip.budget) || 0;

    // Calculate spend per category
    const categoryTotals = {};
    CONFIG.CATEGORIES.forEach(c => { categoryTotals[c.id] = 0; });

    let totalSpent = 0;
    const dailyData = trip.days.map(day => {
      let dayCost = 0;
      day.activities.forEach(act => {
        const cost = Number(act.cost) || 0;
        dayCost += cost;
        totalSpent += cost;
        if (categoryTotals[act.category] !== undefined) {
          categoryTotals[act.category] += cost;
        } else {
          categoryTotals['sightseeing'] += cost;
        }
      });
      return {
        dayNumber: day.dayNumber,
        date: day.date,
        city: day.city,
        totalCost: dayCost
      };
    });

    const remainingBudget = totalBudget - totalSpent;
    const isOverTotalBudget = totalBudget > 0 && totalSpent > totalBudget;
    const avgDailyBudget = duration > 0 ? Math.round(totalBudget / duration) : 0;
    const avgDailySpend = duration > 0 ? Math.round(totalSpent / duration) : 0;
    const progressPct = Utils.safePercentage(totalSpent, totalBudget);

    // Filter overbudget days
    const overbudgetDays = dailyData.filter(d => avgDailyBudget > 0 && d.totalCost > avgDailyBudget);

    // Prepare chart data
    const chartCategoryData = CONFIG.CATEGORIES.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      cost: categoryTotals[c.id] || 0
    })).filter(c => c.cost > 0);

    container.innerHTML = `
      <div class="animate-fade-in" style="max-width: 1100px; margin: 0 auto;">
        <!-- Header -->
        <div class="glass-card flex items-center justify-between" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="flex items-center gap-2" style="margin-bottom: 0.35rem;">
              <span class="badge badge-primary">Financial Intelligence</span>
              <span class="badge ${isOverTotalBudget ? 'badge-rose' : 'badge-emerald'}">
                ${isOverTotalBudget ? '⚠️ Over Budget' : '✓ Budget On Track'}
              </span>
            </div>
            <h2>Budget Breakdown: <span class="text-gradient">${Utils.escapeHtml(trip.title)}</span></h2>
            <p>Monitor your expenses, daily burn rate, and category distribution.</p>
          </div>

          <div class="flex items-center gap-2">
            <button class="btn btn-secondary btn-sm" onclick="AppRouter.navigate('itinerary-builder', '${trip.id}')">
              &larr; Back to Builder
            </button>
            <button class="btn btn-primary btn-sm" onclick="BudgetView.openEditBudgetModal('${trip.id}', ${totalBudget})">
              <span>💰</span> Adjust Target Budget
            </button>
          </div>
        </div>

        <!-- Over-Budget Alert Banner if spending exceeds limit -->
        ${isOverTotalBudget ? `
          <div class="alert-banner alert-danger">
            <span style="font-size: 1.25rem;">🚨</span>
            <div>
              <strong>Budget Exceeded:</strong> Total planned expenses (${Utils.formatCurrency(totalSpent, trip.currency)}) exceed your target budget of ${Utils.formatCurrency(totalBudget, trip.currency)} by <strong>${Utils.formatCurrency(totalSpent - totalBudget, trip.currency)}</strong>.
            </div>
          </div>
        ` : ''}

        <!-- Financial KPI Cards -->
        <div class="budget-summary-grid">
          <div class="glass-card stat-card">
            <div class="stat-icon-wrapper" style="background: rgba(99, 102, 241, 0.15); color: #818cf8;">🎯</div>
            <div>
              <div class="stat-value">${Utils.formatCurrency(totalBudget, trip.currency)}</div>
              <div class="stat-label">Total Budget Target</div>
            </div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-icon-wrapper" style="background: rgba(239, 68, 68, 0.15); color: #f87171;">💳</div>
            <div>
              <div class="stat-value" style="color: ${isOverTotalBudget ? 'var(--accent-rose)' : 'var(--text-main)'};">
                ${Utils.formatCurrency(totalSpent, trip.currency)}
              </div>
              <div class="stat-label">Total Planned Spend</div>
            </div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-icon-wrapper" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">🏦</div>
            <div>
              <div class="stat-value" style="color: ${remainingBudget < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">
                ${Utils.formatCurrency(remainingBudget, trip.currency)}
              </div>
              <div class="stat-label">Remaining Balance</div>
            </div>
          </div>

          <div class="glass-card stat-card">
            <div class="stat-icon-wrapper" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee;">📊</div>
            <div>
              <div class="stat-value">${Utils.formatCurrency(avgDailySpend, trip.currency)}</div>
              <div class="stat-label">Avg Daily Spend / ${duration}d</div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <!-- Category Breakdown Donut Chart -->
          <div class="glass-card chart-card">
            <div class="w-full flex items-center justify-between" style="margin-bottom: 1rem;">
              <h4 style="font-size: 1.05rem;">Spending by Category</h4>
              <span style="font-size: 0.8rem; color: var(--text-subtle);">${chartCategoryData.length} active categories</span>
            </div>
            
            <div class="chart-canvas-container">
              <canvas id="category-donut-canvas" style="width: 100%; height: 100%;"></canvas>
            </div>

            <!-- Legend List -->
            <div class="w-full flex items-center justify-center gap-3" style="flex-wrap: wrap; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--glass-border);">
              ${chartCategoryData.length === 0 ? `
                <span style="font-size: 0.8rem; color: var(--text-subtle);">No categorized expenses yet.</span>
              ` : chartCategoryData.map(cat => {
                const pct = totalSpent > 0 ? Math.round((cat.cost / totalSpent) * 100) : 0;
                return `
                  <div class="flex items-center gap-1" style="font-size: 0.8rem;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${cat.color};"></span>
                    <span style="color: var(--text-muted);">${cat.name}:</span>
                    <strong style="color: var(--text-main);">${Utils.formatCurrency(cat.cost, trip.currency)} (${pct}%)</strong>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Daily Spending Bar Graph -->
          <div class="glass-card chart-card">
            <div class="w-full flex items-center justify-between" style="margin-bottom: 1rem;">
              <h4 style="font-size: 1.05rem;">Daily Expenditure Timeline</h4>
              <span class="badge badge-amber" style="font-size: 0.7rem;">Target Ceiling: ${Utils.formatCurrency(avgDailyBudget, trip.currency)}/day</span>
            </div>

            <div class="chart-canvas-container">
              <canvas id="daily-bar-canvas" style="width: 100%; height: 100%;"></canvas>
            </div>

            <div style="font-size: 0.78rem; color: var(--text-subtle); text-align: center; margin-top: 0.5rem;">
              Highlighted orange bars represent days exceeding target daily budget ceiling.
            </div>
          </div>
        </div>

        <!-- Overbudget Days Summary Table / Notification -->
        ${overbudgetDays.length > 0 ? `
          <div class="glass-card" style="margin-top: 1.5rem; border-left: 4px solid var(--accent-amber);">
            <h4 style="margin-bottom: 0.75rem; color: #fde68a;">⚠️ High Spending Days Alert</h4>
            <div class="flex flex-col gap-2">
              ${overbudgetDays.map(d => `
                <div class="glass-card-subtle flex items-center justify-between" style="padding: 0.75rem 1rem;">
                  <div>
                    <strong>Day ${d.dayNumber} (${Utils.formatDate(d.date)})</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">📍 ${Utils.escapeHtml(d.city || trip.destination)}</div>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-weight: 700; color: var(--accent-rose); font-size: 1rem;">${Utils.formatCurrency(d.totalCost, trip.currency)}</span>
                    <div style="font-size: 0.75rem; color: var(--accent-amber);">+${Utils.formatCurrency(d.totalCost - avgDailyBudget, trip.currency)} over avg</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Render Canvas Charts after DOM paint
    requestAnimationFrame(() => {
      Charts.renderCategoryDonut('category-donut-canvas', chartCategoryData, trip.currency);
      Charts.renderDailyBarChart('daily-bar-canvas', dailyData, avgDailyBudget, trip.currency);
    });
  },

  openEditBudgetModal(tripId, currentBudget) {
    const modalHtml = `
      <div class="modal-header">
        <div class="modal-title">💰 Update Target Budget</div>
        <button class="modal-close" onclick="AppRouter.closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <form id="form-update-budget" onsubmit="BudgetView.handleBudgetUpdateSubmit(event, '${tripId}')">
          <div class="form-group">
            <label class="form-label">Total Trip Budget</label>
            <input type="number" id="update-budget-input" class="form-control" value="${currentBudget}" min="0" step="50" required />
            <div class="form-hint">Tip: Set to 0 to test the zero-division error handling edge case.</div>
          </div>
          <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: -0.5rem;">
            <button type="button" class="btn btn-secondary" onclick="AppRouter.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Target</button>
          </div>
        </form>
      </div>
    `;
    AppRouter.openModal(modalHtml);
  },

  async handleBudgetUpdateSubmit(event, tripId) {
    event.preventDefault();
    const newBudget = document.getElementById('update-budget-input').value;
    try {
      await MockApi.updateTrip(tripId, { budget: Number(newBudget) });
      AppRouter.closeModal();
      Utils.showToast('Budget target updated!', 'success');
      this.render(tripId);
    } catch (err) {
      Utils.showToast(err.message || 'Failed to update budget.', 'error');
    }
  }
};
