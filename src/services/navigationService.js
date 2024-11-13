// src/services/navigationService.js

import { ROUTES, navigate } from "../config/routes.js";

class NavigationService {
  navigateToLogin() {
    navigate(ROUTES.AUTH.LOGIN);
  }

  navigateToMemberDashboard() {
    navigate(ROUTES.MEMBER.DASHBOARD);
  }

  navigateToAdminDashboard() {
    navigate(ROUTES.ADMIN.DASHBOARD);
  }

  navigateBasedOnRole(role) {
    switch (role) {
      case "ROLE_PT":
        this.navigateToAdminDashboard();
        break;
      case "ROLE_MEMBER":
        this.navigateToMemberDashboard();
        break;
      default:
        console.error("Unknown role:", role);
        this.navigateToLogin();
    }
  }

  navigateToMemberDetails(memberId) {
    navigate(`${ROUTES.ADMIN.MEMBER_DETAILS}?id=${memberId}`);
  }

  navigateToMemberAppointments(memberId) {
    navigate(`${ROUTES.ADMIN.MEMBER_APPOINTMENTS}?id=${memberId}`);
  }
}

export const navigationService = new NavigationService();
