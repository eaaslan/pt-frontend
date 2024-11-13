// src/services/utils/common.js
export const dateUtils = {
  formatDate: (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  },

  roundToNearestHour: (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() >= 30 ? 60 : 0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  },
};

export const Utils = {
  createElementFromTemplate(templateId) {
    const template = document.getElementById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    return template.content.cloneNode(true);
  },

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },
};

export const validationUtils = {
  validateUsername: (username) => username.length >= 3,
  validatePassword: (password) => password.length >= 6,
  validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
};

export const domUtils = {
  showError: (element, message) => {
    if (element) {
      element.textContent = message;
      element.classList.add("visible");
    }
  },

  hideError: (element) => {
    if (element) {
      element.classList.remove("visible");
    }
  },
};
