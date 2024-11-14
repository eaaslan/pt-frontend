// /src/pages/member/schedule/schedule.js

import { Navbar } from "../../../components/common/Navbar.js";
import { ScheduleService } from "../../../services/ScheduleService.js";
// /src/pages/member/schedule/schedule.js


export class ScheduleHandler {
  constructor() {
    this.scheduleService = new ScheduleService();
    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);
    this.appointments = [];
    this.selectedSlot = null;
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
    document.getElementById("prevWeek")?.addEventListener("click", () => this.navigateWeek(-1));
    document.getElementById("nextWeek")?.addEventListener("click", () => this.navigateWeek(1));
    document.getElementById("closeModal")?.addEventListener("click", () => this.closeModal());
    document.getElementById("cancelBooking")?.addEventListener("click", () => this.closeModal());
    document.getElementById("confirmBooking")?.addEventListener("click", () => this.confirmBooking());
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

    this.currentWeekElement.textContent = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  }

  async navigateWeek(direction) {
    this.currentDate.setDate(this.currentDate.getDate() + direction * 7);
    this.updateCurrentWeekDisplay();
    await this.loadSchedule();
  }

  async loadSchedule() {
    try {
      const appointments = await this.scheduleService.fetchAppointments();
      this.appointments = appointments || [];
      this.renderSchedule();
    } catch (error) {
      this.handleError(error);
    }
  }

  isSlotBooked(date, time) {
    const searchDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    searchDate.setHours(hours, minutes, 0, 0);

    return this.appointments.some(appointment => {
      const appointmentDate = new Date(appointment.appointmentTime);
      return appointmentDate.getTime() === searchDate.getTime();
    });
  }

  renderSchedule() {
    this.renderWeekDays();
    this.renderTimeSlots();
  }

  renderWeekDays() {
    const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
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

  renderTimeSlots() {
    const timeSlots = this.generateTimeSlots();
    const startDate = new Date(this.currentDate);

    this.timeSlotsContainer.innerHTML = timeSlots.map(time => {
      return `
        <div class="time-row">
          <div class="time-label">${time}</div>
          ${Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isBooked = this.isSlotBooked(date, time);
            const isPast = date < new Date().setHours(0, 0, 0, 0) ||
                          (this.isToday(date) && this.isPastTime(time));

            let slotClass = "time-slot";
            if (isBooked) {
              slotClass += " booked";
            } else if (!isPast) {
              slotClass += " available";
            }
            if (isPast) slotClass += " past";

            return `
              <div 
                class="${slotClass}"
                ${!isBooked && !isPast ? 
                  `onclick="window.scheduleHandler.openBookingModal(new Date('${date.toISOString()}'), '${time}')"` : 
                  ''}
              ></div>
            `;
          }).join("")}
        </div>
      `;
    }).join("");
  }

  generateTimeSlots() {
    const slots = [];
    for (let hour = 9; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  }

  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isPastTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    return now.getHours() > hours || 
           (now.getHours() === hours && now.getMinutes() > minutes);
  }

  openBookingModal(date, time) {
    this.selectedSlot = { date, time };
    this.bookingDetails.textContent = `${date.toLocaleDateString()} ${time} için randevu oluştur?`;
    this.modal.classList.remove("hidden");
  }

  closeModal() {
    this.modal.classList.add("hidden");
    this.selectedSlot = null;
  }

  async confirmBooking() {
    if (!this.selectedSlot) return;

    try {
      const bookingDate = new Date(this.selectedSlot.date);
      const [hours, minutes] = this.selectedSlot.time.split(':').map(Number);
      bookingDate.setHours(hours, minutes, 0, 0);

      await this.scheduleService.bookAppointment(bookingDate);
      this.showSuccess("Randevu oluşturuldu!");
      this.closeModal();
      await this.loadSchedule();
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error("Schedule error:", error);
    if (this.errorContainer) {
      this.errorContainer.textContent = "Bir hata oluştu. Lütfen tekrar deneyin.";
      this.errorContainer.style.display = "block";
      setTimeout(() => {
        this.errorContainer.style.display = "none";
      }, 3000);
    }
  }

  showSuccess(message) {
    const successContainer = document.createElement('div');
    successContainer.className = 'success-message';
    successContainer.textContent = message;
    document.body.appendChild(successContainer);

    setTimeout(() => {
      successContainer.remove();
    }, 3000);
  }
}

window.scheduleHandler = null;

document.addEventListener("DOMContentLoaded", () => {
  window.scheduleHandler = new ScheduleHandler();
});