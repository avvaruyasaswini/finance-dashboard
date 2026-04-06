// insights.js — Insights computation and rendering with polished UI

/* ═══════════════════════════════════════════════
   RENDER INSIGHTS
   ═══════════════════════════════════════════════ */

function renderInsights() {
  const container = document.getElementById('insights-grid');
  if (!container) return;

  const transactions = appState.transactions;

  // ── 1. Highest Spending Category ──
  const highestCategory = computeHighestSpendingCategory(transactions);

  // ── 2. This Month vs Last Month ──
  const monthComparison = computeMonthComparison(transactions);

  // ── 3. Income vs Expense Ratio ──
  const ratio = computeIncomeExpenseRatio(transactions);

  // Determine comparison sentiment
  const compSentiment = monthComparison.change > 0 ? 'negative' : monthComparison.change < 0 ? 'positive' : 'neutral';
  const compIcon = monthComparison.change > 0 ? 'trending_up' : monthComparison.change < 0 ? 'trending_down' : 'trending_flat';
  const compIconClass = monthComparison.change > 0 ? 'icon-negative' : monthComparison.change < 0 ? 'icon-positive' : 'icon-neutral';

  // Determine savings sentiment
  const savingsSentiment = parseFloat(ratio.savingsRate) >= 20 ? 'positive' : 'negative';
  const savingsIcon = parseFloat(ratio.savingsRate) >= 20 ? 'savings' : 'warning';
  const savingsIconClass = parseFloat(ratio.savingsRate) >= 20 ? 'icon-positive' : 'icon-negative';

  container.innerHTML = `
    <div class="insight-card insight-negative" id="insight-highest">
      <div class="insight-header">
        <div class="insight-icon icon-negative">
          <span class="material-icons-outlined">shopping_cart</span>
        </div>
        <p class="insight-label">Highest Spending Category</p>
      </div>
      <h3 class="insight-value">${highestCategory.category}</h3>
      <p class="insight-detail">
        <strong style="color: var(--expense)">₹${highestCategory.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> 
        spent across ${highestCategory.count} transaction${highestCategory.count !== 1 ? 's' : ''}
      </p>
    </div>

    <div class="insight-card insight-${compSentiment}" id="insight-comparison">
      <div class="insight-header">
        <div class="insight-icon ${compIconClass}">
          <span class="material-icons-outlined">${compIcon}</span>
        </div>
        <p class="insight-label">Month-over-Month</p>
      </div>
      <h3 class="insight-value" style="color: ${monthComparison.changeColor}">${monthComparison.changeSymbol}₹${Math.abs(monthComparison.change).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
      <p class="insight-detail">
        ${monthComparison.currentMonth}: <strong>₹${monthComparison.currentExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> spent<br>
        ${monthComparison.previousMonth}: <strong>₹${monthComparison.previousExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> spent
      </p>
    </div>

    <div class="insight-card insight-${savingsSentiment}" id="insight-ratio">
      <div class="insight-header">
        <div class="insight-icon ${savingsIconClass}">
          <span class="material-icons-outlined">${savingsIcon}</span>
        </div>
        <p class="insight-label">Income vs Expense Ratio</p>
      </div>
      <h3 class="insight-value">${ratio.ratio}</h3>
      <p class="insight-detail">
        For every ₹1 spent, you earn <strong style="color: var(--income)">₹${ratio.perDollar}</strong><br>
        Savings rate: <strong style="color: ${ratio.savingsColor}">${ratio.savingsRate}%</strong>
      </p>
    </div>
  `;
}

/* ═══════════════════════════════════════════════
   COMPUTATION FUNCTIONS
   ═══════════════════════════════════════════════ */

/**
 * Find the category with the highest total spending
 */
function computeHighestSpendingCategory(transactions) {
  const categoryMap = {};

  transactions.forEach(t => {
    if (t.type === 'expense') {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { amount: 0, count: 0 };
      }
      categoryMap[t.category].amount += t.amount;
      categoryMap[t.category].count += 1;
    }
  });

  let highest = { category: 'N/A', amount: 0, count: 0 };

  for (const [category, data] of Object.entries(categoryMap)) {
    if (data.amount > highest.amount) {
      highest = { category, amount: data.amount, count: data.count };
    }
  }

  return highest;
}

/**
 * Compare this month's expenses to last month's expenses
 * Uses the most recent month in data as "this month"
 */
function computeMonthComparison(transactions) {
  // Group expenses by YYYY-MM
  const monthlyExpenses = {};

  transactions.forEach(t => {
    if (t.type === 'expense') {
      const d = new Date(t.date);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      if (!monthlyExpenses[key]) {
        monthlyExpenses[key] = { total: 0, label: '' };
      }
      monthlyExpenses[key].total += t.amount;
      monthlyExpenses[key].label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }
  });

  const sortedMonths = Object.keys(monthlyExpenses).sort();

  if (sortedMonths.length < 2) {
    return {
      currentMonth: sortedMonths.length > 0 ? monthlyExpenses[sortedMonths[0]].label : 'N/A',
      previousMonth: 'N/A',
      currentExpenses: sortedMonths.length > 0 ? monthlyExpenses[sortedMonths[0]].total : 0,
      previousExpenses: 0,
      change: 0,
      changeSymbol: '',
      changeColor: 'var(--text-primary)'
    };
  }

  const currentKey = sortedMonths[sortedMonths.length - 1];
  const previousKey = sortedMonths[sortedMonths.length - 2];
  const current = monthlyExpenses[currentKey];
  const previous = monthlyExpenses[previousKey];
  const change = current.total - previous.total;

  return {
    currentMonth: current.label,
    previousMonth: previous.label,
    currentExpenses: current.total,
    previousExpenses: previous.total,
    change: change,
    changeSymbol: change > 0 ? '▲ +' : change < 0 ? '▼ ' : '',
    changeColor: change > 0 ? 'var(--expense)' : change < 0 ? 'var(--income)' : 'var(--text-primary)'
  };
}

/**
 * Compute income to expense ratio and savings rate
 */
function computeIncomeExpenseRatio(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpenses += t.amount;
  });

  if (totalExpenses === 0) {
    return {
      ratio: '∞ : 1',
      perDollar: '∞',
      savingsRate: '100',
      savingsColor: 'var(--income)'
    };
  }

  const ratioValue = (totalIncome / totalExpenses).toFixed(2);
  const perDollar = ratioValue;
  const savingsRate = (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1);

  return {
    ratio: ratioValue + ' : 1',
    perDollar,
    savingsRate,
    savingsColor: parseFloat(savingsRate) >= 20 ? 'var(--income)' : 'var(--expense)'
  };
}
