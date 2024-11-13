import BaseApi from "./baseApi.js";

class AuthApi extends BaseApi {
  constructor() {
    super();
    this.endpoint = "/api/auth";
  }

  async login(username, password) {
    try {
      const data = await this.fetch(`${this.endpoint}/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const basicAuth = btoa(`${username}:${password}`);
      localStorage.setItem("basicAuth", `Basic ${basicAuth}`);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem("basicAuth");
    localStorage.removeItem("user");
    window.location.href("/src/pages/auth/login.html");
  }

  isAuthenticated() {
    return !!localStorage.getItem("basicAuth");
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthApi();
