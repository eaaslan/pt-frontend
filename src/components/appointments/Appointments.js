// components/Appointments.js
import { appointmentApi } from "../../services/api/appointmentApi.js";
import authApi from "../../services/api/authApi.js";
import { Utils } from "../../services/utils/common.js";

export class Appointments {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.render();
    this.loadAppointments();
  }

  render() {
    this.container.appendChild(
      Utils.createElementFromTemplate("appointments-template")
    );
  }

  async loadAppointments() {
    try {
      const user = authApi.getCurrentUser();
      const appointments = await appointmentApi.getUserAppointments(user.id);
      // this.displayAppointments(appointments);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      // Show error to user
    }
  }
  displayAppointments(appointments) {
    const listContainer = this.container.querySelector(".appointments-list");
    listContainer.innerHTML = "";

    appointments
      .sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime))
      .forEach((appointment) => {
        const element = this.createAppointmentElement(appointment);
        listContainer.appendChild(element);
      });
  }

  createAppointmentElement(appointment) {
    const div = document.createElement("div");
    div.className =
      "p-3 border rounded-lg flex justify-between items-center fade-in";

    const status = appointment.status.toLowerCase();
    const statusClass = CONFIG.STATUS_COLORS[status.toUpperCase()];

    div.innerHTML = `
          <div>
              <p class="font-medium">${Utils.formatDate(
                appointment.appointmentTime
              )}</p>
              <span class="status-badge ${statusClass}">${status}</span>
          </div>
          ${
            status === "scheduled"
              ? `
              <button class="cancel-btn text-red-600 text-sm hover:text-red-800">
                  Cancel
              </button>
          `
              : ""
          }
      `;

    if (status === "scheduled") {
      div
        .querySelector(".cancel-btn")
        .addEventListener("click", () =>
          this.handleCancellation(appointment.id)
        );
    }

    return div;
  }

  async handleCancellation(appointmentId) {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await AppointmentService.cancelAppointment(appointmentId);
      this.container.dispatchEvent(new CustomEvent("appointmentCancelled"));
      await this.loadAppointments();
    } catch (error) {
      console.error("Cancellation failed:", error);
    }
  }
}
