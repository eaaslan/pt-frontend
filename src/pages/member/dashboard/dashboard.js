import { ROUTES } from "../../../config/routes.js";
import { navigationService } from "../../../services/navigationService.js";
import { Navbar } from "../../../components/common/Navbar.js";
import { PackageHandler } from "../../../components/package/PackageHandler.js";

class DashboardHandler {
  constructor() {
    this.initialize();
  }

  async initialize() {
    try {
      const authHeader = this.checkAuth();
      if (!authHeader) return;

      this.initializeElements();
      this.initializeNavbar();
      await this.initializePackageInfo(authHeader);
      await this.loadDashboard();
    } catch (error) {
      console.error("Initialization error:", error);
      this.handleError(error);
    }
  }

  initializePackageInfo(authHeader) {
    new PackageHandler("packageContainer", authHeader);
  }

  initializeNavbar() {
    new Navbar("navbarContainer");
  }

  checkAuth() {
    const user = localStorage.getItem("credentials");
    const basicAuth = sessionStorage.getItem("basicAuth");

    if (!user || !basicAuth) {
      console.log("No auth credentials found");
      navigationService.navigateToLogin();
      return false;
    }

    const userData = JSON.parse(user);
    if (userData.role !== "ROLE_MEMBER") {
      console.log("Invalid user role");
      navigationService.navigateToLogin();
      return false;
    }

    return basicAuth;
  }
  initializeElements() {
    this.memberNameElement = document.getElementById("memberName");
    this.appointmentsList = document.getElementById("appointmentsList");
    this.errorElement = document.getElementById("error");

    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.name) {
      this.memberNameElement.textContent = userData.name;
    }
  }

  async loadDashboard() {
    try {
      const appointments = await this.fetchAppointments();
      this.displayAppointments(appointments);
    } catch (error) {
      this.handleError(error);
    }
  }

  async fetchAppointments() {
    try {
      const authHeader = this.checkAuth();

      if (!authHeader) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${ROUTES.API.BASE_URL}/api/appointments/member/appointments`,
        {
          headers: {
            Authorization: `${authHeader}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          //  navigationService.navigateToLogin();
          throw new Error("Authentication failed");
        }
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      return data.appointments;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  displayAppointments(appointments) {
    if (!appointments || appointments.length === 0) {
      this.appointmentsList.innerHTML =
        '<p class="text-sm text-gray-500">No appointments scheduled.</p>';
      return;
    }

    this.appointmentsList.innerHTML = appointments
      .map((appointment) => {
        const appointmentDate = new Date(appointment.appointmentTime);
        const formattedDate = appointmentDate.toLocaleString("tr-TR", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

        return `
        <div class="appointment-card">
          <div class="appointment-time">${formattedDate}</div>
          <div class="flex items-center justify-between">
            <span class="appointment-status">${appointment.status}</span>
            ${
              appointment.checkInTime
                ? `<div class="text-xs text-gray-600">Checked in: ${new Date(
                    appointment.checkInTime
                  ).toLocaleString()}</div>`
                : ""
            }
          </div>
        </div>
      `;
      })
      .join("");
  }

  handleError(error) {
    console.error("Dashboard error:", error);
    if (this.errorElement) {
      this.errorElement.style.display = "block";
      this.errorElement.textContent =
        "Error loading dashboard data. Please try again later.";
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DashboardHandler();
});
