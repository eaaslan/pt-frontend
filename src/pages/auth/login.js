import { ROUTES } from "../../config/routes.js";
import { navigationService } from "../../services/navigationService.js";
import { validationUtils, domUtils } from "../../services/utils/common.js";

class LoginHandler {
  constructor() {
    this.initializeElements();
    this.initializeEventListeners();
    this.restoreFormData();
    this.focusInitialField();
  }

  initializeElements() {
    this.form = document.getElementById("loginForm");
    this.usernameInput = document.getElementById("username");
    this.passwordInput = document.getElementById("password");
    this.passwordToggle = document.getElementById("passwordToggle");
    this.usernameError = document.getElementById("usernameError");
    this.passwordError = document.getElementById("passwordError");
    this.submitButton = this.form.querySelector(".submit-btn");
    this.rememberMe = document.getElementById("remember");
    this.submitError = document.getElementById("submitError");
  }

  initializeEventListeners() {
    // Password toggle
    this.passwordToggle.addEventListener("click", () =>
      this.togglePasswordVisibility()
    );

    // Real-time validation
    this.usernameInput.addEventListener("input", () =>
      this.validateUsernameInput()
    );
    this.passwordInput.addEventListener("input", () =>
      this.validatePasswordInput()
    );

    // Form submission
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  togglePasswordVisibility() {
    const type = this.passwordInput.type === "password" ? "text" : "password";
    this.passwordInput.type = type;

    const eyePath =
      type === "password"
        ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
        : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

    this.passwordToggle.querySelector("svg").innerHTML = eyePath;
  }

  validateUsernameInput() {
    const username = this.usernameInput.value;
    if (username && !validationUtils.validateUsername(username)) {
      domUtils.showError(
        this.usernameError,
        "Username must be at least 3 characters"
      );
    } else {
      domUtils.hideError(this.usernameError);
    }
  }

  validatePasswordInput() {
    const password = this.passwordInput.value;
    if (password && !validationUtils.validatePassword(password)) {
      domUtils.showError(
        this.passwordError,
        "Password must be at least 6 characters"
      );
    } else {
      domUtils.hideError(this.passwordError);
    }
  }

  validateForm() {
    let isValid = true;

    // Validate username
    if (!this.usernameInput.value) {
      domUtils.showError(this.usernameError, "Username is required");
      isValid = false;
    } else if (!validationUtils.validateUsername(this.usernameInput.value)) {
      domUtils.showError(
        this.usernameError,
        "Username must be at least 3 characters"
      );
      isValid = false;
    } else {
      domUtils.hideError(this.usernameError);
    }

    // Validate password
    if (!this.passwordInput.value) {
      domUtils.showError(this.passwordError, "Password is required");
      isValid = false;
    } else if (!validationUtils.validatePassword(this.passwordInput.value)) {
      domUtils.showError(
        this.passwordError,
        "Password must be at least 6 characters"
      );
      isValid = false;
    } else {
      domUtils.hideError(this.passwordError);
    }

    return isValid;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) return;

    const username = this.usernameInput.value;
    const password = this.passwordInput.value;
    const rememberPassword = this.rememberMe.checked;

    //FIXME should i keep user info include password without encoding ??
    try {
      // Always encode Basic Auth with username and password

      const response = await fetch(
        `${ROUTES.API.BASE_URL}${ROUTES.API.ENDPOINTS.LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const basicAuth = btoa(`${username}:${password}`);
      sessionStorage.setItem("basicAuth", `Basic ${basicAuth}`);
      // Prepare user data for storage
      const userData = {
        id: data.user.id,
        username: this.usernameInput.value,
        password: this.rememberMe.checked
          ? this.passwordInput.value
          : undefined,
        name: data.user.name,
        role: data.user.role,
      };
      // Store user data and Basic Auth
      console.log("Auth token stored:", basicAuth);
      console.log("Stored user data:", userData);
      localStorage.setItem("credentials", JSON.stringify(userData));

      navigationService.navigateBasedOnRole(data.user.role);
    } catch (error) {
      console.error("Login failed:", error);
      domUtils.showError(this.submitError, "Login failed. Please try again.");
    } finally {
      this.submitButton.disabled = false;
      this.submitButton.classList.remove("loading");
    }
  }

  restoreFormData() {
    const savedData = localStorage.getItem("user");
    if (savedData) {
      const { username, password, remember } = JSON.parse(savedData);
      if (username) this.usernameInput.value = username;
      if (password) this.passwordInput.value = password;
      if (remember) this.rememberMe.checked = remember;
    }
  }

  focusInitialField() {
    if (!this.usernameInput.value) {
      this.usernameInput.focus();
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LoginHandler();
});
