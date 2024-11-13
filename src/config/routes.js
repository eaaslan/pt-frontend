// src/config/routes.js

const BASE_PATH = "/src/"; // You can change this based on your deployment path

export const ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: `${BASE_PATH}pages/auth/login.html`,
    // todo REGISTER: `${BASE_PATH}register.html`,
  },

  // Member routes
  MEMBER: {
    DASHBOARD: `${BASE_PATH}pages/member/dashboard/index.html`,
    CHECKIN: `${BASE_PATH}pages/member/checkin/check-in.html`,
    SCHEDULE: `${BASE_PATH}pages/member/schedule/schedule.html`,
    //todo  SCHEDULE: `${BASE_PATH}member-page/schedule.html`,
    //todo  PROFILE: `${BASE_PATH}member-page/profile.html`,
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: `${BASE_PATH}pages/admin/dashboard/index.html`,
    SCHEDULE: `${BASE_PATH}pages/admin/schedule/index.html`,
    MEMBER_DETAILS: `${BASE_PATH}member-details.html`,
    MEMBER_APPOINTMENTS: `${BASE_PATH}member-appointments.html`,
    MEMBERS: {
      LIST: `${BASE_PATH}pages/admin/members/index.html`,
      DETAILS: `${BASE_PATH}pages/admin/members/details.html`,
      EDIT: `${BASE_PATH}pages/admin/members/edit.html`,
    },
    SETTINGS: `${BASE_PATH}pages/admin/settings/index.html`,
  },

  // API routes
  API: {
    BASE_URL: "http://localhost:8080",
    ENDPOINTS: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
      APPOINTMENTS: "/api/appointments",
      MEMBERS: "/api/users",
    },
  },
};

export const navigate = (route) => {
  window.location.href = route;
};

// Helper function to check if we're in production
export const isProduction = () => {
  return (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  );
};

// Helper to get API URL based on environment
export const getApiUrl = () => {
  return isProduction()
    ? "https://your-production-api.com"
    : ROUTES.API.BASE_URL;
};
