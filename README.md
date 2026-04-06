# Finance Dashboard UI

**Screening Assignment — Frontend Developer Intern**  
**Zorvyn FinTech Pvt. Ltd.**  
**Submitted by:** Yasaswini Avvaru

---

## Project Overview

A clean, interactive finance dashboard interface built with **plain HTML, CSS, and JavaScript** (with Chart.js via CDN). This project demonstrates core frontend competencies: component design, data visualization, role-based UI behavior, state management, responsiveness, accessibility, and production-quality UX.

No frameworks. No build tools. Every line of code is handwritten.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure & semantic markup |
| CSS3 | Styling, dark mode (CSS variables), responsive layout, animations |
| Vanilla JavaScript | State management, DOM manipulation, event handling |
| Chart.js (CDN) | Line chart & Doughnut chart visualization |
| Google Material Icons | UI icons throughout the application |

---

## How to Run Locally

1. Clone or download this repository.
2. Open `index.html` directly in a browser, **or** serve via a local HTTP server for Chart.js CDN to load:
   ```bash
   npx http-server -p 8080
   ```
3. Navigate to `http://localhost:8080` in your browser.

> **Note:** Opening via `file://` protocol may block Chart.js CDN loading in some browsers. Using a local server is recommended.

---

## Features

### Dashboard Overview
- **Summary Cards** — Total Balance, Income, Expenses with **count-up animation** on load
- **Line Chart** — Monthly Balance Trend (Balance, Income, Expenses over time)
- **Doughnut Chart** — Spending by Category (with percentage tooltips)
- All amounts formatted as **₹** with Indian locale (`en-IN`)

### Transactions — Full CRUD
- **Add** — Admin can add new transactions via modal form
- **Edit** — Admin can edit existing transactions inline
- **Delete** — Admin can delete with a **custom confirmation dialog** showing transaction details
- **View** — All users can view, search, filter, and sort transactions

### Advanced Filtering & Search
- **Live search** by description or category
- **Filter by type** (Income/Expense) with **dynamic category dropdown** (categories update based on type)
- **Date range filter** (From/To date pickers) with "Clear Dates" button
- **Sort** by date or amount (ascending/descending)
- All filters combine together seamlessly

### Export Functionality
- **Export CSV** button exports currently filtered transactions
- CSV includes: Date, Description, Category, Type, Amount
- Values are properly escaped for CSV compatibility
- Shows toast notification with count of exported transactions

### Role-Based UI
- **Viewer** (default): Read-only access — see dashboard, charts, transactions, and insights
- **Admin**: Full CRUD — Add, Edit, and Delete transactions via modal form
- Switch roles using the dropdown in the top navbar
- Role persisted across page refreshes

### Insights
- **Highest Spending Category** — with icon, amount, and transaction count
- **Month-over-Month** — compares current vs previous month's expenses with trend direction
- **Income vs Expense Ratio** — with savings rate percentage and per-rupee breakdown
- Color-coded accent stripes (green = positive, red = negative) and Material Icons

### Toast Notifications
- Non-intrusive success/info/error notifications
- Auto-dismiss after 3 seconds with slide-out animation
- Triggered on: Add, Edit, Delete, Export, Role Switch
- Accessible with `aria-live="polite"` for screen readers

### Form Validation
- **Inline error messages** below each invalid field
- Validates: Required fields, description length (≥2 chars), amount (>0)
- Red border highlight on invalid fields
- Errors clear automatically when user starts typing

### Dark Mode
- Toggle via navbar button (🌙/☀️) or keyboard shortcut (`D`)
- Uses CSS custom properties — all colors swap via `.dark-mode` class
- Preference persisted in localStorage

### Data Persistence
- Transactions, role, and dark mode preference saved to `localStorage`
- Loads automatically on page refresh
- Falls back to mock data if no saved state exists
- Graceful handling of corrupted localStorage data

### Accessibility
- **Focus trap** in modals — Tab/Shift+Tab cycles within dialog
- **Escape key** closes any open dialog
- **ARIA attributes**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- **ARIA labels** on all interactive elements (filter inputs, action buttons)
- **Visible focus states** (`focus-visible`) on all interactive elements
- Focus restored to trigger element when dialog closes

### Keyboard Shortcuts
| Key | Action |
|---|---|
| `N` | New Transaction (Admin only) |
| `/` | Focus search input |
| `D` | Toggle dark mode |
| `1` | Go to Dashboard |
| `2` | Go to Transactions |
| `3` | Go to Insights |
| `?` | Show shortcuts dialog |
| `Esc` | Close any dialog |

### Responsive Design
- **Desktop**: Fixed sidebar, 3-column grid layouts
- **Tablet (≤1024px)**: Charts stack vertically, insights use 2-column grid
- **Mobile (≤768px)**: Sidebar collapses to hamburger menu with overlay, cards stack, table scrolls horizontally, filters go full-width
- **Small Mobile (≤480px)**: Further reduced sizing, full-width action buttons

### Print Stylesheet
- Clean print layout with sidebar and controls hidden
- Page breaks between sections
- Tables and charts print cleanly

