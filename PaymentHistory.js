let forecastChart;
function renderPaymentsTable(breakdowns) {
  const container = document.getElementById("paymentsContainer");

  if (breakdowns.length === 0) {
    container.innerHTML = `
                    <div class="no-payments">
                        <div class="no-payments-icon">📊</div>
                        <h3>No payments recorded yet</h3>
                        <p>Start tracking your EMI payments to see beautiful analytics</p>
                    </div>
                `;
    document.getElementById("paymentCount").textContent = "0 Payments";
    return;
  }

  const tableHTML = `
                <div class="table-responsive">
                    <table class="table table-hover table-custom mb-0">
                        <thead>
                            <tr>
                                <th scope="col" class="border-0">
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-currency-rupee me-2"></i>Payment Details
                                    </div>
                                </th>
                                <th scope="col" class="border-0 text-center">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <i class="bi bi-graph-up me-2 text-success"></i>Principal
                                    </div>
                                </th>
                                <th scope="col" class="border-0 text-center">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <i class="bi bi-graph-down me-2 text-danger"></i>Interest
                                    </div>
                                </th>
                                <th scope="col" class="border-0 text-center">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <i class="bi bi-calendar3 me-2"></i>Date
                                    </div>
                                </th>
                                <th scope="col" class="border-0 text-center">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <i class="bi bi-clock me-2"></i>Timestamp
                                    </div>
                                </th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            ${breakdowns
                              .slice()
                              .reverse()
                              .map(
                                (payment, index) => `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                                <i class="bi bi-wallet2 text-primary"></i>
                                            </div>
                                            <div>
                                                <div class="fw-bold fs-5">${formatCurrency(
                                                  payment.amount
                                                )}</div>
                                                <small class="text-muted">
                                                    <i class="bi bi-tag me-1"></i>${
                                                      payment.note ||
                                                      "EMI Payment"
                                                    }
                                                </small>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <span class="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2">
                                            ${formatCurrency(payment.principal)}
                                        </span>
                                    </td>
                                    <td class="text-center">
                                        <span class="badge bg-danger bg-opacity-10 text-danger fs-6 px-3 py-2">
                                            ${formatCurrency(payment.interest)}
                                        </span>
                                    </td>
                                    <td class="text-center">
                                        <div class="d-flex flex-column align-items-center">
                                            <span class="fw-semibold">${formatDate(
                                              payment.date
                                            )}</span>
                                            <small class="text-muted">Payment #${
                                              breakdowns.length - index
                                            }</small>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <div class="d-flex flex-column align-items-center">
                                            <span class="fw-semibold small">${formatTimestamp(
                                              payment.timestamp
                                            )}</span>
                                            <small class="text-muted">Recorded</small>
                                        </div>
                                    </td>
                                   
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
                
                <!-- Payment Summary Footer -->
                <div class="payment-summary-footer">
                    <div class="row text-center">
                        <div class="col-md-3 col-6 mb-3 mb-md-0">
                            <div class="d-flex align-items-center justify-content-center">
                                <i class="bi bi-collection me-2 text-primary"></i>
                                <div>
                                    <div class="fw-bold fs-5">${
                                      breakdowns.length
                                    }</div>
                                    <small class="text-muted">Total Payments</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-3 mb-md-0">
                            <div class="d-flex align-items-center justify-content-center">
                                <i class="bi bi-currency-rupee me-2 text-success"></i>
                                <div>
                                    <div class="fw-bold fs-5 text-success">${formatCurrency(
                                      breakdowns.reduce(
                                        (sum, p) =>
                                          sum +
                                          (isNaN(p.principal) || p.principal < 0
                                            ? 0
                                            : p.principal),
                                        0
                                      )
                                    )}</div>
                                    <small class="text-muted">Total Principal</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-6">
                            <div class="d-flex align-items-center justify-content-center">
                                <i class="bi bi-currency-rupee me-2 text-danger"></i>
                                <div>
                                    <div class="fw-bold fs-5 text-danger">${formatCurrency(
                                      breakdowns.reduce(
                                        (sum, p) =>
                                          sum +
                                          (isNaN(p.interest) || p.interest < 0
                                            ? 0
                                            : p.interest),
                                        0
                                      )
                                    )}</div>
                                    <small class="text-muted">Total Interest</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-6">
                            <div class="d-flex align-items-center justify-content-center">
                                <i class="bi bi-calendar-check me-2 text-info"></i>
                                <div>
                                    <div class="fw-bold fs-6 text-info">${formatDate(
                                      breakdowns[breakdowns.length - 1]?.date ||
                                        new Date()
                                    )}</div>
                                    <small class="text-muted">Latest Payment</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

  container.innerHTML = tableHTML;
  document.getElementById(
    "paymentCount"
  ).textContent = `${breakdowns.length} Payments`;
}
function GetHistory(loanId) {
    const container = document.getElementById("paymentHistoryContainer");

    getDataById(loanId).then((loan) => {
        console.log("Loan data retrieved:", loan);
        if (loan && loan.payments) {
            console.log("Payments data retrieved:", loan.payments);
            updateComponents(loan.payments);
        } else {
            updateComponents([]);
        }
        
    }).catch((e) => {
        console.error("Error retrieving loan data:", e);
        updateComponents([]);
        
    });
}

