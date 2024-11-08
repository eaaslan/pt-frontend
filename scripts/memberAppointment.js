// memberAppointment.js
const apiUrl = "http://localhost:8080/appointments";
const checkIn = "/check-in";
const URLParams = new URLSearchParams(window.location.search);
const appointmentId = URLParams.get("appointmentId");
const memberId = URLParams.get("memberId");

if (!appointmentId) {
  showError("No appointment ID provided");
} else {
  fetch(`${apiUrl}/${appointmentId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then((appointment) => {
      const dateElement = document.querySelector(".date");
      const timeElement = document.querySelector(".time");
      const statusElement = document.querySelector(".status");
      const checkInElement = document.querySelector(".checkInElement");

      const appointmentDateTime = new Date(appointment.appointmentTime);

      dateElement.textContent = `Date: ${appointmentDateTime.toLocaleDateString()}`;
      timeElement.textContent = `Time: ${appointmentDateTime.toLocaleTimeString()}`;
      statusElement.textContent = `Status: ${appointment.status}`;

      if (appointment.status === "SCHEDULED") {
        checkInElement.innerHTML = `
          <button class="check-in-button">
              Check In
          </button>
          <input type="time" 
           id="checkInTime" 
           value="12:00" 
           class="time-input" 
           style="margin-top: 10px; padding: 5px; width: 100%;">

        `;

        const checkInButton = document.querySelector(".check-in-button");
        const checkInTime = document.querySelector("#checkInTime");

        checkInButton.addEventListener("click", () => {
          const appointmentDate = new Date(appointment.appointmentTime)
            .toISOString()
            .split("T")[0];

          const dateTime = `${appointmentDate}T${checkInTime.value}:00`;

          handleCheckIn(memberId, dateTime);
          console.log("Check-in attempt:", { memberId, dateTime });
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showError("Error loading appointment details");
    });
}

function handleCheckIn(memberId, checkInTime) {
  fetch(`${apiUrl}/check-in/${memberId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      checkInTime: checkInTime,
    }), // Send the ISO string directly
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.error || "Check-in failed");
        });
      }
      return response.json();
    })
    .then((data) => {
      alert("Check-in successful!");
      location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(error.message || "Failed to check in. Please try again.");
    });
}

function showError(message) {
  const container = document.querySelector(".container");
  container.innerHTML = `<div class="error-message">${message}</div>`;
}
