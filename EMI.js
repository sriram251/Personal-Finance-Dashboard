let loans = [];
GetDebts();
function init() {
GetDebts();
document.getElementById("fileUpload").addEventListener("change", importData);
}
document.addEventListener("DOMContentLoaded", init);

async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById("importStatus").innerText = "Processing file...";

    const reader = new FileReader();
    reader.onload = async function (event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            // Step 1: Parse Loans Summary sheet
            const summarySheet = workbook.Sheets["Loans"];
            const summaryData = XLSX.utils.sheet_to_json(summarySheet);

            // Step 2: For each loan, get its payment sheet and reconstruct the object
            const importedLoans = [];

            for (const row of summaryData) {
                const loanName = Object.keys(workbook.Sheets).find(sheet =>
                    sheet.endsWith(row.Name)
                );

                if (!loanName) continue;

                const paymentSheet = workbook.Sheets[loanName];
                const paymentData = XLSX.utils.sheet_to_json(paymentSheet);

                const loan = {
                    id: parseInt(row.ID),
                    name: row.Name,
                    amount: parseFloat(row.Amount.replace(/[^\d.-]/g, "")),
                    rate: parseFloat(row["Rate (%)"]),
                    tenure: parseInt(row["Tenure (Months)"]),
                    startDate: row["Start Date"],
                    emi: parseFloat(row["Monthly EMI"].replace(/[^\d.-]/g, "")),
                    remainingBalance: parseFloat(row["Remaining Balance"].replace(/[^\d.-]/g, "")),
                    payments: paymentData.map(p => ({
                        amount: parseFloat(p.Amount.replace(/[^\d.-]/g, "")),
                        date: p["Payment Date"],
                        note: p.Note || "",
                        timestamp: p.Timestamp,
                        interest: parseFloat(p.Interest.replace(/[^\d.-]/g, "")),
                        principal: parseFloat(p.Principal.replace(/[^\d.-]/g, "")),
                    }))
                };

                importedLoans.push(loan);
            }

            // Step 3: Save all loans to IndexedDB
            await bulkAddLoans(importedLoans);

            document.getElementById("importStatus").innerText = `✅ Successfully imported ${importedLoans.length} loans.`;
        } catch (err) {
            console.error("Import error:", err);
            document.getElementById("importStatus").innerText = "❌ Error importing file.";
        }
    };

    reader.readAsArrayBuffer(file);
}
async function GetDebts() {
  try {
    loans = await getAlldebts();
    renderLoans();
    updateStats();
  } catch (error) {
    console.error("Error fetching debts:", error);
    loans = [];
  }
}
function calculateEMI() {
  const amount = parseFloat(document.getElementById("calcAmount").value);
  const rate = parseFloat(document.getElementById("calcRate").value);
  const tenure = parseFloat(document.getElementById("calcTenure").value);

  if (!amount || !rate || !tenure) {
    alert("Please fill all fields");
    return;
  }

  const monthlyRate = rate / (12 * 100);
  const months = tenure * 12;
  const emi =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  document.getElementById("emiAmount").textContent = `₹${Math.round(
    emi
  ).toLocaleString()}`;
  document.getElementById("emiResult").style.display = "block";
}

