import BaseApi from "./baseApi.js";
import { API_CONFIG } from "../../config/constants.js";

class AppointmentApi extends BaseApi {
  constructor() {
    super();
    this.endpoint = API_CONFIG.ENDPOINTS.APPOINTMENTS;
  }

  async getUserAppointments(userId) {
    try {
      return await this.fetch(`${this.endpoint}/member/appointments`);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  }
  async getAvailableSlots(date) {
    try {
      const formattedDate = date.toISOString();
      return await this.fetch(
        `${this.endpoint}/available-slots?date=${formattedDate}`
      );
    } catch (error) {
      console.error("Error fetching available slots:", error);
      throw error;
    }
  }

  async bookAppointment(timeSlot) {
    try {
      return await this.fetch(`${this.endpoint}/book`, {
        method: "POST",
        body: JSON.stringify({
          appointmentTime: timeSlot.toISOString(),
        }),
      });
    } catch (error) {
      console.error("Error booking appointment:", error);
      throw error;
    }
  }

  async cancelAppointment(appointmentId) {
    try {
      return await this.fetch(`${this.endpoint}/${appointmentId}/cancel`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error canceling appointment:", error);
      throw error;
    }
  }
}

// Create and export a single instance
export const appointmentApi = new AppointmentApi();
