// /src/services/scheduleService.js

import { ROUTES } from "../../config/routes.js";

export class ScheduleService {
  createAuthHeader() {
    const basicAuth = sessionStorage.getItem("basicAuth");
    if (basicAuth) {
      return `Basic ${basicAuth}`;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData.username) {
      throw new Error("User data not found");
    }

    let password;
    if (userData.password) {
      password = userData.password;
    } else {
      const credentials = JSON.parse(sessionStorage.getItem("credentials"));
      password = credentials?.password;
    }

    if (!password) {
      throw new Error("Authentication credentials not found");
    }

    const newBasicAuth = btoa(`${userData.username}:${password}`);
    sessionStorage.setItem("basicAuth", newBasicAuth);
    return `Basic ${newBasicAuth}`;
  }

  async fetchAvailableSlots() {
    try {
      const authHeader = this.createAuthHeader();
      console.log("Fetching appointments with auth:", authHeader);

      const response = await fetch(
        `${ROUTES.API.BASE_URL}/api/appointments/pt`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid auth token
          sessionStorage.removeItem("basicAuth");
          window.location.href = ROUTES.AUTH.LOGIN;
          throw new Error("Authentication failed");
        }
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received appointment data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching schedule:", error);
      throw error;
    }
  }

  async bookAppointment(date, time) {
    try {
      const authHeader = this.createAuthHeader();
      const response = await fetch(
        `${ROUTES.API.BASE_URL}/api/appointments/book`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentTime: new Date(
              date.setHours(
                parseInt(time.split(":")[0]),
                parseInt(time.split(":")[1] || "0"),
                0,
                0
              )
            ).toISOString(),
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem("basicAuth");
          window.location.href = ROUTES.AUTH.LOGIN;
          throw new Error("Authentication failed");
        }
        throw new Error(`Booking failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error booking appointment:", error);
      throw error;
    }
  }

  async cancelAppointment(appointmentId) {
    try {
      const authHeader = this.createAuthHeader();
      const response = await fetch(
        `${ROUTES.API.BASE_URL}/api/appointments/${appointmentId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem("basicAuth");
          window.location.href = ROUTES.AUTH.LOGIN;
          throw new Error("Authentication failed");
        }
        throw new Error(`Cancellation failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error canceling appointment:", error);
      throw error;
    }
  }

  async getAppointmentDetails(appointmentId) {
    try {
      const authHeader = this.createAuthHeader();
      const response = await fetch(
        `${ROUTES.API.BASE_URL}/api/appointments/${appointmentId}`,
        {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem("basicAuth");
          window.location.href = ROUTES.AUTH.LOGIN;
          throw new Error("Authentication failed");
        }
        throw new Error(
          `Failed to fetch appointment details: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      throw error;
    }
  }

  // Helper method to verify auth token
  async testAuth() {
    try {
      const authHeader = this.createAuthHeader();
      console.log("Testing auth with header:", authHeader);

      const response = await fetch(`${ROUTES.API.BASE_URL}/api/users/verify`, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Auth test failed: ${response.status}`);
      }

      console.log("Auth test successful");
      return true;
    } catch (error) {
      console.error("Auth test failed:", error);
      throw error;
    }
  }
}
