// src/config/constants.js

const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_CONFIG = {
  BASE_URL: isDevelopment
    ? "http://localhost:8080"
    : "https://your-production-api.com", //todo  insert real endpoint
  ENDPOINTS: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    APPOINTMENTS: "/api/appointments",
    MEMBERS: "/api/users",
  },
};

export const APP_ROUTES = {
  LOGIN: "/src/pages/auth/login.html",
  MEMBER_DASHBOARD: "/src/pages/member/dashboard/index.html",
  ADMIN_DASHBOARD: "/src/pages/admin/allMembers/index.html",
};

export const USER_ROLES = {
  ADMIN: "ROLE_ADMIN",
  MEMBER: "ROLE_MEMBER",
  PT: "ROLE_PT",
};

export const TIME_SLOTS = {
  START_HOUR: 8,
  END_HOUR: 22,
  SLOT_DURATION: 60, // minutes
};
