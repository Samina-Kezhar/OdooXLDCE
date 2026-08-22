/**
 * GlobeTrotter High-Performance Native SVG/Canvas Chart Engine
 * Interactive Donut/Pie Chart & Daily Spend Bar Graph with zero external dependencies.
 */

const Charts = {
  /**
   * Render Category Expense Donut Chart (Canvas)
   */
  renderCategoryDonut(canvasId, categoryData, currencyCode = 'USD') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set high-DPI resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.38;
    const innerRadius = radius * 0.62;

    ctx.clearRect(0, 0, width, height);

    // Total Cost
    const totalCost = categoryData.reduce((sum, item) => sum + item.cost, 0);

    // Division by zero / Empty state protection
    if (totalCost === 0 || categoryData.length === 0) {
      // Draw empty placeholder ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();

      // Center text
      ctx.font = '600 14px "Inter", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No Expenses', centerX, centerY - 8);
      ctx.font = '500 11px "Inter", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Add activities', centerX, centerY + 12);
      return;
    }

    let startAngle = -0.5 * Math.PI;

    categoryData.forEach(item => {
      const sliceAngle = (item.cost / totalCost) * (2 * Math.PI);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      // Gradient fill for slice
      ctx.fillStyle = item.color || '#6366f1';
      ctx.fill();

      // Subtle border between slices
      ctx.strokeStyle = 'rgba(11, 15, 25, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Draw Center Text (Total Spend)
    ctx.font = '700 18px "Outfit", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Utils.formatCurrency(totalCost, currencyCode), centerX, centerY - 8);

    ctx.font = '500 11px "Inter", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Total Planned', centerX, centerY + 12);
  },

  /**
   * Render Daily Cost Breakdown Bar Chart (Canvas)
   */
  renderDailyBarChart(canvasId, daysData, avgDailyBudget = 0, currencyCode = 'USD') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    if (!daysData || daysData.length === 0) return;

    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Calculate max daily spend
    const maxSpend = Math.max(...daysData.map(d => d.totalCost), avgDailyBudget * 1.2, 100);

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = paddingTop + (chartHeight / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Axis label
      const val = Math.round(maxSpend - (maxSpend / gridSteps) * i);
      ctx.font = '500 10px "Inter", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Utils.formatCurrency(val, currencyCode), paddingLeft - 8, y);
    }

    // Draw Daily Bars
    const barWidth = Math.max(16, Math.min(36, (chartWidth / daysData.length) * 0.6));
    const step = chartWidth / daysData.length;

    daysData.forEach((day, index) => {
      const barX = paddingLeft + index * step + (step - barWidth) / 2;
      const barHeight = maxSpend > 0 ? (day.totalCost / maxSpend) * chartHeight : 0;
      const barY = paddingTop + chartHeight - barHeight;

      // Color: Alert orange/red if over daily average budget, else cyan gradient
      const isOverBudget = avgDailyBudget > 0 && day.totalCost > avgDailyBudget;
      
      const grad = ctx.createLinearGradient(0, barY, 0, paddingTop + chartHeight);
      if (isOverBudget) {
        grad.addColorStop(0, '#f97316');
        grad.addColorStop(1, '#ef4444');
      } else {
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(1, '#6366f1');
      }

      // Draw rounded top bar
      ctx.fillStyle = grad;
      ctx.beginPath();
      const r = 4;
      ctx.moveTo(barX, paddingTop + chartHeight);
      ctx.lineTo(barX, barY + r);
      ctx.quadraticCurveTo(barX, barY, barX + r, barY);
      ctx.lineTo(barX + barWidth - r, barY);
      ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + r);
      ctx.lineTo(barX + barWidth, paddingTop + chartHeight);
      ctx.closePath();
      ctx.fill();

      // Day Label (e.g. D1, D2)
      ctx.font = '600 11px "Inter", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(`D${day.dayNumber}`, barX + barWidth / 2, height - paddingBottom + 16);
    });

    // Draw Average Budget Line if > 0
    if (avgDailyBudget > 0 && avgDailyBudget <= maxSpend) {
      const budgetY = paddingTop + chartHeight - (avgDailyBudget / maxSpend) * chartHeight;
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, budgetY);
      ctx.lineTo(width - paddingRight, budgetY);
      ctx.stroke();
      ctx.restore();

      // Label for threshold
      ctx.font = '600 10px "Inter", sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'right';
      ctx.fillText(`Target Avg: ${Utils.formatCurrency(avgDailyBudget, currencyCode)}`, width - paddingRight, budgetY - 6);
    }
  }
};
