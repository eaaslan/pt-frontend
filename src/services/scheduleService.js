// /src/components/schedule/ScheduleService.js

import { ROUTES } from "../../src/config/routes.js";

export class ScheduleService {
  constructor() {
    this.baseUrl = ROUTES.API.BASE_URL;
  }

  getAuthHeader() {
    const storedAuth = sessionStorage.getItem("basicAuth");
    if (storedAuth?.startsWith("Basic ")) {
      return storedAuth;
    }
    return `Basic ${storedAuth}`;
  }

  async fetchAppointments() {
    try {
      const response = await fetch(`${this.baseUrl}/api/appointments/pt`, {
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  }

  async fetchAvailableSlots() {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/appointments/available`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch available slots: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching available slots:", error);
      throw error;
    }
  }

  async bookAppointment(appointmentTime, memberId = null) {
    try {
      const body = {
        appointmentTime: new Date(appointmentTime).toISOString(),
      };

      if (memberId) {
        body.memberId = memberId;
      }

      const response = await fetch(`${this.baseUrl}/api/appointments`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Booking failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error booking appointment:", error);
      throw error;
    }
  }

  async cancelAppointment(appointmentId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to cancel appointment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error canceling appointment:", error);
      throw error;
    }
  }

  async fetchMembers() {
    try {
      const response = await fetch(`${this.baseUrl}/api/users`, {
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.status}`);
      }

      const data = await response.json();
      return data.members || data.users || data || [];
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  }
}
