# Personal Finance Dashboard

A modern web app to track your loans, manage EMI payments, and visualize your financial progress.

## Features
- Add, view, and delete loans
- Calculate EMI for new loans
- Record payments with interest/principal breakdown
- Visualize payment history and trends (Chart.js)
- Data stored locally using IndexedDB
- Responsive, clean UI (custom CSS, Bootstrap for history page)

## Project Structure
```
Personal-Finance-Dashboard/
├── EMI.js                  # Main dashboard logic
├── IndexedDBService.js     # IndexedDB CRUD operations
├── index.html              # Main dashboard UI
├── paymentHistory.html     # Payment history & analytics (table + chart)
├── PaymentHistory.js       # (Optional) JS for payment history page
├── assets/
│   └── styles.css          # Main CSS styles
└── README.md
```

## How to Use
1. Open `index.html` in your browser to manage loans and payments.
2. Use the "View History" button to see detailed payment analytics (opens `paymentHistory.html`).
3. All data is stored locally in your browser (no backend required).

## Scripts
- `EMI.js`: Handles loan logic, EMI calculation, payment recording, and dashboard updates.
- `IndexedDBService.js`: Provides IndexedDB CRUD functions for storing loan/payment data.
- `assets/openPaymentModal.js`: (If present) Handles opening the payment modal.

## Technologies Used
- HTML, CSS (custom + Bootstrap for history page)
- JavaScript (ES6+)
- IndexedDB (local storage)
- Chart.js (payment trends)

## Customization
- Edit `styles.css` for UI changes.
- Extend `EMI.js` or add new JS modules for more features.

## License
MIT