### Animations & Transitions
- **Count-up animation** on summary card values (ease-out cubic, 600ms)
- Hover effects on cards, buttons, chart containers
- Fade-in animation on section switches
- Staggered card entrance animation
- Toast slide-in/out animations
- Modal entrance (scale + fade)
- Smooth 0.25s transitions throughout

---

## Project Structure

```
finance-dashboard/
├── index.html          ← Main HTML shell (modals, dialogs, toast container)
├── style.css           ← All styling (responsive, dark mode, animations, printing)
├── app.js              ← State, CRUD, toasts, validation, focus trap, shortcuts
├── data.js             ← Mock transactions data (25 entries)
├── charts.js           ← Chart.js initialization & update logic
├── transactions.js     ← Render, filter, sort, search, date range
├── insights.js         ← Insights computation & polished rendering
└── README.md           ← This file
```

---

## State Management

A single `appState` object serves as the central source of truth:

```javascript
const appState = {
  transactions: [],     // All transactions (source of truth)
  filtered: [],         // Currently displayed after filter/search/sort
  role: 'viewer',       // 'viewer' or 'admin'
  filter: {
    type: 'all',        // 'all', 'income', 'expense'
    category: 'all',    // Category name or 'all'
    search: '',         // Search input value
    dateFrom: '',       // Date range start
    dateTo: ''          // Date range end
  },
  sort: 'date-desc',
  darkMode: false,
  editingId: null       // ID of transaction being edited
};
```

When any state changes (role switch, filter, add/edit/delete), a central `render()` function is called which updates **all** DOM elements based on current state. This keeps logic predictable and easy to trace.

State is persisted to `localStorage` on every mutation and loaded on page initialization.

---

## Role-Based UI — Demo Steps

1. **Load the page** → Default role is "Viewer"
2. In the top navbar, change the **Role** dropdown to **"Admin"**
3. A toast notification appears: "Switched to Admin mode"
4. Navigate to **Transactions** → you'll see:
   - **"+ Add Transaction"** button appears
   - **"Edit"** and **"Delete"** buttons appear on every row
5. Click **"+ Add Transaction"** → fill out the form → Save
6. Try saving with empty fields → inline error messages appear
7. The new transaction immediately updates table, summary cards, and charts
8. Click **"Delete"** on any row → confirmation dialog shows transaction details
9. Switch back to **Viewer** → admin controls disappear

---

## Delete Functionality — Demo Steps

1. Switch to **Admin** role
2. Navigate to **Transactions**
3. Click the red **"Delete"** button on any transaction row
4. A confirmation dialog appears showing:
   - Warning icon
   - Transaction description and amount
   - "This action cannot be undone" warning
5. Click **"Cancel"** to dismiss, or **"Delete"** to confirm
6. On deletion: table, summary cards, and charts update instantly
7. A toast notification confirms: "Transaction deleted"

---

## Mock Data

25 transactions spread across **February, March, and April 2026**, covering 7 categories:

| Category | Type |
|---|---|
| Salary | Income |
| Freelance | Income |
| Food & Dining | Expense |
| Rent & Utilities | Expense |
| Shopping | Expense |
| Entertainment | Expense |
| Healthcare | Expense |

---

## Design Decisions

- **Color Palette**: Teal `#0F766E` as primary accent for a professional fintech feel
- **Typography**: Inter (Google Fonts) for modern, clean readability
- **Layout**: Fixed sidebar (desktop) collapsing to hamburger menu (mobile)
- **Dark Mode**: CSS custom properties — all colors swap via `.dark-mode` class
- **Currency**: ₹ (Indian Rupee) with `en-IN` locale formatting
- **Icons**: Google Material Icons Outlined for consistent visual language
- **Confirmation UX**: Custom dialog with warning icon instead of browser `confirm()`
- **Toast System**: Non-intrusive, auto-dismissing, accessible notifications
- **No framework**: Intentional choice to demonstrate raw JavaScript proficiency

---

## Edge Cases Handled

- **Empty state**: Friendly "No transactions found" message with hint text when filters yield zero results
- **Invalid category on type switch**: Category filter resets to "All" if the selected category doesn't exist in the new type
- **localStorage corruption**: Gracefully falls back to mock data if saved state is corrupted
- **Zero expenses**: Insights show ∞ ratio and 100% savings rate
- **Form validation**: Inline error messages prevent submission with empty/invalid data
- **Description validation**: Minimum 2 characters required
- **Amount validation**: Must be greater than 0
- **CSV escaping**: Description and category with special characters are properly quoted
- **Focus management**: Focus trapped in modals, restored on close
- **Print layout**: Clean output with controls hidden

---

## Known Limitations

- Data is not persisted to a backend — changes are stored in browser localStorage only
- Chart.js requires CDN access (won't load via `file://` protocol in some browsers)
- No pagination — all transactions render at once (suitable for this data size)
- No undo for delete operations

---

## Deployed Link

*GitHub Pages / Netlify — to be added after deployment*

---

**Built with care by Yasaswini Avvaru**
