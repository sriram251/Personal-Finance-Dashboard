let loans =   [];
GetDebts();
function saveData() {
  localStorage.setItem("loans", JSON.stringify(loans));
  localStorage.setItem("nextId", nextId.toString());
}

async function GetDebts(){
    try {
        loans =  await getAlldebts();
        renderLoans();
        updateStats();
    }
    catch (error) {
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
    id: nextId++,
    name,
    amount,
    rate,
    tenure,
    startDate,
    emi,
    payments: [],
    remainingBalance: amount,
  };
  var loanid  = await addData(loan);
  loans.push(loan);
  saveData();

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
                                <div class="detail-value">${formatCurrency(
                                  loan.amount
                                )}</div>
                                <div class="detail-label">Principal</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-value">${formatCurrency(
                                  loan.emi
                                )}</div>
                                <div class="detail-label">Monthly EMI</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-value">${formatCurrency(
                                  remaining
                                )}</div>
                                <div class="detail-label">Remaining</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-value">${loan.rate}%</div>
                                <div class="detail-label">Interest Rate</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-value">${
                                  loan.payments.length
                                }</div>
                                <div class="detail-label">Payments Made</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-value">${formatDate(
                                  loan.startDate
                                )}</div>
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
                            <button class="btn btn-secondary" onclick="openHistoryModal(${
                              loan.id
                            })">📊 View History</button>
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

function openHistoryModal(loanId) {
  const loan = loans.find((l) => l.id === loanId);
  const container = document.getElementById("paymentHistoryContainer");

  if (loan.payments.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><p>No payments recorded yet</p></div>';
  } else {
    container.innerHTML = loan.payments
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(
        (payment) => `
                        <div class="payment-item">
                            <div>
                                <div style="font-weight: 600;">${formatCurrency(
                                  payment.amount
                                )}</div>
                                <div style="font-size: 0.9em; color: #666;">${
                                  payment.note || "EMI Payment"
                                }</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.9em; color: #666;">${formatDate(
                                  payment.date
                                )}</div>
                            </div>
                        </div>
                    `
      )
      .join("");
  }

  document.getElementById("historyModal").style.display = "block";
}

async function recordPayment(event) {
  event.preventDefault();

  const loanId = parseInt(document.getElementById("paymentLoanId").value);
  const amount = parseFloat(document.getElementById("paymentAmount").value);
  const date = document.getElementById("paymentDate").value;
  const note = document.getElementById("paymentNote").value;

  const loan = loans.find((l) => l.id === loanId);
  loan.payments.push({
    amount,
    date,
    note,
    timestamp: new Date().toISOString(),
  });

  await updateData(loan.id, loan);
  renderLoans();

  document.getElementById("paymentModal").style.display = "none";
  document.getElementById("paymentForm").reset();

  showAlert("Payment recorded successfully!", "success");
}

async function deleteLoan(loanId) {
  if (
    confirm(
      "Are you sure you want to delete this loan? This action cannot be undone."
    )
  ) {
    loans = loans.filter((l) => l.id === loanId);
    await deleteData(id);
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
