// /src/components/schedule/ScheduleHandler.js

import { ScheduleService } from "../../services/scheduleService.js";
import { Navbar } from "../common/Navbar.js";

export class ScheduleHandler {
  constructor() {
    this.scheduleService = new ScheduleService();
    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);
    this.selectedSlot = null;
    this.appointments = [];
    this.initializeNavbar();
    this.init();
  }

  initializeNavbar() {
    new Navbar("navbarContainer");
  }

  async init() {
    try {
      await this.initializeElements();
      this.initializeEventListeners();
      await this.loadSchedule();
    } catch (error) {
      console.error("Schedule initialization error:", error);
      this.handleError(error);
    }
  }

  async initializeElements() {
    this.weekDaysContainer = document.getElementById("weekDays");
    this.timeSlotsContainer = document.getElementById("timeSlots");
    this.currentWeekElement = document.getElementById("currentWeek");
    this.modal = document.getElementById("bookingModal");
    this.bookingDetails = document.getElementById("bookingDetails");
    this.errorContainer = document.getElementById("errorContainer");

    this.updateCurrentWeekDisplay();
  }

  initializeEventListeners() {
    document
      .getElementById("prevWeek")
      ?.addEventListener("click", () => this.navigateWeek(-1));
    document
      .getElementById("nextWeek")
      ?.addEventListener("click", () => this.navigateWeek(1));
    document
      .getElementById("closeModal")
      ?.addEventListener("click", () => this.closeModal());
    document
      .getElementById("cancelBooking")
      ?.addEventListener("click", () => this.closeModal());
    document
      .getElementById("confirmBooking")
      ?.addEventListener("click", () => this.confirmBooking());
  }

  updateCurrentWeekDisplay() {
    const startOfWeek = new Date(this.currentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date) => {
      return date.toLocaleDateString("tr-TR", {
        month: "short",
        day: "numeric",
      });
    };

    this.currentWeekElement.textContent = `${formatDate(
      startOfWeek
    )} - ${formatDate(endOfWeek)}`;
  }

  async navigateWeek(direction) {
    this.currentDate.setDate(this.currentDate.getDate() + direction * 7);
    this.updateCurrentWeekDisplay();
    await this.loadSchedule();
  }

  async loadSchedule() {
    try {
      const appointmentsData = await this.scheduleService.fetchAvailableSlots();
      console.log("Fetched appointments:", appointmentsData);

      this.appointments = appointmentsData || [];
      const scheduleData = this.processAppointmentsData(appointmentsData);
      this.renderSchedule(scheduleData);
    } catch (error) {
      console.error("Error loading schedule:", error);
      this.handleError(error);
    }
  }

  processAppointmentsData(appointmentsData) {
    const bookedSlots = new Set();
    const availableSlots = new Set();

    // First, mark all potential slots as available
    const startDate = new Date(this.currentDate);
    const workingHours = this.generateTimeSlots();

    // Generate all possible slots for the week
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateStr = currentDate.toISOString().split("T")[0];

      workingHours.forEach((time) => {
        // Skip past slots
        const slotDate = new Date(currentDate);
        const [hours, minutes] = time.split(":").map(Number);
        slotDate.setHours(hours, minutes);

        if (slotDate > new Date()) {
          availableSlots.add(`${dateStr}-${time}`);
        }
      });
    }

    // Process appointments - mark them as booked
    this.appointments.forEach((appointment) => {
      const date = new Date(appointment.appointmentTime);
      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const dateStr = date.toISOString().split("T")[0];
      const slotKey = `${dateStr}-${timeStr}`;

      // Remove from available slots and add to booked slots
      availableSlots.delete(slotKey);
      bookedSlots.add(slotKey);

      console.log(`Marked as booked: ${slotKey}`);
    });

    return {
      availableSlots: Array.from(availableSlots),
      bookedSlots: Array.from(bookedSlots),
    };
  }

  renderSchedule(scheduleData) {
    this.renderWeekDays();
    this.renderTimeSlots(scheduleData);
  }

  renderWeekDays() {
    const days = ["Pzt", "Sali", "Crsb", "Prsb", "Cuma", "Cmrt", "Pzr"];
    const startDate = new Date(this.currentDate);

    const headerHtml = `
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

    this.weekDaysContainer.innerHTML = headerHtml;
  }

  renderTimeSlots(scheduleData) {
    const timeSlots = this.generateTimeSlots();
    const startDate = new Date(this.currentDate);

    this.timeSlotsContainer.innerHTML = timeSlots
      .map((time) => {
        return `
                <div class="time-row">
                    <div class="time-label">${time}</div>
                    ${Array.from({ length: 7 }, (_, i) => {
                      const date = new Date(startDate);
                      date.setDate(startDate.getDate() + i);
                      const slotKey = `${
                        date.toISOString().split("T")[0]
                      }-${time}`;

                      const isBooked =
                        scheduleData.bookedSlots.includes(slotKey);
                      const isAvailable =
                        scheduleData.availableSlots.includes(slotKey);
                      const isPast =
                        date < new Date().setHours(0, 0, 0, 0) ||
                        (this.isToday(date) && this.isPastTime(time));

                      const appointment = isBooked
                        ? this.findAppointment(date, time)
                        : null;

                      let slotClass = "time-slot";
                      if (isBooked) {
                        slotClass += " booked";
                      } else if (isAvailable) {
                        slotClass += " available";
                      } else {
                        slotClass += " unavailable";
                      }
                      if (isPast) slotClass += " past";

                      let slotContent = "";
                      if (appointment) {
                        slotContent = `
                                <div class="appointment-details">
                                    <div class="status">Booked</div>
                                    ${
                                      appointment.memberName
                                        ? `<div class="client">${appointment.memberName}</div>`
                                        : ""
                                    }
                                </div>
                            `;
                      }

                      return `
                            <div 
                                class="${slotClass}"
                                ${
                                  isAvailable && !isPast
                                    ? `onclick="window.scheduleHandler.openBookingModal(new Date('${date.toISOString()}'), '${time}')"`
                                    : ""
                                }
                                ${
                                  appointment
                                    ? `data-appointment-id="${appointment.id}"`
                                    : ""
                                }
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
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  }

  findAppointment(date, time) {
    return this.appointments.find((appointment) => {
      const appointmentDate = new Date(appointment.appointmentTime);
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getHours() === parseInt(time.split(":")[0]) &&
        appointmentDate.getMinutes() === parseInt(time.split(":")[1] || "0")
      );
    });
  }

  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  isPastTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    return (
      now.getHours() > hours ||
      (now.getHours() === hours && now.getMinutes() > minutes)
    );
  }

  openBookingModal(date, time) {
    this.selectedSlot = { date, time };
    this.bookingDetails.textContent = `Book session for ${date.toLocaleDateString()} at ${time}?`;
    this.modal.classList.remove("hidden");
  }

  closeModal() {
    this.modal.classList.add("hidden");
    this.selectedSlot = null;
  }

  async confirmBooking() {
    if (!this.selectedSlot) return;

    try {
      const result = await this.scheduleService.bookAppointment(
        this.selectedSlot.date,
        this.selectedSlot.time
      );
      this.showSuccess("Booking successful!");
      this.closeModal();
      await this.loadSchedule();
    } catch (error) {
      this.handleError(error);
    }
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

  showSuccess(message) {
    alert(message);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.scheduleHandler = new ScheduleHandler();
});
