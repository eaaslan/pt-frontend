import { ROUTES } from "../../../config/routes.js";
import { navigationService } from "../../../services/navigationService.js";
import { Navbar } from "../../../components/common/Navbar.js";

class AdminDashboardHandler {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalPages = 1;
    this.initialize();
  }

  async initialize() {
    try {
      const authHeader = this.checkAuth();
      if (!authHeader) return;

      this.initializeElements();
      this.initializeNavbar();
      this.initializeEventListeners();
      await this.loadDashboard();
    } catch (error) {
      console.error("Initialization error:", error);
      this.handleError(error);
    }
  }

  initializeNavbar() {
    new Navbar("navbarContainer");
  }

  checkAuth() {
    const basicAuth = sessionStorage.getItem("basicAuth");
    const user = localStorage.getItem("credentials");

    if (!user || !basicAuth) {
      console.log("No auth credentials found");
      // navigationService.navigateToLogin();
      return false;
    }

    const userData = JSON.parse(user);
    if (userData.role !== "ROLE_PT") {
      console.log("Invalid user role");
      // navigationService.navigateToLogin();
      return false;
    }

    return basicAuth;
  }

  initializeElements() {
    this.membersList = document.getElementById("membersList");
    this.prevPageBtn = document.getElementById("prevPage");
    this.nextPageBtn = document.getElementById("nextPage");
    this.pageInfo = document.getElementById("pageInfo");
    this.totalMembersElement = document.getElementById("totalMembers");
    this.todaySessionsElement = document.getElementById("todaySessions");
    this.monthlyCheckinsElement = document.getElementById("monthlyCheckins");
    this.errorElement = document.getElementById("errorContainer");
  }

  initializeEventListeners() {
    this.prevPageBtn.addEventListener("click", () => this.changePage(-1));
    this.nextPageBtn.addEventListener("click", () => this.changePage(1));
  }

  async loadDashboard() {
    try {
      await Promise.all([this.loadMembers(), this.loadStatistics()]);
    } catch (error) {
      this.handleError(error);
    }
  }

  async loadMembers() {
    try {
      const response = await fetch(
        `${ROUTES.API.BASE_URL}/api/admin/members?page=${this.currentPage}&size=${this.pageSize}`,
        {
          headers: {
            Authorization: sessionStorage.getItem("basicAuth"),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.status}`);
      }

      const data = await response.json();
      this.totalPages = Math.ceil(data.total / this.pageSize);
      this.renderMembers(data.members);
      this.updatePagination();
    } catch (error) {
      console.error("Error loading members:", error);
      throw error;
    }
  }

  async loadStatistics() {
    try {
      const response = await fetch(
        `${ROUTES.API.BASE_URL}/api/admin/statistics`,
        {
          headers: {
            Authorization: sessionStorage.getItem("basicAuth"),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.status}`);
      }

      const stats = await response.json();
      this.updateStatistics(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
      throw error;
    }
  }

  renderMembers(members) {
    this.membersList.innerHTML = members
      .map(
        (member) => `
            <tr class="border-t">
                <td class="p-2">${member.name}</td>
                <td class="p-2">${member.packageName || "-"}</td>
                <td class="p-2">${member.sessionsLeft || 0}</td>
                <td class="p-2">${
                  member.lastCheckIn
                    ? new Date(member.lastCheckIn).toLocaleString()
                    : "Never"
                }</td>
                <td class="p-2 text-center">
                    <button 
                        onclick="window.adminDashboard.viewMemberDetails('${
                          member.id
                        }')"
                        class="action-button view-button mr-2">
                        View
                    </button>
                    <button 
                        onclick="window.adminDashboard.editMember('${
                          member.id
                        }')"
                        class="action-button edit-button">
                        Edit
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  updateStatistics(stats) {
    this.totalMembersElement.textContent = stats.totalMembers;
    this.todaySessionsElement.textContent = stats.todaySessions;
    this.monthlyCheckinsElement.textContent = stats.monthlyCheckins;
  }

  updatePagination() {
    this.pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    this.prevPageBtn.disabled = this.currentPage === 1;
    this.nextPageBtn.disabled = this.currentPage === this.totalPages;
  }

  async changePage(delta) {
    const newPage = this.currentPage + delta;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      await this.loadMembers();
    }
  }

  viewMemberDetails(memberId) {
    navigationService.navigateToMemberDetails(memberId);
  }

  editMember(memberId) {
    // Navigate to edit member page
    window.location.href = `${ROUTES.ADMIN.MEMBER_EDIT}?id=${memberId}`;
  }

  handleError(error) {
    console.error("Dashboard error:", error);
    if (this.errorElement) {
      this.errorElement.textContent =
        "An error occurred. Please try again later.";
      this.errorElement.classList.remove("hidden");
      setTimeout(() => {
        this.errorElement.classList.add("hidden");
      }, 3000);
    }
  }
}

// Make handler available globally for button click events
window.adminDashboard = null;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.adminDashboard = new AdminDashboardHandler();
});
