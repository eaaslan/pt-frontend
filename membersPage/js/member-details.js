document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:8080/members";
  const urlParams = new URLSearchParams(window.location.search);
  const memberId = urlParams.get("id");

  const memberDetails = document.querySelector("#memberDetails");

  if (!memberId) {
    showError("No member ID provided");
    return;
  }

  fetch(`${apiUrl}/${memberId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then((member) => {
      memberDetails.innerHTML = `
              <div class="member-header">
                  <div class="member-name">${member.name}</div>
                  <div class="member-email">${member.email}</div>
              </div>
              
              <div class="package-info">
                  <div class="package-title">Package Information</div>
                  ${
                    member.activePackage
                      ? `
                      <div>Total Sessions: ${
                        member.activePackage.totalSessions
                      }</div>
                      <div>Used Sessions: ${
                        member.activePackage.usedSessions || 0
                      }</div>
                      <div>Remaining Sessions: ${
                        member.activePackage.remainingSessions ||
                        member.activePackage.totalSessions
                      }</div>
                      <div>Status: ${member.activePackage.status}</div>
                      `
                      : "No active package"
                  }
              </div>

              <div class="appointments-section">
                  <div class="appointments-title">Appointments</div>
                  ${
                    member.appointments && member.appointments.length > 0
                      ? `
                      <ul class="appointment-list">
                          ${member.appointments
                            .map(
                              (appointment) => `
                              <li class="appointment-item" data-appointment-id="${
                                appointment.id
                              }">
                                  <div>Date: ${new Date(
                                    appointment.appointmentTime
                                  ).toLocaleDateString()}</div>
                                  <div>Time: ${new Date(
                                    appointment.appointmentTime
                                  ).toLocaleTimeString()}</div>
                                  <div>Status: ${appointment.status}</div>
                              </li>
                          `
                            )
                            .join("")}
                      </ul>
                      `
                      : "<div>No appointments found</div>"
                  }
              </div>
          `;

      const list = document.querySelector(".appointment-list");
      if (list) {
        list.addEventListener("click", (event) => {
          const appointmentItem = event.target.closest(".appointment-item");
          if (appointmentItem) {
            const appointmentId = appointmentItem.dataset.appointmentId;
            window.location.href = `member-appointments.html?appointmentId=${appointmentId}&memberId=${memberId}`;
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showError("Error loading member details");
    });
});

function showError(message) {
  const memberDetails = document.querySelector("#memberDetails");
  memberDetails.innerHTML = `
      <div class="error-message">
          ${message}
      </div>
  `;
}
