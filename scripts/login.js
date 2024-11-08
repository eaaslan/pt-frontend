document.addEventListener("DOMContentLoaded", () => {
  // Get form elements

  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const passwordToggle = document.getElementById("passwordToggle");
  const usernameError = document.getElementById("usernameError");
  const passwordError = document.getElementById("passwordError");
  const submitButton = form.querySelector(".submit-btn");
  const rememberMe = document.getElementById("remember");
  const API_URL = window.CONFIG.getApiUrl();
  // Restore saved form data
  const restoreFormData = () => {
    const savedData = localStorage.getItem("user");
    if (savedData) {
      const { username, password, remember } = JSON.parse(savedData);

      // Always restore the form values if they exist
      if (username) usernameInput.value = username;
      if (password) passwordInput.value = password;
      if (remember) rememberMe.checked = remember;
    }
  };

  // Save form data
  const saveFormData = () => {
    if (rememberMe.checked) {
      const formData = {
        username: usernameInput.value,
        password: passwordInput.value,
        remember: rememberMe.checked,
      };
      localStorage.setItem("user", JSON.stringify(formData));
    } else {
      localStorage.removeItem("user");
    }
  };

  // Toggle password visibility
  passwordToggle.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;

    // Update icon
    const eyePath =
      type === "password"
        ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
        : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

    passwordToggle.querySelector("svg").innerHTML = eyePath;
  });

  // Validation functions
  const validateUsername = (username) => {
    return username.length >= 3;
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const showError = (element, message) => {
    element.textContent = message;
    element.classList.add("visible");
  };

  const hideError = (element) => {
    element.classList.remove("visible");
  };

  // Real-time validation
  usernameInput.addEventListener("input", () => {
    if (usernameInput.value && !validateUsername(usernameInput.value)) {
      showError(usernameError, "Username must be at least 3 characters");
    } else {
      hideError(usernameError);
    }
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.value && !validatePassword(passwordInput.value)) {
      showError(passwordError, "Password must be at least 6 characters");
    } else {
      hideError(passwordError);
    }
  });

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate username
    if (!usernameInput.value) {
      showError(usernameError, "Username is required");
      isValid = false;
    } else if (!validateUsername(usernameInput.value)) {
      showError(usernameError, "Username must be at least 3 characters");
      isValid = false;
    } else {
      hideError(usernameError);
    }

    // Validate password
    if (!passwordInput.value) {
      showError(passwordError, "Password is required");
      isValid = false;
    } else if (!validatePassword(passwordInput.value)) {
      showError(passwordError, "Password must be at least 6 characters");
      isValid = false;
    } else {
      hideError(passwordError);
    }

    if (isValid) {
      // Show loading state
      submitButton.disabled = true;
      submitButton.classList.add("loading");

      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        if (rememberMe.checked) {
          saveFormData();
        } else {
          localStorage.removeItem("user");
        }

        console.log(data.user.role);

        if (data.user.role == "ROLE_ADMIN") {
          console.log("admin");
        } else if (data.user.role == "ROLE_MEMBER") {
          window.location.href = "member.html";
          console.log("member");
        }

        // Here you would typically make an actual API call
        // and handle the response accordingly
      } catch (error) {
        console.error("Login failed:", error);
        showError(submitError, "Login failed. Please try again.");
      } finally {
        // Reset loading state
        submitButton.disabled = false;
        submitButton.classList.remove("loading");
      }
    }
  });

  restoreFormData();

  if (!usernameInput.value) {
    usernameInput.focus();
  }
});
