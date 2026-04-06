// app.js — App entry point, state management, event listeners

/* ═══════════════════════════════════════════════
   CENTRAL APP STATE
   ═══════════════════════════════════════════════ */
const appState = {
  transactions: [],        // All transactions (source of truth)
  filtered: [],            // Currently displayed after filter/search/sort
  role: 'viewer',          // 'viewer' or 'admin'
  filter: {
    type: 'all',           // 'all', 'income', 'expense'
    category: 'all',       // Category name or 'all'
    search: '',            // Search input value
    dateFrom: '',          // Date range start (YYYY-MM-DD)
    dateTo: ''             // Date range end (YYYY-MM-DD)
  },
  sort: 'date-desc',       // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc'
  darkMode: false,         // true = dark theme active
  editingId: null           // ID of transaction being edited (null = adding new)
};

/* ═══════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════ */

/**
 * Format a number as currency (₹X,XX,XXX.XX) using Indian locale
 */
function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Compute summary totals from the transactions array
 */
function computeSummary(transactions) {
  let income = 0;
  let expenses = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expenses += t.amount;
    }
  }

  return {
    income,
    expenses,
    balance: income - expenses
  };
}

/**
 * Generate next available ID
 */
function getNextId() {
  if (appState.transactions.length === 0) return 1;
  return Math.max(...appState.transactions.map(t => t.id)) + 1;
}

/* ═══════════════════════════════════════════════
   LOCAL STORAGE PERSISTENCE
   ═══════════════════════════════════════════════ */

const STORAGE_KEY = 'finDash_state';

/**
 * Save current state to localStorage
 */
function saveToLocalStorage() {
  try {
    const data = {
      transactions: appState.transactions,
      role: appState.role,
      darkMode: appState.darkMode
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage might be unavailable — fail silently
  }
}

/**
 * Load saved state from localStorage
 * Returns true if data was loaded, false otherwise
 */
function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
        appState.transactions = data.transactions;
      }
      if (data.role) {
        appState.role = data.role;
      }
      if (typeof data.darkMode === 'boolean') {
        appState.darkMode = data.darkMode;
      }
      return true;
    }
  } catch (e) {
    // Corrupted data — fall back to defaults
  }
  return false;
}

/* ═══════════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
   ═══════════════════════════════════════════════ */

const TOAST_ICONS = {
  success: 'check_circle',
  error: 'error',
  info: 'info'
};

/**
 * Show a non-intrusive toast notification
 * @param {string} message — text to display
 * @param {'success'|'error'|'info'} type — toast style
 * @param {number} duration — auto-dismiss in ms (default 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="material-icons-outlined toast-icon">${TOAST_ICONS[type] || 'info'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* ═══════════════════════════════════════════════
   COUNT-UP ANIMATION FOR SUMMARY CARDS
   ═══════════════════════════════════════════════ */

// Track previous values for animation
let prevSummary = { balance: 0, income: 0, expenses: 0 };

/**
 * Animate a value counting up/down with easing
 */
function animateValue(element, from, to, duration) {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = from + (to - from) * eased;
    element.textContent = formatCurrency(current);
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ═══════════════════════════════════════════════
   RENDER FUNCTIONS
   ═══════════════════════════════════════════════ */

/**
 * Update the 3 summary cards with animated values
 */
function renderSummaryCards() {
  const summary = computeSummary(appState.transactions);
  const duration = 600; // ms

  const balanceEl = document.getElementById('balance-value');
  const incomeEl = document.getElementById('income-value');
  const expensesEl = document.getElementById('expenses-value');

  animateValue(balanceEl, prevSummary.balance, summary.balance, duration);
  animateValue(incomeEl, prevSummary.income, summary.income, duration);
  animateValue(expensesEl, prevSummary.expenses, summary.expenses, duration);

  prevSummary = { ...summary };
}

/**
 * Master render — calls all sub-renderers
 */
function render() {
  renderSummaryCards();
  renderHomePage();

  // Transactions
  if (typeof renderTransactions === 'function') {
    renderTransactions();
  }

  // Charts
  if (typeof renderCharts === 'function') {
    renderCharts();
  }

  // Insights
  if (typeof renderInsights === 'function') {
    renderInsights();
  }

  // Role-based UI
  updateRoleUI();
}

/**
 * Show/hide admin-only elements based on current role
 */
function updateRoleUI() {
  const isAdmin = appState.role === 'admin';

  document.body.classList.toggle('admin-mode', isAdmin);

  const adminElements = document.querySelectorAll('.admin-only');
  adminElements.forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  const actionsHeaders = document.querySelectorAll('.admin-only-col');
  actionsHeaders.forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });
}