function renderPaymentsTable(breakdowns) {
  const container = document.getElementById("paymentsContainer");

  if (breakdowns.length === 0) {
    container.innerHTML = `
                    <div class="no-payments">
                        <div class="no-payments-icon">📊</div>
                        <h3>No payments recorded yet</h3>
                        <p>Start tracking your EMI payments to see beautiful analytics</p>
                    </div>
                `;
    document.getElementById("paymentCount").textContent = "0 Payments";
    return;
  }

  const tableHTML = `
                <div class="table-responsive">
                    <table class="table table-hover table-custom mb-0">
                        <thead>
                            <tr>
                                <th scope="col" class="border-0">
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-currency-rupee me-2"></i>Payment Details
                                    </div>
                                </th>
                                <th scope="col" class="border-0 text-center">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <i class="bi bi-graph-up me-2 text-success"></i>Principal
                                    </div>
                                </th>
                                <th scope="col" class="border-0 text-center">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <i class="bi bi-graph-down me-2 text-danger"></i>Interest
                                    </div>
                                </th>
                                <th scope="col" class="border-0 text-center">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <i class="bi bi-calendar3 me-2"></i>Date
                                    </div>
                                </th>
                                <th scope="col" class="border-0 text-center">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <i class="bi bi-clock me-2"></i>Timestamp
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${breakdowns
                              .slice()
                              .reverse()
                              .map(
                                (payment, index) => `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                                <i class="bi bi-wallet2 text-primary"></i>
                                            </div>
                                            <div>
                                                <div class="fw-bold fs-5">${formatCurrency(
                                                  payment.amount
                                                )}</div>
                                                <small class="text-muted">
                                                    <i class="bi bi-tag me-1"></i>${
                                                      payment.note ||
                                                      "EMI Payment"
                                                    }
                                                </small>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <span class="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2">
                                            ${formatCurrency(payment.principal)}
                                        </span>
                                    </td>
                                    <td class="text-center">
                                        <span class="badge bg-danger bg-opacity-10 text-danger fs-6 px-3 py-2">
                                            ${formatCurrency(payment.interest)}
                                        </span>
                                    </td>
                                    <td class="text-center">
                                        <div class="d-flex flex-column align-items-center">
                                            <span class="fw-semibold">${formatDate(
                                              payment.date
                                            )}</span>
                                            <small class="text-muted">Payment #${
                                              breakdowns.length - index
                                            }</small>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <div class="d-flex flex-column align-items-center">
                                            <span class="fw-semibold small">${formatTimestamp(
                                              payment.timestamp
                                            )}</span>
                                            <small class="text-muted">Recorded</small>
                                        </div>
                                    </td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
                
                <!-- Payment Summary Footer -->
                <div class="payment-summary-footer">
                    <div class="row text-center">
                        <div class="col-md-3 col-6 mb-3 mb-md-0">
                            <div class="d-flex align-items-center justify-content-center">
                                <i class="bi bi-collection me-2 text-primary"></i>
                                <div>
                                    <div class="fw-bold fs-5">${
                                      breakdowns.length
                                    }</div>
                                    <small class="text-muted">Total Payments</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-3 mb-md-0">
                            <div class="d-flex align-items-center justify-content-center">
                                <i class="bi bi-currency-rupee me-2 text-success"></i>
                                <div>
                                    <div class="fw-bold fs-5 text-success">${formatCurrency(
                                      breakdowns.reduce(
                                        (sum, p) => sum + p.principal,
                                        0
                                      )
                                    )}</div>
                                    <small class="text-muted">Total Principal</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-6">
                            <div class="d-flex align-items-center justify-content-center">
                                <i class="bi bi-currency-rupee me-2 text-danger"></i>
                                <div>
                                    <div class="fw-bold fs-5 text-danger">${formatCurrency(
                                      breakdowns.reduce(
                                        (sum, p) => sum + p.interest,
                                        0
                                      )
                                    )}</div>
                                    <small class="text-muted">Total Interest</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-6">
                            <div class="d-flex align-items-center justify-content-center">
                                <i class="bi bi-calendar-check me-2 text-info"></i>
                                <div>
                                    <div class="fw-bold fs-6 text-info">${formatDate(
                                      breakdowns[breakdowns.length - 1]?.date ||
                                        new Date()
                                    )}</div>
                                    <small class="text-muted">Latest Payment</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

  container.innerHTML = tableHTML;
  document.getElementById(
    "paymentCount"
  ).textContent = `${breakdowns.length} Payments`;
}

