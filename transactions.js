// transactions.js — Render, filter, sort, search logic

/* ═══════════════════════════════════════════════
   POPULATE CATEGORY FILTER DROPDOWN
   Dynamically filters categories based on selected type
   ═══════════════════════════════════════════════ */

function populateCategoryFilter() {
  const select = document.getElementById('filter-category');
  if (!select) return;

  const currentType = appState.filter.type;

  // Get categories relevant to the selected type
  let relevantTransactions = appState.transactions;
  if (currentType !== 'all') {
    relevantTransactions = appState.transactions.filter(t => t.type === currentType);
  }

  const categories = [...new Set(relevantTransactions.map(t => t.category))].sort();

  // Save current selection
  const currentCategory = appState.filter.category;

  // Rebuild the dropdown
  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Reset category filter if the selected category is no longer valid
  if (currentCategory !== 'all' && !categories.includes(currentCategory)) {
    appState.filter.category = 'all';
    select.value = 'all';
  } else {
    select.value = appState.filter.category;
  }
}

/* ═══════════════════════════════════════════════
   APPLY FILTERS, SEARCH & SORT
   ═══════════════════════════════════════════════ */

function applyFilters() {
  let result = [...appState.transactions];

  // ── Filter by type ──
  if (appState.filter.type !== 'all') {
    result = result.filter(t => t.type === appState.filter.type);
  }

  // ── Filter by category ──
  if (appState.filter.category !== 'all') {
    result = result.filter(t => t.category === appState.filter.category);
  }

  // ── Filter by date range ──
  if (appState.filter.dateFrom) {
    result = result.filter(t => t.date >= appState.filter.dateFrom);
  }
  if (appState.filter.dateTo) {
    result = result.filter(t => t.date <= appState.filter.dateTo);
  }

  // ── Search by description or category ──
  if (appState.filter.search.trim() !== '') {
    const query = appState.filter.search.toLowerCase().trim();
    result = result.filter(t =>
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }

  // ── Sort ──
  switch (appState.sort) {
    case 'date-desc':
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'date-asc':
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'amount-desc':
      result.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-asc':
      result.sort((a, b) => a.amount - b.amount);
      break;
  }

  appState.filtered = result;
}

/* ═══════════════════════════════════════════════
   RENDER TRANSACTIONS TABLE
   ═══════════════════════════════════════════════ */

function renderTransactions() {
  applyFilters();

  const tbody = document.getElementById('transactions-tbody');
  const tableWrapper = document.getElementById('table-wrapper');
  const emptyState = document.getElementById('empty-state');
  if (!tbody) return;

  // Handle empty state — hide the table, show message
  if (appState.filtered.length === 0) {
    tbody.innerHTML = '';
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (tableWrapper) tableWrapper.style.display = '';
  if (emptyState) emptyState.style.display = 'none';

  const isAdmin = appState.role === 'admin';

  tbody.innerHTML = appState.filtered.map(t => {
    const dateFormatted = new Date(t.date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const typeBadge = `<span class="badge badge-${t.type}">${t.type}</span>`;
    const amountClass = t.type === 'income' ? 'amount-income' : 'amount-expense';
    const amountPrefix = t.type === 'income' ? '+' : '-';
    const amountFormatted = amountPrefix + '₹' + t.amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const actionsCell = isAdmin
      ? `<td class="actions-cell">
           <button class="btn-edit" onclick="editTransaction(${t.id})" aria-label="Edit ${t.description}">Edit</button>
           <button class="btn-delete" onclick="confirmDelete(${t.id})" aria-label="Delete ${t.description}">Delete</button>
         </td>`
      : '';

    return `
      <tr>
        <td>${dateFormatted}</td>
        <td>${t.description}</td>
        <td>${t.category}</td>
        <td>${typeBadge}</td>
        <td class="${amountClass}">${amountFormatted}</td>
        ${actionsCell}
      </tr>
    `;
  }).join('');
}

/* ═══════════════════════════════════════════════
   EVENT LISTENERS (called once from app.js DOMContentLoaded)
   ═══════════════════════════════════════════════ */

function initTransactionListeners() {
  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      appState.filter.search = this.value;
      renderTransactions();
    });
  }

  // Filter by type — also update category dropdown dynamically
  const filterType = document.getElementById('filter-type');
  if (filterType) {
    filterType.addEventListener('change', function () {
      appState.filter.type = this.value;
      populateCategoryFilter();
      renderTransactions();
    });
  }

  // Filter by category
  const filterCategory = document.getElementById('filter-category');
  if (filterCategory) {
    filterCategory.addEventListener('change', function () {
      appState.filter.category = this.value;
      renderTransactions();
    });
  }

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      appState.sort = this.value;
      renderTransactions();
    });
  }

  // Date range — From
  const dateFrom = document.getElementById('filter-date-from');
  if (dateFrom) {
    dateFrom.addEventListener('change', function () {
      appState.filter.dateFrom = this.value;
      renderTransactions();
    });
  }

  // Date range — To
  const dateTo = document.getElementById('filter-date-to');
  if (dateTo) {
    dateTo.addEventListener('change', function () {
      appState.filter.dateTo = this.value;
      renderTransactions();
    });
  }

  // Clear date range
  const clearDates = document.getElementById('btn-clear-dates');
  if (clearDates) {
    clearDates.addEventListener('click', function () {
      appState.filter.dateFrom = '';
      appState.filter.dateTo = '';
      document.getElementById('filter-date-from').value = '';
      document.getElementById('filter-date-to').value = '';
      renderTransactions();
    });
  }
}
