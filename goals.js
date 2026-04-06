// goals.js — Render and manage savings goals

/* ═══════════════════════════════════════════════
   GOALS DATA STRUCTURE
   ═══════════════════════════════════════════════ */

const mockGoals = [
  {
    id: 1,
    name: 'Emergency Fund',
    targetAmount: 50000,
    currentAmount: 25000,
    deadline: '2025-12-31',
    category: 'Savings'
  },
  {
    id: 2,
    name: 'Vacation to Goa',
    targetAmount: 30000,
    currentAmount: 15000,
    deadline: '2025-06-30',
    category: 'Travel'
  },
  {
    id: 3,
    name: 'New Laptop',
    targetAmount: 80000,
    currentAmount: 20000,
    deadline: '2025-09-15',
    category: 'Electronics'
  }
];

/* ═══════════════════════════════════════════════
   RENDER GOALS
   ═══════════════════════════════════════════════ */

function renderGoals() {
  const container = document.getElementById('goals-grid');
  if (!container) return;

  // For now, use mock goals; later integrate with appState
  const goals = mockGoals;

  if (goals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-outlined empty-state-icon">flag</span>
        <h3>No Goals Yet</h3>
        <p>Set financial goals to track your progress towards savings targets.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = goals.map(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;
    const status = progress >= 100 ? 'completed' : isOverdue ? 'overdue' : 'active';

    return `
      <div class="goal-card goal-${status}">
        <div class="goal-header">
          <h3 class="goal-name">${goal.name}</h3>
          <span class="goal-category">${goal.category}</span>
        </div>
        <div class="goal-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
          </div>
          <div class="progress-text">
            <span class="progress-current">${formatCurrency(goal.currentAmount)}</span>
            <span class="progress-target">of ${formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>
        <div class="goal-details">
          <div class="goal-detail">
            <span class="detail-label">Remaining</span>
            <span class="detail-value">${formatCurrency(remaining)}</span>
          </div>
          <div class="goal-detail">
            <span class="detail-label">${isOverdue ? 'Overdue by' : 'Days left'}</span>
            <span class="detail-value ${isOverdue ? 'overdue' : ''}">${Math.abs(daysLeft)} days</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ═══════════════════════════════════════════════
   GOALS EVENT LISTENERS
   ═══════════════════════════════════════════════ */

function initGoalsListeners() {
  // Add goal button (admin only)
  const addBtn = document.getElementById('btn-add-goal');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      // For now, just show a toast; implement modal later
      showToast('Add Goal feature coming soon!', 'info');
    });
  }
}