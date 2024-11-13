export class Header {
  constructor() {
    this.container = document.getElementById("header-component");
    this.template = document.getElementById("header-template");
    this.render();
  }

  render() {
    // Clone the template content
    const content = this.template.content.cloneNode(true);

    // Get current user
    const user = JSON.parse(localStorage.getItem("user"));

    // Update username in the template
    const userNameSpan = content.querySelector(".user-name");
    if (userNameSpan && user) {
      userNameSpan.textContent = user.name;
    }

    // Add logout handler
    const logoutBtn = content.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    // Clear existing content and append new
    this.container.innerHTML = "";
    this.container.appendChild(content);
  }

  handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("basicAuth");
    window.location.href = "/src/pages/auth/login.html";
    //todo make dynmaic
  }
}
