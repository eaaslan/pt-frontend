// /src/pages/member/schedule/schedule.js

import { Navbar } from "../../../components/common/Navbar.js";
// /src/pages/member/schedule/schedule.js

class ScheduleHandler {
  constructor() {
    this.currentDate = new Date();
    this.selectedSlot = null;
    this.initializeElements();
    this.initializeNavbar();
    this.initializeEventListeners();
    this.loadSchedule();
  }

  initializeNavbar() {
    new Navbar("navbarContainer");
  }

  initializeElements() {
    this.weekDaysContainer = document.getElementById("weekDays");
    this.timeSlotsContainer = document.getElementById("timeSlots");
    this.currentWeekElement = document.getElementById("currentWeek");
    this.modal = document.getElementById("bookingModal");
    this.bookingDetails = document.getElementById("bookingDetails");

    this.updateCurrentWeekDisplay();
  }

  initializeEventListeners() {
    document
      .getElementById("prevWeek")
      .addEventListener("click", () => this.navigateWeek(-1));
    document
      .getElementById("nextWeek")
      .addEventListener("click", () => this.navigateWeek(1));

    document
      .getElementById("closeModal")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("cancelBooking")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("confirmBooking")
      .addEventListener("click", () => this.confirmBooking());
  }

  updateCurrentWeekDisplay() {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    this.currentWeekElement.textContent = `${formatDate(
      startOfWeek
    )} - ${formatDate(endOfWeek)}`;
  }

  navigateWeek(direction) {
    this.currentDate.setDate(this.currentDate.getDate() + direction * 7);
    this.updateCurrentWeekDisplay();
    this.loadSchedule();
  }

  loadSchedule() {
    // Mock data - randomly generate available slots
    const mockData = this.generateMockScheduleData();
    this.renderSchedule(mockData);
  }

  generateMockScheduleData() {
    const availableSlots = [];
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

    // Generate some random available slots
    for (let day = 0; day < 7; day++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + day);

      // Skip past dates
      if (currentDay < new Date().setHours(0, 0, 0, 0)) continue;

      // Generate 3-5 random slots per day
      const numSlots = Math.floor(Math.random() * 3) + 3;
      const hours = [9, 10, 11, 13, 14, 15, 16];

      for (let i = 0; i < numSlots; i++) {
        const randomHour = hours[Math.floor(Math.random() * hours.length)];
        const randomMinute = Math.random() < 0.5 ? "00" : "30";
        const timeSlot = `${String(randomHour).padStart(
          2,
          "0"
        )}:${randomMinute}`;
        const dateStr = currentDay.toISOString().split("T")[0];
        availableSlots.push(`${dateStr}-${timeSlot}`);
      }
    }

    return { availableSlots };
  }

  renderSchedule(scheduleData) {
    this.renderWeekDays();
    this.renderTimeSlots(scheduleData);
  }

  renderWeekDays() {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

    this.weekDaysContainer.innerHTML = days
      .map((day, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        const isToday = this.isToday(date);

        return `
                <div class="day-column ${isToday ? "today" : ""}">
                    <div class="day-label">${day}</div>
                    <div class="date-label">${date.getDate()}</div>
                </div>
            `;
      })
      .join("");
  }

  renderTimeSlots(scheduleData) {
    const timeSlots = this.generateTimeSlots();
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

    this.timeSlotsContainer.innerHTML = timeSlots
      .map((time) => {
        const row = document.createElement("div");
        row.className = "time-row";

        const timeLabel = document.createElement("div");
        timeLabel.className = "time-label";
        timeLabel.textContent = time;
        row.appendChild(timeLabel);

        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          const slotKey = `${date.toISOString().split("T")[0]}-${time}`;
          const isAvailable = scheduleData.availableSlots.includes(slotKey);
          const isPast =
            date < new Date().setHours(0, 0, 0, 0) ||
            (this.isToday(date) && this.isPastTime(time));

          const slot = document.createElement("div");
          slot.className = `time-slot ${
            isAvailable ? "available" : "unavailable"
          } ${isPast ? "past" : ""}`;
          if (isAvailable && !isPast) {
            slot.addEventListener("click", () =>
              this.openBookingModal(date, time)
            );
          }
          row.appendChild(slot);
        }

        return row.outerHTML;
      })
      .join("");
  }

  generateTimeSlots() {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
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

  confirmBooking() {
    if (!this.selectedSlot) return;

    // Simulate successful booking
    alert("Booking successful! (Demo version)");
    this.closeModal();
    this.loadSchedule(); // Refresh the schedule
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ScheduleHandler();
});
