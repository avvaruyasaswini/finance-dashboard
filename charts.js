// charts.js — Chart.js initialization & update logic

/* ═══════════════════════════════════════════════
   CHART INSTANCES (stored for destroy/re-create)
   ═══════════════════════════════════════════════ */
let lineChartInstance = null;
let doughnutChartInstance = null;

/* ── Category Color Map ── */
const categoryColors = {
  'Food & Dining':    { bg: 'rgba(245, 158, 11, 0.75)',  border: '#F59E0B' },
  'Rent & Utilities': { bg: 'rgba(239, 68, 68, 0.75)',   border: '#EF4444' },
  'Shopping':         { bg: 'rgba(99, 102, 241, 0.75)',   border: '#6366F1' },
  'Entertainment':    { bg: 'rgba(236, 72, 153, 0.75)',   border: '#EC4899' },
  'Healthcare':       { bg: 'rgba(16, 185, 129, 0.75)',   border: '#10B981' },
  'Salary':           { bg: 'rgba(14, 165, 233, 0.75)',   border: '#0EA5E9' },
  'Freelance':        { bg: 'rgba(139, 92, 246, 0.75)',   border: '#8B5CF6' }
};

/* ═══════════════════════════════════════════════
   COMPUTE MONTHLY DATA
   ═══════════════════════════════════════════════ */

/**
 * Returns an array of { month: 'Feb 2026', income, expenses, balance }
 * sorted chronologically.
 */
function computeMonthlyData(transactions) {
  const monthMap = {};

  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    if (!monthMap[key]) {
      monthMap[key] = { key, label, income: 0, expenses: 0 };
    }

    if (t.type === 'income') {
      monthMap[key].income += t.amount;
    } else {
      monthMap[key].expenses += t.amount;
    }
  });

  // Sort chronologically and compute running balance
  const months = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));

  let runningBalance = 0;
  months.forEach(m => {
    runningBalance += m.income - m.expenses;
    m.balance = runningBalance;
  });

  return months;
}

/**
 * Returns { category: totalAmount } for expense transactions only.
 */
function computeCategorySpending(transactions) {
  const categoryMap = {};

  transactions.forEach(t => {
    if (t.type === 'expense') {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += t.amount;
    }
  });

  return categoryMap;
}

/* ═══════════════════════════════════════════════
   RENDER CHARTS
   ═══════════════════════════════════════════════ */

function renderCharts() {
  renderLineChart();
  renderDoughnutChart();
}

/* ── Line Chart: Monthly Balance Trend ── */
function renderLineChart() {
  const ctx = document.getElementById('line-chart');
  if (!ctx) return;

  // Destroy existing instance
  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  const data = computeMonthlyData(appState.transactions);
  const labels = data.map(m => m.label);
  const incomeData = data.map(m => m.income);
  const expenseData = data.map(m => m.expenses);
  const balanceData = data.map(m => m.balance);

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Balance',
          data: balanceData,
          borderColor: '#0F766E',
          backgroundColor: 'rgba(15, 118, 110, 0.1)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#0F766E',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.05)',
          borderWidth: 2,
          borderDash: [6, 3],
          fill: false,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#DC2626',
          backgroundColor: 'rgba(220, 38, 38, 0.05)',
          borderWidth: 2,
          borderDash: [6, 3],
          fill: false,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { family: 'Inter', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(26, 26, 46, 0.92)',
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString('en-IN');
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Inter', size: 12 },
            color: '#8C95A6'
          }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            font: { family: 'Inter', size: 12 },
            color: '#8C95A6',
            callback: function (value) {
              return '₹' + value.toLocaleString('en-IN');
            }
          }
        }
      }
    }
  });
}

/* ── Doughnut Chart: Spending by Category ── */
function renderDoughnutChart() {
  const ctx = document.getElementById('doughnut-chart');
  if (!ctx) return;

  // Destroy existing instance
  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
  }

  const spending = computeCategorySpending(appState.transactions);
  const categories = Object.keys(spending);
  const amounts = Object.values(spending);
  const bgColors = categories.map(c => (categoryColors[c] || { bg: '#94A3B8' }).bg);
  const borderColors = categories.map(c => (categoryColors[c] || { border: '#64748B' }).border);

  doughnutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 14,
            font: { family: 'Inter', size: 11.5 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(26, 26, 46, 0.92)',
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((context.raw / total) * 100).toFixed(1);
              return context.label + ': ₹' + context.raw.toLocaleString('en-IN') + ' (' + pct + '%)';
            }
          }
        }
      }
    }
  });
}