function createForecastChart(breakdowns) {
  const ctx = document.getElementById("forecastChart").getContext("2d");

  if (forecastChart) {
    forecastChart.destroy();
  }

  if (breakdowns.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "16px Inter";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.fillText(
      "No payment data to display",
      ctx.canvas.width / 2,
      ctx.canvas.height / 2
    );
    return;
  }

  const labels = breakdowns.map((_, index) => `Payment ${index + 1}`);
  const principalData = breakdowns.map((payment) => payment.principal);
  const interestData = breakdowns.map((payment) => payment.interest);

  forecastChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Principal",
          data: principalData,
          backgroundColor: "rgba(5, 150, 105, 0.1)",
          borderColor: "rgba(5, 150, 105, 1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "rgba(5, 150, 105, 1)",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: "Interest",
          data: interestData,
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          borderColor: "rgba(220, 38, 38, 1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "rgba(220, 38, 38, 1)",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 13,
              weight: "600",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "rgba(102, 126, 234, 0.5)",
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${formatCurrency(
                context.parsed.y
              )}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#64748b",
            font: {
              size: 12,
              weight: "500",
            },
          },
        },
        y: {
          grid: {
            color: "rgba(148, 163, 184, 0.1)",
          },
          ticks: {
            color: "#64748b",
            font: {
              size: 12,
              weight: "500",
            },
            callback: function (value) {
              return formatCurrency(value);
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });
}

function updateComponents(breakdowns) {
  renderPaymentsTable(breakdowns);
  createForecastChart(breakdowns);
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
function isValidId(id) {
    const num = Number(id);
    return !isNaN(num) && num > 0 && isFinite(num);
}
function init() {
    const params = new URLSearchParams(window.location.search);
    let loanId = params.get("loanid");
    if (!isValidId(loanId)) {
        throw new Error("Invalid ID provided");
    }

    loanId = Number(loanId);
    console.log(loanId);
    if (loanId) {
        GetHistory(loanId);
    }
}

document.addEventListener("DOMContentLoaded", init);