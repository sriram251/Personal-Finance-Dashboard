# Personal Finance Dashboard

## Overview
The Personal Finance Dashboard is a web application designed to help users manage their loans, track EMI payments, and calculate EMIs. It provides an intuitive interface for adding loans, viewing payment history, and monitoring financial statistics.

## Features
- **Loan Management**: Add, view, and delete loans with details like principal amount, interest rate, tenure, and start date.
- **EMI Calculator**: Calculate monthly EMIs based on loan amount, interest rate, and tenure.
- **Payment Tracking**: Record payments, view payment history, and track remaining balances.
- **Dashboard Statistics**: View total active loans, total principal, remaining balance, and monthly EMI.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Database**: IndexedDB for storing loan and payment data locally

## File Structure
- `EMI.html`: The main HTML file for the application interface.
- `EMI.js`: Contains the core logic for loan management, EMI calculations, and UI updates.
- `IndexedDBService.js`: Handles CRUD operations for storing and retrieving data from IndexedDB.

## How to Use
1. Open the `EMI.html` file in a web browser.
2. Use the "Add New Loan" form to add loan details.
3. View loan details and statistics on the dashboard.
4. Use the EMI Calculator to calculate monthly EMIs.
5. Record payments and view payment history for each loan.

## Screenshots
- **Dashboard**: Displays loan statistics and active loans.
- **Add Loan Form**: Allows users to input loan details.
- **EMI Calculator**: Provides a quick way to calculate EMIs.

## Future Enhancements
- Add user authentication for secure access.
- Enable cloud-based data storage for cross-device synchronization.
- Add reminders for upcoming EMI payments.

## License
This project is licensed under the MIT License. Feel free to use and modify it as needed.