/* ═══════════════════════════════════════════════
   NAVIGATION — Section Switching
   ═══════════════════════════════════════════════ */

function switchSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const target = document.getElementById('section-' + sectionId);
  if (target) {
    target.classList.add('active');
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  const titles = {
    home: 'Home',
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    insights: 'Insights'
  };
  document.getElementById('page-title').textContent = titles[sectionId] || 'Home';

  // Also update the logo active state
  const logoLink = document.getElementById('logo-link');
  if (logoLink) {
    logoLink.classList.toggle('active', sectionId === 'home');
  }
}

/* ═══════════════════════════════════════════════
   RENDER HOME / LANDING PAGE
   ═══════════════════════════════════════════════ */

function renderHomePage() {
  const summary = computeSummary(appState.transactions);

  // Update hero stat cards
  const homeBalance = document.getElementById('home-balance');
  const homeIncome = document.getElementById('home-income');
  const homeExpenses = document.getElementById('home-expenses');

  if (homeBalance) homeBalance.textContent = formatCurrency(summary.balance);
  if (homeIncome) homeIncome.textContent = formatCurrency(summary.income);
  if (homeExpenses) homeExpenses.textContent = formatCurrency(summary.expenses);

  // Transaction count
  const txnCount = document.getElementById('home-txn-count');
  if (txnCount) txnCount.textContent = appState.transactions.length;

  // Unique categories
  const categories = new Set(appState.transactions.map(t => t.category));
  const catEl = document.getElementById('home-categories');
  if (catEl) catEl.textContent = categories.size;

  // Months tracked
  const months = new Set(appState.transactions.map(t => t.date.substring(0, 7)));
  const monthEl = document.getElementById('home-months');
  if (monthEl) monthEl.textContent = months.size;

  // Savings rate
  const savingsRate = summary.income > 0
    ? Math.round(((summary.income - summary.expenses) / summary.income) * 100)
    : 0;
  const savingsEl = document.getElementById('home-savings-rate');
  if (savingsEl) savingsEl.textContent = savingsRate + '%';
}

/* ═══════════════════════════════════════════════
   MODAL — Add / Edit Transaction
   ═══════════════════════════════════════════════ */

let focusTrapCleanup = null;
let previouslyFocusedElement = null;

function openModal(mode, transaction) {
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('transaction-form');

  // Save currently focused element for accessibility
  previouslyFocusedElement = document.activeElement;

  // Clear previous validation errors
  clearFormErrors();

  if (mode === 'edit' && transaction) {
    title.textContent = 'Edit Transaction';
    appState.editingId = transaction.id;

    document.getElementById('input-date').value = transaction.date;
    document.getElementById('input-description').value = transaction.description;
    document.getElementById('input-category').value = transaction.category;
    document.getElementById('input-type').value = transaction.type;
    document.getElementById('input-amount').value = transaction.amount;
  } else {
    title.textContent = 'Add Transaction';
    appState.editingId = null;
    form.reset();

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('input-date').value = today;
  }

  overlay.style.display = 'flex';

  // Set up focus trap
  requestAnimationFrame(() => {
    focusTrapCleanup = trapFocus(document.getElementById('transaction-modal'));
  });
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  appState.editingId = null;

  // Clean up focus trap
  if (focusTrapCleanup) {
    focusTrapCleanup();
    focusTrapCleanup = null;
  }

  // Restore focus to previously focused element
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
    previouslyFocusedElement = null;
  }
}

/* ═══════════════════════════════════════════════
   ACCESSIBILITY — Focus Trap
   ═══════════════════════════════════════════════ */