function calculateLoanEMI(amount, rate, tenure) {
  const monthlyRate = rate / (12 * 100);
  const months = tenure * 12;
  return (
    (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

function formatCurrency(amount) {
  if (isNaN(amount) || amount < 0) {
    return 0;
  }
  return `₹${Math.round(amount).toLocaleString()}`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN");
}

async function addLoan(event) {
  event.preventDefault();

  const name = document.getElementById("loanName").value;
  const amount = parseFloat(document.getElementById("loanAmount").value);
  const rate = parseFloat(document.getElementById("interestRate").value);
  const tenure = parseFloat(document.getElementById("tenure").value);
  const startDate = document.getElementById("startDate").value;

  const emi = calculateLoanEMI(amount, rate, tenure);

  const loan = {
    name,
    amount,
    rate,
    tenure,
    startDate,
    emi,
    payments: [],
    remainingBalance: amount,
  };
  var loanid = await addData(loan);
  loan.id = loanid;
  console.log("Loan added with ID:", loanid);
  loans.push(loan);

  document.getElementById("loanForm").reset();
  renderLoans();

  showAlert("Loan added successfully!", "success");
}

function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alertContainer");
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 3000);
}

function renderLoans() {
  const container = document.getElementById("loansContainer");

  if (loans.length === 0) {
    container.innerHTML = `
                    <div class="empty-state">
                        <div style="font-size: 3em; margin-bottom: 20px;">🏦</div>
                        <h3>No loans added yet</h3>
                        <p>Add your first loan using the form above to start tracking your EMI payments</p>
                    </div>
                `;
    return;
  }

  container.innerHTML = loans
    .map((loan) => {
      const totalPaid = loan.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const remaining = Math.max(0, loan.amount - totalPaid);
      const progress = ((loan.amount - remaining) / loan.amount) * 100;
      const isCompleted = remaining <= 0;

      const nextPaymentDate = getNextPaymentDate(loan);
      const isOverdue =
        nextPaymentDate && new Date(nextPaymentDate) < new Date();

      return `
            <div class="loan-card">
            <div class="loan-header">
                <div class="loan-title">${loan.name}</div>
                <span class="loan-status ${
                  isCompleted ? "status-completed" : "status-active"
                }">
                ${isCompleted ? "Completed" : "Active"}
                </span>
            </div>
            
            <div class="loan-details">
                <div class="detail-item">
                <div class="detail-value">${formatCurrency(loan.amount)}</div>
                <div class="detail-label">Principal</div>
                </div>
                <div class="detail-item">
                <div class="detail-value">${formatCurrency(loan.emi)}</div>
                <div class="detail-label">Monthly EMI</div>
                </div>
                <div class="detail-item">
                <div class="detail-value">${formatCurrency(remaining)}</div>
                <div class="detail-label">Remaining</div>
                </div>
                <div class="detail-item">
                <div class="detail-value">${loan.rate}%</div>
                <div class="detail-label">Interest Rate</div>
                </div>
                <div class="detail-item">
                <div class="detail-value">${loan.payments.length}</div>
                <div class="detail-label">Payments Made</div>
                </div>
                <div class="detail-item">
                <div class="detail-value">${formatDate(loan.startDate)}</div>
                <div class="detail-label">Start Date</div>
                </div>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            
            <div style="text-align: center; margin: 10px 0; font-size: 0.9em; color: #666;">
                ${Math.round(progress)}% paid off
            </div>
            
            ${
              isOverdue
                ? '<div class="alert alert-warning">Payment overdue!</div>'
                : ""
            }
            
            <div class="payment-actions">
                ${
                  !isCompleted
                    ? `<button class="btn" onclick="openPaymentModal(${loan.id})">💳 Make Payment</button>`
                    : ""
                }
                <button class="btn btn-secondary" onclick="window.location.href='paymenthistory.html?loanid=${
                  loan.id
                }'">📊 View History</button>
                <button class="btn btn-danger" onclick="deleteLoan(${
                  loan.id
                })">🗑️ Delete</button>
            </div>
            </div>
            `;
    })
    .join("");
  updateStats();
}
function exportToExcel() {
  const wb = XLSX.utils.book_new();

  // --- Overview Sheet ---
  const overviewData = [
    ["📘 This file contains your loan data."],
    ["📌 You can edit values in the 'Loans' sheet."],
    ["⚠️ Do NOT edit formulas in individual loan sheets."],
  ];
  const overviewWS = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, overviewWS, "Overview");

  // --- Loans Summary Sheet ---
  const summaryData = [
    [
      "ID",
      "Name",
      "Amount",
      "Rate (%)",
      "Tenure (Months)",
      "Start Date",
      "Monthly EMI",
      "Remaining Balance",
    ],
  ];

  loans.forEach((loan) => {
    summaryData.push([
      loan.id,
      loan.name,
      formatCurrency(loan.amount),
      loan.rate,
      loan.tenure,
      formatDate(loan.startDate),
      formatCurrency(loan.emi),
      formatCurrency(loan.remainingBalance),
    ]);
  });

  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWS, "Loans");

  // --- Individual Sheets for Each Loan ---
  loans.forEach((loan, index) => {
    const paymentRows = loan.payments.map((payment, i) => ({
      "S.No": i + 1,
      "Payment Date": formatDate(payment.date),
      Amount: formatCurrency(payment.amount),
      Principal: formatCurrency(payment.principal),
      Interest: formatCurrency(payment.interest),
      Note: payment.note || "",
      Timestamp: payment.timestamp,
    }));

    const ws = XLSX.utils.json_to_sheet(paymentRows);
    ws["!autofilter"] = { ref: "A1:F1" };

    const sheetName = `${index + 1}. ${loan.name}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  // --- Export File ---
  XLSX.writeFile(wb, `All_Loans_Details.xlsx`);
}
function getNextPaymentDate(loan) {
  if (loan.payments.length === 0) {
    const startDate = new Date(loan.startDate);
    return new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate()
    )
      .toISOString()
      .split("T")[0];
  }

  const lastPayment = loan.payments.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];
  const lastDate = new Date(lastPayment.date);
  return new Date(
    lastDate.getFullYear(),
    lastDate.getMonth() + 1,
    lastDate.getDate()
  )
    .toISOString()
    .split("T")[0];
}

function updateStats() {
  console.log("Updating stats...");
  const activeLoans = loans.filter((loan) => {
    const totalPaid = loan.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    return totalPaid < loan.amount;
  });

  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalPaid = loans.reduce(
    (sum, loan) =>
      sum +
      loan.payments.reduce((paidSum, payment) => paidSum + payment.amount, 0),
    0
  );
  const totalRemaining = Math.max(0, totalPrincipal - totalPaid);
  const monthlyEMI = activeLoans.reduce((sum, loan) => sum + loan.emi, 0);
  console.log("Active loans:", activeLoans);
  console.log("Total principal:", totalPrincipal);
  console.log("Total remaining:", totalRemaining);
  console.log("Monthly EMI:", monthlyEMI);
  document.getElementById("totalLoans").textContent = activeLoans.length;
  document.getElementById("totalPrincipal").textContent =
    formatCurrency(totalPrincipal);
  document.getElementById("totalRemaining").textContent =
    formatCurrency(totalRemaining);
  document.getElementById("monthlyEMI").textContent =
    formatCurrency(monthlyEMI);
}

function openPaymentModal(loanId) {
  const loan = loans.find((l) => l.id === loanId);
  document.getElementById("paymentLoanId").value = loanId;
  document.getElementById("paymentAmount").value = Math.round(loan.emi);
  document.getElementById("paymentDate").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("paymentModal").style.display = "block";
}
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function insertPaymentSorted(payments, payment) {
  if (payments.length === 0) {
    payments.push(payment);
    return;
  }
  let left = 0,
    right = payments.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (new Date(payment.date) < new Date(payments[mid].date)) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  payments.splice(left, 0, payment);
}
async function recordPayment(event) {
  event.preventDefault();

  const loanId = parseInt(document.getElementById("paymentLoanId").value);
  const amount = parseFloat(document.getElementById("paymentAmount").value);
  const date = document.getElementById("paymentDate").value;
  const note = document.getElementById("paymentNote").value;

  const loan = loans.find((l) => l.id === loanId);

  // Use the loan's remainingBalance property for calculations
  let lastPaymentDate = loan.startDate;
  if (loan.payments.length > 0) {
    let sortedPayments = loan.payments.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    // Payments are  sorted by date ascending
    console.log("Sorted payments:", sortedPayments);
    lastPaymentDate = sortedPayments[loan.payments.length - 1].date;
  }

  // Calculate days since last payment (accurate daily interest)
  let daysSinceLast =
    (new Date(date) - new Date(lastPaymentDate)) / (1000 * 60 * 60 * 24);
  let annualRate = loan.rate / 100;
  let dailyRate = annualRate / 365;
  let interest = loan.remainingBalance * dailyRate * daysSinceLast;
  let principal = amount - interest;
  if (principal < 0) principal = 0;

  // Update remaining balance
  loan.remainingBalance = Math.max(0, loan.remainingBalance - principal);

  // Insert payment in sorted order
  loan.payments.push({
    amount,
    date,
    note,
    timestamp: new Date().toISOString(),
    interest,
    principal,
  });

  await updateData(loan.id, loan);
  renderLoans();

  document.getElementById("paymentModal").style.display = "none";
  document.getElementById("paymentForm").reset();

  showAlert("Payment recorded successfully!", "success");
}
// Global efficient sort function for payments (by date ascending)
// Usage: sortPaymentsByDate(payments)
function sortPaymentsByDate(payments) {
  payments.sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function deleteLoan(loanId) {
  if (
    confirm(
      "Are you sure you want to delete this loan? This action cannot be undone."
    )
  ) {
    loans = loans.filter((l) => l.id !== loanId);
    await deleteData(loanId);
    renderLoans();
    showAlert("Loan deleted successfully!", "success");
  }
}

// Event listeners
document.getElementById("loanForm").addEventListener("submit", addLoan);
document
  .getElementById("paymentForm")
  .addEventListener("submit", recordPayment);

// Modal controls
document.querySelectorAll(".close").forEach((closeBtn) => {
  closeBtn.addEventListener("click", function () {
    this.closest(".modal").style.display = "none";
  });
});

window.addEventListener("click", function (event) {
  if (event.target.classList.contains("modal")) {
    event.target.style.display = "none";
  }
});

// Set default start date to today
document.getElementById("startDate").value = new Date()
  .toISOString()
  .split("T")[0];

// Initialize dashboard
renderLoans();

function getTotalInterestPaid(loan) {
  // Calculate total interest paid so far
  let balance = loan.amount;
  let totalInterest = 0;
  let monthlyRate = loan.rate / (12 * 100);
  loan.payments
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(() => {
      let interest = balance * monthlyRate;
      totalInterest += interest;
      let principal = loan.emi - interest;
      balance -= principal;
    });
  return totalInterest;
}

function getTotalPrincipalPaid(loan) {
  // Calculate total principal paid so far
  let totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
  let totalInterest = getTotalInterestPaid(loan);
  return totalPaid - totalInterest;
}

function getCurrentPaymentBreakdown(loan) {
  if (!loan.payments.length) return { interest: 0, principal: 0 };
  let balance = loan.amount;
  let monthlyRate = loan.rate / (12 * 100);
  // Sort payments by date ascending
  const sortedPayments = loan.payments
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  let interest = 0,
    principal = 0;
  for (let i = 0; i < sortedPayments.length; i++) {
    let thisInterest = balance * monthlyRate;
    let thisPrincipal = sortedPayments[i].amount - thisInterest;
    if (i === sortedPayments.length - 1) {
      interest = thisInterest;
      principal = thisPrincipal;
    }
    balance -= thisPrincipal;
  }
  return { interest, principal };
}
