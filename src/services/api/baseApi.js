// src/services/api/baseApi.js

import { API_CONFIG } from "../../config/constants.js";

class BaseApi {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  getHeaders() {
    const basicAuth = localStorage.getItem("basicAuth");
    return {
      Authorization: basicAuth,
      "Content-Type": "application/json",
    };
  }

  async fetch(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "API request failed");
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  }
}

export default BaseApi;