/**
 * Trap Tab/Shift+Tab within a container element.
 * Returns a cleanup function to remove the event listener.
 */
function trapFocus(container) {
  const focusableSelectors = 'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusable = container.querySelectorAll(focusableSelectors);

  if (focusable.length === 0) return () => {};

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeydown);
  first.focus();

  return () => container.removeEventListener('keydown', handleKeydown);
}

/* ═══════════════════════════════════════════════
   FORM VALIDATION
   ═══════════════════════════════════════════════ */

/**
 * Validate the transaction form and show inline errors.
 * Returns true if valid, false otherwise.
 */
function validateForm() {
  let isValid = true;
  clearFormErrors();

  const date = document.getElementById('input-date').value;
  const description = document.getElementById('input-description').value.trim();
  const category = document.getElementById('input-category').value;
  const type = document.getElementById('input-type').value;
  const amount = document.getElementById('input-amount').value;

  if (!date) {
    setFieldError('date', 'Date is required');
    isValid = false;
  }

  if (!description) {
    setFieldError('description', 'Description is required');
    isValid = false;
  } else if (description.length < 2) {
    setFieldError('description', 'Description must be at least 2 characters');
    isValid = false;
  }

  if (!category) {
    setFieldError('category', 'Please select a category');
    isValid = false;
  }

  if (!type) {
    setFieldError('type', 'Please select a type');
    isValid = false;
  }

  if (!amount || isNaN(parseFloat(amount))) {
    setFieldError('amount', 'Amount is required');
    isValid = false;
  } else if (parseFloat(amount) <= 0) {
    setFieldError('amount', 'Amount must be greater than 0');
    isValid = false;
  }

  return isValid;
}

function setFieldError(field, message) {
  const errorEl = document.getElementById('error-' + field);
  const formGroup = errorEl?.closest('.form-group');
  if (errorEl) errorEl.textContent = message;
  if (formGroup) formGroup.classList.add('has-error');
}

function clearFormErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-group.has-error').forEach(el => el.classList.remove('has-error'));
}

/**
 * Handle form submission — add or update transaction
 */
function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const date = document.getElementById('input-date').value;
  const description = document.getElementById('input-description').value.trim();
  const category = document.getElementById('input-category').value;
  const type = document.getElementById('input-type').value;
  const amount = parseFloat(document.getElementById('input-amount').value);

  if (appState.editingId !== null) {
    // ── Edit existing ──
    const index = appState.transactions.findIndex(t => t.id === appState.editingId);
    if (index !== -1) {
      appState.transactions[index] = {
        ...appState.transactions[index],
        date,
        description,
        category,
        type,
        amount
      };
    }
    closeModal();
    showToast('Transaction updated successfully', 'success');
  } else {
    // ── Add new ──
    appState.transactions.push({
      id: getNextId(),
      date,
      description,
      category,
      type,
      amount
    });
    closeModal();
    showToast('Transaction added successfully', 'success');
  }

  populateCategoryFilter();
  render();
  saveToLocalStorage();
}

/**
 * Called from edit button onclick in transaction rows
 */
function editTransaction(id) {
  const transaction = appState.transactions.find(t => t.id === id);
  if (transaction) {
    openModal('edit', transaction);
  }
}

/* ═══════════════════════════════════════════════
   DELETE TRANSACTION WITH CONFIRMATION
   ═══════════════════════════════════════════════ */

let pendingDeleteId = null;
let confirmFocusTrapCleanup = null;
let confirmPreviouslyFocused = null;

/**
 * Show the confirmation dialog for deleting a transaction
 */
function confirmDelete(id) {
  const transaction = appState.transactions.find(t => t.id === id);
  if (!transaction) return;

  pendingDeleteId = id;
  confirmPreviouslyFocused = document.activeElement;

  // Update dialog message
  document.getElementById('confirm-message').textContent =
    `Delete "${transaction.description}" (${formatCurrency(transaction.amount)})?`;

  const overlay = document.getElementById('confirm-overlay');
  overlay.style.display = 'flex';

  // Focus trap
  requestAnimationFrame(() => {
    confirmFocusTrapCleanup = trapFocus(document.querySelector('.confirm-dialog'));
  });
}

