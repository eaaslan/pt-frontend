// /src/pages/admin/schedule/pt-schedule.js

import { Navbar } from "../common/Navbar.js";
import { ROUTES } from "../../config/routes.js";

class PTScheduleHandler {
  constructor() {
    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);
    this.appointments = [];
    this.members = [];
    this.selectedMember = null;
    this.selectedSlot = null;
    this.init();
  }
  async init() {
    try {
      new Navbar("navbarContainer");
      await this.initializeElements();
      this.initializeEventListeners();
      await this.loadMembers();
      await this.loadSchedule();
    } catch (error) {
      console.error("Schedule initialization error:", error);
      this.handleError(error);
    }
  }
  async loadMembers() {
    try {
      const authHeader = this.getAuthHeader();
      console.log("Using auth header:", authHeader); // Debug log

      const response = await fetch(`${ROUTES.API.BASE_URL}/api/users`, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load members: ${response.status}`);
      }

      const data = await response.json();
      console.log("Members data:", data); // Debug log

      // Handle different response structures
      this.members = data.members || data.users || data || [];
      this.renderMemberSelect();
    } catch (error) {
      console.error("Failed to load members:", error);
      this.handleError(error);
    }
  }
  initializeElements() {
    // Get all required DOM elements
    this.weekDaysContainer = document.getElementById("weekDays");
    this.timeSlotsContainer = document.getElementById("timeSlots");
    this.currentWeekElement = document.getElementById("currentWeek");
    this.modal = document.getElementById("bookingModal");
    this.bookingDetails = document.getElementById("bookingDetails");
    this.errorContainer = document.getElementById("errorContainer");
    this.memberSelectContainer = document.getElementById(
      "memberSelectContainer"
    );
    this.memberSelect = document.getElementById("memberSelect");

    if (!this.memberSelectContainer || !this.memberSelect) {
      console.error("Member select elements not found");
      return;
    }

    // Show member select for PT role
    this.memberSelectContainer.classList.remove("hidden");

    // Initialize the current week display
    this.updateCurrentWeekDisplay();
  }

  initializeEventListeners() {
    // Week navigation
    const prevWeek = document.getElementById("prevWeek");
    const nextWeek = document.getElementById("nextWeek");
    if (prevWeek)
      prevWeek.addEventListener("click", () => this.navigateWeek(-1));
    if (nextWeek)
      nextWeek.addEventListener("click", () => this.navigateWeek(1));

    // Modal controls
    const closeModal = document.getElementById("closeModal");
    const cancelBooking = document.getElementById("cancelBooking");
    const confirmBooking = document.getElementById("confirmBooking");

    if (closeModal)
      closeModal.addEventListener("click", () => this.closeModal());
    if (cancelBooking)
      cancelBooking.addEventListener("click", () => this.closeModal());
    if (confirmBooking)
      confirmBooking.addEventListener("click", () => this.confirmBooking());

    // Member select
    if (this.memberSelect) {
      this.memberSelect.addEventListener("change", (e) => {
        this.selectedMember = e.target.value;
      });
    }
  }

  renderMemberSelect() {
    this.memberSelect.innerHTML = `
      <option value="">Select a member</option>
      ${this.members
        .map(
          (member) => `
        <option value="${member.id}">${member.name}</option>
      `
        )
        .join("")}
    `;
  }

  async loadSchedule() {
    try {
      const appointmentsData = await this.fetchAppointments();
      console.log(appointmentsData);
      this.appointments = appointmentsData || [];
      const scheduleData = this.processAppointmentsData(appointmentsData);
      this.renderSchedule(scheduleData);
    } catch (error) {
      this.handleError(error);
    }
  }

  processAppointmentsData(appointmentsData) {
    const bookedSlots = new Set();
    const availableSlots = new Set();
    const startDate = new Date(this.currentDate);
    const workingHours = this.generateTimeSlots();

    // Generate all possible slots
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateStr = currentDate.toISOString().split("T")[0];

      workingHours.forEach((time) => {
        const slotDate = new Date(currentDate);
        const [hours, minutes] = time.split(":").map(Number);
        slotDate.setHours(hours, minutes);

        if (slotDate > new Date()) {
          availableSlots.add(`${dateStr}-${time}`);
        }
      });
    }

    // Process booked slots
    this.appointments.forEach((appointment) => {
      const date = new Date(appointment.appointmentTime);
      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const dateStr = date.toISOString().split("T")[0];
      const slotKey = `${dateStr}-${timeStr}`;

      availableSlots.delete(slotKey);
      bookedSlots.add(slotKey);
    });

    return {
      availableSlots: Array.from(availableSlots),
      bookedSlots: Array.from(bookedSlots),
    };
  }
  getAuthHeader() {
    const storedAuth = sessionStorage.getItem("basicAuth");
    // If the auth is already in "Basic xyz" format, use it directly
    if (storedAuth?.startsWith("Basic ")) {
      return storedAuth;
    }
    // Otherwise, add the "Basic " prefix
    return `Basic ${storedAuth}`;
  }
  renderSchedule(scheduleData) {
    this.renderWeekDays();
    this.renderTimeSlots(scheduleData);
  }

  renderMemberSelect() {
    if (!this.memberSelect) return;

    const options = this.members.map((member) => {
      const name = member.name || member.username || "Unknown Member";
      return `<option value="${member.id}">${name}</option>`;
    });

    this.memberSelect.innerHTML = `
      <option value="">Select a member</option>
      ${options.join("")}
    `;
  }

  renderWeekDays() {
    const days = ["Pzt", "Sali", "Crsb", "Prsb", "Cuma", "Cmrt", "Pzr"];
    const startDate = new Date(this.currentDate);

    this.weekDaysContainer.innerHTML = `
      <div class="day-column time-header"></div>
      ${Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        const isToday = this.isToday(date);
        const dayIndex = date.getDay();
        const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

        return `
          <div class="day-column ${isToday ? "today" : ""}">
            <div class="day-label">${days[adjustedDayIndex]}</div>
            <div class="date-label">${date.getDate()}</div>
          </div>
        `;
      }).join("")}
    `;
  }

  renderTimeSlots(scheduleData) {
    this.timeSlotsContainer.innerHTML = this.generateTimeSlots()
      .map((time) => {
        return `
        <div class="time-row">
          <div class="time-label">${time}</div>
          ${Array.from({ length: 7 }, (_, i) => {
            const date = new Date(this.currentDate);
            date.setDate(this.currentDate.getDate() + i);
            const slotKey = `${date.toISOString().split("T")[0]}-${time}`;

            const appointment = this.findAppointment(date, time);
            const isBooked = scheduleData.bookedSlots.includes(slotKey);
            const isAvailable = scheduleData.availableSlots.includes(slotKey);
            const isPast = this.isPastTime(date, time);

            let slotClass = "time-slot";
            if (isBooked) slotClass += " booked";
            else if (isAvailable) slotClass += " available";
            else slotClass += " unavailable";
            if (isPast) slotClass += " past";

            const slotContent = appointment
              ? `
              <div class="appointment-details">
                <div class="member-name">${appointment.memberName || ""}</div>
                <div class="status">${appointment.status || "Booked"}</div>
              </div>
            `
              : "";

            return `
              <div 
                class="${slotClass}"
                ${
                  !isBooked && !isPast
                    ? `onclick="window.ptScheduleHandler.openBookingModal('${date.toISOString()}', '${time}')"`
                    : ""
                }
                ${appointment ? `data-appointment-id="${appointment.id}"` : ""}
              >
                ${slotContent}
              </div>
            `;
          }).join("")}
        </div>
      `;
      })
      .join("");
  }

  generateTimeSlots() {
    const slots = [];
    for (let hour = 9; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  }

  openBookingModal(dateStr, time) {
    if (!this.selectedMember) {
      alert("Please select a member first");
      return;
    }

    const date = new Date(dateStr);
    const member = this.members.find((m) => m.id === this.selectedMember);

    this.selectedSlot = { date, time };
    this.bookingDetails.innerHTML = `
      Book session with ${member.name}<br>
      for ${date.toLocaleDateString()} at ${time}
    `;
    this.modal.classList.remove("hidden");
  }

  async confirmBooking() {
    if (!this.selectedSlot) {
      this.showError("Please select a time slot");
      return;
    }

    try {
      const appointmentTime = new Date(
        this.selectedSlot.date.toDateString() + " " + this.selectedSlot.time
      ).toISOString();

      // Show loading state
      const confirmButton = document.getElementById("confirmBooking");
      const originalText = confirmButton.textContent;
      confirmButton.disabled = true;
      confirmButton.textContent = "Booking...";

      const response = await fetch(`${ROUTES.API.BASE_URL}/api/appointments`, {
        method: "POST",
        headers: {
          Authorization: this.scheduleService.createAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Booking failed: ${response.status}`
        );
      }

      // Show success message
      this.showSuccess("Appointment booked successfully!");
      this.closeModal();
      await this.loadSchedule();
    } catch (error) {
      console.error("Booking error:", error);
      this.showError(error.message || "Failed to book appointment");
    } finally {
      // Reset button state
      const confirmButton = document.getElementById("confirmBooking");
      confirmButton.disabled = false;
      confirmButton.textContent = "Confirm";
    }
  }

  // Add these helper methods to your class if they don't exist:
  showError(message) {
    const errorContainer = document.getElementById("errorContainer");
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.classList.remove("hidden");
      setTimeout(() => {
        errorContainer.classList.add("hidden");
      }, 3000);
    }
  }

  showSuccess(message) {
    // Create a success message element if it doesn't exist
    let successContainer = document.getElementById("successContainer");
    if (!successContainer) {
      successContainer = document.createElement("div");
      successContainer.id = "successContainer";
      successContainer.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
      document.body.appendChild(successContainer);
    }

    successContainer.textContent = message;
    successContainer.classList.remove("hidden");
    setTimeout(() => {
      successContainer.classList.add("hidden");
    }, 3000);
  }

  // Utility methods
  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  isPastTime(date, time) {
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes);
    return slotDate < now;
  }

  findAppointment(date, time) {
    return this.appointments.find((apt) => {
      const aptDate = new Date(apt.appointmentTime);
      return (
        aptDate.toISOString().split("T")[0] ===
          date.toISOString().split("T")[0] &&
        aptDate.getHours() === parseInt(time.split(":")[0])
      );
    });
  }

  closeModal() {
    this.modal.classList.add("hidden");
    this.selectedSlot = null;
  }

  navigateWeek(direction) {
    this.currentDate.setDate(this.currentDate.getDate() + direction * 7);
    this.updateCurrentWeekDisplay();
    this.loadSchedule();
  }

  updateCurrentWeekDisplay() {
    const startOfWeek = new Date(this.currentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date) =>
      date.toLocaleDateString("tr-TR", { month: "short", day: "numeric" });

    this.currentWeekElement.textContent = `${formatDate(
      startOfWeek
    )} - ${formatDate(endOfWeek)}`;
  }

  showSuccess(message) {
    alert(message); // Replace with your preferred notification method
  }

  handleError(error) {
    console.error("Schedule error:", error);
    if (this.errorContainer) {
      this.errorContainer.textContent =
        "An error occurred. Please try again later.";
      this.errorContainer.style.display = "block";
      setTimeout(() => {
        this.errorContainer.style.display = "none";
      }, 3000);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.ptScheduleHandler = new PTScheduleHandler();
});
