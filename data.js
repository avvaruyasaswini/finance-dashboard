// data.js — Mock transactions data (25 entries across Feb, Mar, Apr 2026)

const mockTransactions = [
  // ─── February 2026 ───
  { id: 1,  date: '2026-02-01', description: 'Monthly Salary',         category: 'Salary',           type: 'income',  amount: 5000 },
  { id: 2,  date: '2026-02-03', description: 'Grocery Shopping',       category: 'Food & Dining',    type: 'expense', amount: 120 },
  { id: 3,  date: '2026-02-05', description: 'Apartment Rent',         category: 'Rent & Utilities', type: 'expense', amount: 1200 },
  { id: 4,  date: '2026-02-08', description: 'Netflix Subscription',   category: 'Entertainment',    type: 'expense', amount: 15 },
  { id: 5,  date: '2026-02-10', description: 'Freelance Web Project',  category: 'Freelance',        type: 'income',  amount: 800 },
  { id: 6,  date: '2026-02-14', description: 'Valentine Dinner',       category: 'Food & Dining',    type: 'expense', amount: 85 },
  { id: 7,  date: '2026-02-18', description: 'New Running Shoes',      category: 'Shopping',         type: 'expense', amount: 140 },
  { id: 8,  date: '2026-02-22', description: 'Electricity Bill',       category: 'Rent & Utilities', type: 'expense', amount: 95 },

  // ─── March 2026 ───
  { id: 9,  date: '2026-03-01', description: 'Monthly Salary',         category: 'Salary',           type: 'income',  amount: 5000 },
  { id: 10, date: '2026-03-03', description: 'Doctor Visit',           category: 'Healthcare',       type: 'expense', amount: 200 },
  { id: 11, date: '2026-03-05', description: 'Apartment Rent',         category: 'Rent & Utilities', type: 'expense', amount: 1200 },
  { id: 12, date: '2026-03-07', description: 'Online Course',          category: 'Shopping',         type: 'expense', amount: 50 },
  { id: 13, date: '2026-03-10', description: 'Freelance Logo Design',  category: 'Freelance',        type: 'income',  amount: 500 },
  { id: 14, date: '2026-03-12', description: 'Restaurant Lunch',       category: 'Food & Dining',    type: 'expense', amount: 45 },
  { id: 15, date: '2026-03-15', description: 'Movie Tickets',          category: 'Entertainment',    type: 'expense', amount: 30 },
  { id: 16, date: '2026-03-18', description: 'Pharmacy',               category: 'Healthcare',       type: 'expense', amount: 60 },
  { id: 17, date: '2026-03-22', description: 'Internet Bill',          category: 'Rent & Utilities', type: 'expense', amount: 70 },
  { id: 18, date: '2026-03-28', description: 'Spring Clothing Haul',   category: 'Shopping',         type: 'expense', amount: 220 },

  // ─── April 2026 ───
  { id: 19, date: '2026-04-01', description: 'Monthly Salary',         category: 'Salary',           type: 'income',  amount: 5200 },
  { id: 20, date: '2026-04-02', description: 'Grocery Run',            category: 'Food & Dining',    type: 'expense', amount: 95 },
  { id: 21, date: '2026-04-03', description: 'Apartment Rent',         category: 'Rent & Utilities', type: 'expense', amount: 1200 },
  { id: 22, date: '2026-04-03', description: 'Freelance App UI',       category: 'Freelance',        type: 'income',  amount: 650 },
  { id: 23, date: '2026-04-03', description: 'Gaming Subscription',    category: 'Entertainment',    type: 'expense', amount: 12 },
  { id: 24, date: '2026-04-03', description: 'Dental Checkup',         category: 'Healthcare',       type: 'expense', amount: 150 },
  { id: 25, date: '2026-04-03', description: 'Headphones',             category: 'Shopping',         type: 'expense', amount: 75 },
];