/**
 * Execute the deletion
 */
function executeDelete() {
  if (pendingDeleteId === null) return;

  appState.transactions = appState.transactions.filter(t => t.id !== pendingDeleteId);
  pendingDeleteId = null;
  closeConfirmDialog();
  populateCategoryFilter();
  render();
  saveToLocalStorage();
  showToast('Transaction deleted', 'success');
}

/**
 * Close confirmation dialog
 */
function closeConfirmDialog() {
  document.getElementById('confirm-overlay').style.display = 'none';
  pendingDeleteId = null;

  if (confirmFocusTrapCleanup) {
    confirmFocusTrapCleanup();
    confirmFocusTrapCleanup = null;
  }

  if (confirmPreviouslyFocused) {
    confirmPreviouslyFocused.focus();
    confirmPreviouslyFocused = null;
  }
}

/* ═══════════════════════════════════════════════
   EXPORT CSV
   ═══════════════════════════════════════════════ */

function exportCSV() {
  const rows = appState.filtered;
  if (rows.length === 0) {
    showToast('No transactions to export', 'info');
    return;
  }

  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const csvLines = [headers.join(',')];

  rows.forEach(t => {
    const row = [
      t.date,
      '"' + t.description.replace(/"/g, '""') + '"',
      '"' + t.category.replace(/"/g, '""') + '"',
      t.type,
      t.amount.toFixed(2)
    ];
    csvLines.push(row.join(','));
  });

  const csvContent = csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'transactions_export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`Exported ${rows.length} transaction${rows.length !== 1 ? 's' : ''} to CSV`, 'success');
}

/* ═══════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ═══════════════════════════════════════════════ */

function isInputFocused() {
  const tag = document.activeElement?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function isAnyDialogOpen() {
  return (
    document.getElementById('modal-overlay').style.display === 'flex' ||
    document.getElementById('confirm-overlay').style.display === 'flex' ||
    document.getElementById('shortcuts-overlay').style.display === 'flex'
  );
}

function openShortcutsDialog() {
  document.getElementById('shortcuts-overlay').style.display = 'flex';
}

function closeShortcutsDialog() {
  document.getElementById('shortcuts-overlay').style.display = 'none';
}

function handleKeyboardShortcuts(e) {
  // Escape always closes dialogs
  if (e.key === 'Escape') {
    if (document.getElementById('modal-overlay').style.display === 'flex') {
      closeModal();
      return;
    }
    if (document.getElementById('confirm-overlay').style.display === 'flex') {
      closeConfirmDialog();
      return;
    }
    if (document.getElementById('shortcuts-overlay').style.display === 'flex') {
      closeShortcutsDialog();
      return;
    }
    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
    }
    return;
  }

  // Don't intercept if input is focused or dialog is open
  if (isInputFocused() || isAnyDialogOpen()) return;

  switch (e.key) {
    case 'n':
    case 'N':
      if (appState.role === 'admin') {
        e.preventDefault();
        switchSection('transactions');
        openModal('add');
      }
      break;

    case '/':
      e.preventDefault();
      switchSection('transactions');
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
      break;

    case 'd':
      e.preventDefault();
      appState.darkMode = !appState.darkMode;
      document.body.classList.toggle('dark-mode', appState.darkMode);
      document.getElementById('toggle-icon').textContent = appState.darkMode ? '☀️' : '🌙';
      saveToLocalStorage();
      break;

    case '0':
      e.preventDefault();
      switchSection('home');
      break;

    case '1':
      e.preventDefault();
      switchSection('dashboard');
      break;

    case '2':
      e.preventDefault();
      switchSection('transactions');
      break;

    case '3':
      e.preventDefault();
      switchSection('insights');
      break;

    case '?':
      e.preventDefault();
      openShortcutsDialog();
      break;
  }
}

/* ═══════════════════════════════════════════════
   EVENT LISTENERS
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  // ── Load from localStorage or use mock data ──
  const loaded = loadFromLocalStorage();
  if (!loaded) {
    appState.transactions = [...mockTransactions];
  }
  appState.filtered = [...appState.transactions];

  // Initialize previous summary for animation
  prevSummary = computeSummary(appState.transactions);

  // ── Apply dark mode (default to dark on first visit) ──
  // The inline head script already applied .dark-mode to <html> to prevent flash.
  // Now sync <body> and toggle icon with the resolved state.
  if (!loaded) {
    appState.darkMode = true; // default to dark on first visit
  }
  document.body.classList.toggle('dark-mode', appState.darkMode);
  document.getElementById('toggle-icon').textContent = appState.darkMode ? '☀️' : '🌙';

  // ── Apply saved role ──
  document.getElementById('role-select').value = appState.role;

  // ── Populate category filter dropdown ──
  if (typeof populateCategoryFilter === 'function') {
    populateCategoryFilter();
  }

  // ── Initialize transaction filter listeners ──
  if (typeof initTransactionListeners === 'function') {
    initTransactionListeners();
  }

  // ── Initial Render ──
  render();

  // ── Sidebar Navigation ──
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const section = this.dataset.section;
      switchSection(section);

      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
    });
  });

  // ── Logo Click → Navigate to Home ──
  const logoLink = document.getElementById('logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      e.preventDefault();
      switchSection('home');
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
    });
  }

  // ── Feature Cards → Navigate to Sections ──
  document.getElementById('feature-dashboard').addEventListener('click', function () {
    switchSection('dashboard');
  });
  document.getElementById('feature-transactions').addEventListener('click', function () {
    switchSection('transactions');
  });
  document.getElementById('feature-insights').addEventListener('click', function () {
    switchSection('insights');
  });

  // ── Mobile Menu Toggle ──
  document.getElementById('menu-toggle').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });

  // ── Mobile Sidebar Overlay Close ──
  document.getElementById('sidebar-overlay').addEventListener('click', function () {
    document.getElementById('sidebar').classList.remove('open');
    this.classList.remove('active');
  });

  // ── Role Switcher ──
  document.getElementById('role-select').addEventListener('change', function () {
    appState.role = this.value;
    render();
    saveToLocalStorage();
    showToast(`Switched to ${this.value === 'admin' ? 'Admin' : 'Viewer'} mode`, 'info');
  });

  // ── Dark Mode Toggle ──
  document.getElementById('dark-mode-toggle').addEventListener('click', function () {
    appState.darkMode = !appState.darkMode;
    document.body.classList.toggle('dark-mode', appState.darkMode);
    document.getElementById('toggle-icon').textContent = appState.darkMode ? '☀️' : '🌙';
    saveToLocalStorage();
  });

  // ── Add Transaction Button ──
  document.getElementById('btn-add-transaction').addEventListener('click', function () {
    openModal('add');
  });

  // ── Export CSV Button ──
  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);

  // ── Modal Close ──
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);

  // Close modal on overlay click
  document.getElementById('modal-overlay').addEventListener('click', function (e) {
    if (e.target === this) {
      closeModal();
    }
  });

  // ── Form Submit ──
  document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit);

  // ── Clear inline errors on input ──
  document.querySelectorAll('#transaction-form input, #transaction-form select').forEach(el => {
    el.addEventListener('input', function () {
      const group = this.closest('.form-group');
      if (group) {
        group.classList.remove('has-error');
        const errorEl = group.querySelector('.form-error');
        if (errorEl) errorEl.textContent = '';
      }
    });
  });

  // ── Confirm Dialog ──
  document.getElementById('confirm-cancel').addEventListener('click', closeConfirmDialog);
  document.getElementById('confirm-delete').addEventListener('click', executeDelete);

  // Close confirm on overlay click
  document.getElementById('confirm-overlay').addEventListener('click', function (e) {
    if (e.target === this) {
      closeConfirmDialog();
    }
  });

  // ── Shortcuts Dialog ──
  document.getElementById('shortcuts-close').addEventListener('click', closeShortcutsDialog);
  document.getElementById('shortcuts-overlay').addEventListener('click', function (e) {
    if (e.target === this) {
      closeShortcutsDialog();
    }
  });

  // ── Keyboard Shortcuts ──
  document.addEventListener('keydown', handleKeyboardShortcuts);

});
